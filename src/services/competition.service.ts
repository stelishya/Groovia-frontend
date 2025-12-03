import axios from "axios";
import { CompetitionAxios } from "../api/user.axios";
import type { CreateCompetitionData } from "../types/competition.type";

export interface Competition {
    _id: string;
    organizer_id: string;
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

export const getOrganizerCompetitions = async (params?: { category?: string; style?: string }): Promise<Competition[]> => {
    try {
        const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
        const response = await CompetitionAxios.get(`/${queryString}`);
        console.log("response from getCompetitions in client.service.ts:", response.data);
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