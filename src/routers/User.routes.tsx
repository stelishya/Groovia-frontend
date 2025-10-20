import { Route, Routes } from "react-router-dom"
import { PublicRoute } from "../protected/PublicRoute";
import Signup from "../pages/dancer/Signup";
import VerifyOtp from "../pages/dancer/VerifyOtp";
import Login from "../pages/dancer/Login";
import ForgotPasswordForm from "../components/shared/forgotPasswordForm";
import ResetPasswordForm from "../components/shared/resetPasswordForm";
import Home from "../pages/dancer/Home";
import HomePage from "../pages/Home";
import { PrivateRoute } from "../protected/PrivateRoute";
import Profile from "../pages/dancer/DancerProfile";
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
            <Route path="/dancer/profile" element={
                <PrivateRoute userType="user" >
                    <Profile />
                </PrivateRoute>
            }
            />
            {/* <Route path="/home" element={
                <PublicRoute userType="dancer">
                    <Home />
                </PublicRoute>
            }
            /> */}
            <Route path='/logout' element={<Login />} />
        </Routes>
    )
}
export default UserRoutes;