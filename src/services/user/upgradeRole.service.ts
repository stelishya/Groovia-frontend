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

        return await UserAxios.post('/upgrade-role-organizer', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};