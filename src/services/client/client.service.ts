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