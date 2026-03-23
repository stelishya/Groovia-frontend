import { Route } from "react-router-dom"
import { PublicRoute } from "../protected/PublicRoute";
import { PrivateRoute } from "../protected/PrivateRoute";
import Signup from "../pages/dancer/Signup";
import VerifyOtp from "../pages/dancer/VerifyOtp";
import Login from "../pages/dancer/Login";
import ForgotPasswordForm from "../components/shared/ForgotPasswordForm";
import ResetPasswordForm from "../components/shared/ResetPasswordForm";
import HomePage from "../pages/authorization/Home";
import ProfilePage from "../pages/authorization/Profile";
import BookingsPage from "../pages/authorization/Bookings";
import LandingPage from "../pages/LandingPage";
import CheckoutPage from "../pages/authorization/Checkout";
import PaymentHistory from "../pages/shared/PaymentHistory";
import PublicProfile from "../pages/public/PublicProfile";
import UserLayout from "../components/shared/UserLayout";

const UserRoutes = () => {
    return (
        <>
            <Route path="/login" element={
                <PublicRoute userType="dancer">
                    <Login />
                </PublicRoute>
            } />
            <Route path="/signup" element={
                <PublicRoute userType="dancer">
                    <Signup />
                </PublicRoute>
            } />
            <Route path="/" element={
                <PublicRoute userType="dancer">
                    <LandingPage />
                </PublicRoute>
            } />
            <Route path="/verify-otp" element={
                <PublicRoute userType="dancer">
                    <VerifyOtp />
                </PublicRoute>
            } />
            <Route path="/forgot-password" element={
                <PublicRoute userType="dancer">
                    <ForgotPasswordForm />
                </PublicRoute>
            }
            />
            <Route path="/reset-password/:token" element={
                <PublicRoute userType="dancer">
                    <ResetPasswordForm />
                </PublicRoute>
            }
            />

            {/* Protected Routes with Global Layout */}
            <Route element={
                <PrivateRoute userType="user">
                    <UserLayout />
                </PrivateRoute>
            }>
                <Route path="/home" element={<HomePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/dancer-profile/:id" element={<PublicProfile />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/payments" element={<PaymentHistory />} />
            </Route>

            <Route path='/logout' element={<Login />} />
        </>
    )
}
export default UserRoutes;
