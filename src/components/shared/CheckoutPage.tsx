import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Search, MessageCircle, BarChart3, Calendar, MapPin, Clock } from 'lucide-react';
import { upgradeService, ROLE_UPGRADE_PRICE } from '../../services/user/upgradeRole.service';
import type { UpgradeStatus } from '../../services/user/upgradeRole.service';
import { confirmWorkshopBooking, initiateWorkshopBooking } from '../../services/workshop/workshop.service';
import type { Workshop } from '../../types/workshop.type';
import toast from 'react-hot-toast';
import { fetchMyProfile } from '../../services/user/auth.service';
import { loginUser } from '../../redux/slices/user.slice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';


import { createEventBookingPayment, verifyEventBookingPayment } from '../../services/client/client.service';
import type { EventRequest } from '../../pages/client/BookingsClient';

// const { userData } = useSelector((state: RootState) => state.user);

interface PaymentProps {
  userEmail?: string;
  onUpgrade?: () => void;
  onCancel?: () => void;
  upgradeRequest?: UpgradeStatus; // For role upgrade payments
  workshop?: Workshop; // For workshop booking payments
  eventRequest?: EventRequest;
}

export enum PaymentType {
  WORKSHOP_BOOKING = 'WORKSHOP_BOOKING',
  INSTRUCTOR_UPGRADE = 'INSTRUCTOR_UPGRADE',
  ORGANIZER_UPGRADE = 'ORGANIZER_UPGRADE',
  COMPETITION_PAYMENT = 'COMPETITION_PAYMENT',
  EVENT_REQUEST_PAYMENT = 'EVENT_REQUEST_PAYMENT'
}

interface PaymentConfig {
  type: PaymentType;
  amount: number;
  currency: string;
  description: string;
  entityId?: string; // workshop ID, competition ID, etc.
  orderId?: string;
  onSuccess: (response: any) => Promise<void>;
  onFailure?: () => void;
}

