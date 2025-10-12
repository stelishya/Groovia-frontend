// import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
// import { loginUser } from "../../redux/slices/user.slice"
import toast from "react-hot-toast";
import { useState } from "react";
// import { userLogin } from "../../services/user/auth.service";
import type { LoginForm } from "../../types/auth.type";


export interface AuthLoginProps {
  signupRoute: string
  onSubmit: (data: LoginForm) => Promise<void>
  // title: string
  // subtitle?: string
}

export default function AuthLogin({
    signupRoute,
    onSubmit
}:AuthLoginProps){
    const [credentials, setCredentials] = useState<{email:string;password:string}>({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!credentials.email || !credentials.password) {
            toast.error('Please enter both email and password.');
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(credentials);
            // await userLogin(credentials)
        } catch (error) {
            // Error toast is handled by the service
            console.error('Login failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-pink-600 p-4">
            <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-purple-500/20 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
                {/* Left Side: Form */}
                <div className="p-8 md:p-12">
                    <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <h2 className="text-4xl font-bold text-white mb-8 mt-10">Login</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={credentials.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-purple-200/50 border-none rounded-lg text-white placeholder-purple-100/70 focus:outline-none focus:ring-2 focus:ring-purple-300"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={credentials.password}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-purple-200/50 border-none rounded-lg text-white placeholder-purple-100/70 focus:outline-none focus:ring-2 focus:ring-purple-300"
                            />
                            <div className="text-right mt-2">
                                <a href="/forgot-password" className="text-sm text-purple-200 hover:text-white transition-colors">Forgot Password?</a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-purple-700 hover:bg-purple-800 disabled:bg-purple-700/50 text-white font-bold rounded-lg transition-colors shadow-lg"
                        >
                            {isLoading ? 'Logging In...' : 'Login'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button className="w-full py-3 bg-white/90 hover:bg-white text-purple-800 font-semibold rounded-lg transition-colors shadow-md">
                            Continue with Google
                        </button>
                    </div>

                    <p className="text-center text-sm text-purple-200 mt-6">
                        New to Groovia?{' '}
                        <Link to={signupRoute}>
                        Sign up now.
                        </Link>
                        {/* <button onClick={() => navigate('/signup')} className="font-semibold text-white hover:underline">
                            Sign up now.
                        </button> */}
                    </p>
                </div>

                {/* Right Side: Image */}
                <div className="hidden md:block relative">
                    <img
                        src="/src/assets/LoginImage.png" 
                        alt="Dancer"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
                    <div className="absolute bottom-12 left-12 text-white">
                        <h1 className="text-5xl font-bold ml-16">Groovia</h1>
                    </div>
                </div>
            </div>
        </div>
    );
}
