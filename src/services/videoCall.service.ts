import { VideoCallAxios } from '../api/user.axios';

export const startWorkshopSession = async (workshopId: string) => {
    try {
        const response = await VideoCallAxios.post(`/workshop/${workshopId}/start`);
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to start session'
        };
    }
};

export const joinWorkshopSession = async (workshopId: string) => {
    try {
        const response = await VideoCallAxios.get(`/workshop/${workshopId}/token`);
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to join session'
        };
    }
};
