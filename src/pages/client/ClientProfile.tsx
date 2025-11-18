import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../../redux/store';
import { loginUser } from '../../redux/slices/user.slice';
import { User, Settings, ArrowLeft, Crown, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserAxios } from '../../api/auth.axios';
import Sidebar from '../../components/shared/Sidebar';
import UserNavbar from '../../components/shared/Navbar';
import FormModal from '../../components/ui/FormModal';
import { ClientAxios } from '../../api/user.axios';
import { validateUsername, validateEmail, validatePhone, validateBio } from '../../utils/validation';
import UpgradeRoleModal, { UpgradeRoleSection } from '../../components/shared/UpgradeRoleModal';
import { upgradeService, type UpgradeStatus } from '../../services/user/upgradeRole.service';

const Profile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userData } = useSelector((state: RootState) => state.user);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [profileData, setProfileData] = useState({
        username: userData?.username || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        bio: userData?.bio || '',
    })
    const [profileErrors, setProfileErrors] = useState({
        username: '',
        email: '',
        phone: '',
        bio: '',
    });
    const [upgradeRequests, setUpgradeRequests] = useState<UpgradeStatus[]>([]);
    const [loadingUpgradeStatus, setLoadingUpgradeStatus] = useState(true);
    const validateProfileForm = () => {
        const errors = {
            username: '',
            email: '',
            phone: '',
            bio: '',
        };
        let isValid = true;

        // Username validation
        const usernameResult = validateUsername(profileData.username);
        if (!usernameResult.isValid) {
            errors.username = usernameResult.error;
            isValid = false;
        }

        // Email validation
        const emailResult = validateEmail(profileData.email);
        if (!emailResult.isValid) {
            errors.email = emailResult.error;
            isValid = false;
        }

        // Phone validation (optional)
        const phoneResult = validatePhone(profileData.phone, false);
        if (!phoneResult.isValid) {
            errors.phone = phoneResult.error;
            isValid = false;
        }

        // Bio validation (optional)
        const bioResult = validateBio(profileData.bio);
        if (!bioResult.isValid) {
            errors.bio = bioResult.error;
            isValid = false;
        }

        setProfileErrors(errors);
        return isValid;
    }
    const handleOpenEditModal = () => {
        // Populate form with current user data
        setProfileData({
            username: userData?.username || '',
            email: userData?.email || '',
            phone: userData?.phone || '',
            bio: userData?.bio || '',
        });
        setShowEditModal(true);
    };

    const [upgradeFormData, setUpgradeFormData] = useState({
        danceStyles: [] as string[],
        experienceYears: '',
        bio: '',
        portfolioLinks: '',
        certificate: null as File | null,
        availableForWorkshops: false,
        preferredLocation: '',
        additionalMessage: ''
    });
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUpgradeFormData(prev => ({ ...prev, certificate: e.target.files![0] }));
        }
    };
    const handleProfileUpdate = async () => {
        // Validate form before submission
        if (!validateProfileForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        try {
            const response = await ClientAxios.patch('/profile', profileData);
            console.log('✅ Profile update response received:', response);
            // return response.data;
            // Backend returns: { success: true, data: { message, user } }
            if (response.data?.success) {
                const updatedUser = response.data.data?.user;
                if (updatedUser) {
                    // Update Redux state with the new user data
                    const token = localStorage.getItem('token') || '';
                    dispatch(loginUser({ user: updatedUser, token }));
                }
                toast.success(response.data.data?.message || 'Profile updated successfully!');
                setShowEditModal(false);
            } else {
                console.warn('⚠️ Response success is false');
                toast.error('Update failed - please try again');
            }
        } catch (error: any) {
            console.error('❌ Profile update error:', error);
            
            // Extract error message from various possible response structures
            let errorMessage = 'Failed to update profile';
            
            if (error.response?.data) {
                const data = error.response.data;
                // Handle different error response formats
                if (data.error?.message) {
                    errorMessage = data.error.message;
                } else if (data.message) {
                    errorMessage = data.message;
                }
            }
            
            toast.error(errorMessage);
        }
    }
    const fetchUpgradeStatus = async () => {
        try {
            const requests = await upgradeService.getUpgradeStatus();
            setUpgradeRequests(requests);
        } catch (error) {
            console.error('Failed to fetch upgrade status:', error);
        } finally {
            setLoadingUpgradeStatus(false);
        }
    };

    const handlePaymentClick = (request: UpgradeStatus) => {
        localStorage.setItem('pendingUpgradeRequest', JSON.stringify(request));
        navigate('/checkout', { state: { upgradeRequest: request } });
    };

    useEffect(() => {
        if (userData) {
            fetchUpgradeStatus();
        }
    }, [userData]);

    const currentRoles = Array.from(new Set(userData?.role || [])); // Remove duplicates
    const hasOrganizerRole = currentRoles.includes('organizer');
    console.log(userData);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-600">
            {/* Header */}
            {/* <div className="bg-purple-900/50 backdrop-blur-lg border-b border-purple-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <button
                onClick={() => navigate(-1)}
                className="flex items-center text-white hover:text-purple-200 transition-colors"
                >
                <ArrowLeft className="mr-2" size={20} />
                Back
                </button>
                </div>
                </div> */}
            <div className="flex h-screen bg-gray-900">
                <Sidebar activeMenu='Profile' />
                {/* Main Content */}
                {/* <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> */}
                <main className="flex-1 overflow-y-auto bg-deep-purple">
                    <UserNavbar title='Profile' subTitle='View and manage your profile'/>
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Profile Card */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-purple-500/30">
                            {/* Cover Image */}
                            <div className="h-32 bg-gradient-to-r from-pink-500 to-purple-600"></div>

                            {/* Profile Info */}
                            <div className="px-6 pb-6">
                                <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-12">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-full border-4 border-white bg-purple-200 flex items-center justify-center overflow-hidden">
                                            {userData?.profileImage ? (
                                                <img src={userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={64} className="text-purple-600" />
                                            )}
                                        </div>
                                    </div>

                                    {/* User Info */}
                                    <div className="mt-4 sm:mt-0 sm:ml-6 flex-1 text-center sm:text-left">
                                        <h1 className="text-3xl font-bold text-white">{userData?.username || 'User'}</h1>
                                        <p className="text-purple-200">{userData?.email}</p>
                                        <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                                            {currentRoles.map((role: string) => (
                                                <span
                                                    key={role}
                                                    className="px-3 py-1 bg-purple-500/50 text-white rounded-full text-sm font-medium capitalize"
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>


                        {/* User Details */}
                        <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                            {/* Header with Title and Edit Button */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Account Details</h2>
                                <button
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center transition-colors"
                                    onClick={handleOpenEditModal}
                                >
                                    <Edit2 size={18} className="mr-2" />
                                    Edit Profile
                                </button>
                            </div>

                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-purple-200 text-sm">Username</label>
                                        <p className="text-white text-lg">{userData?.username}</p>
                                    </div>
                                    <div>
                                        <label className="text-purple-200 text-sm">Email</label>
                                        <p className="text-white text-lg">{userData?.email}</p>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-purple-200 text-sm">Bio</label>
                                        <p className="text-white text-lg">{userData?.bio || 'No bio added yet'}</p>
                                    </div>
                                    <div>
                                        <label className="text-purple-200 text-sm">Phone</label>
                                        <p className="text-white text-lg">{userData?.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {!loadingUpgradeStatus && (
                            <UpgradeRoleSection
                                upgradeRequests={upgradeRequests}
                                onRequestUpgrade={() => setShowUpgradeModal(true)}
                                onPaymentClick={handlePaymentClick}
                                onRefreshStatus={fetchUpgradeStatus}
                                roleType="organizer"
                                userType="client"
                                hasRole={hasOrganizerRole}
                            />
                        )}
                    </div>
                </main>
            </div>
            <FormModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Client Profile"
                icon={<Edit2 className="text-purple-300" size={32} />}
                onSubmit={handleProfileUpdate}
                submitText="Save Changes"
                submitButtonClass="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
                {/* Username */}
                <div>
                    <label className="block text-white font-medium mb-2">Username</label>
                    <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => {
                            setProfileData({ ...profileData, username: e.target.value });
                            if (profileErrors.username) setProfileErrors({ ...profileErrors, username: '' });
                        }}
                        className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 ${profileErrors.username ? 'border-2 border-red-500 focus:ring-red-500' : 'focus:ring-purple-500'
                            }`}
                        placeholder="Your username"
                    />
                    {profileErrors.username && (
                        <p className="text-red-400 text-sm mt-1">{profileErrors.username}</p>
                    )}
                </div>
                {/* Email */}
                <div>
                    <label className="block text-white font-medium mb-2">Email</label>
                    <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => {
                            setProfileData({ ...profileData, email: e.target.value });
                            if (profileErrors.email) setProfileErrors({ ...profileErrors, email: '' });
                        }}
                        className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 ${profileErrors.email ? 'border-2 border-red-500 focus:ring-red-500' : 'focus:ring-purple-500'
                            }`}
                        placeholder="your.email@example.com"
                    />
                    {profileErrors.email && (
                        <p className="text-red-400 text-sm mt-1">{profileErrors.email}</p>
                    )}
                </div>
                {/* Phone */}
                <div>
                    <label className="block text-white font-medium mb-2">Phone (Optional)</label>
                    <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => {
                            setProfileData({ ...profileData, phone: e.target.value });
                            if (profileErrors.phone) setProfileErrors({ ...profileErrors, phone: '' });
                        }}
                        className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 ${profileErrors.phone ? 'border-2 border-red-500 focus:ring-red-500' : 'focus:ring-purple-500'
                            }`}
                        placeholder="+1234567890"
                    />
                    {profileErrors.phone && (
                        <p className="text-red-400 text-sm mt-1">{profileErrors.phone}</p>
                    )}
                </div>
                {/* Bio */}
                <div>
                    <label className="block text-white font-medium mb-2">
                        Bio (Optional)
                        <span className="text-gray-400 text-sm ml-2">
                            {profileData.bio.length}/500
                        </span>
                    </label>
                    <textarea
                        value={profileData.bio}
                        onChange={(e) => {
                            setProfileData({ ...profileData, bio: e.target.value });
                            if (profileErrors.bio) setProfileErrors({ ...profileErrors, bio: '' });
                        }}
                        className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 ${profileErrors.bio ? 'border-2 border-red-500 focus:ring-red-500' : 'focus:ring-purple-500'
                            }`}
                        rows={4}
                        placeholder="Tell us about yourself..."
                        maxLength={500}
                    />
                    {profileErrors.bio && (
                        <p className="text-red-400 text-sm mt-1">{profileErrors.bio}</p>
                    )}
                </div>
            </FormModal>
            <UpgradeRoleModal
                show={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                upgradeType="organizer"
                userData={userData}
            />


        </div>
    );
};

export default Profile;