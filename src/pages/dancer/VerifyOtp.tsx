// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import AuthAxios from "../../api/auth.axios";
// import { useForm } from "react-hook-form";


// interface OtpFormData {
  //   otp: string;
  // }
  
  // interface LocationState {
    //   email?: string;
    // }

// const VerifyOtp: React.FC = () => {
  //     const navigate = useNavigate();
//   const location = useLocation();
//   const state = location.state as LocationState;

//   // Get email from navigation state or localStorage
//   const [email] = useState<string>(() => {
  //     return state?.email || localStorage.getItem('pendingVerificationEmail') || '';
  //   });
  
  //   const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<OtpFormData>({
    //     defaultValues: { otp: '' }
    //   });
    
//   const [loading, setLoading] = useState(false);
//   const [resendLoading, setResendLoading] = useState(false);
//   const [countdown, setCountdown] = useState(120); // 120 seconds
//   const [canResend, setCanResend] = useState(false);

//   const otpValue = watch('otp');

//   // Redirect if no email is available
//   useEffect(() => {
  //     if (!email) {
    //       toast.error('No email found for verification. Please sign up again.');
    //       navigate('/signup');
//     }
//   }, [email, navigate]);
//      // Countdown timer effect
//   useEffect(() => {
  //     let timer: NodeJS.Timeout;
  
  //     if (countdown > 0 && !canResend) {
    //       timer = setTimeout(() => {
      //         setCountdown(prev => prev - 1);
      //       }, 1000);
      //     } else if (countdown === 0) {
        //       setCanResend(true);
        //     }
        
        //     return () => {
          //       if (timer) clearTimeout(timer);
          //     };
          //   }, [countdown, canResend]);
          
          //   // Format countdown time
          //   const formatTime = (seconds: number): string => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
//   };
//   // Handle OTP input - only allow numbers and limit to 6 digits
//   const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
  //     if (value.length <= 6) {
    //       setValue('otp', value);
    //     }
    //   };
    
    //   // Verify OTP submission
    //   const onSubmit = async (data: OtpFormData) => {
      //     if (!email) {
        //       toast.error('Email is required for verification');
//       return;
//     }

//     if (data.otp.length !== 6) {
  //       toast.error('Please enter a complete 6-digit OTP');
  //       return;
  //     }
  //     try {
    //       setLoading(true);
    
    //       const response = await AuthAxios.post('/verify-otp', {
//         email: email,
//         otp: data.otp,
//       });

//       if (response.data.success) {
  //         toast.success('Email verified successfully! Your account has been created.');
  
  //         // Clear stored email
  //         localStorage.removeItem('pendingVerificationEmail');
  
  //         // Navigate to login or dashboard
  //         navigate('/login', { 
    //           replace: true,
    //           state: { message: 'Registration completed successfully! Please log in.' }
    //         });
    //       } else {
      //         toast.error(response.data.message || 'OTP verification failed');
      //       }
      //     } catch (err: any) {
        //       console.error('OTP verification error:', err);
        
        //       const errorMessage = err?.response?.data?.message || 'OTP verification failed. Please try again.';
        //       toast.error(errorMessage);
        
//       // Clear OTP input on error
//       setValue('otp', '');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Resend OTP
//   const handleResendOtp = async () => {
  //     if (!email) {
    //       toast.error('Email is required to resend OTP');
    //       return;
    //     }
    
    //     try {
      //       setResendLoading(true);
      
      //       const response = await AuthAxios.post('/resend-otp', {
        //         email: email,
        //       });
        
        //       if (response.data.success) {
          //         toast.success('New OTP sent to your email!');
          
          //         // Reset timer and states
          //         setCountdown(120);
          //         setCanResend(false);
          //         setValue('otp', ''); // Clear current OTP input
//       } else {
//         toast.error(response.data.message || 'Failed to resend OTP');
//       }
//     } catch (err: any) {
//       console.error('Resend OTP error:', err);

//       const errorMessage = err?.response?.data?.message || 'Failed to resend OTP. Please try again.';
//       toast.error(errorMessage);
//     } finally {
  //       setResendLoading(false);
  //     }
  //   };
  
  //   return ()
  // }
  
  
  
  
  
  
  
  
  
  //*************************************************************************************************************************** */
  
"use client";

import AuthOTP from "../../components/shared/authOTP";

export default function VerifyOtp() {
    return (
        <AuthOTP/>
    );
}