import { useNavigate } from "react-router-dom"
import type { LoginForm } from "../../types/auth.type"
import AuthLogin from "../../components/shared/AuthLogin"
import { userLogin } from "../../services/user/auth.service"
import toast from "react-hot-toast"
import { useDispatch } from "react-redux"
import axios from "axios"

const Login: React.FC = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleSubmit = async (formData: LoginForm) => {
        try {
            await userLogin({
                email: formData.email,
                password: formData.password,
            },dispatch);
            navigate('/home')
            toast.success('Login successful!');
        } catch (error) {
            // toast.error('Login failed!');
            console.log("Login failed",error)
            if (axios.isAxiosError(error)) {
 const errorMessage = error.response?.data?.message || 'Login failed!';
 if (errorMessage.toLowerCase().includes('blocked')) {
 toast.error('Your account has been blocked. Please contact support.', {
 duration: 5000,
 style: {
 background: '#FEE2E2',
 color: '#DC2626',
 border: '1px solid #F87171'
 }
 });
 } else {
 toast.error(errorMessage);
 }
 } else {
 toast.error('Login failed!');
 }
            throw error
        }
    }
    return (
        <AuthLogin
            signupRoute="/signup"
            onSubmit={handleSubmit}
            title="Login"
            role="user"
            />
    )
}
export default Login;