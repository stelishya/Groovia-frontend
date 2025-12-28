import React, { useEffect, useRef, useState } from 'react';
import { useVideoCall } from '../../context/VideoCallContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Minimize2, Maximize2, GripHorizontal } from 'lucide-react'; // Assuming lucide-react is installed

const VideoRoom: React.FC = () => {
    const {
        localStream,
        localMetadata,
        participants,
        leaveSession,
        toggleAudio,
        toggleVideo,
        isAudioEnabled,
        isVideoEnabled,
        isMinimized,
        setIsMinimized,
        localIsSpeaking,
        localVolume
    } = useVideoCall();
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isMinimized) return;
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            setPosition({
                x: e.clientX - dragOffset.current.x,
                y: e.clientY - dragOffset.current.y
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // Reset position when entering fullscreen to avoid weird offsets
    useEffect(() => {
        if (!isMinimized) {
            setPosition({ x: 0, y: 0 });
        }
    }, [isMinimized]);

    return (
        <div className={`fixed transition-all duration-500 ease-in-out font-sans z-50 flex flex-col overflow-hidden ${isMinimized
            ? 'bottom-6 right-6 w-80 md:w-96 min-h-[480px] bg-deep-purple backdrop-blur-xl rounded-2xl shadow-3xl border border-white/20'
            : 'inset-0 bg-deep-purple'
            }`}
            style={{
                '--local-volume': `${Math.min(localVolume * 2, 100)}%`,
                transform: isMinimized ? `translate(${position.x}px, ${position.y}px)` : 'none',
            } as React.CSSProperties}
        >
            {/* Drag Handle (Visible only when minimized) */}
            {isMinimized && (
                <div
                    onMouseDown={handleMouseDown}
                    className="h-6 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors group"
                >
                    <GripHorizontal className="text-white/20 group-hover:text-white/40 transition-colors" size={16} />
                </div>
            )}

            {/* Main Video Area */}
            <div className={`flex-1 relative flex items-center justify-center overflow-hidden ${isMinimized ? 'p-2' : 'p-4 lg:p-6'}`}>
                <div className={`w-full max-h-full overflow-y-auto grid gap-4 ${isMinimized
                    ? 'grid-cols-1 place-items-center'
                    : participants.length === 0
                        ? 'grid-cols-1 max-w-4xl place-items-center'
                        : participants.length === 1
                            ? 'grid-cols-1 md:grid-cols-2 max-w-6xl items-center'
                            : participants.length === 2
                                ? 'grid-cols-1 md:grid-cols-3 max-w-7xl items-center'
                                : 'grid-cols-2 lg:grid-cols-3 items-center'
                    }`}>
                    {/* Local Video Tile */}
                    <div
                        className={`relative w-full aspect-video bg-[#3c4043] rounded-xl overflow-hidden shadow-xl border-2 transition-all duration-150 group`}
                        style={{
                            borderColor: localIsSpeaking ? 'rgb(168, 85, 247)' : 'transparent',
                            boxShadow: localIsSpeaking ? `0 0 ${localVolume / 2}px rgba(168, 85, 247, 0.6)` : 'none'
                        }}
                    >
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover mirror"
                        />
                        {!isVideoEnabled && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#3c4043]">
                                <div className={`${isMinimized ? 'w-12 h-12 text-xl' : 'w-20 h-20 text-3xl'} rounded-full bg-purple-600 flex items-center justify-center font-bold text-white shadow-lg`}>
                                    {(localMetadata?.name || 'Y').charAt(0).toUpperCase()}
                                </div>
                            </div>
                        )}
                        <div className={`absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full text-white font-medium border border-white/10 z-10 transition-all duration-300 ${isMinimized ? 'text-[10px] bottom-2 left-2 px-2 py-1' : 'text-sm px-3 py-1.5'}`}>
                            {!isAudioEnabled ? <MicOff size={isMinimized ? 10 : 14} className="text-red-400" /> : <Mic size={isMinimized ? 10 : 14} className="text-green-400" />}
                            <span>(you) {localMetadata?.name}</span>
                        </div>
                        {localIsSpeaking && (
                            <div className="absolute top-4 right-4 speaking-ring w-3 h-3 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                        )}
                    </div>

                    {/* Remote Participant Tiles */}
                    {(() => {
                        const visibleParticipants = isMinimized ? participants.slice(0, 1) : participants;
                        const remainingCount = participants.length - visibleParticipants.length;

                        return (
                            <>
                                {visibleParticipants.map((participant) => (
                                    <ParticipantTile key={participant.userId} participant={participant} isMinimized={isMinimized} />
                                ))}
                                {isMinimized && remainingCount > 0 && (
                                    <div className="relative aspect-video bg-[#3c4043]/50 rounded-xl flex items-center justify-center border-2 border-dashed border-white/20 backdrop-blur-sm">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-white">+{remainingCount}</div>
                                            <div className="text-[10px] text-white/60">Others</div>
                                        </div>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            </div>

            {/* Floating Control Bar */}
            <div className={`${isMinimized ? 'h-16' : 'h-24'} flex items-center justify-center gap-4 px-6 relative`}>
                <div className={`flex items-center bg-purple-800/80 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl transition-all duration-300 ${isMinimized ? 'gap-2 px-4 py-2' : 'gap-4 px-8 py-4'}`}>
                    <button
                        onClick={toggleAudio}
                        className={`group rounded-full border border-white transition-all duration-300 ${isMinimized ? 'p-2.5' : 'p-4'} ${isAudioEnabled
                            ? 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                            }`}
                        title={isAudioEnabled ? "Mute Microphone" : "Unmute Microphone"}
                    >
                        {isAudioEnabled ? <Mic size={isMinimized ? 18 : 24} /> : <MicOff size={isMinimized ? 18 : 24} />}
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`group rounded-full border border-white transition-all duration-300 ${isMinimized ? 'p-2.5' : 'p-4'} ${isVideoEnabled
                            ? 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                            }`}
                        title={isVideoEnabled ? "Turn Off Camera" : "Turn On Camera"}
                    >
                        {isVideoEnabled ? <Video size={isMinimized ? 18 : 24} /> : <VideoOff size={isMinimized ? 18 : 24} />}
                    </button>

                    <div className={`w-px bg-white/10 mx-1 ${isMinimized ? 'h-5' : 'h-8'}`} />

                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className={`group rounded-full border border-white bg-[#3c4043] hover:bg-[#4a4e52] text-white transition-all duration-300 ${isMinimized ? 'p-2.5' : 'p-4'}`}
                        title={isMinimized ? "Restore to Fullscreen" : "Minimize Meeting"}
                    >
                        {isMinimized ? <Maximize2 size={isMinimized ? 18 : 24} /> : <Minimize2 size={isMinimized ? 18 : 24} />}
                    </button>

                    <div className={`w-px bg-white/10 mx-1 ${isMinimized ? 'h-5' : 'h-8'}`} />

                    <button
                        onClick={leaveSession}
                        className={`group rounded-full border border-white bg-red-600 hover:bg-red-700 text-white transition-all duration-300 shadow-xl shadow-red-600/30 hover:scale-105 active:scale-95 ${isMinimized ? 'p-2.5' : 'p-4'}`}
                        title="Leave Call"
                    >
                        <PhoneOff size={isMinimized ? 18 : 24} />
                    </button>
                </div>

                {/* Info Overlay (Optional) */}
                {!isMinimized && (
                    <div className="absolute right-10 hidden lg:flex items-center gap-4 text-white/70 text-sm">
                        <div className="flex items-center gap-2 bg-purple-800 px-4 py-2 rounded-lg">
                            <Users size={24} />
                            <span className="font-bold text-white">{participants.length + 1}</span>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .mirror { transform: scaleX(-1); }
                @keyframes pulse-ring {
                    0% { transform: scale(0.95); opacity: 0.5; }
                    50% { transform: scale(1.05); opacity: 0.3; }
                    100% { transform: scale(0.95); opacity: 0.5; }
                }
                .speaking-ring {
                    animation: pulse-ring 2s infinite ease-in-out;
                }
            `}</style>
        </div >
    );
};

const ParticipantTile: React.FC<{ participant: any, isMinimized?: boolean }> = ({ participant, isMinimized }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && participant.stream) {
            videoRef.current.srcObject = participant.stream;
        }
    }, [participant.stream]);

    return (
        <div
            className={`relative w-full aspect-video bg-[#3c4043] rounded-xl overflow-hidden shadow-xl border-2 transition-all duration-150`}
            style={{
                borderColor: participant.isSpeaking ? 'rgb(168, 85, 247)' : 'transparent',
                boxShadow: participant.isSpeaking ? `0 0 ${participant.volume / 2}px rgba(168, 85, 247, 0.6)` : 'none'
            }}
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />
            {!participant.isVideoOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#3c4043]">
                    <div className={`${isMinimized ? 'w-12 h-12 text-xl' : 'w-20 h-20 text-3xl'} rounded-full bg-purple-600 flex items-center justify-center font-bold text-white shadow-lg`}>
                        {participant.name.charAt(0).toUpperCase()}
                    </div>
                </div>
            )}
            <div className={`absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white font-medium border border-white/10 transition-all duration-300 ${isMinimized ? 'text-[10px] bottom-2 left-2 px-2 py-1' : 'text-sm'}`}>
                {!participant.isAudioOn ? <MicOff size={isMinimized ? 10 : 14} className="text-red-400" /> : <Mic size={isMinimized ? 10 : 14} className="text-green-400" />}
                <span>{participant.role === 'instructor' ? '(host) ' : ''}{participant.name}</span>
            </div>
            {participant.isSpeaking && (
                <div className="absolute top-4 right-4 speaking-ring w-3 h-3 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
            )}
        </div>
    );
};

export default VideoRoom;
