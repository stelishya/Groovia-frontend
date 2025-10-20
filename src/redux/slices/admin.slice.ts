// src/store/slice/adminSlice.ts
import { createSlice,type PayloadAction } from '@reduxjs/toolkit'; 

interface AdminData {
  _id: string;
  id:string;
  username: string; 
  email: string;
}

interface AdminState {
  adminData: AdminData | null;
  token:string|null;
  isAuthenticated:boolean;
  isLoading:boolean;
}

const getInitialState=(): AdminState => {
    try {
        const storedAdminData = localStorage.getItem('adminData');
        const storedToken = localStorage.getItem('adminToken');
        return {
            adminData: storedAdminData ? JSON.parse(storedAdminData) : null,
            token: storedToken,
            isAuthenticated: !!(storedAdminData && storedToken),
            isLoading: false,
        }
    } catch (error) {
        console.error('Failed to parse adminData from localStorage:', error);
        localStorage.removeItem('adminData');
        localStorage.removeItem('adminToken');
        return {
            adminData: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        }
    }
//   adminData: (() => {
//     const storedData = localStorage.getItem('adminData');
//     if (storedData) {
//       try {
//         return JSON.parse(storedData) as AdminData;
//       } catch (error) {
//         console.error('Failed to parse adminData from localStorage:', error);
//         return null;
//       }
//     }
//     return null;
//   })(),
};
const initialState: AdminState = getInitialState();

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    loginAdmin: (state, action: PayloadAction<{admin:AdminData,token:string}>) => {
      state.adminData = action.payload.admin;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;

      localStorage.setItem('adminData', JSON.stringify(action.payload.admin));
      localStorage.setItem('adminToken', action.payload.token);
    },
    logoutAdmin: (state) => {
      state.adminData = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      
      localStorage.removeItem('adminData');
      localStorage.removeItem('adminToken');
    },
  },
});

export const { loginAdmin, logoutAdmin } = adminSlice.actions;
export default adminSlice.reducer;