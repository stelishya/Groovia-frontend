import { House, Trophy, CreditCard, User, LogOut, Settings, GitPullRequest, PersonStanding, ChevronLeft, Menu } from "lucide-react"
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { logoutUser as logoutUserAction } from "../../redux/slices/user.slice";
import { logoutUser as logoutUserService } from "../../services/user/auth.service";
import ConfirmationModal from "../ui/ConfirmationModal";
import { type RootState } from "../../redux/store";

interface SidebarProps {
    activeMenu?: string;
    isCollapsed?: boolean;
    onToggle?: () => void;
}
const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, onToggle }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { userData } = useSelector((state: RootState) => state.user);
    const userRoles = userData?.role || [];

    // Map routes to menu names for internal active state
    const getActiveMenu = () => {
        const path = location.pathname;
        if (path === '/home') return 'Home';
        if (path === '/bookings') return 'Requests';
        if (path === '/workshops') return 'Workshops';
        if (path === '/competitions') return 'Competitions';
        if (path === '/payments') return 'Payments';
        if (path === '/profile') return 'Profile';
        return 'Home';
    };

    const activeMenu = getActiveMenu();

    const handleLogout = async () => {
        try {
            await logoutUserService()
        } catch (error) {
            console.error("Logout failed on the server", error)
        } finally {
            dispatch(logoutUserAction())
            navigate('/login')
            setShowLogoutModal(false)
        }
    }
    const navItems = [
        { icon: <House />, name: 'Home', action: () => navigate('/home') },
        { icon: <GitPullRequest />, name: 'Requests', action: () => navigate('/bookings') },
        ...(userRoles.includes('dancer') || userRoles.includes('instructor')
            ? [{ icon: <PersonStanding />, name: 'Workshops', action: () => navigate('/workshops') }]
            : []),
        ...(userRoles.includes('dancer') || userRoles.includes('organizer')
            ? [{ icon: <Trophy />, name: 'Competitions', action: () => navigate('/competitions') }] : []),
        { icon: <CreditCard />, name: 'Payments', action: () => navigate('/payments') },
    ];

    const bottomItems = [
        { icon: <User />, name: 'Profile', action: () => navigate('/profile') },
        { icon: <LogOut />, name: 'Log Out', action: () => setShowLogoutModal(true) },
        { icon: <Settings />, name: 'Settings' },
    ];

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out flex-shrink-0 bg-purple-900 text-white flex flex-col p-4 relative z-50`}>
            <div className={`flex items-center justify-between mb-10 ${isCollapsed ? 'justify-center' : 'ml-4'}`}>
                {!isCollapsed && <div className="text-3xl font-bold truncate">Groovia</div>}
                <button
                    onClick={onToggle}
                    className={`p-2 rounded-lg hover:bg-purple-800 transition-colors`}
                >
                    {isCollapsed ? <Menu /> : <ChevronLeft />}
                </button>
            </div>

            <nav className="flex-grow">
                <ul>
                    {navItems.map(item => (
                        <li
                            key={item.name}
                            onClick={item.action}
                            title={isCollapsed ? item.name : ''}
                            className={`flex items-center p-3 my-1 rounded-lg cursor-pointer ${activeMenu === item.name ? 'bg-purple-700' : 'hover:bg-purple-800'} ${isCollapsed ? 'justify-center' : ''}`}>
                            <span className={`${isCollapsed ? '' : 'mr-4'} text-xl`}>{item.icon}</span>
                            {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </li>
                    ))}
                </ul>
            </nav>
            <nav>
                <ul>
                    {bottomItems.map(item => (
                        <li
                            key={item.name}
                            onClick={item.action}
                            title={isCollapsed ? item.name : ''}
                            className={`flex items-center p-3 my-1 rounded-lg cursor-pointer ${activeMenu === item.name ? 'bg-purple-700' : 'hover:bg-purple-800'} ${isCollapsed ? 'justify-center' : ''}`}>
                            <span className={`${isCollapsed ? '' : 'mr-4'} text-xl`}>{item.icon}</span>
                            {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </li>
                    ))}
                </ul>
            </nav>
            {/* Logout Confirmation Modal */}
            <ConfirmationModal
                show={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
                title="Confirm Logout"
                message="Are you sure you want to logout? You will need to login again to access your account."
                confirmText="Logout"
                cancelText="Cancel"
                variant="warning"
            />
        </aside>
    );
};
export default Sidebar