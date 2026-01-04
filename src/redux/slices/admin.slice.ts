import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AdminData {
  _id: string;
  id: string;
  username: string;
  email: string;
}

interface AdminState {
  adminData: AdminData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const getInitialState = (): AdminState => {
  try {
    const storedAdminData = localStorage.getItem('adminData');
    const storedToken = localStorage.getItem('adminToken');
    // return {
    //     adminData: storedAdminData ? JSON.parse(storedAdminData) : null,
    //     token: storedToken,
    //     isAuthenticated: !!(storedAdminData && storedToken),
    //     isLoading: false,
    // }
    // If either is missing, treat as not authenticated
    if (!storedAdminData || !storedToken) {
      return {
        adminData: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    }
    // Check if we have valid data
    if (!storedAdminData || storedAdminData === 'undefined' || storedAdminData === 'null') {
      // Clean up any bad values and treat as unauthenticated
      localStorage.removeItem('adminData');
      localStorage.removeItem('adminToken');
      return {
        adminData: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
      //  throw new Error('Invalid or missing admin data');
    }
    // Safely parse the admin data
    let parsedAdminData = null;
    if (storedAdminData) {
      try {
        //  parsedAdminData = JSON.parse(storedAdminData);
        //  console.log("parsedAdminData: ",parsedAdminData);
        //  // Validate the parsed data has required fields
        //  if (!parsedAdminData || typeof parsedAdminData !== 'object' || !parsedAdminData.id) {
        //  throw new Error('Invalid admin data format');
        //  }
        //  } catch (parseError) {
        //  console.error('Error parsing admin data:', parseError);
        //  throw new Error('Failed to parse admin data');
        //  }
        //  }
        parsedAdminData = JSON.parse(storedAdminData);
        // Validate the parsed data has required fields (accept either id or _id)
        const hasId = parsedAdminData && typeof parsedAdminData === 'object' && (parsedAdminData.id || parsedAdminData._id);
        if (!hasId) {
          throw new Error('Invalid admin data format');
        }
        // Normalize to always have id
        if (!parsedAdminData.id && parsedAdminData._id) {
          parsedAdminData.id = parsedAdminData._id;
        }
      } catch (parseError) {
        console.error('Error parsing admin data:', parseError);
        // Treat as unauthenticated if parsing fails
        localStorage.removeItem('adminData');
        localStorage.removeItem('adminToken');
        return {
          adminData: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        };
      }
    }
    return {
      adminData: parsedAdminData,
      token: storedToken || null,
      isAuthenticated: !!(parsedAdminData && storedToken),
      isLoading: false,
    };
  } catch (error) {
    // console.error('Failed to parse adminData from localStorage:', error);
    console.error('Failed to initialize admin state:', error);
    // Clear any invalid data
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
    loginAdmin: (state, action: PayloadAction<{ admin: AdminData, token: string }>) => {
      // state.adminData = action.payload.admin;
      // Normalize admin to ensure id exists
      // const _normalizedAdmin = {
      //   ...action.payload.admin,
      //   id: action.payload.admin.id || (action.payload.admin as any)._id,
      // } as AdminData;
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