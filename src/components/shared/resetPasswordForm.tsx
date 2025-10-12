import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { userResetPassword } from '../../services/user/auth.service';

const ResetPasswordForm: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!token){
            toast.error("Invalid or missing the token")
            return;
        }
        if (password !== confirmPassword) {
            console.error("Passwords do not match");
            toast.error("Passwords do not match")
            return;
        }
        if (password.length < 6) {
            console.error("Password must be at least 6 characters long");
            toast.error("Password must be at least 6 characters long")
            return;
        }
        setIsLoading(true);
        console.log("Submitting new password...");
        try {
            await userResetPassword({
                token,
                password,
                confirmPassword,
            })
            console.log("Password reset successfully");
            setTimeout(()=>{
                navigate("/login")
            },2000)
        } catch (error) {
            console.error("Failed to reset password",error)
        }finally{
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex flex-col items-center justify-center p-4 font-sans">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-white/90 tracking-wide">Groovia</h1>
            </div>

            <div className="w-full max-w-md">
                <div className="bg-purple-600/40 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-3xl font-semibold text-white text-center mb-8">Change Your Password</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* New Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-purple-200 mb-2">Enter New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-10 py-3 bg-purple-500/30 border-2 border-purple-400/50 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:border-purple-300 focus:bg-purple-500/40 transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-purple-200 mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-10 py-3 bg-purple-500/30 border-2 border-purple-400/50 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:border-purple-300 focus:bg-purple-500/40 transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-purple-700/50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-colors shadow-lg mt-2"
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPasswordForm;