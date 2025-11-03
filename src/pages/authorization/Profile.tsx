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

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!user && token && !attemptedHydrate) {
            setHydrating(true);
            (async () => {
                try {
                    const me = await fetchMyProfile();
                    dispatch(loginUser({ user: me.profile, token }));
                } catch (e) {
                    // silent: will fall back to redirect below
                } finally {
                    setHydrating(false);
                    setAttemptedHydrate(true);
                }
            })();
        }
    }, [user, attemptedHydrate, dispatch]);

    if (isLoading || hydrating) {
        return <div>Loading...</div>;
    }

    if (!user) {
        console.log("user not found in profile page" )
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