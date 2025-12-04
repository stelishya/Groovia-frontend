import { WorkshopAxios } from "../../api/user.axios";
import { UserAxios } from "../../api/auth.axios";

export enum PaymentType {
    WORKSHOP_BOOKING = 'WORKSHOP_BOOKING',
    INSTRUCTOR_UPGRADE = 'INSTRUCTOR_UPGRADE',
    ORGANIZER_UPGRADE = 'ORGANIZER_UPGRADE',
    COMPETITION_PAYMENT = 'COMPETITION_PAYMENT',
    EVENT_REQUEST_PAYMENT = 'EVENT_REQUEST_PAYMENT'
}

export const initiatePayment = async (type: PaymentType, data: any) => {
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
            default:
                throw new Error('Invalid payment type');
        }
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to initiate payment'
        };
    }
};

export const confirmPayment = async (type: PaymentType, data: any) => {
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
            default:
                throw new Error('Invalid payment type');
        }
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to confirm payment'
        };
    }
};
