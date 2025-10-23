import { ClientAxios } from "../../api/user.axios";
import axios from 'axios';

export const getClientEventRequests = async (params: URLSearchParams) => {
    try {
        const response = await ClientAxios.get(`/event-requests?${params.toString()}`);
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