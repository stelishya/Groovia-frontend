export interface EventRequestData {
    dancerId: string;
    event: string;
    date: string;
    duration: string;
    venue: string;
    description?: string;
    specialRequests?: string;
}

export interface EventPaymentDetails {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}
