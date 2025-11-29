import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { type RootState } from '../redux/store';
import { fetchMyProfile } from '../services/user/auth.service';

/**
 * User type enum for route protection
 */
export type UserType = 'user' | 'admin';

interface PrivateRouteProps {
    children: React.ReactNode;
    userType: UserType;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, userType }) => {
    const { isAuthenticated: isUserAuthenticated, userData } = useSelector((state: RootState) => state.user);
    const { isAuthenticated: isAdminAuthenticated } = useSelector((state: RootState) => state.admin);
    
    const location = useLocation();
    const [verifying, setVerifying] = useState(userType !== 'admin');
    const [denied, setDenied] = useState(false);
    
    useEffect(() => {
        if (userType === 'admin') { setVerifying(false); setDenied(false); return; }
        let cancelled = false;
        // reset before verifying this route
        setVerifying(true);
        setDenied(false);
        (async () => {
            try {
                const res = await fetchMyProfile();
                console.log("res in PrivateRoute : ", res)
                // If API responds but user is flagged blocked, deny proactively
                if ((res as any)?.profile?.isBlocked === true) {
                    setDenied(true);
                }
            } catch (e) {
                setDenied(true);
                console.log("Failed to fetch profile in PrivateRoute")
                // errorHandler will redirect on blocked/unauthorized
            } finally {
                if (!cancelled) setVerifying(false);
            }
        })();
        return () => { cancelled = true; };
    }, [userType, location.pathname]);
    
    let isAuthenticated = false;
    let loginPath = "/login";
    
    if (userType === 'admin') {
        isAuthenticated = isAdminAuthenticated;
        loginPath = "/admin/login";
    } else {
        isAuthenticated = isUserAuthenticated;
        loginPath = "/login";
    }
    
    if (userType !== 'admin' && denied) {
        return <Navigate to={loginPath} state={{ from: location, reason: 'blocked' }} replace />;
    }

    if (userType !== 'admin' && verifying) {
        return null;
    }
    
    if (!isAuthenticated) {
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // Blocked user guard (for non-admin routes)
    if (userType !== 'admin' && userData?.isBlocked) {
        return <Navigate to={loginPath} state={{ from: location, reason: 'blocked' }} replace />;
    }

    return <>{children}</>;
};
