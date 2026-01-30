import { House, Trophy, CreditCard, User, LogOut, Settings, GitPullRequest, PersonStanding } from "lucide-react"
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser as logoutUserAction } from "../../redux/slices/user.slice";
import { logoutUser as logoutUserService } from "../../services/user/auth.service";
import { useState, useMemo } from "react";
import ConfirmationModal from "../ui/ConfirmationModal";
import { type RootState } from "../../redux/store";

interface SidebarProps {
    activeMenu?: string;
}
const Sidebar: React.FC<SidebarProps> = ({ activeMenu: manualActiveMenu }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { userData } = useSelector((state: RootState) => state.user);
    const userRoles = userData?.role || [];

    const activeMenu = useMemo(() => {
        if (manualActiveMenu) return manualActiveMenu;
        const path = location.pathname;
        if (path.startsWith('/home')) return 'Home';
        if (path.startsWith('/bookings')) return 'Requests';
        if (path.startsWith('/workshops')) return 'Workshops';
        if (path.startsWith('/competitions')) return 'Competitions';
        if (path.startsWith('/payments')) return 'Payments';
        if (path.startsWith('/profile')) return 'Profile';
        return 'Home';
    }, [location.pathname, manualActiveMenu]);

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
        <aside className="w-64 flex-shrink-0 bg-purple-900 text-white flex flex-col p-4">
            <div className="text-3xl font-bold mb-10 ml-4">Groovia</div>
            <nav className="flex-grow">
                <ul>
                    {navItems.map(item => (
                        <li
                            key={item.name}
                            onClick={item.action}
                            className={`flex items-center p-3 my-1 rounded-lg cursor-pointer ${activeMenu === item.name ? 'bg-purple-700' : 'hover:bg-purple-800'}`}>
                            <span className="mr-4 text-xl">{item.icon}</span>
                            <span>{item.name}</span>
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
                            className={`flex items-center p-3 my-1 rounded-lg cursor-pointer ${activeMenu === item.name ? 'bg-purple-700' : 'hover:bg-purple-800'}`}>
                            <span className="mr-4 text-xl">{item.icon}</span>
                            <span>{item.name}</span>
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