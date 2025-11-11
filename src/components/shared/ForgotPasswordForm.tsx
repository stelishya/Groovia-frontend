import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { userSendResetLink } from '../../services/user/auth.service';

const ForgotPasswordForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email address.");
            console.error("Email is required");
            return;
        }
        setIsLoading(true);
        // does email exist or not

        console.log("Submitting email for password reset:", email);
        try {
            const response =  await userSendResetLink(email);
            console.log("response:",response)
            if(response.success){
                toast.success("Password reset link sent successfully!");
            }else{
                toast.error("Email does not exist.")
            }
        } catch (error) {
            console.error("Failed to sent reset link",error)
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex flex-col items-center justify-center p-4 font-sans">
            <div className="absolute top-8 left-8">
                <button
                    onClick={() => navigate(-1)} // Go back to the previous page
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all duration-200 z-10 border border-white/20"
                >
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
            </div>

            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-white/90 tracking-wide">Groovia</h1>
            </div>

            <div className="w-full max-w-md">
                <div className="bg-purple-600/40 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-3xl font-semibold text-white text-center mb-6">Forgot Password</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">Enter your Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-3 py-3 bg-purple-500/30 border-2 border-purple-400/50 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:border-purple-300 focus:bg-purple-500/40 transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-purple-700/50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-colors shadow-lg"
                        >
                            {isLoading ? 'Sending...' : 'Continue'}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <Link to="/login" className="text-sm font-medium text-purple-200 hover:text-white transition-colors">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;