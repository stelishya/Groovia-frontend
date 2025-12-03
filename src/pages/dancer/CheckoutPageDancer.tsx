import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Payment from '../../components/shared/CheckoutPage';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';

const CheckoutPageDancer: React.FC = () => {
  const navigate = useNavigate();

  // Get user email from localStorage or context
  // const userEmail = localStorage.getItem('userEmail') || 'dancer@example.com';
  const { userData } = useSelector((state: RootState) => state.user);
  const userEmail = userData?.email || 'dancer@example.com';

  const handleUpgradeSuccess = () => {
    toast.success('Successfully upgraded to Premium! Your dance profile is now featured.');
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

export default CheckoutPageDancer;