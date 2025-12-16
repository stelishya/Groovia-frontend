export enum WorkshopMode {
    ONLINE = 'online',
    OFFLINE = 'offline',
    // HYBRID = 'Hybrid',
}

export interface Session {
    date: string;
    startTime: string;
    endTime: string;
}

export interface Workshop {
    _id: string;
    title: string;
    description: string;
    instructor: {
        _id: string;
        username: string;
        profileImage?: string;
    };
    style: string;
    mode: WorkshopMode;
    startDate: string;
    endDate: string;
    fee: number;
    maxParticipants: number;
    participants: any[]; // Using any[] for now as Participant structure is complex
    userParticipant?: {
        dancerId: string;
        paymentStatus: 'paid' | 'failed';
        paymentId?: string;
        attendence?: 'present' | 'absent';
        paymentDate?: string;
        registeredDate?: string;
        snapshot?: {
            title: string;
            fee: number;
            date: Date;
            time: string;
            location: string;
            image: string;
        };
    };
    posterImage: string;
    location?: string;
    meetingLink?: string;
    deadline: string;
    sessions: Session[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateWorkshopData {
    title: string;
    description: string;
    style: string;
    mode: WorkshopMode;
    startDate: string;
    endDate: string;
    fee: number;
    maxParticipants: number;
    posterImage: string;
    location?: string;
    meetingLink?: string;
    deadline: string;
    sessions: Session[];
}
