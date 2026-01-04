import { Route, Routes } from "react-router-dom"
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
// import BookingsPage from "../pages/dancer/Bookings-Dancer";

// import Home from "../pages/dancer/Home";
// import Profile from "../pages/dancer/DancerProfile";
// import { PrivateRoute } from "../protected/PrivateRoute";
// import HomePage from "../pages/Home";

const UserRoutes = () => {
    return (
        <Routes>
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
            <Route path="/landing" element={
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
            <Route path="/home" element={
                <PrivateRoute userType="user" >
                    <HomePage />
                </PrivateRoute>
            }
            />
            <Route path="/profile" element={
                <PrivateRoute userType="user" >
                    <ProfilePage />
                </PrivateRoute>
            }
            />
            {/* <Route path="/dancers/:id" element={ */}
            <Route path="/dancer-profile/:id" element={
                <PrivateRoute userType="user">
                    <PublicProfile />
                </PrivateRoute>
            } />
            <Route path="/bookings" element={
                <PrivateRoute userType="user" >
                    <BookingsPage />
                </PrivateRoute>
            }
            />
            {/* <Route path="/home" element={
                <PublicRoute userType="dancer">
                    <Home />
                </PublicRoute>
            }
            /> */}
            {/* Checkout Routes */}
            <Route path="/checkout" element={
                <PrivateRoute
                    userType="user"
                // allowedRoles={[Role.DANCER, Role.CLIENT]}
                >
                    <CheckoutPage />
                </PrivateRoute>
            } />

            <Route path="/payments" element={
                <PrivateRoute userType="user" >
                    <PaymentHistory />
                </PrivateRoute>
            } />

            <Route path='/logout' element={<Login />} />
        </Routes>
    )
}
export default UserRoutes;