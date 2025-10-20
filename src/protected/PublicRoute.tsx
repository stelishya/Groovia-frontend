import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { Navigate, useLocation } from "react-router-dom";

interface PublicRouteProps {
    children: React.ReactNode;
    userType: 'dancer' | 'client' | 'admin';
    redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ 
    children, 
    userType,
    redirectTo 
}) => {
    const location = useLocation();

    const userAuth = useSelector((state: RootState) => ({
        isAuthenticated: state.user.isAuthenticated,
        userData: state.user.userData
    }));

    const adminAuth = useSelector((state: RootState) => ({
        adminData: state.admin.adminData
    }));

    const checkAuthentication = () => {
        switch (userType) {
            case 'dancer':
                return userAuth.isAuthenticated && userAuth.userData;
            case 'client':
                return userAuth.isAuthenticated && userAuth.userData;
            case 'admin':
              // return false;
                return adminAuth.adminData !== null;
            default:
            return false;
        }
    };

    const getRedirectPath = () => {
    if (redirectTo) return redirectTo;
    
    const from = location.state?.from?.pathname;
    
    switch (userType) {
      case 'dancer':
        return from || '/home';
      case 'client':
        return from || '/client/dashboard';
      case 'admin':
        return from || '/admin/';
      default:
        return '/';
    }
  };

  // If user is already authenticated, redirect to dashboard/home
  if (checkAuthentication()) {
    return <Navigate to={getRedirectPath()} replace />;
  }

  return <>{children}</>;
}