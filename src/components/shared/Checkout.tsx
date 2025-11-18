import React, { useState, useEffect } from 'react';
import { ChevronRight, Check, Star, TrendingUp, Search, MessageCircle, BarChart3 } from 'lucide-react';
import { upgradeService, type UpgradeStatus, ROLE_UPGRADE_PRICE } from '../../services/user/upgradeRole.service';
import toast from 'react-hot-toast';
import { fetchMyProfile } from '../../services/user/auth.service';
import { loginUser } from '../../redux/slices/user.slice';
import { useDispatch } from 'react-redux';

interface PaymentProps {
  userEmail?: string;
  onUpgrade?: () => void;
  onCancel?: () => void;
  upgradeRequest?: UpgradeStatus; // For role upgrade payments
}

const Payment: React.FC<PaymentProps> = ({
  userEmail = 'user@example.com',
  onUpgrade,
  onCancel,
  upgradeRequest
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUpgradeRequest, setCurrentUpgradeRequest] = useState(upgradeRequest);

  const getRoleUpgradeAmount = (type: string) => {
    return ROLE_UPGRADE_PRICE; // Single price for all role upgrades
  };
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if there's a pending upgrade request in localStorage
    if (!upgradeRequest) {
      const storedRequest = localStorage.getItem('pendingUpgradeRequest');
      if (storedRequest) {
        setCurrentUpgradeRequest(JSON.parse(storedRequest));
      }
    }
  }, [upgradeRequest]);

  const getPaymentDetails = () => {
    if (currentUpgradeRequest) {
      const amount = getRoleUpgradeAmount(currentUpgradeRequest.type);
      return {
        title: `Upgrade to ${currentUpgradeRequest.type.charAt(0).toUpperCase() + currentUpgradeRequest.type.slice(1)}`,
        subtitle: `Complete your ${currentUpgradeRequest.type} role upgrade with a one-time payment of ₹${amount}.`,
        planName: `${currentUpgradeRequest.type.charAt(0).toUpperCase() + currentUpgradeRequest.type.slice(1)} Role Upgrade`,
        billing: 'One-time payment',
        amount: amount,
        icon: currentUpgradeRequest.type === 'instructor' ? <Star className="w-8 h-8 text-yellow-400 mr-3" /> : <Star className="w-8 h-8 text-blue-400 mr-3" />
      };
    } else {
      return {
        title: 'Role Upgrade',
        subtitle: 'Complete your role upgrade payment.',
        planName: 'Role Upgrade',
        billing: 'One-time payment',
        amount: ROLE_UPGRADE_PRICE,
        icon: <Star className="w-8 h-8 text-yellow-400 mr-3" />
      };
    }
  };

  const paymentDetails = getPaymentDetails();

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      if (currentUpgradeRequest) {
        // Handle role upgrade payment
        // await upgradeService.completeUpgradePayment({
        //   upgradeRequestId: currentUpgradeRequest.id,
        //   amount: getRoleUpgradeAmount(currentUpgradeRequest.type),
        //   currency: 'INR'
        // });

        // Simulate payment processing
        setTimeout(async () => {
          try {
            // Confirm payment completion
            await upgradeService.confirmPaymentCompletion(
              currentUpgradeRequest.id,
              'payment_' + Date.now(), // Mock payment ID
              getRoleUpgradeAmount(currentUpgradeRequest.type),
              'INR'
            );
            // toast.success('Payment completed!', {
            //   duration: 5000,
            //   icon: '🎉',
            // });
            // Clear stored request
            localStorage.removeItem('pendingUpgradeRequest');

            setIsProcessing(false);
            // Refetch user profile to get updated roles
            try {
              const response = await fetchMyProfile();
              const freshUser = response.profile;
              const token = localStorage.getItem('token') || '';
              dispatch(loginUser({ user: freshUser, token }));
            } catch (err) {
              console.error('Failed to refetch profile after payment:', err);
            }
            onUpgrade?.();
          } catch (error) {
            setIsProcessing(false);
            console.error('Payment confirmation failed:', error);
          }
        }, 2000);
      }
    } catch (error) {
      setIsProcessing(false);
      console.error('Payment failed:', error);
    }
  };

  const benefits = [
    {
      icon: <TrendingUp className="w-5 h-5 text-purple-400" />,
      text: "Post unlimited ads and artworks"
    },
    {
      icon: <Search className="w-5 h-5 text-purple-400" />,
      text: "Get featured in search results"
    },
    {
      icon: <MessageCircle className="w-5 h-5 text-purple-400" />,
      text: "Priority customer support"
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-purple-400" />,
      text: "Access advanced analytics"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-gray-800 rounded-2xl border-2 border-purple-500 shadow-2xl overflow-hidden">
        {/* {onBack && ( */}
        <button
          // onClick={onBack}
          className="absolute top-8 left-8 w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all duration-200 z-10"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        {/* )} */}
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left Side - Plan Details */}
          <div className="p-5 lg:p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-r border-purple-500/30">
            <div className="space-y-4">
              {/* Header */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-4">
                  {paymentDetails.icon}
                  <h1 className="text-3xl lg:text-4xl font-bold text-white">
                    {paymentDetails.title}
                  </h1>
                </div>
                <p className="text-gray-300 text-lg">
                  {paymentDetails.subtitle}
                </p>
              </div>

              {/* Plan Card */}
              <div className="bg-gray-700/50 rounded-xl p-3 border border-purple-400/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-white">
                    {paymentDetails.planName}
                  </h3>
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Approved
                  </span>
                </div>
                <p className="text-gray-400 mb-2">{paymentDetails.billing}</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-purple-400">₹{paymentDetails.amount}</span>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="text-xl font-semibold text-white mb-3">What you'll get:</h4>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      {benefit.icon}
                      <span className="text-gray-300">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <div className="bg-gray-700/30 rounded-lg p-4 border border-purple-400/20">
                <p className="text-sm text-gray-400 leading-relaxed">
                  You'll be charged ₹{paymentDetails.amount} one-time for this role upgrade.
                  You can manage or cancel your plan anytime in your account settings.
                  By upgrading, you agree to our{' '}
                  <span className="text-purple-400 hover:text-purple-300 cursor-pointer">
                    Terms of Use
                  </span>{' '}
                  and{' '}
                  <span className="text-purple-400 hover:text-purple-300 cursor-pointer">
                    Privacy Policy
                  </span>.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Payment Details */}
          <div className="p-8 lg:p-6 bg-gray-800">
            <div className="space-y-4">
              {/* Billing Summary */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Billing Summary</h3>
                <div className="bg-gray-700/50 rounded-xl p-4 border border-purple-400/30">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Subtotal:</span>
                      <span className="text-white font-semibold">₹{paymentDetails.amount}</span>
                    </div>
                    <hr className="border-gray-600" />
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-white font-semibold">Total due today:</span>
                      <span className="text-purple-400 font-bold">₹{paymentDetails.amount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-xl font-semibold text-white mb-4">Contact Information</h4>
                <div className="bg-gray-700/50 rounded-xl p-4 border border-purple-400/30">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="bg-gray-600 rounded-lg p-3 border border-gray-500">
                        <span className="text-white">{userEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h4 className="text-xl font-semibold text-white mb-4">Payment Method</h4>
                <div className="bg-gray-700/50 rounded-xl p-4 border border-purple-400/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">RP</span>
                      </div>
                      <span className="text-white font-medium">RazorPay</span>
                    </div>
                    {/* <ChevronRight className="w-5 h-5 text-gray-400" /> */}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Secure payment processing
                    {/* (Implementation pending) */}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                {onCancel && (
                  <button
                    onClick={onCancel}
                    className="w-full bg-transparent hover:bg-gray-700/50 text-gray-300 hover:text-white font-medium py-3 px-6 rounded-xl border border-gray-600 hover:border-purple-400 transition-all duration-300"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl border-2 border-purple-500  flex items-center justify-center space-x-2"
                //transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {/* <span className="text-xl">🟢</span> */}
                      <span>Pay Now</span>
                    </>
                  )}
                </button>

              </div>

              {/* Security Notice */}
              {/* <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Check className="w-4 h-4 text-green-400" />
                <span>Secure 256-bit SSL encryption</span>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;