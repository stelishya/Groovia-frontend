import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { type RootState } from '../../redux/store';
import CheckoutPageClient from '../client/CheckoutPageClient';
import CheckoutPageDancer from '../dancer/CheckoutPageDancer';

const CheckoutPage: React.FC = () => {
    console.log("CHECKOUT PAGE")
    const {userData:user,isLoading} = useSelector((state: RootState) => state.user);

    if(isLoading){
        return <div>Loading...</div>
    }
    if (!user) {
        console.log("user not found in checkout page" )
        return <Navigate to="/login" replace />;
    }

    // Check the user's role and render the correct component
    if (user.role && Array.isArray(user.role) && user.role.includes('dancer')) {
        return <CheckoutPageDancer />;
    }

    if (user.role && Array.isArray(user.role) && user.role.includes('client')) {
        return <CheckoutPageClient />;
    }
    // If role is unknown, redirect to login
    console.log("unknown role found in profile page" )
    return <Navigate to="/login" replace />;
};

export default CheckoutPage;