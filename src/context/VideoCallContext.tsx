import React, {
    createContext,
    useContext,
    useRef,
    useState,
} from 'react';
import { io, Socket } from 'socket.io-client';

interface Participant {
    userId: string;
    name: string;
    role?: string;
    stream: MediaStream;
    isAudioOn: boolean;
    isVideoOn: boolean;
    isSpeaking: boolean;
    volume: number;
}

interface VideoCallContextType {
    joinSession: (token: string, name: string, role: string) => Promise<void>;
    leaveSession: () => void;
    localMetadata: { name: string; role: string } | null;
    localStream: MediaStream | null;
    participants: Participant[];
    isConnected: boolean;
    toggleAudio: () => void;
    toggleVideo: () => void;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    isMinimized: boolean;
    setIsMinimized: (val: boolean) => void;
    localIsSpeaking: boolean;
    localVolume: number;
    activeRoomId: string | null;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(
    undefined,
);

export const useVideoCall = () => {
    const context = useContext(VideoCallContext);
    if (!context) {
        throw new Error('useVideoCall must be used within a VideoCallProvider');
    }
    return context;
};

// Simplified Mesh topology for the prototype (good for 2-3 users).
// For larger workshops, SFU (Mediasoup/Janus) is recommended.
export const VideoCallProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [localMetadata, setLocalMetadata] = useState<{ name: string; role: string } | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const [localIsSpeaking, setLocalIsSpeaking] = useState(false);
    const [localVolume, setLocalVolume] = useState(0);
    const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const userPeers = useRef<{ [key: string]: RTCPeerConnection }>({}); // Map userId -> PeerConnection
    const localStreamRef = useRef<MediaStream | null>(null);
    const roomIdRef = useRef<string | null>(null);
    const audioAnalyzers = useRef<{ [key: string]: { analyser: AnalyserNode, dataArray: Uint8Array } }>({});
    const audioContextRef = useRef<AudioContext | null>(null);
    const speakingIntervalRef = useRef<number | null>(null);

