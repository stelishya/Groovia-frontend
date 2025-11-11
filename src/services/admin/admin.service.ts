
// import { createBaseAxios } from '../../api/base.axios';
import axios from "axios";
import toast from 'react-hot-toast';
import type { LoginForm } from '../../types/auth.type';
import {loginAdmin as loginAdminAction} from '../../redux/slices/admin.slice';
import type { AppDispatch } from '../../redux/store';
import { AuthAxiosAdmin } from '../../api/auth.axios';
import { AdminAxios } from "../../api/user.axios";

// let  AdminAxios = createBaseAxios('/admin-auth');

export const loginAdmin = async (data: LoginForm,dispatch:AppDispatch) => {
  try {
    console.log("HI from loginAdmin in admin.service.ts",data)
    const response = await AuthAxiosAdmin.post('/login', data);
    console.log("response in loginAdmin in admin.service.ts",response)
    const {admin, token} = response.data;
    dispatch(loginAdminAction({admin,token}))
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
    toast.error(errorMessage, {
      position: 'top-right',
      duration: 4000,
      style: {
        background: '#FEE2E2',
        color: '#DC2626',
        border: '1px solid #F87171'
      }
    });
    console.error('Admin login error:', error);
    throw error;
  }
};

export const logoutAdmin = async () => {
  const loadingToast = toast.loading('Signing you out...', {
    position: 'top-right'
  });
  try {
    await AuthAxiosAdmin.post('/logout');
    // Clear local storage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    toast.dismiss(loadingToast);
    toast.success('Logged out successfully! See you soon! 👋', {
      position: 'top-right',
      duration: 3000,
      style: {
        background: '#DBEAFE',
        color: '#1D4ED8',
        border: '1px solid #93C5FD'
      }
    });
    return { success: true };
  } catch (error) {
    toast.dismiss(loadingToast);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');

    toast.error('Logout failed, but cleared local data', {
      position: 'top-right'
    });
    console.error('Admin logout error:', error);
    return { success: true };
  }
};

export const getAllUsers = async (page: number = 1, pageSize: number = 10) => {
  try {
    console.log("HI from getAllUsers in admin.service.ts",page,pageSize)
    const response = await AdminAxios.get(`/users?page=${page}&limit=${pageSize}`);
    console.log("response in getAllUsers in admin.service.ts : ",response)
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Failed to fetch users.";
      console.error(message)
      throw new Error(message);
    } else {
      throw new Error("An unexpected error occurred.");
    }
  }
}

export const updateUserStatus = async (userId: string) => {
  try {
    const response = await AdminAxios.patch(`/users/${userId}/status`)
    // , {
      // isActive
    // });
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.data;
  } catch (error) {
    console.error('Failed to update user status:', error);
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Failed to update user status";
      console.error(message);
      throw new Error(message);
    } else {
      throw new Error("An unexpected error occurred.");
    }
  }
};