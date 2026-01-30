import { ClientAxios } from "../../api/user.axios";
import axios from 'axios';
import type { DancerEventRequest } from "../../types/event.types";
import type { EventPaymentDetails } from "../../types/event.types";
import type { RegisteredDancer } from "../competition.service";

export interface StandardResponse<T = unknown> {
    success: boolean;
    message?: string;
    data: T;
}

export interface ClientEventRequestsResponse { // Specific response structure based on getClientEventRequests
    success: boolean;
    data: {
        requests: DancerEventRequest[];
        total: number;
    }
}

export interface UpdateBookingStatusData {
    message: string;
    request: DancerEventRequest;
}

export interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    notes: any[];
    created_at: number;
}


export const getClientEventRequests = async (params: URLSearchParams): Promise<ClientEventRequestsResponse> => {
    try {
        const response = await ClientAxios.get(`/event-requests?${params.toString()}`);
        console.log('Raw API Response:', response.data);
        // return response.data;
        // Check if the response has a data property (common in Axios responses)
        const responseData = response.data.data || response.data;
        // Return in the expected format
        return {
            // requests: responseData.requests || responseData.data || responseData,
            // total: responseData.total || responseData.length || 0
            success: true,
            data: {
                requests: responseData.requests || responseData.data || responseData,
                total: responseData.total || responseData.length || 0
            }
        };
    } catch (error) {
        console.error('Failed to fetch client event requests:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || "Failed to fetch requests.";
            throw new Error(message);
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
};

export const updateEventBookingStatus = async (eventId: string, status: 'accepted' | 'rejected' | 'cancelled', amount?: number): Promise<StandardResponse<UpdateBookingStatusData>> => {
    try {
        const response = await ClientAxios.patch(`/event-requests/${eventId}/status`, { status, amount });
        return response.data;
    } catch (error) {
        console.error('Failed to update booking status:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to update status.';
            throw new Error(message);
        } else {
            throw new Error('An unexpected error occurred.');
        }
    }
};

export const createEventBookingPayment = async (eventId: string): Promise<StandardResponse<{ order: RazorpayOrder }>> => {
    try {
        const response = await ClientAxios.post(`/event-requests/${eventId}/payment`);
        return response.data;
    } catch (error) {
        console.error('Failed to create payment order:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to create payment order.';
            throw new Error(message);
        } else {
            throw new Error('An unexpected error occurred.');
        }
    }
};

export const verifyEventBookingPayment = async (eventId: string, paymentDetails: EventPaymentDetails): Promise<StandardResponse> => {
    try {
        const response = await ClientAxios.post(`/event-requests/${eventId}/verify-payment`, paymentDetails);
        return response.data;
    } catch (error) {
        console.error('Failed to verify payment:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to verify payment.';
            throw new Error(message);
        } else {
            throw new Error('An unexpected error occurred.');
        }
    }
};

export interface UpdateClientProfileData {
    username?: string;
    email?: string;
    phone?: string;
    bio?: string;
    profileImage?: string;
}

/**
 * Get client profile
 */
export const getClientProfile = async (): Promise<unknown> => { // Using unknown as User type isn't imported
    // Ideally this should return User profile interface
    try {
        const response = await ClientAxios.get('/profile');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch client profile:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to fetch profile';
            throw new Error(message);
        }
        throw error;
    }
};

/**
 * Update client profile
 */
export const updateClientProfile = async (profileData: UpdateClientProfileData): Promise<StandardResponse> => {
    try {
        const response = await ClientAxios.patch('/profile', profileData);
        return response.data;
    } catch (error) {
        console.error('Failed to update client profile:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to update profile';
            throw new Error(message);
        }
        throw error;
    }
};

/**
 * Upload profile picture
 */
export const uploadClientProfilePicture = async (file: File): Promise<StandardResponse<{ user: any }>> => {
    try {
        const formData = new FormData();
        formData.append('profileImage', file);

        const response = await ClientAxios.post('/profile/upload-picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Failed to upload profile image:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to upload profile image';
            throw new Error(message);
        }
        throw error;
    }
};

export const getDancerProfile = async (dancerId: string) => {
    try {
        console.log('Fetching dancer profile for ID:', dancerId);
        const response = await ClientAxios.get(`/dancer-profile/${dancerId}`);
        console.log('Raw API Response in getDancerProfile in client.service.ts:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch dancer profile:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to fetch profile';
            throw new Error(message);
        }
        throw error;
    }
};

export interface CompetitionData {
    title: string;
    description: string;
    category: string;
    style: string;
    level: string;
    age_category: string;
}

export interface Competition {
    _id: string;
    organizer_id: string;
    title: string;
    description: string;
    category: string;
    style: string;
    level: string;
    age_category: string;
    mode: string;
    duration: string;
    location?: string;
    meeting_link?: string;
    posterImage: string;
    document?: string;
    fee: number;
    maxParticipants: number;
    date: string;
    registrationDeadline: string;
    status: string;
    registeredDancers: RegisteredDancer[];
    results?: Record<string, unknown> | Record<string, unknown>[];
    createdAt: string;
    updatedAt: string;
}
export const getOrganizerCompetitions = async (params?: { category?: string; style?: string }): Promise<Competition[]> => {
    try {
        const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
        const response = await ClientAxios.get(`/competitions${queryString}`);
        console.log("response from getCompetitions in client.service.ts:", response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch competitions:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to fetch competitions';
            throw new Error(message);
        }
        throw error;
    }
}

export const getEventById = async (id: string): Promise<DancerEventRequest> => {
    try {
        const response = await ClientAxios.get(`/events/${id}`);
        console.log("response from getEventById in client.service.ts:", response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch event:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to fetch event';
            throw new Error(message);
        }
        throw error;
    }
}

export const markEventRequestPaymentFailed = async (eventId: string) => {
    try {
        await ClientAxios.post(`/events/${eventId}/mark-payment-failed`);
    } catch (error) {
        console.error('Failed to mark event request payment as failed:', error);
    }
};