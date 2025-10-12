import React, {
    useState,
    useRef,
    useEffect,
    type KeyboardEvent,
    type ClipboardEvent,
  } from "react";
  import toast from "react-hot-toast";
  import {  useNavigate } from "react-router-dom";
  import {  signup } from "../../services/user/auth.service";
  
  const AuthOTP:React.FC = ()=> {
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [timeLeft, setTimeLeft] = useState(30); // 30 seconds countdown
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
  
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const navigate = useNavigate();
    // const location = useLocation();
  
    //get email from local storage, where it was saved during signup
    const pendingDataString = localStorage.getItem('pendingSignupData');
    const email = pendingDataString ? JSON.parse(pendingDataString).email : null;
  
    console.log("pendingDataString in authOTP.tsx", pendingDataString)
    console.log("email in authOTP.tsx", email)

    // //redirect to signup if no email is found
    // useEffect(() => {
    //   if (!email) {
    //     console.log("no email found in authOTP.tsx")
    //     toast.error('Signup session not found. Please signup again.');
    //     navigate('/signup');
    //   }
    // }, [email, navigate]);
  
    // countdown timer
    useEffect(() => {
      if (timeLeft <= 0) return;
  
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
  
      return () => clearInterval(timer);
    }, [timeLeft]);
  
    const handleChange = (index: number, value: string) => {
      if (value && !/^\d$/.test(value)) return;    // Only allow numbers
  
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
  
      // move to next input if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    };
  
    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      // Move to previous input on backspace if current input is empty
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };
  
    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
  
      if (!/^\d+$/.test(pastedData)) return;
  
      const newOtp = [...otp];
      pastedData.split("").forEach((char, index) => {
        if (index < 6) {
          newOtp[index] = char;
        }
      });
      setOtp(newOtp);
  
      // Focus last filled input
      const lastIndex = Math.min(pastedData.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
    };
  
    const handleResend = async() => {
      if(timeLeft > 0)return;
      setIsResending(true)
      try {
        if(!pendingDataString){
          throw new Error("Signup session not found. Please signup again.")
        }
        const pendingData = JSON.parse(pendingDataString)
        // We only need to re-trigger the first step of signup
        await signup(pendingData
          // {
          // username: pendingData.username,
          // email: pendingData.email,
          // phone: pendingData.phone,
          // password: pendingData.password,
          // role: pendingData.role,
        // }
      );
        toast.success("A new OTP has been sent!");
        setOtp(new Array(6).fill(""));
        setTimeLeft(30);
        inputRefs.current[0]?.focus();
      } catch (error) {
        toast.error("Failed to resend OTP. Please try again.")
      }finally{
        setIsResending(false)
      }
    };
  
    const handleVerify = async() => {
      const otpCode = otp.join("");
      setIsLoading(true);
      if (otpCode.length !== 6) {
        toast.error("Please enter the complete 6-digit OTP.");
        return;
      }
      setIsLoading(true)
      console.log("Verifying OTP:", otpCode);
  
      try {
        if (!pendingDataString){
          throw new Error("Signup session expired. Please try again.")
          setIsLoading(false)
          return
        }
        const pendingData = JSON.parse(pendingDataString);
          
        const result = await signup({ ...pendingData, otp: otpCode });
  
        // localStorage.removeItem('pendingSignupData');
        // toast.success('Account created successfully! Please log in.');
        if(result && result.success){
          navigate('/login');
        }
      } catch (error) {
          console.error("OTP Verification failed:", error);
          setOtp(new Array(6).fill("")); // Clear input on error
          inputRefs.current[0]?.focus();
      }finally{
        setIsLoading(false);
      }     
    };
  
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };
  
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4"
        data-oid="mi4gixt"
      >
        <div className="w-full max-w-md" data-oid="0izo81l">
          {/* Logo */}
          <div className="text-center mb-12" data-oid="v:s0k8-">
            <h1
              className="text-5xl font-bold text-white/90 tracking-wide"
              data-oid="s6t2cg7"
            >
              Groovia
            </h1>
          </div>
  
          {/* Verification Card */}
          <div
            className="bg-purple-600/40 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-8 shadow-2xl"
            data-oid="96q1v3n"
          >
            {/* Title */}
            <h2
              className="text-3xl font-semibold text-white text-center mb-3"
              data-oid="926x_pa"
            >
              Verify Your Account
            </h2>
  
            {/* Subtitle */}
            <p className="text-purple-100 text-center mb-8" data-oid="0chc2lo">
              Enter the 6-digit code sent to your email
            </p>
  
            {/* Timer */}
            <div className="text-purple-300 text-center mb-6" data-oid="aweuwdz">
              Remaining Time : {formatTime(timeLeft)}
            </div>
  
            {/* OTP Input Fields */}
            <div className="flex justify-center gap-3 mb-6" data-oid="7n:340i">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold bg-purple-500/30 border-2 border-purple-400/50 rounded-lg text-white focus:outline-none focus:border-purple-300 focus:bg-purple-500/40 transition-all"
                  data-oid="8o4hv0c"
                  disabled={isLoading}
                />
              ))}
            </div>
  
            {/* Resend OTP */}
            <div className="text-right mb-6" data-oid="_g3azgn">
              <button
                onClick={handleResend}
                disabled={timeLeft > 0 || isResending}
                className={`text-sm font-medium transition-colors ${
                  timeLeft > 0 || isResending
                    ? "text-purple-300 cursor-not-allowed"
                    : "text-purple-200 hover:text-white cursor-pointer"
                }`}
                data-oid="1uds5.b"
              >
                {isResending ? 'Sending':'Resent OTP'}
              </button>
            </div>
  
            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={otp.join("").length !== 6 || isLoading}
              className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-purple-700/50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-colors shadow-lg"
              data-oid="5ee:0_-"
            >
              {isLoading ? 'Verifying...' :'Verify & Continue'}
            </button>
  
            {/* Terms */}
            <p
              className="text-xs text-center text-purple-200/80 mt-6"
              data-oid="tnj8z7n"
            >
              By continuing, you agree to our{" "}
              <a
                href="#"
                className="underline hover:text-white"
                data-oid="31vkewd"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="underline hover:text-white"
                data-oid="55e2cok"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }
  export default AuthOTP;