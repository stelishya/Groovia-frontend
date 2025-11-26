import toast from "react-hot-toast";
import AuthAxios from "../../api/auth.axios";
import type { SignupForm, VerificationData } from "../../types/auth.type";
import type { AppDispatch } from "../../redux/store";
import { loginUser } from "../../redux/slices/user.slice";
import { decodeJwt } from '../../utils/auth';
import { DancerAxios, ClientAxios } from '../../api/user.axios';
import { Role } from '../../utils/constants/roles';

const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};

export const signup = async (data: SignupForm | VerificationData) => {
  const isVerification = 'otp' in data;
  const loadingMessage = isVerification
    ? 'Verifying OTP and creating account...'
    : 'Sending OTP...';

  const loadingToast = toast.loading(loadingMessage, {
    position: 'top-right',
  });
  try {
    // Both steps call the same backend endpoint
    const response = await AuthAxios.post('/signup', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Handle side-effects based on which step we're on
    if (!isVerification) {
      // If this was the first step, save the data to localStorage
      localStorage.setItem('pendingSignupData', JSON.stringify(data));
      toast.success('OTP sent successfully! Please check your email.');
    } else {
      // If this was the final step, show success and clear localStorage
      toast.success('Account created successfully!');
      localStorage.removeItem('pendingSignupData');
    }

    toast.dismiss(loadingToast);
    return response.data;

  } catch (error) {
    toast.dismiss(loadingToast);
    const errorMessage = getErrorMessage(error);
    toast.error(errorMessage);
    console.error('Signup process failed:', error);
    throw error;
  }
}

// export const registerUser = async (data: SignupForm) => {
//   const loadingToast = toast.loading('OTP sending...', {
//     position: 'top-right',
//   });

// try {
//   console.log("Frontend - data in registerUser from auth service:",data)
//   const response = await AuthAxios.post('/signup', data, {
//     headers: {
//       "Content-Type": "application/json"
//     }
//   });

//   localStorage.setItem('pendingSignupData', JSON.stringify(data));

//   toast.dismiss(loadingToast);
//   toast.success('OTP sent successfully! Please check your email. ', {
//     position: 'top-right',
//     duration: 5000,
//     style: {
//       background: '#DCFCE7',
//       color: '#16A34A',
//       border: '1px solid #BBF7D0',
//     },
//   });

//     return response.data;
//   } catch (error) {
//     toast.dismiss(loadingToast);
//     const errorMessage = getErrorMessage(error);

//     toast.error(errorMessage, {
//       position: 'top-right',
//       duration: 5000,
//       style: {
//         background: '#FEE2E2',
//         color: '#DC2626',
//         border: '1px solid #FECACA',
//       },
//     });

//     console.error('Error in sending OTP:', error);
//     throw error;
//   }
// };

// export const verifyAndCompleteSignup = async(data:VerificationData)=>{
//   const loadingToast = toast.loading('verifying otp and creating account..', {
//     position: 'top-right',
//   });
//   console.log('data in verifyAndCompleteSignup in auth.service.ts',data)
//   try {
//     const response = await AuthAxios.post('/verify-signup',data,{
//       headers:{
//         "Content-Type": "application/json"
//       }
//     })
//     toast.dismiss(loadingToast);
//     toast.success('account created successfully!', {
//       position: 'top-right',
//       duration: 5000,
//       style: {
//         background: '#DCFCE7',
//         color: '#16A34A',
//         border: '1px solid #BBF7D0',
//       },
//     });
//     return response.data;
//   } catch (error) {
//     toast.dismiss(loadingToast);
//     const errorMessage = getErrorMessage(error);

//     toast.error(errorMessage, {
//       position: 'top-right',
//       duration: 5000,
//       style: {
//         background: '#FEE2E2',
//         color: '#DC2626',
//         border: '1px solid #FECACA',
//       },
//     });
//     console.error('User Registration failed:', error);
//     throw error;
//   }
// }

export const userLogin = async (data: { email: string; password: string; role?: string }, dispatch: AppDispatch) => {
  try {
    const response = await AuthAxios.post('/login', data);

    const { user, accessToken } = response.data;

    // Store user data if needed
    if (accessToken) {
      localStorage.setItem('token', accessToken);
    }
    // if (response.data.user) {
    //   localStorage.setItem('user', JSON.stringify(response.data.user));
    // }

    dispatch(loginUser({ user, token: accessToken }))

    return response.data;
  } catch (error) {

    console.error('User login error:', error);
    throw error;
  }
}

export const logoutUser = async () => {
  const loadingToast = toast.loading('Signing you out...', {
    position: 'top-right',
  });

  try {
    const response = await AuthAxios.delete('../logout');

    // Clear local storage
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');

    toast.dismiss(loadingToast);
    toast.success('Logged out successfully! See you soon! ', {
      position: 'top-right',
      duration: 3000,
      style: {
        background: '#DBEAFE',
        color: '#1D4ED8',
        border: '1px solid #93C5FD',
      },
    });

    return response.data;
  } catch (error) {
    toast.dismiss(loadingToast);

    // Clear local storage 
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');


    console.error('User logout error:', error);
    throw error;
  }
};
export const userSendResetLink = async (email: string) => {
  const loadingToast = toast.loading('Sending reset link...', {
    position: 'top-right',
  });

  try {
    const response = await AuthAxios.post('/forgot-password', { email }, {
      withCredentials: true
    });

    toast.dismiss(loadingToast);
    // toast.success('Reset link sent to your email! ', {
    //   position: 'top-right',
    //   duration: 5000,
    //   style: {
    //     background: '#DCFCE7',
    //     color: '#16A34A',
    //     border: '1px solid #BBF7D0',
    //   },
    // });

    return response.data;
  } catch (error) {
    toast.dismiss(loadingToast);
    const errorMessage = getErrorMessage(error);

    toast.error(errorMessage, {
      position: 'top-right',
      duration: 5000,
      style: {
        background: '#FEE2E2',
        color: '#DC2626',
        border: '1px solid #FECACA',
      },
    });

    console.error('Send reset link error:', error);
    throw error;
  }
};


export const userResetPassword = async (data: {
  token: string;
  password: string;
  confirmPassword: string;
}) => {
  const loadingToast = toast.loading('Resetting password...', {
    position: 'top-right',
  });

  try {
    console.log("sending reset password request in userResetPassword in auth.service.ts", data)
    const response = await AuthAxios.post('/reset-password', {
      token: data.token,
      password: data.password,
      confirmPassword: data.confirmPassword
    }, {
      withCredentials: true
    });

    toast.dismiss(loadingToast);
    toast.success('Password reset successfully! ', {
      position: 'top-right',
      duration: 5000,
      style: {
        background: '#DCFCE7',
        color: '#16A34A',
        border: '1px solid #BBF7D0',
      },
    });
    console.log("reset password response in userResetPassword in auth.service.ts", response.data)
    return response.data;
  } catch (error) {
    toast.dismiss(loadingToast);
    const errorMessage = getErrorMessage(error);

    toast.error(errorMessage, {
      position: 'top-right',
      duration: 5000,
      style: {
        background: '#FEE2E2',
        color: '#DC2626',
        border: '1px solid #FECACA',
      },
    });

    console.error('Reset password error:', error);
    throw error;
  }
  // console.error('Reset password error:', error);
  // throw error;
}
// };

export const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
  const loadingToast = toast.loading('Changing password...', {
    position: 'top-right',
  });

  try {
    const response = await AuthAxios.post('/change-password', data);

    toast.dismiss(loadingToast);
    // toast.success('Password changed successfully!', {
    //   position: 'top-right',
    //   duration: 5000,
    //   style: {
    //     background: '#DCFCE7',
    //     color: '#16A34A',
    //     border: '1px solid #BBF7D0',
    //   },
    // });
    toast.success('Password changed successfully!')

    return response.data;
  } catch (error) {
    toast.dismiss(loadingToast);
    const errorMessage = getErrorMessage(error);

    toast.error(errorMessage, {
      position: 'top-right',
      duration: 5000,
      style: {
        background: '#FEE2E2',
        color: '#DC2626',
        border: '1px solid #FECACA',
      },
    });

    console.error('Change password error:', error);
    throw error;
  }
};


