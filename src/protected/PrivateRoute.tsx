import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { type RootState } from '../redux/store';

/**
 * User type enum for route protection
 */
export type UserType = 'user' | 'admin';

interface PrivateRouteProps {
    children: React.ReactNode;
    userType: UserType;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, userType }) => {
    const { isAuthenticated: isUserAuthenticated } = useSelector((state: RootState) => state.user);
    const { isAuthenticated: isAdminAuthenticated } = useSelector((state: RootState) => state.admin);
    
    const location = useLocation();
    let isAuthenticated = false;
    let loginPath = "/login";

    if (userType === 'admin') {
        isAuthenticated = isAdminAuthenticated;
        loginPath = "/admin/login";
    } else {
        isAuthenticated = isUserAuthenticated;
        loginPath = "/login";
    }

    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them along to that page after they log in.
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

// PrivateRoute.tsx - For authenticated users only
// import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import type { RootState } from '../redux/store';

// interface PrivateRouteProps {
//   children: React.ReactNode;
//   userType: 'dancer' | 'client' | 'admin';
//   redirectTo?: string;
// }

// const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
//   children, 
//   userType,
//   redirectTo 
// }) => {
//   const location = useLocation();
  
//   const userAuth = useSelector((state: RootState) => ({
//     userData: state.dancer.userDatas
//   }));
  
//   const shopAuth = useSelector((state: RootState) => ({
//     shopData: state.client.shopData,
//   }));
  
//   const adminAuth = useSelector((state: RootState) => ({
//     adminData: state.admin.adminDatas
//   }));

//   const checkAuthentication = () => {
//     switch (userType) {
//       case 'dancer':
//         return userAuth && userAuth.userData;
//       case 'client':
//         return shopAuth && shopAuth.shopData ;
//       case 'admin':
//         return adminAuth.adminData !== null;
//       default:
//         return false;
//     }
//   };

//   const getRedirectPath = () => {
//     if (redirectTo) return redirectTo;
    
//     switch (userType) {
//       case 'user':
//         return '/login';
//       case 'shop':
//         return '/shop/login';
//       case 'admin':
//         return '/admin/login';
//       default:
//         return '/';
//     }
//   };

//   if (!checkAuthentication()) {
//     return <Navigate to={getRedirectPath()} state={{ from: location }} replace />;
//   }

//   return <>{children}</>;
// };

// export default PrivateRoute;

