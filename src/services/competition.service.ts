import axios from "axios";
import { CompetitionAxios } from "../api/user.axios";
import type { CreateCompetitionData } from "../types/competition.type";

export interface Competition {
    _id: string;
    organizer_id: string | {
        _id: string;
        username: string;
        profileImage?: string;
    };
    title: string;
    description: string;
    category: string;
    style: string;
    level: string;
    age_category: string;
    mode: string;
    duration: string;
    location?: string;
    meeting_link?: string;
    posterImage: string;
    document?: string;
    fee: number;
    maxParticipants: number;
    date: string;
    registrationDeadline: string;
    status: string;
    registeredDancers: any[];
    results?: any;
    createdAt: string;
    updatedAt: string;
}

export const getCompetitionById = async (id: string): Promise<Competition> => {
    try {
        const response = await CompetitionAxios.get(`/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch competition details:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to fetch competition details';
            throw new Error(message);
        }
        throw error;
    }
}

export const getOrganizerCompetitions = async (params?: { search?: string; sortBy?: string; level?: string; category?: string; style?: string; page?: number; limit?: number }): Promise<{ data: Competition[], total: number, page: number, totalPages: number }> => {
    try {
        const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        console.log("Fetching organizer competitions with queryString:", queryString)
        const response = await CompetitionAxios.get(`/my-competitions${queryString}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch competitions:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to fetch competitions';
            throw new Error(message);
        }
        throw error;
    }
}

export const getRegisteredCompetitions = async (params?: { search?: string; sortBy?: string; level?: string; category?: string; style?: string; page?: number; limit?: number }): Promise<{ data: Competition[], total: number, page: number, totalPages: number }> => {
    try {
        const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        const response = await CompetitionAxios.get(`/my-registrations${queryString}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch registered competitions:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to fetch registered competitions';
            throw new Error(message);
        }
        throw error;
    }
}

export interface AllCompetitionsResponse {
    data: Competition[];
    total: number;
    page: number;
    totalPages: number;
}

export const getAllCompetitions = async (params?: any): Promise<AllCompetitionsResponse> => {
    try {
        const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
        const response = await CompetitionAxios.get(`/${queryString}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch all competitions:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to fetch all competitions';
            throw new Error(message);
        }
        throw error;
    }
}

export const createCompetition = async (data: CreateCompetitionData | FormData) => {
    try {
        const config = {
            headers: {
                'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
            },
        };
        const response = await CompetitionAxios.post('', data, config);
        console.log("create competition response:", response.data);
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create competition'
        };
    }
};

export const updateCompetition = async (id: string, data: Partial<CreateCompetitionData> | FormData) => {
    try {
        const config = {
            headers: {
                'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
            },
        };
        const response = await CompetitionAxios.patch(`/${id}`, data, config);
        console.log("update competition response:", response.data);
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update competition'
        };
    }
};

export const deleteCompetition = async (id: string) => {
    try {
        const response = await CompetitionAxios.delete(`/${id}`);
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete competition'
        };
    }
};

export const markCompetitionPaymentFailed = async (competitionId: string) => {
    try {
        await CompetitionAxios.post(`/${competitionId}/mark-payment-failed`);
    } catch (error) {
        console.error('Failed to mark competition payment as failed:', error);
    }
};