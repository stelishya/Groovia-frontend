export interface Notification {
    _id: string;
    userId: string;
    type: 'upgrade_approved' | 'upgrade_rejected' | 'workshop' | 'general';
    title: string;
    message: string;
    isRead: boolean;
    adminNote: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserNavbarProps {
    onSearch?: (query: string) => void;
    title?: string;
    subTitle?: string;
}