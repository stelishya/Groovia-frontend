import axios from 'axios';
import { DancerAxios } from '../../api/user.axios';

export const getEventRequests = async (params: URLSearchParams) => {
    try {
        const response = await DancerAxios.get(`/event-requests?${params.toString()}`);
        // return response.data;
        const raw = response.data;
        const payload = raw?.data ?? raw; // support ApiResponse envelope or plain
        const requests = payload?.requests ?? payload?.data ?? (Array.isArray(payload) ? payload : []);
        const total = payload?.total ?? (Array.isArray(requests) ? requests.length : 0);
        return { requests, total };
    } catch (error) {
        console.error('Failed to fetch event requests:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || "Failed to fetch requests.";
            throw new Error(message);
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
};

export const toggleLike = async (dancerId: string) => {
    try {
        const response = await DancerAxios.post(`/${dancerId}/like`);
        return response.data;
    } catch (error) {
        console.error('Failed to toggle like:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to update like status.';
            throw new Error(message);
        } else {
            throw new Error('An unexpected error occurred.');
        }
    }
};

export interface UpdateDancerProfileData {
    username?: string;
    email?: string;
    phone?: string;
    bio?: string;
    experienceYears?: number;
    portfolioLinks?: string[];
    danceStyles?: string[];
    preferredLocation?: string;
    availableForPrograms?: boolean;
    profileImage?: string;
}

/**
 * Get dancer profile
 */
export const getDancerProfile = async () => {
    try {
        const response = await DancerAxios.get('/profile');
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

/**
 * Update dancer profile
 */
export const updateDancerProfile = async (profileData: UpdateDancerProfileData) => {
    try {
        const response = await DancerAxios.patch('/profile', profileData);
        return response.data;
    } catch (error) {
        console.error('Failed to update dancer profile:', error);
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
export const uploadProfilePicture = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append('profileImage', file);

        const response = await DancerAxios.post('/profile/upload-picture', formData, {
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

/**
 * Upload certificate
 */
export const uploadCertificate = async (file: File, name?: string) => {
    try {
        const formData = new FormData();
        formData.append('certificate', file);
        if (name) {
            formData.append('name', name);
        }

        const response = await DancerAxios.post('/profile/upload-certificate', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Failed to upload certificate:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to upload certificate';
            throw new Error(message);
        }
        throw error;
    }
};

/**
 * Update event request status
 */
export const updateEventRequestStatus = async (
    requestId: string,
    status: 'accepted' | 'rejected' | 'cancelled'
) => {
    try {
        const response = await DancerAxios.patch(`/event-requests/${requestId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Failed to update event request status:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to update status';
            throw new Error(message);
        }
        throw error;
    }
};
