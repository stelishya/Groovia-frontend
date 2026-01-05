import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ShieldAlert, FileQuestion } from 'lucide-react';

interface ErrorPageProps {
    code?: number;
    title?: string;
    message?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ code: propCode, title: propTitle, message: propMessage }) => {
    const navigate = useNavigate();
    // Attempt to capture router errors if used as an errorElement
    // Default to 404 since this is primarily used for catch-all routes
    let statusCode = propCode || 404;
    let title = propTitle || "Page Not Found";
    let message = propMessage || "The page you are looking for doesn't exist or has been moved.";

    // Customize content based on status code
    let Icon = FileQuestion;
    if (statusCode === 403 || statusCode === 401) {
        Icon = ShieldAlert;
        title = title || "Access Denied";
        message = message || "You don't have permission to access this page.";
    } else if (statusCode === 500) {
        Icon = AlertCircle;
        title = title || "Server Error";
        message = message || "Our servers are having a moment. Please try again later.";
    }

    return (
        <div className="min-h-screen w-full bg-[#100918] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-md w-full">
                {/* Glass Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">

                    {/* Icon/Code */}
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                            <div className="relative bg-white/10 p-4 rounded-full border border-white/20">
                                <Icon size={64} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2 tracking-tighter opacity-80">
                        {statusCode}
                    </h1>

                    <h2 className="text-2xl font-bold text-white mb-3">
                        {title}
                    </h2>

                    <p className="text-gray-400 mb-8 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all duration-300 font-medium group"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Go Back
                        </button>
                        {/* <button
                            onClick={() => navigate('/home')} // Or condition based on role
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25 transition-all duration-300 font-medium hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Home size={18} />
                            Go Home
                        </button> */}
                    </div>

                </div>

                {/* Footer decoration */}
                <div className="mt-8 text-center">
                    <p className="text-white/20 text-sm font-medium tracking-widest uppercase">Groovia Platform</p>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;