export const refreshToken = async (): Promise<{ accessToken: string }> => {
  try {
    const response = await AuthAxios.post('/refresh-token');
    return response.data;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

export async function fetchMyProfile() {
  const token = localStorage.getItem('token');
  const decoded = decodeJwt(token);
  const role = decoded?.role?.[0];

  if (!token || !role) throw new Error('Not authenticated');

  if (role === Role.DANCER || role === Role.INSTRUCTOR) {
    const res = await DancerAxios.get('/profile');
    return { role, profile: res.data };
  }
  if (role === Role.CLIENT) {
    const res = await ClientAxios.get('/profile');
    return { role, profile: res.data };
  }
  if (role === Role.ADMIN) {
    // Add admin profile endpoint if you have one
    throw new Error('Admin profile endpoint not implemented');
  }

  throw new Error('Unknown role');
}

// Additional utility functions for better UX
export const showValidationErrors = (errors: Record<string, string>) => {
  const errorMessages = Object.values(errors);
  const message = errorMessages.length > 1
    ? `Please fix ${errorMessages.length} form errors`
    : errorMessages[0];

  toast.error(message, {
    position: 'top-right',
    duration: 4000,
    style: {
      background: '#FEE2E2',
      color: '#DC2626',
      border: '1px solid #FECACA',
    },
    icon: '笞ｸ',
  });
};

export const showNetworkError = () => {
  toast.error('Network error. Please check your connection and try again.', {
    position: 'top-right',
    duration: 6000,
    style: {
      background: '#FEE2E2',
      color: '#DC2626',
      border: '1px solid #FECACA',
    },
    icon: '倹',
  });
};