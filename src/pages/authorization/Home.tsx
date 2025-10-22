import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { type RootState } from '../../redux/store';
import DancerHome from '../dancer/DancerHome'; // Renders the dancer dashboard
import ClientHome from '../client/ClientHome'; // Renders the client dashboard

const HomePage: React.FC = () => {
    console.log("HOME PAGE")
    const {userData:user,isLoading} = useSelector((state: RootState) => state.user);

    if(isLoading){
        return <div>Loading...</div>
    }
    if (!user) {
        console.log("user not found in home page" )
        return <Navigate to="/login" replace />;
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