import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import PageLoader from '../components/ui/PageLoader';
import UserNavbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';

const MainLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-900 overflow-hidden">
            {/* Permanent Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">

                <main className="flex-1 overflow-y-auto bg-deep-purple">
                <UserNavbar />
                    <Suspense fallback={<PageLoader />}>
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;