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

export interface UpdateClientProfileData {
    username?: string;
    email?: string;
    phone?: string;
    bio?: string;
    profileImage?: string;
}

/**
 * Get client profile
 */
export const getClientProfile = async () => {
    try {
        const response = await ClientAxios.get('/profile');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch client profile:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to fetch profile';
            throw new Error(message);
        }
        throw error;
    }
};

/**
 * Update client profile
 */
export const updateClientProfile = async (profileData: UpdateClientProfileData) => {
    try {
        const response = await ClientAxios.patch('/profile', profileData);
        return response.data;
    } catch (error) {
        console.error('Failed to update client profile:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to update profile';
            throw new Error(message);
        }
        throw error;
    }
};

/**
 * Upload profile picture
 */
export const uploadClientProfilePicture = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append('profileImage', file);

        const response = await ClientAxios.post('/profile/upload-picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Failed to upload profile image:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to upload profile image';
            throw new Error(message);
        }
        throw error;
    }
};

export const getDancerProfile = async (dancerId: string) => {
    try {
        console.log('Fetching dancer profile for ID:', dancerId);
        const response = await ClientAxios.get(`/dancer-profile/${dancerId}`);
        console.log('Raw API Response in getDancerProfile in client.service.ts:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch dancer profile:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to fetch profile';
            throw new Error(message);
        }
        throw error;
    }
};

export interface CompetitionData {
    title: string;
    description: string;
    category: string;
    style: string;
    level: string;
    age_category: string;
}

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
export const getCompetitions = async (params?: { category?: string; style?: string }): Promise<Competition[]> => {
    try {
                const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
        const response = await ClientAxios.get(`/competitions${queryString}`);
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

export const createCompetition = async (competitionData: CompetitionData) => {
    try {
        const response = await ClientAxios.post('/competitions', competitionData);
        return response.data;
    } catch (error) {
        console.error('Failed to create competition:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Failed to create competition';
            throw new Error(message);
        }
        throw error;
    }
}

  
  interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
  }
  
//   class CompetitionService {
//     async getAllCompetitions(params?: { category?: string; style?: string }): Promise<Competition[]> {
//       try {
//         const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
//         const response = await apiClient.get<ApiResponse<Competition[]>>(`/competitions${queryString}`);
//         return response.data.data;
//       } catch (error) {
//         console.error('Error fetching competitions:', error);
//         throw error;
//       }
//     }
  
//     async getActiveCompetitions(): Promise<Competition[]> {
//       try {
//         const response = await apiClient.get<ApiResponse<Competition[]>>('/competitions/active');
//         return response.data.data;
//       } catch (error) {
//         console.error('Error fetching active competitions:', error);
//         throw error;
//       }
//     }
  
//     async getCompetitionById(id: string): Promise<Competition> {
//       try {
//         const response = await apiClient.get<ApiResponse<Competition>>(`/competitions/${id}`);
//         return response.data.data;
//       } catch (error) {
//         console.error('Error fetching competition:', error);
//         throw error;
//       }
//     }
  
//     async registerForCompetition(competitionId: string): Promise<void> {
//       try {
//         await apiClient.post(`/competitions/${competitionId}/register`, {});
//       } catch (error) {
//         console.error('Error registering for competition:', error);
//         throw error;
//       }
//     }
//   }
  
 
  