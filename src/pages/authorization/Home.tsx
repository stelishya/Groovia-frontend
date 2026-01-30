import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { type RootState } from '../../redux/store';
import DancerHome from '../dancer/DancerHome'; // Renders the dancer dashboard
import ClientHome from '../client/ClientHome'; // Renders the client dashboard

const HomePage: React.FC = () => {
    console.log("HOME PAGE")
    const { userData: user, isLoading } = useSelector((state: RootState) => state.user);

    if (isLoading) {
        return <div>Loading...</div>
    }
    console.log("user in home page in Home.tsx : ", user)

    // Check for token before redirecting to prevent issues during state updates
    if (!user) {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log("user not found in home page and no token" )
            return <Navigate to="/login" replace />;
        }
        // If we have token but no user, show loading (temporary state)
        console.log("user temporarily null but token exists")
        return <div>Loading...</div>;
    }

    // Check the user's role and render the correct component
    if (user.role && Array.isArray(user.role) && user.role.includes('dancer')) {
        return <DancerHome />;
    }

    if (user.role && Array.isArray(user.role) && user.role.includes('client')) {
        return <ClientHome />;
    }
    // If role is unknown, redirect to login
    console.log("unknown role found in home page" )
    return <Navigate to="/login" replace />;
};

export default HomePage;