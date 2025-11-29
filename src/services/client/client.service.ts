import { ClientAxios } from "../../api/user.axios";
import axios from 'axios';

export const getClientEventRequests = async (params: URLSearchParams) => {
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

export const updateEventBookingStatus = async (eventId: string, status: 'accepted' | 'rejected' | 'cancelled') => {
    try {
        const response = await ClientAxios.patch(`/event-requests/${eventId}/status`, { status });
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
export const getClientProfile = async () => {
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
export const updateClientProfile = async (profileData: UpdateClientProfileData) => {
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
export const uploadClientProfilePicture = async (file: File) => {
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