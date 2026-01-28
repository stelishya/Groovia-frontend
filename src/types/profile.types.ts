// Certificate and Achievement types for dancer profiles
export interface Certificate {
    name: string;
    url?: string;
    file?: File;
}

export interface Achievement {
    awardName: string;
    position: string;
    year: string | number;
}

// User profile data structure
export interface DancerProfileData {
    username: string;
    email: string;
    phone: string;
    bio: string;
    experienceYears: number;
    portfolioLinks: string[];
    danceStyles: string[];
    preferredLocation: string;
    gender: string;
    danceStyleLevels: Record<string, string>;
    achievements: Achievement[];
    certificates: Certificate[];
    availableForPrograms: boolean;
}

// Public profile user interface
export interface ProfileUser {
    _id: string;
    username: string;
    email?: string;
    phone?: string;
    phoneNumber?: string;
    bio?: string;
    experienceYears?: number;
    portfolioLinks?: string[];
    danceStyles?: string[];
    preferredLocation?: string;
    gender?: string;
    danceStyleLevels?: Record<string, string>;
    achievements?: Achievement[];
    certificates?: Certificate[];
    availableForPrograms?: boolean;
    profileImage?: string;
    isVerified?: boolean;
    likes?: string[];
}