    const iceServers = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
        ],
    };


    const joinSession = async (token: string, name: string, role: string) => {
        // 1. Decode token to get roomId (simplified) or send token in auth
        const payload = JSON.parse(atob(token));
        const { roomId, userId } = payload;

        roomIdRef.current = roomId;
        setActiveRoomId(roomId);
        setLocalMetadata({ name, role });

        // 2. Get User Media
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setLocalStream(stream);
            localStreamRef.current = stream;

            // Audio Context Setup
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            setupAudioAnalyzer('local', stream);

            // 3. Connect Socket
            const backendUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
            console.log("Socket connecting to:", `${backendUrl}/video-calls`);
            socketRef.current = io(`${backendUrl}/video-calls`, {
                // path: '/socket.io', // Default is /socket.io
                transports: ['websocket'], // Force websocket to avoid polling issues
                auth: { token }, // Send token for validation
                query: { userId } // Pass userId for tracking
            });

            const socket = socketRef.current;

            socket.on('connect', () => {
                console.log('Connected to signaling server');
                setIsConnected(true);
                socket.emit('join-room', { roomId, name, role });
            });

            socket.on('user-connected', (data: { socketId: string, name: string, role: string }) => {
                console.log('User connected:', data.socketId, data.name, data.role);
                initiateOffer(data.socketId, stream, data.name, data.role);
            });

            socket.on('offer', async (data: { offer: any; from: string; name?: string; role?: string }) => {
                console.log('Received offer from:', data.from, data.name, data.role);
                await handleOffer(data.offer, data.from, stream, data.name, data.role);
            });

            socket.on('answer', async (data: { answer: any; from: string; name?: string; role?: string }) => {
                console.log('Received answer from:', data.from, data.name, data.role);
                await handleAnswer(data.answer, data.from, data.name, data.role);
            });

            socket.on(
                'ice-candidate',
                async (data: { candidate: any; from: string }) => {
                    await handleIceCandidate(data.candidate, data.from);
                },
            );

            socket.on('user-disconnected', (remoteUserId: string) => {
                console.log('User disconnected:', remoteUserId);
                setParticipants(prev => prev.filter(p => p.userId !== remoteUserId));
                if (userPeers.current[remoteUserId]) {
                    userPeers.current[remoteUserId].close();
                    delete userPeers.current[remoteUserId];
                }
            });

            socket.on('user-audio-toggle', (data: { userId: string, enabled: boolean }) => {
                console.log('User audio toggle:', data.userId, data.enabled);
                setParticipants(prev => prev.map(p =>
                    p.userId === data.userId ? { ...p, isAudioOn: data.enabled } : p
                ));
            });

            socket.on('user-video-toggle', (data: { userId: string, enabled: boolean }) => {
                console.log('User video toggle:', data.userId, data.enabled);
                setParticipants(prev => prev.map(p =>
                    p.userId === data.userId ? { ...p, isVideoOn: data.enabled } : p
                ));
            });

            // Start speaking detection loop
            startSpeakingDetection();

        } catch (err) {
            console.error('Error accessing media or connecting:', err);
        }
    };

    const startSpeakingDetection = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const detectSpeaking = () => {
            // Local detection
            if (localStreamRef.current && isAudioEnabled) {
                const vol = getStreamVolume('local');
                setLocalVolume(vol);
                setLocalIsSpeaking(vol > 20); // Lower threshold for sensitivity
            } else {
                setLocalVolume(0);
                setLocalIsSpeaking(false);
            }

            // Remote detection
            setParticipants(prev => prev.map(p => {
                const vol = getStreamVolume(p.userId);
                const isSpeaking = vol > 20; // Lower threshold for sensitivity
                // Only update if state changes or volume differs significantly to reduce re-renders
                if (p.isSpeaking !== isSpeaking || Math.abs(p.volume - vol) > 5) {
                    return { ...p, isSpeaking, volume: vol };
                }
                return p;
            }));

            speakingIntervalRef.current = requestAnimationFrame(detectSpeaking);
        };

        speakingIntervalRef.current = requestAnimationFrame(detectSpeaking);
    };

    const getStreamVolume = (userId: string) => {
        const analyzerData = audioAnalyzers.current[userId];
        if (!analyzerData) return 0;

        const { analyser, dataArray } = analyzerData;
        analyser.getByteFrequencyData(dataArray as any);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        return sum / dataArray.length;
    };

    const setupAudioAnalyzer = (userId: string, stream: MediaStream) => {
        if (!audioContextRef.current) return;

        const source = audioContextRef.current.createMediaStreamSource(stream);
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        source.connect(analyser);
        audioAnalyzers.current[userId] = { analyser, dataArray };
    };

    const createPeerConnection = (remoteUserId: string, stream: MediaStream, name?: string, role?: string) => {
        const pc = new RTCPeerConnection(iceServers);

        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('ice-candidate', {
                    candidate: event.candidate,
                    to: remoteUserId,
                });
            }
        };

        pc.ontrack = (event) => {
            console.log('Received remote track for:', remoteUserId, name, role);
            const remoteStream = event.streams[0] || new MediaStream([event.track]);

            setParticipants((prev) => {
                const exists = prev.find(p => p.userId === remoteUserId);
                if (exists) {
                    // Setup analyzer for existing stream if it changed
                    setupAudioAnalyzer(remoteUserId, remoteStream);
                    // Update stream and name/role if needed
                    return prev.map(p => p.userId === remoteUserId ? { ...p, stream: remoteStream, name: name || p.name, role: role || p.role } : p);
                }

                setupAudioAnalyzer(remoteUserId, remoteStream);

                return [...prev, {
                    userId: remoteUserId,
                    name: name || `Participant ${prev.length + 1}`,
                    role: role,
                    stream: remoteStream,
                    isAudioOn: true,
                    isVideoOn: true,
                    isSpeaking: false,
                    volume: 0
                }];
            });
        };

        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
        });

        userPeers.current[remoteUserId] = pc;
        return pc;
    };

    const initiateOffer = async (remoteUserId: string, stream: MediaStream, name?: string, role?: string) => {
        const pc = createPeerConnection(remoteUserId, stream, name, role);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current?.emit('offer', { offer, to: remoteUserId });
    };

    const handleOffer = async (
        offer: any,
        remoteUserId: string,
        stream: MediaStream,
        name?: string,
        role?: string
    ) => {
        const pc = createPeerConnection(remoteUserId, stream, name, role);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current?.emit('answer', { answer, to: remoteUserId });
    };

    const handleAnswer = async (answer: any, remoteUserId: string, name?: string, role?: string) => {
        const pc = userPeers.current[remoteUserId];
        if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));

            // Update name/role from answer if they weren't in the initial connection
            if (name || role) {
                setParticipants(prev => prev.map(p =>
                    p.userId === remoteUserId ? { ...p, name: name || p.name, role: role || p.role } : p
                ));
            }
        }
    };

    const handleIceCandidate = async (candidate: any, remoteUserId: string) => {
        const pc = userPeers.current[remoteUserId];
        if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

    const leaveSession = () => {
        if (speakingIntervalRef.current) {
            cancelAnimationFrame(speakingIntervalRef.current);
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        audioAnalyzers.current = {};

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
        }
        setLocalStream(null);
        setParticipants([]);
        setIsConnected(false);
        setIsMinimized(false);
        setActiveRoomId(null);

        Object.values(userPeers.current).forEach((pc) => pc.close());
        userPeers.current = {};

        socketRef.current?.disconnect();
    };

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);

                // Sync with others
                if (roomIdRef.current) {
                    socketRef.current?.emit('toggle-audio', { enabled: audioTrack.enabled, roomId: roomIdRef.current });
                }
            }
        }
    }

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);

                // Sync with others
                if (roomIdRef.current) {
                    socketRef.current?.emit('toggle-video', { enabled: videoTrack.enabled, roomId: roomIdRef.current });
                }
            }
        }
    }

    return (
        <VideoCallContext.Provider
            value={{
                joinSession,
                leaveSession,
                localMetadata,
                localStream,
                participants,
                isConnected,
                toggleAudio,
                toggleVideo,
                isAudioEnabled,
                isVideoEnabled,
                isMinimized,
                setIsMinimized,
                localIsSpeaking,
                localVolume,
                activeRoomId
            }}
        >
            {children}
        </VideoCallContext.Provider>
    );
};
