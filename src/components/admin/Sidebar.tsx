import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, Trophy, CreditCard, LogOut, Settings, VerifiedIcon } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logoutAdmin } from '../../services/admin/admin.service';
import {logoutAdmin as logoutAdminAction} from '../../redux/slices/admin.slice';
import ConfirmationModal from '../ui/ConfirmationModal'

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-blue-600/20 hover:text-white rounded-lg transition-all duration-200 ${
        isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50' : ''
      }`
    } 
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{label}</span>
  </NavLink>
);

const Sidebar: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true)
    try {
      await logoutAdmin();
      dispatch(logoutAdminAction());
      navigate("/admin/login",{replace:true});
    } catch (error) {
      console.error("Logout failed:", error);
      dispatch(logoutAdminAction())
      navigate("/admin/login",{replace:true});
    } finally {
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  };

  return (
    <div className="fixed left-0 top-0 w-64 bg-[#0B1120] border-r border-gray-800 p-6 flex flex-col h-screen hidden md:flex z-40">
      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-wide">Groovia</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        <SidebarLink 
          to="/admin/" 
          icon={<LayoutDashboard size={20} />} 
          label="Dashboard" 
          end
        />
        <SidebarLink 
          to="/admin/users" 
          icon={<Users size={20} />} 
          label="Users" 
        />
        <SidebarLink 
          to="/admin/workshops" 
          icon={<Briefcase size={20} />} 
          label="Workshops" 
        />
        <SidebarLink 
          to="/admin/competitions" 
          icon={<Trophy size={20} />} 
          label="Competitions" 
        />
        <SidebarLink 
          to="/admin/payments" 
          icon={<CreditCard size={20} />} 
          label="Payments" 
        />
        <SidebarLink 
          to="/admin/approvals" 
          icon={<VerifiedIcon size={20} />} 
          label="Approvals" 
        />
      </nav>

      {/* Bottom Links */}
      <div className="space-y-2 border-t border-gray-800 pt-4">
        {/* <SidebarLink 
          to="/admin/logout" 
          icon={<LogOut size={20} />} 
          label="Log Out" 
        /> */}
        <button 
        onClick={handleLogoutClick}
        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition-all duration-200 w-full text-left">
          <LogOut size={20} />
          <span className="font-medium">Log Out</span>
        </button>
        <SidebarLink 
          to="/admin/settings" 
          icon={<Settings size={20} />} 
          label="Settings" 
        />
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to sign in again to access the admin panel."
        confirmText="Log Out"
        cancelText="Cancel"
        variant="danger"
        isLoading={isLoggingOut}
      />
    </div>
  );
};

export default Sidebar;