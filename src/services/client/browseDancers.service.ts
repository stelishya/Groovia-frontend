
import axios from "axios";
import { ClientAxios } from '../../api/user.axios'; // Authenticated instance";

const getAllDancers = async ({params}: {params: any},page: number = 1, pageSize: number = 10) => {
    try {
        const response = await ClientAxios.get(`/dancers?page=${page}&limit=${pageSize}`);
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