const Payment: React.FC<PaymentProps> = ({
  userEmail = 'user@example.com',
  onUpgrade,
  onCancel,
  upgradeRequest,
  workshop,
  eventRequest
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUpgradeRequest, setCurrentUpgradeRequest] = useState(upgradeRequest);

  const getRoleUpgradeAmount = () => {
    return ROLE_UPGRADE_PRICE; // Single price for all role upgrades
  };
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    if (workshop) {
      return {
        title: `Register for ${workshop.title}`,
        subtitle: `Complete your registration for this workshop with a one-time payment of ₹${workshop.fee}.`,
        planName: workshop.title,
        billing: 'One-time payment',
        amount: workshop.fee,
        icon: <Calendar className="w-8 h-8 text-purple-400 mr-3" />,
        workshopDetails: workshop
      };
    } else if (currentUpgradeRequest) {
      const amount = getRoleUpgradeAmount();
      return {
        title: `Upgrade to ${currentUpgradeRequest.type.charAt(0).toUpperCase() + currentUpgradeRequest.type.slice(1)}`,
        subtitle: `Complete your ${currentUpgradeRequest.type} role upgrade with a one-time payment of ₹${amount}.`,
        planName: `${currentUpgradeRequest.type.charAt(0).toUpperCase() + currentUpgradeRequest.type.slice(1)} Role Upgrade`,
        billing: 'One-time payment',
        amount: amount,
        icon: currentUpgradeRequest.type === 'instructor' ? <Star className="w-8 h-8 text-yellow-400 mr-3" /> : <Star className="w-8 h-8 text-blue-400 mr-3" />
      };
    } else if (eventRequest) {
      return {
        title: `Confirm Payment for ${eventRequest.event}`,
        subtitle: `Complete your booking confirmation with a payment of ₹${eventRequest.acceptedAmount}.`,
        planName: `Event : ${eventRequest.event}`,
        billing: 'One-time payment',
        amount: eventRequest.acceptedAmount || 0,
        icon: <Calendar className="w-8 h-8 text-purple-400 mr-3" />,
        eventDetails: eventRequest
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



  const initiateRazorpayPayment = async (config: PaymentConfig) => {
    setIsProcessing(true);

    // Load Razorpay SDK
    if (!(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      await new Promise(resolve => script.onload = resolve);
    }

    try {
      // Create Razorpay order
      // const order = await createPaymentOrder({
      //   amount: config.amount,
      //   currency: config.currency,
      //   receipt: `${config.type}_${config.entityId || Date.now()}_${Date.now()}`
      // });

      // Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: config.amount,
        currency: config.currency,
        name: 'Groovia',
        description: config.description,
        order_id: config.orderId,
        handler: async function (response: any) {
          try {
            await config.onSuccess(response);
            setIsProcessing(false);
          } catch (error) {
            setIsProcessing(false);
            toast.error('Payment verification failed');
            console.error('Payment verification error:', error);
          }
        },
        // prefill: {
        //   name: userData?.username || '',
        //   email: userData?.email || '',
        // },
        theme: {
          color: '#9333ea'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            config.onFailure?.();
            toast.error('Payment Failed !!');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      setIsProcessing(false);
      const errorMessage = error.response?.data?.message || 'Failed to initiate payment !!';
      toast.error(errorMessage);
      console.error('Payment initiation failed:', error);
    }
  };

  const handleWorkshopBooking = async () => {
    if (!workshop) return;

    const result = await initiateWorkshopBooking(workshop._id);
    if (!result.success) {
      toast.error(result.message || 'Failed to initiate booking');
      return;
    }

    await initiateRazorpayPayment({
      type: PaymentType.WORKSHOP_BOOKING,
      amount: result.data.amount,
      currency: result.data.currency || 'INR',
      description: `Workshop: ${workshop.title}`,
      entityId: workshop._id,
      orderId: result.data.id,
      onSuccess: async (response) => {
        await confirmWorkshopBooking(
          workshop._id,
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature
        );
        toast.success('Successfully registered for workshop! 🎉');
        onUpgrade?.();
      }
    });
  };

  const handleInstructorUpgrade = async () => {
    if (!currentUpgradeRequest) return;

    const order = await upgradeService.createPaymentOrder({
      upgradeRequestId: currentUpgradeRequest.id,
      amount: getRoleUpgradeAmount(),
      currency: 'INR',
    });

    await initiateRazorpayPayment({
      type: PaymentType.INSTRUCTOR_UPGRADE,
      amount: order.amount,
      currency: order.currency,
      description: 'Instructor Role Upgrade',
      entityId: currentUpgradeRequest.id,
      orderId: order.id,
      onSuccess: async (response) => {
        await upgradeService.confirmPaymentCompletion(
          currentUpgradeRequest.id,
          response.razorpay_payment_id,
          getRoleUpgradeAmount(),
          'INR',
          response.razorpay_order_id,
          response.razorpay_signature
        );
        toast.success('Payment Successful! Your role has been upgraded. 🎉');

        // Clear stored request
        localStorage.removeItem('pendingUpgradeRequest');

        // Refetch user profile
        const profileResponse = await fetchMyProfile();
        const freshUser = profileResponse.profile;
        const token = localStorage.getItem('token') || '';
        dispatch(loginUser({ user: freshUser, token }));

        onUpgrade?.();
      },
      onFailure: async () => {
        await upgradeService.upgradePaymentFailed(currentUpgradeRequest.id);
        setTimeout(() => navigate('/profile'), 1500);
      }
    });
  };

  // const handleOrganizerUpgrade = async () => {
  //   // Similar to instructor upgrade
  //   // ... implementation
  // };

  // const handleCompetitionPayment = async (competitionId: string, amount: number) => {
  //   await initiateRazorpayPayment({
  //     type: PaymentType.COMPETITION_PAYMENT,
  //     amount: amount,
  //     currency: 'INR',
  //     description: 'Competition Registration',
  //     entityId: competitionId,
  //     onSuccess: async (response) => {
  //       // Call competition booking confirmation API
  //       toast.success('Successfully registered for competition! 🎉');
  //     }
  //   });
  // };

  const handleEventRequestPayment = async (eventId: string, _amount: number) => {
    try {
      const result = await createEventBookingPayment(eventId);

      if (!result.success || !result.order) {
        throw new Error(result.message || "Failed to create order");
      }

      const { order } = result;

      await initiateRazorpayPayment({
        type: PaymentType.EVENT_REQUEST_PAYMENT,
        amount: order.amount, // Use amount from order
        currency: order.currency,
        description: 'Event Request Payment',
        entityId: eventId,
        orderId: order.id,
        onSuccess: async (response) => {
          await verifyEventBookingPayment(eventId, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          toast.success('Event request payment successful! Booking Confirmed. 🎉');
        }
      });
    } catch (error: any) {
      toast.error(error.message || 'Payment initiation failed');
      console.error(error);
    }
  };
  const handlePayment = async () => {
    console.log("handle payment called")
    if (workshop) {
      await handleWorkshopBooking();
    } else if (currentUpgradeRequest) {
      await handleInstructorUpgrade();
    } else if (eventRequest) {
      if (!eventRequest.acceptedAmount) return;
      console.log("Accepted Amount in checkout page: ", eventRequest.acceptedAmount);
      const response = await handleEventRequestPayment(eventRequest._id, eventRequest.acceptedAmount);
      console.log("Response of event request payment: ", response);
    }
  };


  const getBenefits = () => {
    if (workshop) {
      return [
        {
          icon: <Calendar className="w-5 h-5 text-purple-400" />,
          text: "Access to all workshop sessions"
        },
        {
          icon: <TrendingUp className="w-5 h-5 text-purple-400" />,
          text: "Learn from certified instructors"
        },
        {
          icon: <MessageCircle className="w-5 h-5 text-purple-400" />,
          text: "Interactive learning experience"
        },
        {
          icon: <BarChart3 className="w-5 h-5 text-purple-400" />,
          text: "Certificate upon completion"
        }
      ];
    } else {
      return [
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
    }
  };

  const benefits = getBenefits();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-gray-800 rounded-2xl border-2 border-purple-500 shadow-2xl overflow-hidden">
        {/* {onBack && ( */}
        <button
          onClick={() => navigate(-1)}
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
                  {/* <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Approved
                  </span> */}
                </div>
                <p className="text-gray-400 mb-2">{paymentDetails.billing}</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-purple-400">₹{paymentDetails.amount}</span>
                </div>
                <p className="text-purple-400/70 text-sm">Platform fee is not refundable</p>
              </div>

              {/* Benefits or Workshop Details */}
              {workshop ? (
                <div>
                  <h4 className="text-xl font-semibold text-white mb-3">Workshop Details:</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      <span className="text-gray-300">{new Date(workshop.startDate).toLocaleDateString()} - {new Date(workshop.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-purple-400" />
                      <span className="text-gray-300">{workshop.sessions.length} Sessions</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-purple-400" />
                      <span className="text-gray-300">{workshop.mode === 'online' ? 'Online Workshop' : workshop.location}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-purple-400" />
                      <span className="text-gray-300">Instructor: {workshop.instructor.username}</span>
                    </div>
                  </div>
                </div>
              ) : eventRequest ? (
                <div>
                  <h4 className="text-xl font-semibold text-white mb-3">Event Details:</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      <span className="text-gray-300">
                        {new Date(eventRequest.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-purple-400" />
                      <span className="text-gray-300">{eventRequest.venue}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-purple-400" />
                      {/* <span className="text-gray-300">Dancer: {eventRequest.dancerId?.username || 'Undisclosed'}</span> */}
                      <span className="text-gray-300">Dancer : {eventRequest.dancerId?.username}</span>
                    </div>
                  </div>
                </div>
              ) : (
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
              )}

              {/* Terms */}
              <div className="bg-gray-700/30 rounded-lg p-4 border border-purple-400/20">
                <p className="text-sm text-gray-400 leading-relaxed">
                  You'll be charged ₹{paymentDetails.amount} one-time for this {paymentDetails.planName}.
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
                  onClick={handlePayment}
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
    </div >
  );
};

export default Payment;