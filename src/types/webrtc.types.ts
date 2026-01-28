// WebRTC types for video calling
export interface WebRTCOffer {
    type: 'offer';
    sdp: string;
}

export interface WebRTCAnswer {
    type: 'answer';
    sdp: string;
}

export interface WebRTCIceCandidate {
    candidate: string;
    sdpMLineIndex: number | null;
    sdpMid: string | null;
}

export type RTCSessionDescriptionInit = WebRTCOffer | WebRTCAnswer;
