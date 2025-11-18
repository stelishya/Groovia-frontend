import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '../../redux/store';
import { User, Settings, ArrowLeft, Crown, Edit2, Heart, Instagram, Linkedin, Facebook, LinkIcon, Youtube, Twitter, Camera, CreditCard, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { UserAxios } from '../../api/auth.axios';
import { loginUser } from '../../redux/slices/user.slice';
import { validateImageFile, validateExperienceYears } from '../../utils/validation';
import { Role, hasRole, hasAnyRole } from '../../utils/constants/roles';
import Sidebar from '../../components/shared/Sidebar';
import UserNavbar from '../../components/shared/Navbar';
import FormModal from '../../components/ui/FormModal';
import UpgradeRoleModal, { UpgradeRoleSection } from '../../components/shared/UpgradeRoleModal';
import ProfileImageModal from '../../components/ui/ProfileImageModal';
import { uploadProfilePicture } from '../../services/dancer/dancer.service';
import { DancerAxios } from '../../api/user.axios';
import { upgradeService, type UpgradeStatus, ROLE_UPGRADE_PRICE } from '../../services/user/upgradeRole.service';
import { fetchMyProfile } from '../../services/user/auth.service';

const Profile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userData } = useSelector((state: RootState) => state.user);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [customDanceStyle, setCustomDanceStyle] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [upgradeRequests, setUpgradeRequests] = useState<UpgradeStatus[]>([]);
    const [loadingUpgradeStatus, setLoadingUpgradeStatus] = useState(true);
    // const [isRefreshing, setIsRefreshing] = useState(false);
    // const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        username: userData?.username || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        bio: userData?.bio || '',
        experienceYears: userData?.experienceYears || 0,
        portfolioLinks: userData?.portfolioLinks || [],
        danceStyles: userData?.danceStyles || [],
        // preferredLocation: userData?.preferredLocation || '',
        availableForPrograms: userData?.availableForPrograms || false
    });
    const [didClean, setDidClean] = useState(false);

    // const [upgradeFormData, setUpgradeFormData] = useState({
    //     danceStyles: [] as string[],
    //     experienceYears: '',
    //     bio: '',
    //     portfolioLinks: '',
    //     certificate: null as File | null,
    //     // availableForWorkshops: false,
    //     preferredLocation: '',
    //     additionalMessage: ''
    // });
    const danceStyleOptions = [
        'Bharatanatyam', 'Kathak', 'Odissi', 'Kuchipudi', 'Mohiniyattam',
        'Hip-Hop', 'Contemporary', 'Ballet', 'Jazz', 'Salsa',
        'Bollywood', 'Folk', 'Freestyle', 'Ballroom', 'Tap', 'Breakdance', 'Other'
    ];
    const handleDanceStyleToggle = (style: string) => {
        setProfileData(prev => ({
            ...prev,
            danceStyles: prev.danceStyles.includes(style)
                ? prev.danceStyles.filter(s => s !== style)
                : [...prev.danceStyles, style]
        }));
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProfileData(prev => ({ ...prev, certificate: e.target.files![0] }));
        }
    };

    const handleImageChange = () => {
        // Open modal in edit mode (no imageUrl means edit mode)
        setShowImageModal(true);
    };

    const handleUploadComplete = async (croppedBlob: Blob) => {
        try {
            // Convert blob to file
            const croppedFile = new File([croppedBlob], 'profile.jpg', {
                type: 'image/jpeg',
            });

            // Upload using dancer service
            const response = await uploadProfilePicture(croppedFile);

            toast.success('Profile picture uploaded successfully!');

            // Update Redux state with new user data
            const { user } = response;
            dispatch(loginUser({ user, token: localStorage.getItem('token') || '' }));
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to upload profile image';
            toast.error(errorMessage);
            console.error('Upload error:', error);
            throw error; // Re-throw to let modal handle it
        }
    };

    const handleImageClick = () => {
        // Open modal (will show preview if imageUrl exists, edit mode otherwise)
        setShowImageModal(true);
    };



    const currentRoles = Array.from(new Set(userData?.role || [])); // Remove duplicates
    const hasApprovedPaymentPending = upgradeRequests.some(r => r.status === 'approved' && r.paymentStatus === 'pending');

    const hasInstructorRole = hasRole(userData?.role, Role.INSTRUCTOR) && !hasApprovedPaymentPending;
    console.log("hasInstructorRole in dancer profile : ", hasInstructorRole);
    console.log("userData in dancer profile : ", userData);
    const isDancer = hasAnyRole(userData?.role, [Role.DANCER, Role.INSTRUCTOR]);
    useEffect(() => {
        if (userData && !didClean) {
            setProfileData({
                username: userData.username || '',
                email: userData.email || '',
                phone: userData.phone || '',
                bio: userData.bio || '',
                experienceYears: userData.experienceYears || 0,
                portfolioLinks: userData.portfolioLinks || [],
                danceStyles: userData.danceStyles || [],
                availableForPrograms: userData.availableForPrograms || false
            });
            fetchUpgradeStatus().then(() => {
            const hasApprovedPending = upgradeRequests.some(r => r.status === 'approved' && r.paymentStatus === 'pending');
            console.log("hasApprovedPending in dancer profile : ", hasApprovedPending)
            if (hasApprovedPending && userData.role.includes('instructor')) {
                console.log("USERDATA.ROLE in dancer profile : ", userData.role)
                const cleanedUser = {
                    ...userData,
                    role: userData.role.filter(r => r !== 'instructor')
                };
                console.log("cleanedUser in dancer profile : ", cleanedUser)
                dispatch(loginUser({ user: cleanedUser, token: localStorage.getItem('token') || '' }));
                setDidClean(true);
            }
        });
            // const interval = setInterval(() => {
            //     const shouldPoll = upgradeRequests.some(r =>
            //         r.status === 'pending' ||
            //         (r.status === 'approved' && r.paymentStatus === 'pending')
            //     );
            //     if (shouldPoll) {
            //         fetchUpgradeStatus();
            //     } else {
            //         clearInterval(interval);
            //     }
            // }, 5000);
            // return () => clearInterval(interval);
        }
    }, [userData,didClean]);

    // const fetchUpgradeStatus = async () => {
    //     try {
    //         const requests = await upgradeService.getUpgradeStatus();
    //         setUpgradeRequests(requests);
    //     } catch (error) {
    //         console.error('Failed to fetch upgrade status:', error);
    //     } finally {
    //         setLoadingUpgradeStatus(false);
    //     }
    // };


    const handleProfileUpdate = async () => {
        try {
            // Validation: Experience years
            const expValidation = validateExperienceYears(profileData.experienceYears, 50);
            if (!expValidation.isValid) {
                toast.error(expValidation.error);
                return;
            }

            // Validation: Check if required fields are filled
            // if (!profileData.bio.trim() || profileData.experienceYears === 0 || profileData.danceStyles.length === 0) {
            //     toast.error('Please fill in all required fields (bio, experience, dance styles)');
            //     return;
            // }

            const token = localStorage.getItem('token');
            console.log("profileData : ", profileData)

            const response = await DancerAxios.patch('/profile', profileData);
            console.log("response  in handleProfileUpdate in dancer profile : ", response)
            if (response.status === 200) {
                if (response.data?.token) {
                    localStorage.setItem('token', response.data.token);
                }
                toast.success('Profile updated successfully!');

                const { user } = response.data;
                dispatch(loginUser({ user, token: localStorage.getItem('token') || '' }));
                setShowEditModal(false);
                console.log('Profile update completed, modal closed, staying on profile page');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            toast.error(errorMessage);
            console.error('Profile update error:', error);
        }
    };
    const handleDanceStyleToggleInEdit = (style: string) => {
        if (style === 'Other') {
            setShowCustomInput(!showCustomInput);
            if (showCustomInput) {
                // Remove custom styles when unchecking Other
                setProfileData(prev => ({
                    ...prev,
                    danceStyles: prev.danceStyles.filter(s => danceStyleOptions.includes(s))
                }));
                setCustomDanceStyle('');
            }
        } else {
            setProfileData(prev => ({
                ...prev,
                danceStyles: prev.danceStyles.includes(style)
                    ? prev.danceStyles.filter(s => s !== style)
                    : [...prev.danceStyles, style]
            }));
        }
    };

    const handleAddCustomDanceStyle = () => {
        if (customDanceStyle.trim()) {
            setProfileData(prev => ({
                ...prev,
                danceStyles: [...prev.danceStyles, customDanceStyle.trim()]
            }));
            setCustomDanceStyle('');
        }
    };

    const isProfileComplete = () => {
        return (
            profileData.bio.trim() !== '' &&
            profileData.experienceYears > 0 &&
            profileData.danceStyles.length > 0
        );
    };
    const handleLike = async () => {
        try {
            const response = await UserAxios.post(`/dancers/${userData?._id}/like`);
            if (response.status === 200) {
                toast.success('Liked!');
            }
        } catch (error: any) {
            toast.error('Failed to like');
        }
    };
    const likeCount =
        Array.isArray(userData?.likes) ? userData.likes.length
            : typeof userData?.likes === 'number' ? userData.likes
                : 0;

    const fetchUpgradeStatus = async () => {
        try {
            const requests = await upgradeService.getUpgradeStatus();
            setUpgradeRequests(requests);
            console.log('upgradeRequests in dancer profile:', upgradeRequests);
        } catch (error) {
            console.error('Failed to fetch upgrade status:', error);
        } finally {
            setLoadingUpgradeStatus(false);
        }
    };
    const handlePaymentClick = (request: UpgradeStatus) => {
        // Store upgrade request in localStorage for checkout page
        localStorage.setItem('pendingUpgradeRequest', JSON.stringify(request));
        // Navigate to checkout with upgrade context
        navigate('/checkout', { state: { upgradeRequest: request } });
    };
    console.log('roles in dancer profile:', userData?.role);
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
                    <UserNavbar title="Profile" subTitle="View and edit your profile" />
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Profile Card */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-purple-500/30">
                            {/* Cover Image */}
                            <div className="h-32 bg-gradient-to-r from-pink-500 to-purple-600"></div>

                            {/* Profile Info */}
                            <div className="px-6 pb-6">
                                <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-12">
                                    {/* Avatar */}
                                    <div className="relative group">
                                        <div
                                            className="w-32 h-32 rounded-full border-4 border-white bg-purple-200 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={handleImageClick}
                                        >
                                            {userData?.profileImage ? (
                                                <img src={userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={64} className="text-purple-600" />
                                            )}
                                        </div>
                                        <button
                                            onClick={handleImageChange}
                                            className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 cursor-pointer transition-colors shadow-lg"
                                        >
                                            <Camera size={20} />
                                        </button>
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

                                    {/* Settings Button */}
                                    {/* <button className="mt-4 sm:mt-0 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center transition-colors">
                                        <Settings size={18} className="mr-2" />
                                        Edit Profile
                                    </button> */}
                                    {/* Action Buttons */}
                                    {/* <div className="mt-4 sm:mt-0 flex gap-2">
 {isDancer && (
 <button
 onClick={handleLike}
 className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg flex items-center transition-colors"
 >
 <Heart size={18} className="mr-2" />
 {userData?.likes || 0}
 </button>
 )}
 <button
 onClick={() => setShowEditModal(true)}
 className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center transition-colors"
 >
 <Edit2 size={18} className="mr-2" />
 Edit Profile
 </button>
 </div> */}

                                    {/* Like Button */}
                                    {isDancer && (
                                        <button
                                            onClick={handleLike}
                                            className="mt-4 sm:mt-0 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg flex items-center transition-colors"
                                        >
                                            <Heart size={18} className="mr-2" />
                                            {likeCount}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* User Details */}
                        <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                            {/* <h2 className="text-2xl font-bold text-white mb-4">Account Details</h2> */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-white">Account Details</h2>
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center transition-colors"
                                >
                                    <Edit2 size={18} className="mr-2" />
                                    Edit Profile
                                </button>
                            </div>
                            {/* <div className="space-y-4"> */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-purple-200 text-sm">Username</label>
                                    <p className="text-white text-lg">{userData?.username}</p>
                                </div>
                                <div>
                                    <label className="text-purple-200 text-sm">Bio</label>
                                    <p className="text-white text-lg">{userData?.bio || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-purple-200 text-sm">Email</label>
                                    <p className="text-white text-lg">{userData?.email}</p>
                                </div>
                                <div>
                                    <label className="text-purple-200 text-sm">Dance Styles</label>
                                    <p className="text-white text-lg">{userData?.danceStyles?.join(', ') || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-purple-200 text-sm">Phone</label>
                                    <p className="text-white text-lg">{userData?.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-purple-200 text-sm">Experience Years</label>
                                    <p className="text-white text-lg">{userData?.experienceYears || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-purple-200 text-sm">Social Media</label>
                                    {/* <p className="text-white text-lg">{userData?.portfolioLinks?.join(', ') || 'Not provided'}</p> */}
                                    <div className="flex items-center space-x-4 mt-2">
                                        {userData?.portfolioLinks && userData.portfolioLinks.length > 0 ? (
                                            userData.portfolioLinks.map((link, index) => {
                                                const getSocialIcon = (url: string) => {
                                                    try {
                                                        const hostname = new URL(url).hostname.toLowerCase();
                                                        if (hostname.includes('instagram.com')) return <Instagram className="text-white hover:text-pink-500 transition-colors" />;
                                                        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return <Youtube className="text-white hover:text-red-500 transition-colors" />;
                                                        if (hostname.includes('linkedin.com')) return <Linkedin className="text-white hover:text-blue-500 transition-colors" />;
                                                        if (hostname.includes('twitter.com') || hostname.includes('x.com')) return <Twitter className="text-white hover:text-sky-400 transition-colors" />;
                                                        if (hostname.includes('facebook.com')) return <Facebook className="text-white hover:text-blue-600 transition-colors" />;
                                                    } catch (e) {
                                                        /* Invalid URL */
                                                    }
                                                    return <LinkIcon className="text-white hover:text-purple-300 transition-colors" />;
                                                };
                                                return (
                                                    <a key={index} href={link} target="_blank" rel="noopener noreferrer">
                                                        {getSocialIcon(link)}
                                                    </a>
                                                );
                                            })
                                        ) : (
                                            <p className="text-white text-lg">Not provided</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-purple-200 text-sm">Available for Programs</label>
                                    <p className="text-white text-lg">{userData?.availableForPrograms ? 'Yes' : 'No'}</p>
                                </div>
                                {/* <div>
                                    <label className="text-purple-200 text-sm">Account Status</label>
                                    <p className="text-white text-lg">
                                        {userData?.isVerified ? (
                                            <span className="text-green-400">✓ Verified</span>
                                        ) : (
                                            <span className="text-yellow-400">⚠ Not Verified</span>
                                        )}
                                    </p>
                                </div> */}
                            </div>
                        </div>

                        {/* Upgrade Role Section */}
                        {/* {!hasInstructorRole && (
                            <div className="mt-6 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/30">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <Crown className="text-yellow-400" size={32} />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="text-xl font-bold text-white mb-2">Upgrade to Instructor Role</h3>
                                        <p className="text-purple-100 mb-4">
                                            Unlock additional features by upgrading to a Instructor role. As a Instructor, you can:
                                        </p>
                                        <ul className="list-disc list-inside text-purple-100 space-y-1 mb-4">
                                            <li>Create and host workshops</li>
                                            <li>Teach dance classes and courses</li>
                                            <li>Earn from your expertise</li>
                                            <li>Build your student community</li>
                                            <li>Access instructor-only features</li>
                                        </ul>
                                        <button
                                            onClick={() => setShowUpgradeModal(true)}
                                            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg"
                                        >
                                            Request Upgrade
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )} */}
                        {!loadingUpgradeStatus && (
                            <UpgradeRoleSection
                                upgradeRequests={upgradeRequests}
                                onRequestUpgrade={() => setShowUpgradeModal(true)}
                                onPaymentClick={(request) => handlePaymentClick(request)}
                                onRefreshStatus={fetchUpgradeStatus}
                                roleType="instructor"
                                userType="dancer"
                                hasRole={hasInstructorRole}
                            />
                        )}
                    </div>
                </main>
            </div>
            <FormModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Dancer Profile"
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
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Your username"
                    />
                </div>
                {/* Email */}
                <div>
                    <label className="block text-white font-medium mb-2">Email</label>
                    <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="your.email@example.com"
                    />
                </div>
                {/* Phone */}
                <div>
                    <label className="block text-white font-medium mb-2">Phone</label>
                    <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="+1234567890"
                    />
                </div>
                {/* Bio */}
                <div>
                    <label className="block text-white font-medium mb-2">Bio</label>
                    <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={4}
                        placeholder="Tell us about your dance journey..."
                    />
                </div>
                {/* Experience Years */}
                <div>
                    <label className="block text-white font-medium mb-2">Years of Experience</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={profileData.experienceYears || ''}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                            const numValue = parseInt(value) || 0;
                            if (numValue > 50) {
                                toast.error('Experience years cannot exceed 50');
                                return;
                            }
                            setProfileData({ ...profileData, experienceYears: numValue });
                        }}
                        className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., 5"
                    />
                </div>
                {/* Dance Styles */}
                <div>
                    <label className="block text-white font-medium mb-2">Dance Styles</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {danceStyleOptions.map(style => (
                            <button
                                key={style}
                                type="button"
                                onClick={() => handleDanceStyleToggleInEdit(style)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${style === 'Other'
                                    ? (showCustomInput ? 'bg-purple-500 text-white' : 'bg-purple-800 text-purple-200 hover:bg-purple-700')
                                    : (profileData.danceStyles.includes(style)
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-purple-800 text-purple-200 hover:bg-purple-700')
                                    }`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                    {showCustomInput && (
                        <div className="mt-3 flex gap-2">
                            <input
                                type="text"
                                value={customDanceStyle}
                                onChange={(e) => setCustomDanceStyle(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomDanceStyle()}
                                className="flex-1 px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter custom dance style"
                            />
                            <button
                                type="button"
                                onClick={handleAddCustomDanceStyle}
                                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    )}
                    {profileData.danceStyles.filter(s => !danceStyleOptions.includes(s)).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {profileData.danceStyles.filter(s => !danceStyleOptions.includes(s)).map((style, idx) => (
                                <span key={idx} className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm flex items-center gap-2">
                                    {style}
                                    <button
                                        type="button"
                                        onClick={() => setProfileData(prev => ({
                                            ...prev,
                                            danceStyles: prev.danceStyles.filter(s => s !== style)
                                        }))}
                                        className="text-white hover:text-red-300"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                {/* Portfolio Links */}
                <div>
                    <label className="block text-white font-medium mb-2">Social Media Links</label>
                    <input
                        type="text"
                        value={profileData.portfolioLinks.join(', ')}
                        onChange={(e) => setProfileData({ ...profileData, portfolioLinks: e.target.value.split(',').map(l => l.trim()).filter(l => l) })}
                        className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Instagram, YouTube, etc. (comma separated)"
                    />
                    <p className="text-purple-300 text-sm mt-1">Separate multiple links with commas</p>
                </div>
                {/* Available for Programs */}
                <div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="availableForProgramsEdit"
                            checked={profileData.availableForPrograms}
                            onChange={(e) => {
                                if (!isProfileComplete() && e.target.checked) {
                                    toast.error('Please complete your profile (bio, experience, and dance styles) before marking yourself as available for programs.');
                                    return;
                                }
                                setProfileData({ ...profileData, availableForPrograms: e.target.checked });
                            }}
                            disabled={!isProfileComplete()}
                            className="w-5 h-5 text-purple-500 bg-purple-800 border-purple-600 rounded focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <label htmlFor="availableForProgramsEdit" className="ml-2 text-white font-medium">
                            Available for programs
                        </label>
                    </div>
                    {!isProfileComplete() && (
                        <p className="text-yellow-300 text-sm mt-1">
                            Complete your bio, experience, and dance styles to enable this option
                        </p>
                    )}
                </div>
            </FormModal>


            <UpgradeRoleModal
                show={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                // onSubmit={handleUpgradeRole}
                upgradeType="instructor"
                userData={profileData}
            />

            {/* Unified Profile Image Modal */}
            <ProfileImageModal
                isOpen={showImageModal}
                imageUrl={userData?.profileImage}
                onClose={() => setShowImageModal(false)}
                onUploadComplete={handleUploadComplete}
                userName={userData?.username}
                aspectRatio={1}
            />

        </div>
    );

};

export default Profile;