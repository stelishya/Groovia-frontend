import React, { useState } from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { createBookingOrder, verifyBookingPayment } from '../../services/workshop/workshop.service';
import type { Workshop } from '../../types/workshop.type';

interface WorkshopCheckoutProps {
    workshop: Workshop;
    userEmail: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const WorkshopCheckout: React.FC<WorkshopCheckoutProps> = ({
    workshop,
    userEmail,
    onSuccess,
    onCancel
}) => {
    const [isProcessing, setIsProcessing] = useState(false);

    // Load Razorpay SDK dynamically
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setIsProcessing(true);

        const res = await loadRazorpay();
        if (!res) {
            toast.error('Razorpay SDK failed to load. Please check your internet connection.');
            setIsProcessing(false);
            return;
        }

        try {
            // 1. Create Order
            const orderRes = await createBookingOrder(workshop._id, workshop.fee);

            if (!orderRes.success) {
                throw new Error(orderRes.message);
            }

            const order = orderRes.data;

            // 2. Configure Options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Groovia",
                description: `Workshop: ${workshop.title}`,
                order_id: order.id,
                handler: async function (response: any) {
                    try {
                        // 3. Verify Payment
                        const verifyRes = await verifyBookingPayment({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            workshopId: workshop._id
                        });

                        if (verifyRes.success) {
                            toast.success('Registration Successful! See you at the workshop.', {
                                duration: 5000,
                                icon: '🎉',
                            });
                            onSuccess();
                        } else {
                            throw new Error(verifyRes.message);
                        }
                    } catch (error) {
                        setIsProcessing(false);
                        toast.error('Payment verification failed. Please contact support.');
                        console.error('Payment verification failed:', error);
                    }
                },
                prefill: {
                    name: userEmail.split('@')[0],
                    email: userEmail,
                },
                theme: {
                    color: "#9333ea"
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                        toast.error('Payment Cancelled');
                    }
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

        } catch (error: any) {
            setIsProcessing(false);
            toast.error(error.message || 'Failed to initiate payment');
            console.error('Payment initiation failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-gray-800 rounded-2xl border-2 border-purple-500 shadow-2xl overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-0">
                    {/* Left Side - Workshop Details */}
                    <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-r border-purple-500/30">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">{workshop.title}</h2>
                                <p className="text-purple-400 font-medium">with {workshop.instructor.username}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Calendar className="w-5 h-5 text-purple-400" />
                                    <span>{new Date(workshop.startDate).toLocaleDateString()} - {new Date(workshop.endDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Clock className="w-5 h-5 text-purple-400" />
                                    <span>{workshop.sessions.length} Sessions</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <MapPin className="w-5 h-5 text-purple-400" />
                                    <span>{workshop.mode === 'online' ? 'Online Workshop' : workshop.location}</span>
                                </div>
                            </div>

                            <div className="bg-gray-700/50 rounded-xl p-4 border border-purple-400/30">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-300">Workshop Fee</span>
                                    <span className="text-xl font-bold text-white">₹{workshop.fee}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-400">
                                    <span>Platform Fee (20%)</span>
                                    <span>Included</span>
                                </div>
                                <hr className="my-2 border-gray-600" />
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-white">Total</span>
                                    <span className="text-2xl font-bold text-purple-400">₹{workshop.fee}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Payment */}
                    <div className="p-8 bg-gray-800 flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-white mb-6">Complete Registration</h3>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                <div className="bg-gray-700 rounded-lg p-3 border border-gray-600 text-white">
                                    {userEmail}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={onCancel}
                                className="flex-1 py-3 px-4 bg-transparent border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <span>Pay ₹{workshop.fee}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkshopCheckout;
