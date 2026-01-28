import axios from "axios";
import { WorkshopAxios } from "../../api/user.axios";
import type { CreateWorkshopData } from "../../types/workshop.type";
import type { WorkshopBookingPaymentData } from "../../types/payment.types";

export const createWorkshop = async (data: CreateWorkshopData | FormData) => {
    try {
        const config = {
            headers: {
                'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
            },
        };
        const response = await WorkshopAxios.post('', data, config);
        return { success: true, data: response.data };
    } catch (error: unknown) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to create workshop'
            : 'Failed to create workshop';
        return { success: false, message };
    }
};

export const createBookingOrder = async (workshopId: string, amount: number) => {
    try {
        const response = await WorkshopAxios.post('/bookings/order', { workshopId, amount });
        return { success: true, data: response.data };
    } catch (error: unknown) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to create booking order'
            : 'Failed to create booking order';
        return { success: false, message };
    }
};

export const verifyBookingPayment = async (paymentData: WorkshopBookingPaymentData) => {
    try {
        const response = await WorkshopAxios.post('/bookings/verify', paymentData);
        return { success: true, data: response.data };
    } catch (error: unknown) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to verify payment'
            : 'Failed to verify payment';
        return { success: false, message };
    }
};

export const getAllWorkshops = async (params?: URLSearchParams) => {
    try {
        const queryString = params ? `?${params.toString()}` : '';
        const response = await WorkshopAxios.get(`${queryString}`);
        return { success: true, data: response.data };
    } catch (error: unknown) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to fetch workshops'
            : 'Failed to fetch workshops';
        return { success: false, message };
    }
};

export const getInstructorWorkshops = async () => {
    try {
        const response = await WorkshopAxios.get('/instructor');
        console.log("response in get instructor workshops", response);
        return { success: true, data: response.data };
    } catch (error: unknown) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to fetch instructor workshops'
            : 'Failed to fetch instructor workshops';
        return { success: false, message };
    }
};

export const getBookedWorkshops = async (params?: {
    search?: string;
    style?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
}) => {
    try {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.style) queryParams.append('style', params.style);
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const queryString = queryParams.toString();
        const response = await WorkshopAxios.get(`/booked?${queryString}`);
        return { success: true, data: response.data };
    } catch (error: unknown) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to fetch booked workshops'
            : 'Failed to fetch booked workshops';
        return { success: false, message };
    }
};

export const getWorkshopById = async (id: string) => {
    try {
        const response = await WorkshopAxios.get(`/${id}`);
        return { success: true, data: response.data };
    } catch (error: unknown) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to fetch workshop details'
            : 'Failed to fetch workshop details';
        return { success: false, message };
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
    } catch (error: unknown) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to update workshop'
            : 'Failed to update workshop';
        return { success: false, message };
    }
};

export const deleteWorkshop = async (id: string) => {
    try {
        const response = await WorkshopAxios.delete(`/${id}`);
        return { success: true, data: response.data };
    } catch (error: unknown) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to delete workshop'
            : 'Failed to delete workshop';
        return { success: false, message };
    }
};

export const initiateWorkshopBooking = async (workshopId: string) => {
    try {
        const response = await WorkshopAxios.post(`/${workshopId}/initiate-booking`);
        return { success: true, data: response.data };
    } catch (error: unknown) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to initiate booking'
            : 'Failed to initiate booking';
        return { success: false, message };
    }
};

export const confirmWorkshopBooking = async (
    workshopId: string,
    paymentId: string,
    orderId: string,
    signature: string
) => {
    try {
        const response = await WorkshopAxios.post(`/${workshopId}/confirm-booking`, {
            paymentId,
            orderId,
            signature
        });
        return { success: true, data: response.data };
    } catch (error: unknown) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to confirm booking'
            : 'Failed to confirm booking';
        return { success: false, message };
    }
};

export const markWorkshopPaymentFailed = async (workshopId: string | undefined) => {
    try {
        const response = await WorkshopAxios.post(`/${workshopId}/mark-payment-failed`);
        return { success: true, data: response.data };
    } catch (error: unknown) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to mark payment as failed'
            : 'Failed to mark payment as failed';
        return { success: false, message };
    }
};