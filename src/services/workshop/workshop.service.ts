import { WorkshopAxios } from "../../api/user.axios";
import type { CreateWorkshopData, Workshop } from "../../types/workshop.type";

export const createWorkshop = async (data: CreateWorkshopData | FormData) => {
    try {
        const config = {
            headers: {
                'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
            },
        };
        const response = await WorkshopAxios.post('', data, config);
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create workshop'
        };
    }
};

export const createBookingOrder = async (workshopId: string, amount: number) => {
    try {
        const response = await WorkshopAxios.post('/bookings/order', { workshopId, amount });
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create booking order'
        };
    }
};

export const verifyBookingPayment = async (paymentData: any) => {
    try {
        const response = await WorkshopAxios.post('/bookings/verify', paymentData);
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to verify payment'
        };
    }
};

export const getAllWorkshops = async (params?: URLSearchParams) => {
    try {
        const queryString = params ? `?${params.toString()}` : '';
        const response = await WorkshopAxios.get(`${queryString}`);
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch workshops'
        };
    }
};

export const getInstructorWorkshops = async () => {
    try {
        const response = await WorkshopAxios.get('/instructor');
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch instructor workshops'
        };
    }
};

export const getWorkshopById = async (id: string) => {
    try {
        const response = await WorkshopAxios.get(`/${id}`);
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch workshop details'
        };
    }
};

export const updateWorkshop = async (id: string, data: Partial<CreateWorkshopData> | FormData) => {
    try {
        const config = {
            headers: {
                'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
            },
        };
        const response = await WorkshopAxios.patch(`/${id}`, data, config);
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update workshop'
        };
    }
};

export const deleteWorkshop = async (id: string) => {
    try {
        const response = await WorkshopAxios.delete(`/${id}`);
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete workshop'
        };
    }
};
