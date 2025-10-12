export type UserRole = "dancer" | "client"

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; 
}

export interface UserForm{
    username: string;
    email: string;
    phone: string;
    role: UserRole;
    password: string;
    confirmPassword: string;
    // location: GeoLocation | null;
}

export type SignupData = Omit<UserForm, 'role'> & {
  role: UserRole[];
};

export interface UserLoginForm{
  email: string;
  password: string;
}
export type LoginForm= UserLoginForm;
export type SignupForm = UserForm;
export type VerificationData = SignupForm & { otp: string };
