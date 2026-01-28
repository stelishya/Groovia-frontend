
import axios from "axios";
import { ClientAxios } from '../../api/user.axios'; // Authenticated instance";
import type { EventRequestData } from '../../types/event.types';

const getAllDancers = async (params: URLSearchParams, page: number = 1, pageSize: number = 6) => {
    try {
        params.append('page', page.toString());
        params.append('limit', pageSize.toString());
        const response = await ClientAxios.get(`/?${params.toString()}`);
        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.data;
    } catch (error) {
        console.error('Failed to fetch dancers:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || "Failed to fetch dancers.";
            console.error(message)
            throw new Error(message);
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
}

export default getAllDancers

export const sendRequestToDancers = async (dancerId: string, requestData: EventRequestData) => {
    try {
        const response = await ClientAxios.post('/event-requests', {
            ...requestData,
            dancerId,
        });
        return response.data;
    } catch (error: unknown) {
        console.error('Failed to send request:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || "Failed to send request.";
            console.error(message);
            throw new Error(message);
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
};


// const handleLike = async (dancerId: string) => {
// try {
// await ClientAxios.post(`/dancers/${dancerId}/like`);
// // Optimistically update the UI
// setDancers(dancers.map(dancer =>
// dancer._id === dancerId ? { ...dancer, likes: dancer.likes + 1 } : dancer
// ));
// } catch (error) {
// console.error('Failed to like dancer:', error);
// }
// };
