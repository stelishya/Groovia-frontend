import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { EventRequest } from './BookingsClient';
import { toast } from 'react-hot-toast';
import Payment from '../../components/shared/CheckoutPage';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';

const CheckoutPageClient: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const eventBooking = location.state?.eventBooking as EventRequest | undefined;

  // Get user email from localStorage or context
  // const userEmail = localStorage.getItem('userEmail') || 'client@example.com';
  const { userData } = useSelector((state: RootState) => state.user);
  const userEmail = userData?.email || 'client@example.com';

  const handleUpgradeSuccess = () => {
    toast.success('🎉 Payment Successful! Welcome to your new features.');
    // Redirect to profile
    navigate('/profile');
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <Payment
      userEmail={userEmail}
      onUpgrade={handleUpgradeSuccess}
      onCancel={handleCancel}
      eventRequest={eventBooking}
    />
  );
};

export default CheckoutPageClient;