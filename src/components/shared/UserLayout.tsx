import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../redux/store';
import Sidebar from './Sidebar';
import UserNavbar from './Navbar';
import { useVideoCall } from '../../context/VideoCallContext';
import VideoRoom from '../video/VideoRoom';

const VideoRoomWrapper: React.FC = () => {
    const { isConnected } = useVideoCall();
    return isConnected ? <VideoRoom /> : null;
};

const UserLayout: React.FC = () => {
    const { userData } = useSelector((state: RootState) => state.user);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation();

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const getPageHeader = () => {
        const path = location.pathname;
        const roles = userData?.role || [];
        const isClient = roles.includes('client');

        if (path === '/home') {
            return isClient
                ? { pageName: 'Home', title: 'Client Dashboard', subTitle: 'Find and book the best talent' }
                : { pageName: 'Home', title: 'Dancer Dashboard', subTitle: 'Welcome back to your groove' };
        }
        if (path === '/bookings') {
            return isClient
                ? { pageName: 'Requests', title: 'Sent Requests', subTitle: 'Track your talent bookings' }
                : { pageName: 'Requests', title: 'Bookings & Requests', subTitle: 'Manage your events and workshops' };
        }
        if (path === '/workshops') return { pageName: 'Workshops', title: 'Dance Workshops', subTitle: 'Explore and join upcoming sessions' };
        if (path === '/competitions') return { pageName: 'Competitions', title: 'Dance Competitions', subTitle: 'Showcase your talent and compete' };
        if (path === '/payments') return { pageName: 'Payments', title: 'Payment History', subTitle: 'Track all your transactions' };
        if (path === '/profile') return { pageName: 'Profile', title: 'My Profile', subTitle: 'Manage your personal information' };
        return { pageName: 'Groovia', title: '', subTitle: '' };
    };

    const { pageName, title, subTitle } = getPageHeader();

    return (
        <div className="flex h-screen bg-deep-purple overflow-hidden">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={toggleSidebar}
            />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <UserNavbar pageName={pageName} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {title && (
                        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                {title}
                            </h1>
                            {subTitle && (
                                <p className="text-purple-300/80 text-lg">
                                    {subTitle}
                                </p>
                            )}
                        </div>
                    )}
                    <Outlet />
                </main>
            </div>
            <VideoRoomWrapper />
        </div>
    );
};

export default UserLayout;
