export interface PaymentInitiationData {
    entityId: string;
    amount?: number;
}

export interface PaymentConfirmationData {
    entityId: string;
    paymentId: string;
    orderId: string;
    signature: string;
    amount?: number;
}

export interface WorkshopBookingPaymentData {
    workshopId: string;
    paymentId: string;
    orderId: string;
    signature: string;
}
