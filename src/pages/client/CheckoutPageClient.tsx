import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Payment from '../../components/shared/Checkout';

const CheckoutPageClient: React.FC = () => {
  const navigate = useNavigate();

  // Get user email from localStorage or context
  const userEmail = localStorage.getItem('userEmail') || 'client@example.com';

  const handleUpgradeSuccess = () => {
    toast.success('🎉 Payment Successful! Welcome to your new features.');
    // Redirect to client dashboard or profile
    navigate('/client/dashboard');
  };

  const handleCancel = () => {
    navigate('/client/profile'); // or wherever you want to redirect
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