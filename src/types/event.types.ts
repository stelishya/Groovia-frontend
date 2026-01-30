export interface EventRequestData {
    dancerId: string;
    event: string;
    date: string;
    duration: string;
    venue: string;
    description?: string;
    specialRequests?: string;
}

export interface EventPaymentDetails {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}
export interface Client {
    _id: string;
    username: string;
    profileImage?: string;
}

export interface EventRequest {
    _id: string;
    clientId: Client | null;
    event: string;
    date: string;
    venue: string;
    budget: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'confirmed' | 'cancelled';
    paymentStatus?: string;
}

export interface Dancer {
    _id: string;
    username: string;
    profileImage?: string;
    bio?: string;
    danceStyles?: string[];
    likes?: string[];
    createdAt: string;
    updatedAt: string;
}
export interface EventRequests {
    _id: string;
    dancerId: { // dancerId is an object after population
        _id: string;
        username: string;
        profileImage?: string;
    } | null;
}

export interface Dancers {
    _id: string;
    username: string;
    profileImage?: string;
    danceStyles?: string[];
}

export interface DancerEventRequest {
    _id: string;
    dancerId: Dancers | null;
    event: string;
    date: string;
    venue: string;
    budget: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'confirmed' | 'cancelled';
    acceptedAmount?: number;
    paymentStatus?: 'pending' | 'failed' | 'paid';
}