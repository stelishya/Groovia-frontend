// import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
// import { loginUser } from "../../redux/slices/user.slice"
import toast from "react-hot-toast";
import { useState } from "react";
// import { userLogin } from "../../services/user/auth.service";
import type { LoginForm } from "../../types/auth.type";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { fetchMyProfile } from '../../services/user/auth.service';
import { loginUser } from '../../redux/slices/user.slice';
import { Role, UserType } from '../../utils/constants/roles';


export interface AuthLoginProps {
  signupRoute: string
  onSubmit: (data: LoginForm) => Promise<void>
  title: string
  //   subtitle?: string
  role: UserType
}

export default function AuthLogin({
  signupRoute,
  onSubmit,
  title,
  // subtitle,
  role
}: AuthLoginProps) {
  const [credentials, setCredentials] = useState<{ email: string; password: string, role: string }>({ email: '', password: '', role });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role.CLIENT | Role.DANCER | null>(null);
  const [isGoogleInitializing, setIsGoogleInitializing] = useState(false);
  const dispatch = useDispatch();

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

  function loadGoogleScript() {
    return new Promise<void>((resolve, reject) => {
      if ((window as any).google?.accounts?.id) return resolve();
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load Google script'));
      document.head.appendChild(s);
      console.log("Google script loaded - s: ", s);
    });
  }

  async function startGoogleSignIn(role: 'client' | 'dancer') {
    console.log("role in startGoogleSignIn : ", role);
    console.log('origin:', location.origin);

    setIsGoogleInitializing(true);

    // Clear any existing button
    const existingButton = document.getElementById('google-signin-button');
    if (existingButton) {
      existingButton.innerHTML = '';
    }

    await loadGoogleScript();
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    console.log("clientId : ", clientId)
    if (!clientId) {
      setIsGoogleInitializing(false);
      throw new Error('Missing VITE_GOOGLE_CLIENT_ID');
    }

    console.log('🔵 Initializing Google Sign-In...');

    (window as any).google.accounts.id.initialize({
      client_id: clientId,
      callback: async (resp: any) => {
        console.log('🟢 Google callback fired!', resp);
        const credential = resp?.credential;
        console.log("credential : ", credential);

        if (!credential) {
          console.error('❌ No credential received from Google');
          return;
        }

        try {
          // Send credential + role to backend
          console.log('📤 Sending to backend:', { role });
          const url = `${import.meta.env.VITE_SERVER_URL}/auth/common/google`;
          const { data } = await axios.post(url, { credential, role });
          console.log('📥 Backend response:', data);
          if (!data.success) {
            toast.error(data.message);
            return;
          }
          // Save token and hydrate
          const accessToken = data?.accessToken;
          if (!accessToken) throw new Error('No token returned from Google auth');

          localStorage.setItem('token', accessToken);
          console.log('✅ Token saved, fetching profile...');

          const me = await fetchMyProfile();
          console.log('👤 User profile fetched:', me);
          dispatch(loginUser({ user: me.profile, token: accessToken }));

          console.log('✅ navigating to /home');
          navigate('/home');
          setShowRoleModal(false);
          setSelectedRole(null);
        } catch (error) {
          console.error('❌ Google login error:', error);
          setShowRoleModal(false);
          setSelectedRole(null);
        }
      },
      cancel_on_tap_outside: false,
    });

    console.log('🔵 Initialization complete, rendering button...');

    // Render Google Sign-In button (more reliable than One Tap)
    // Wait a tick for React to render the div
    setTimeout(() => {
      const buttonDiv = document.getElementById('google-signin-button');
      if (buttonDiv) {
        (window as any).google.accounts.id.renderButton(
          buttonDiv,
          {
            theme: 'filled_blue',
            size: 'large',
            text: 'continue_with',
            width: 280,
            locale: 'en'
          }
        );
        console.log('✅ Google button rendered');
      } else {
        console.error('❌ Button container not found');
        setIsGoogleInitializing(false);
      }
    }, 100);
  }

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
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
      toast.dismiss(loadingToast)
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-pink-600 p-4">
      <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-purple-900 border-2 border-purple-800 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  className="w-full pr-12 px-4 py-3 bg-purple-200/50 border-none rounded-lg text-white placeholder-purple-100/70 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                >
                  {showPassword ? <Eye className="w-5 h-5 text-purple-700" /> : <EyeOff className="w-5 h-5 text-purple-700" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </p>
              )}
              {(role === 'user' &&
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

          {(role === 'user' &&
            <div className="mt-6 text-center">
              <button className="w-full py-3 bg-white/90 hover:bg-white text-purple-800 font-semibold rounded-lg transition-colors shadow-md"
                onClick={() => setShowRoleModal(true)}>
                Continue with Google
              </button>
            </div>
          )}

          {(role === 'user' &&
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

      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">Continue as</h3>
            <p className="text-sm text-gray-600 mb-4">Select your role to continue</p>
            <div className="space-y-2">
              <button className={`w-full py-2 rounded ${selectedRole === 'dancer' ? 'bg-purple-600 text-white' : 'bg-gray-300'}`}
                onClick={() => setSelectedRole(Role.DANCER)}>Dancer</button>
              <button className={`w-full py-2 rounded ${selectedRole === 'client' ? 'bg-purple-600 text-white' : 'bg-gray-300'}`}
                onClick={() => setSelectedRole(Role.CLIENT)}>Client</button>
            </div>

            {isGoogleInitializing && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2 text-center">Sign in with Google as {selectedRole}</p>
                <div id="google-signin-button" className="flex justify-center"></div>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-2 bg-gray-400 rounded" onClick={() => {
                setShowRoleModal(false);
                setSelectedRole(null);
                setIsGoogleInitializing(false);
              }}>Cancel</button>
              {!isGoogleInitializing && (
                <button className="px-3 py-2 bg-purple-600 text-white rounded disabled:opacity-70"
                  disabled={!selectedRole}
                  onClick={() => selectedRole && startGoogleSignIn(selectedRole)}>
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
