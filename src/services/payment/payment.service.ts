import { ClientAxios, CompetitionAxios, WorkshopAxios } from "../../api/user.axios";
import { UserAxios } from "../../api/auth.axios";
import axios from "axios";
import type { PaymentInitiationData, PaymentConfirmationData } from "../../types/payment.types";

export enum PaymentType {
    WORKSHOP_BOOKING = 'WORKSHOP_BOOKING',
    INSTRUCTOR_UPGRADE = 'INSTRUCTOR_UPGRADE',
    ORGANIZER_UPGRADE = 'ORGANIZER_UPGRADE',
    COMPETITION_PAYMENT = 'COMPETITION_PAYMENT',
    EVENT_REQUEST_PAYMENT = 'EVENT_REQUEST_PAYMENT'
}

export const initiatePayment = async (type: PaymentType, data: PaymentInitiationData) => {
    try {
        let response;
        switch (type) {
            case PaymentType.WORKSHOP_BOOKING:
                response = await WorkshopAxios.post(`/${data.entityId}/initiate-booking`);
                break;
            case PaymentType.INSTRUCTOR_UPGRADE:
            case PaymentType.ORGANIZER_UPGRADE:
                response = await UserAxios.post('/upgrade-payment', {
                    upgradeRequestId: data.entityId,
                    amount: data.amount,
                    currency: 'INR'
                });
                break;
            case PaymentType.COMPETITION_PAYMENT:
                response = await CompetitionAxios.post(`/${data.entityId}/initiate-payment`, {
                    amount: data.amount,
                    currency: 'INR'
                });
                break;
            case PaymentType.EVENT_REQUEST_PAYMENT:
                response = await ClientAxios.post(`/event-requests/${data.entityId}/payment`, {
                    // amount: data.amount, // Backend creates order from DB amount, body usually ignored or used for validation
                    // currency: 'INR'
                });
                break;
            default:
                throw new Error('Invalid payment type');
        }
        return { success: true, data: response.data };
    } catch (error: unknown) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to initiate payment'
            : 'Failed to initiate payment';
        return { success: false, message };
    }
};

export const confirmPayment = async (type: PaymentType, data: PaymentConfirmationData) => {
    try {
        let response;
        switch (type) {
            case PaymentType.WORKSHOP_BOOKING:
                response = await WorkshopAxios.post(`/${data.entityId}/confirm-booking`, {
                    paymentId: data.paymentId,
                    orderId: data.orderId,
                    signature: data.signature
                });
                break;
            case PaymentType.INSTRUCTOR_UPGRADE:
            case PaymentType.ORGANIZER_UPGRADE:
                response = await UserAxios.post('/upgrade-payment-confirm', {
                    upgradeRequestId: data.entityId,
                    paymentId: data.paymentId,
                    amount: data.amount,
                    currency: 'INR',
                    razorpayOrderId: data.orderId,
                    razorpaySignature: data.signature
                });
                break;
            case PaymentType.COMPETITION_PAYMENT:
                response = await CompetitionAxios.post(`/${data.entityId}/confirm-payment`, {
                    paymentId: data.paymentId,
                    orderId: data.orderId,
                    signature: data.signature,
                    amount: data.amount
                });
                break;
            case PaymentType.EVENT_REQUEST_PAYMENT:
                response = await ClientAxios.post(`/event-requests/${data.entityId}/verify-payment`, {
                    razorpay_payment_id: data.paymentId,
                    razorpay_order_id: data.orderId,
                    razorpay_signature: data.signature,
                    // amount: data.amount 
                });
                break;
            default:
                throw new Error('Invalid payment type');
        }
        return { success: true, data: response.data };
    } catch (error: unknown) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to confirm payment'
            : 'Failed to confirm payment';
        return { success: false, message };
    }
};


export interface PaymentFilters {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    sortBy?: string;
}

export const getPaymentHistory = async (filters: PaymentFilters) => {
    try {
        const response = await UserAxios.get('/payments/history', { params: filters });
        return { success: true, data: response.data };
    } catch (error: unknown) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to fetch payment history'
            : 'Failed to fetch payment history';
        return { success: false, message };
    }
};
