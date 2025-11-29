import { UserAxios } from '../../api/auth.axios';

export interface InstructorUpgradeRequest {
    danceStyles: string[];
    experienceYears: string;
    bio: string;
    portfolioLinks: string;
    preferredLocation: string;
    additionalMessage: string;
    email: string;
    certificate?: File;
}

export interface OrganizerUpgradeRequest {
    organizationName: string;
    experienceYears: string;
    pastEvents: string;
    description: string;
    message: string;
    email: string;
    licenseDocument?: File;
}

export interface UpgradeStatus {
    id: string;
    type: 'instructor' | 'organizer';
    status: 'pending' | 'approved' | 'rejected' | 'payment_pending' | 'completed';
    paymentStatus: 'pending' | 'paid';
    approvedAt?: string;
    rejectedAt?: string;
    paymentCompletedAt?: string;
    adminMessage?: string;
}

export interface PaymentRequest {
    upgradeRequestId: string;
    amount: number;
    currency: string;
}

// Single price for all role upgrades
export const ROLE_UPGRADE_PRICE = 499;

export const upgradeService = {
    // Upgrade to instructor
    upgradeToInstructor: async (data: InstructorUpgradeRequest) => {
        const formData = new FormData();
        formData.append('danceStyles', JSON.stringify(data.danceStyles));
        formData.append('experienceYears', data.experienceYears);
        formData.append('bio', data.bio);
        formData.append('portfolioLinks', data.portfolioLinks);
        formData.append('preferredLocation', data.preferredLocation);
        formData.append('additionalMessage', data.additionalMessage);
        formData.append('email', data.email);
        if (data.certificate) {
            formData.append('certificate', data.certificate);
        }

        return await UserAxios.post('/upgrade-role', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // Upgrade to organizer
    upgradeToOrganizer: async (data: OrganizerUpgradeRequest) => {
        const formData = new FormData();
        formData.append('organizationName', data.organizationName);
        formData.append('experienceYears', data.experienceYears);
        formData.append('pastEvents', data.pastEvents);
        formData.append('description', data.description);
        formData.append('message', data.message);
        formData.append('email', data.email);
        if (data.licenseDocument) {
            formData.append('licenseDocument', data.licenseDocument);
        }

        return await UserAxios.post('/upgrade-role', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // Get upgrade status for current user
    getUpgradeStatus: async (): Promise<UpgradeStatus[]> => {
        const response = await UserAxios.get('/upgrade-status');
        console.log('upgrade status response in upgradeRole.service.ts:', response);
        return response.data;
    },

    // Get specific upgrade request details
    getUpgradeRequest: async (requestId: string): Promise<UpgradeStatus> => {
        const response = await UserAxios.get(`/upgrade-request/${requestId}`);
        console.log('upgrade request response in upgradeRole.service.ts:', response);
        return response.data;
    },

    // Create payment order
    createPaymentOrder: async (data: PaymentRequest) => {
        const response = await UserAxios.post('/upgrade-payment', data);
        console.log('payment order response in upgradeRole.service.ts:', response);
        return response.data;
    },

    // Confirm payment completion (called after successful payment)
    confirmPaymentCompletion: async (upgradeRequestId: string, paymentId: string, amount: number, currency: string, razorpayOrderId: string, razorpaySignature: string) => {
        const response = await UserAxios.post('/upgrade-payment-confirm', {
            upgradeRequestId,
            paymentId,
            amount,
            currency,
            razorpayOrderId,
            razorpaySignature
        });
        return response.data;
    },

    upgradePaymentFailed: async (upgradeRequestId: string) => {
        const response = await UserAxios.patch(`/upgrade-payment-failed/${upgradeRequestId}`);
        console.log("response in upgradePaymentFailed in upgradeRole.service.ts:", response);
        return response.data;
    }
};