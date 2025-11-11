import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { type RootState } from '../../redux/store';
import DancerProfile from '../dancer/DancerProfile'; // renders the dancer profile
import ClientProfile from '../client/ClientProfile'; // renders the client profile
import BookingsClient from '../client/BookingsClient';
import BookingsDancer from '../dancer/BookingsDancer';

const BookingsPage: React.FC = () => {
    console.log("BOOKINGS PAGE")
    const {userData:user,isLoading} = useSelector((state: RootState) => state.user);

    if(isLoading){
        return <div>Loading...</div>
    }
    if (!user) {
        console.log("user not found in bookings page" )
        return <Navigate to="/login" replace />;
    }

    // Check the user's role and render the correct component
    if (user.role && Array.isArray(user.role) && user.role.includes('dancer')) {
        return <BookingsDancer />;
    }

    if (user.role && Array.isArray(user.role) && user.role.includes('client')) {
        return <BookingsClient />;
    }
    // If role is unknown, redirect to login
    console.log("unknown role found in profile page" )
    return <Navigate to="/login" replace />;
};

export default BookingsPage;