import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserData {
  _id: string;
  id: string;
  username: string;
  email: string;
  role: string[];
  profileImage?: string;
  phone?: string;
  isVerified?: boolean;
  isBlocked?: boolean;
  // Dancer Profile Fields
  bio?: string;
  experienceYears?: number;
  portfolioLinks?: string[];
  danceStyles?: string[];
  likes?: number;
  preferredLocation?: string;
  gender?: string;
  danceStyleLevels?: { [key: string]: string };
  achievements?: Array<{ awardName: string; position: string; year: number | string }>;
  certificates?: Array<{ name: string; url: string }>;
  availableForPrograms?: boolean;
}
interface UserState {
  userData: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const getInitialState = (): UserState => {
  try {
    const storedUserData = localStorage.getItem('userDatas');
    const storedToken = localStorage.getItem('userToken');

    return {
      userData: storedUserData ? JSON.parse(storedUserData) : null,
      token: storedToken,
      isAuthenticated: !!(storedUserData && storedToken),
      isLoading: false,
    };
  } catch (error) {
    console.error('failed to parse user data from localStorage:', error);

    localStorage.removeItem('userDatas');
    localStorage.removeItem('userToken');
    return {
      userData: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    };
  }
}
const initialState: UserState = getInitialState();

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<{ user: UserData; token: string }>) => {
      state.userData = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;

      // sync with localStorage
      localStorage.setItem('userDatas', JSON.stringify(action.payload.user));
      localStorage.setItem('userToken', action.payload.token);
    },

    logoutUser: (state) => {
      state.userData = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      // clear localStorage
      localStorage.removeItem('userDatas');
      localStorage.removeItem('userToken');
    },
  }
})


export const {
  loginUser,
  logoutUser
} = userSlice.actions;

export default userSlice.reducer;