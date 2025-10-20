// import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
// import { loginUser } from "../../redux/slices/user.slice"
import toast from "react-hot-toast";
import { useState } from "react";
// import { userLogin } from "../../services/user/auth.service";
import type { LoginForm } from "../../types/auth.type";
import { AlertCircle } from "lucide-react";


export interface AuthLoginProps {
  signupRoute: string
  onSubmit: (data: LoginForm) => Promise<void>
  title: string
//   subtitle?: string
  role: "user" | "admin"
}

export default function AuthLogin({
    signupRoute,
    onSubmit,
    title,
    // subtitle,
    role
}:AuthLoginProps){
    const [credentials, setCredentials] = useState<{email:string;password:string,role:string}>({ email: '', password: '',role });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));

        //clear errors when user starts typing
        if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: undefined });
    }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
         const newErrors: { email?: string; password?: string } = {};

    // Validation
    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(credentials.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
        // if (!credentials.email || !credentials.password) {
        //     toast.error('Please enter both email and password.');
        //     return;
        // }
        if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Show error toast for validation errors
      toast.error('Please fix the form errors before submitting', {
        position: 'top-right',
        duration: 4000,
        style: {
          background: '#FEE2E2',
          color: '#DC2626',
          border: '1px solid #FECACA',
        },
        icon: '⚠️',
      });
      return;
    }

        setIsLoading(true);
        const loadingToast = toast.loading('Signing you in...', {
      position: 'top-right',
      style: {
        background: '#EFF6FF',
        color: '#1D4ED8',
        border: '1px solid #DBEAFE',
      },
    });
        try {
            await onSubmit(credentials);
            // await userLogin(credentials)
        } catch (error) {
            // Error toast is handled by the service
            console.error('Login failed:', error);
            

      // toast.error(error as string, {
      //   position: 'top-right',
      //   duration: 5000,
      //   style: {
      //     background: '#FEE2E2',
      //     color: '#DC2626',
      //     border: '1px solid #FECACA',
      //   },
      //   icon: '❌',
      // });
        } finally {
            setIsLoading(false);
            toast.dismiss(loadingToast)
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

                    <h2 className="text-4xl font-bold text-white mb-8 mt-10">{title}</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                // type="email"
                                name="email"
                                placeholder="Email"
                                value={credentials.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-purple-200/50 border-none rounded-lg text-white placeholder-purple-100/70 focus:outline-none focus:ring-2 focus:ring-purple-300"
                            />
                            {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
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
                            {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </p>
              )}
                          {(role==='user' && 
                            <div className="text-right mt-2">
                                <a href="/forgot-password" className="text-sm text-purple-200 hover:text-white transition-colors">Forgot Password?</a>
                            </div>
                          )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-purple-700 hover:bg-purple-800 disabled:bg-purple-700/50 text-white font-bold rounded-lg transition-colors shadow-lg"
                        >
                            {isLoading ? 'Logging In...' : 'Login'}
                        </button>
                    </form>

                    {/* {(role==='user' &&
                    <div className="mt-6 text-center">
                        <button className="w-full py-3 bg-white/90 hover:bg-white text-purple-800 font-semibold rounded-lg transition-colors shadow-md">
                            Continue with Google
                        </button>
                    </div>
                    )} */}

                    {(role==='user' &&
                    <p className="text-center text-sm text-purple-200 mt-6">
                        New to Groovia?{' '}
                        <Link to={signupRoute}>
                        Sign up now.
                        </Link>
                    </p>
                    )}
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
