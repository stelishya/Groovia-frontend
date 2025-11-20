import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Payment from '../../components/shared/Checkout';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';

const CheckoutPageClient: React.FC = () => {
  const navigate = useNavigate();

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
    />
  );
};

export default CheckoutPageClient;