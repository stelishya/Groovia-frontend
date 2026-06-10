import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser as logoutUserAction } from "../redux/slices/user.slice";
import { logoutUser as logoutUserService } from "../services/user/auth.service";

export const useLogout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logoutUserService();
        } catch (error) {
            console.error("Logout failed on the server", error);
        } finally {
            dispatch(logoutUserAction());
            navigate('/login');
        }
    };

    return { handleLogout };
};
