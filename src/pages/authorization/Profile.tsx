import React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { type RootState } from '../../redux/store';
import { loginUser } from '../../redux/slices/user.slice';
import { fetchMyProfile } from '../../services/user/auth.service';
import DancerProfile from '../dancer/DancerProfile'; // renders the dancer profile
import ClientProfile from '../client/ClientProfile'; // renders the client profile

const ProfilePage: React.FC = () => {
    console.log("PROFILE PAGE AUTHORIZATION")
    const dispatch = useDispatch();
    const { userData: user, isLoading } = useSelector((state: RootState) => state.user);

    const [hydrating, setHydrating] = useState(false);
    const [attemptedHydrate, setAttemptedHydrate] = useState(false);
    const [fetchError, setFetchError] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        // Reset attemptedHydrate when user exists (successful login/update)
        if (user && attemptedHydrate) {
            setAttemptedHydrate(false);
        }
        
        // Only fetch if: no user, has token, haven't tried yet, and not currently hydrating
        if (!user && token && !attemptedHydrate && !hydrating) {
            setHydrating(true);
            setFetchError(false);
            (async () => {
                try {
                    const me = await fetchMyProfile();
                    dispatch(loginUser({ user: me.profile, token }));
                    setFetchError(false);
                } catch (e) {
                    console.log("error in auth profile page",e)
                    setFetchError(true);
                    // Clear token if fetch fails (invalid/expired token)
                    localStorage.removeItem('token');
                } finally {
                    setHydrating(false);
                    setAttemptedHydrate(true);
                }
            })();
        }
    }, [user, attemptedHydrate, hydrating, dispatch]);

    if (isLoading || hydrating) {
        return <div>Loading...</div>;
    }

    // Only redirect if there's no user AND no token (truly logged out)
    // This prevents redirect during profile updates when user is temporarily null
    if (!user) {
        const token = localStorage.getItem('token');
        if (!token || fetchError) {
            console.log("user not found in profile page and no token or fetch error" )
            return <Navigate to="/login" replace />;
        }
        // If we have a token but no user, show loading while Redux rehydrates
        if (!attemptedHydrate || hydrating) {
            console.log("user temporarily null but token exists, waiting for rehydration")
            return <div>Loading...</div>;
        }
        // If we attempted hydration but still no user, redirect to login
        console.log("hydration attempted but no user, redirecting to login")
        return <Navigate to="/login" replace />;
    }

    // Check the user's role and render the correct component
    if (user.role && Array.isArray(user.role) && user.role.includes('dancer')) {
        return <DancerProfile />;
    }

    if (user.role && Array.isArray(user.role) && user.role.includes('client')) {
        return <ClientProfile />;
    }
    // If role is unknown, redirect to login
    console.log("unknown role found in profile page" )
    return <Navigate to="/login" replace />;
};

export default ProfilePage;