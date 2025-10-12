import { useNavigate } from "react-router-dom"
import type { LoginForm } from "../../types/auth.type"
import AuthLogin from "../../components/shared/authLogin"
import { userLogin } from "../../services/user/auth.service"
import toast from "react-hot-toast"

const Login: React.FC = () => {
    const navigate = useNavigate()

    const handleSubmit = async (formData: LoginForm) => {
        try {
            await userLogin({
                email: formData.email,
                password: formData.password,
            })
            navigate('/home')
            toast.success('Login successful!');
        } catch (error) {
            toast.error('Login failed!');
            console.log("Login failed",error)
            throw error
        }
    }
    return (
        <AuthLogin
            signupRoute="/login"
            onSubmit={handleSubmit}
            />
    )
}
export default Login;