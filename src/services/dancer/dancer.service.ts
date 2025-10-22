import axios from 'axios';
import { DancerAxios } from '../../api/user.axios';

export const getEventRequests = async () => {
    try {
        const response = await DancerAxios.get('/event-requests');
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