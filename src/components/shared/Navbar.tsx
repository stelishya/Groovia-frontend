import React, { useState, useEffect } from 'react';
import { Bell, X, User, Settings, LogOut } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '../../redux/store';
import { NotificationAxios } from '../../api/user.axios';
import toast from 'react-hot-toast';

interface Notification {
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

interface UserNavbarProps {
    onSearch?: (query: string) => void;
    title?: string;
    subTitle?: string;
}

const UserNavbar: React.FC<UserNavbarProps> = ({ title, subTitle }) => {
    const navigate = useNavigate();
    const { userData } = useSelector((state: RootState) => state.user);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [notificationTab, setNotificationTab] = useState<'all' | 'unread' | 'read'>('all');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [processedNotifications, setProcessedNotifications] = useState<Set<string>>(new Set());

    // Fetch notifications when component mounts and poll every 30 seconds
    useEffect(() => {
        if (userData?._id) {
            fetchNotifications();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(() => {
                fetchNotifications();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [userData?._id]);
    const fetchNotifications = async () => {
        try {
            const response = await NotificationAxios.get(`/user/${userData?._id}`);
            const newNotifications = response.data.data.notifications || [];
            setNotifications(newNotifications);

            // Process new unread notifications
            newNotifications.forEach((notif: Notification) => {
                if (!notif.isRead && !processedNotifications.has(notif._id)) {
                    handleNewNotification(notif);
                    setProcessedNotifications(prev => new Set(prev).add(notif._id));
                }
            });
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const handleNewNotification = (notification: Notification) => {
        // Handle upgrade approved - update user role in Redux
        if (notification.type === 'upgrade_approved' && userData) {
            // Only add instructor role if it doesn't already exist
            const currentRoles = userData.role || [];
        }
        // Handle upgrade rejected
        else if (notification.type === 'upgrade_rejected') {
            toast.error(notification.title, {
                duration: 5000,
                icon: '❌',
            });
        }
    };
    const markAsRead = async (notificationId: string) => {
        try {
            await NotificationAxios.patch(`/${notificationId}/read`);
            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif._id === notificationId ? { ...notif, isRead: true } : notif
                )
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };
    const markAllAsRead = async () => {
        try {
            await NotificationAxios.patch(`/user/${userData?._id}/read-all`);
            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif.userId === userData?._id ? { ...notif, isRead: true } : notif
                )
            );
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };
    // Mock notifications - Replace with actual API call later
    // const [notifications] = useState<Notification[]>([
    //     {
    //         id: '1',
    //         type: 'upgrade_approved',
    //         title: 'Upgrade Request Approved!',
    //         message: 'Your instructor upgrade has been approved. Welcome to the instructor community!',
    //         isRead: false,
    //         createdAt: new Date().toISOString(),
    //     },
    //     {
    //         id: '2',
    //         type: 'workshop',
    //         title: 'New Workshop Registration',
    //         message: 'Someone registered for your Contemporary Dance workshop.',
    //         isRead: false,
    //         createdAt: new Date(Date.now() - 3600000).toISOString(),
    //     },
    //     {
    //         id: '3',
    //         type: 'general',
    //         title: 'Profile Update',
    //         message: 'Your profile has been successfully updated.',
    //         isRead: true,
    //         createdAt: new Date(Date.now() - 86400000).toISOString(),
    //     },
    // ]);



    const filteredNotifications = notifications.filter((notif) => {
        if (notificationTab === 'unread') return !notif.isRead;
        if (notificationTab === 'read') return notif.isRead;
        return true;
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'upgrade_approved':
                return '🎉';
            case 'upgrade_rejected':
                return '❌';
            case 'workshop':
                return '💃';
            default:
                return '🔔';
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <>
            <header className="flex justify-between items-center p-4 relative">
                <div>
                    <h1 className="text-4xl font-bold text-purple-400 mb-2">{title}</h1>
                    <p className="text-gray-400">{subTitle}</p>
                </div>
                {/* Search Bar */}
                {/* <div className="relative w-80 mr-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                    <input
                        type="text"
    placeholder = "Search Workshops, Competitions..."
    value = { searchQuery }
    onChange = {(e) => setSearchQuery(e.target.value)}
onKeyDown = {(e) => e.key === 'Enter' && handleSearchSubmit(e)}
className = "w-full bg-purple-700 text-white placeholder-purple-300 rounded-lg py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
    />
                </div > */}

                <div className="flex items-center">
                    {/* <div className="relative w-80 mr-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                    <input
                        type="text"
                        placeholder="Search Workshops, Competitions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                        className="w-full bg-purple-700 text-white placeholder-purple-300 rounded-lg py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div> */}

                    {/* Notification Bell */}
                    <div className="relative mr-6">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative text-white text-2xl cursor-pointer hover:text-purple-300 transition-colors"
                        >
                            <Bell className="w-6 h-6 text-purple-400 cursor-pointer hover:text-purple-300" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* User Profile */}
                    <div className="relative">
                        <button
                            // onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                        >
                            {userData?.profileImage ? (
                                <img
                                    src={userData?.profileImage}
                                    alt="User"
                                    className="w-10 h-10 rounded-full cursor-pointer border-2 border-purple-500"
                                    referrerPolicy="no-referrer"
                                    crossOrigin="anonymous"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = 'https://img.icons8.com/?size=128&id=tZuAOUGm9AuS&format=png';
                                    }}
                                />
                            ) : (
                                <User size={34} className="text-purple-600 bg-purple-200 rounded-full p-2" />
                            )}
                        </button>

                        {/* User Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-200 z-50">
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <p className="text-sm font-semibold text-gray-800">{userData?.username || 'User'}</p>
                                    <p className="text-xs text-gray-500">{userData?.email || 'user@example.com'}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        navigate('/profile');
                                        setShowUserMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    Profile
                                </button>
                                <button
                                    onClick={() => {
                                        navigate('/user/settings');
                                        setShowUserMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Settings
                                </button>
                                <hr className="my-1" />
                                <button
                                    onClick={() => {
                                        // Handle logout
                                        navigate('/login');
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Notification Dropdown Pane l */}

            {showNotifications && (
                <div className="fixed top-20 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
                            <button
                                onClick={() => setShowNotifications(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2">
                            {(['all', 'unread', 'read'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setNotificationTab(tab)}
                                    className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${notificationTab === tab
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {tab}
                                    {tab === 'unread' && unreadCount > 0 && (
                                        <span className="ml-1 text-xs">({unreadCount})</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredNotifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {filteredNotifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        onClick={() => !notification.isRead && markAsRead(notification._id)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-purple-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start">
                                            <span className="text-2xl mr-3">
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <h4 className="text-sm font-semibold text-gray-800">
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.isRead && (
                                                        <span className="h-2 w-2 bg-purple-600 rounded-full ml-2 mt-1"></span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {notification.message}
                                                </p>
                                                {notification.adminNote && (
                                                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700">
                                                        <span className="font-semibold">Admin Note: </span>
                                                        {notification.adminNote}
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {formatTime(notification.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {filteredNotifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200">
                            <button
                                onClick={markAllAsRead}
                                className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium">
                                Mark all as read
                            </button>
                        </div>
                    )}
                </div>

            )}

            {/* Overla y */}

            {(showNotifications || showUserMenu) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setShowNotifications(false);
                        setShowUserMenu(false);
                    }}
                />

            )}
        </>
    );
};

export default UserNavbar;