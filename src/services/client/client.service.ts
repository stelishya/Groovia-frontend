import { ClientAxios } from "../../api/user.axios";
import axios from 'axios';

export const getClientEventRequests = async () => {
    try {
        const response = await ClientAxios.get('/event-requests');
        return response.data;
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