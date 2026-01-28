import axios from 'axios';
import { VideoCallAxios } from '../api/user.axios';

export const startWorkshopSession = async (workshopId: string) => {
    try {
        const response = await VideoCallAxios.post(`/workshop/${workshopId}/start`);
        return { success: true, data: response.data };
    } catch (error: unknown) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to start session'
            : 'Failed to start session';
        return { success: false, message };
    }
};

export const joinWorkshopSession = async (workshopId: string) => {
    try {
        const response = await VideoCallAxios.get(`/workshop/${workshopId}/token`);
        return { success: true, data: response.data };
    } catch (error: unknown) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to join session'
            : 'Failed to join session';
        return { success: false, message };
    }
};
