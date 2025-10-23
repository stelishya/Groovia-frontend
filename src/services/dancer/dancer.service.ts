import axios from 'axios';
import { DancerAxios } from '../../api/user.axios';

export const getEventRequests = async (params: URLSearchParams) => {
    try {
        const response = await DancerAxios.get(`/event-requests?${params.toString()}`);
        return response.data;
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

