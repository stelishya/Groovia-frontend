import { useNavigate } from "react-router-dom"
import type { SignupForm } from "../../types/auth.type"
import { signup } from "../../services/user/auth.service"
import AuthSignup from "../../components/shared/AuthSignup"


const Signup: React.FC = () => {
    const navigate = useNavigate()

    const handleSubmit = async (formData: SignupForm) => {
        try {
            console.log("signup service function in dancer signup.tsx!")
            await signup(formData);

            localStorage.setItem('pendingVerificationEmail', formData.email);
            console.log("navigate to verify-otp in dancer signup.tsx!")
            navigate('/verify-otp', {
                state: { email: formData.email },
                replace: true
            });
        } catch (error) {
            console.error('User signup failed:', error);
            throw error;
        }
    }

    return (
        <AuthSignup
            loginRoute="/login"
            onSubmit={handleSubmit}
        />
    );
}
export default Signup;