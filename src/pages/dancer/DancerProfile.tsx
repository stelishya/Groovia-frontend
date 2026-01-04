import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '../../redux/store';
import { User, Settings, Edit2, Heart, Instagram, Linkedin, Facebook, LinkIcon, Youtube, Twitter, Camera, FileImage, Eye, Minus, Trash2, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginUser } from '../../redux/slices/user.slice';
import { validateExperienceYears } from '../../utils/validation';
import { Role, hasRole, hasAnyRole } from '../../utils/constants/roles';
import Sidebar from '../../components/shared/Sidebar';
import UserNavbar from '../../components/shared/Navbar';
import FormModal from '../../components/ui/FormModal';
import UpgradeRoleModal, { UpgradeRoleSection } from '../../components/shared/UpgradeRoleModal';
import ProfileImageModal from '../../components/ui/ProfileImageModal';
import { uploadProfilePicture, uploadCertificate } from '../../services/dancer/dancer.service';
import { DancerAxios } from '../../api/user.axios';
import { upgradeService, type UpgradeStatus } from '../../services/user/upgradeRole.service';
import { changePassword } from '../../services/user/auth.service';

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
        preferredLocation: userData?.preferredLocation || '',
        gender: userData?.gender || '',
        danceStyleLevels: userData?.danceStyleLevels || {},
        achievements: userData?.achievements || [],
        certificates: userData?.certificates || [],
        availableForPrograms: userData?.availableForPrograms || false
    });
    const [didClean, setDidClean] = useState(false);
    console.log("profileData certificates : ", profileData.certificates);
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
    // const handleDanceStyleToggle = (style: string) => {
    //     setProfileData(prev => ({
    //         ...prev,
    //         danceStyles: prev.danceStyles.includes(style)
    //             ? prev.danceStyles.filter(s => s !== style)
    //             : [...prev.danceStyles, style]
    //     }));
    // };
    // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     if (e.target.files && e.target.files[0]) {
    //         setProfileData(prev => ({ ...prev, certificate: e.target.files![0] }));
    //     }
    // };

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

    const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Validate file type
            if (!file.type.match(/(pdf|image\/.*)/)) {
                toast.error('Only PDF and image files are allowed');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }

            // Create a temporary certificate object for preview
            // We store the raw file in the 'file' property to upload later
            const tempCertificate = {
                name: file.name,
                url: URL.createObjectURL(file), // Local preview URL
                file: file // Raw file for S3 upload
            };
            console.log("tempCertificate : ", tempCertificate);
            setProfileData(prev => ({
                ...prev,
                certificates: [...(prev.certificates || []), tempCertificate]
            }));

            // Reset input
            e.target.value = '';
        }
    };

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error('Please fill in all password fields');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        try {
            await changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordModal(false);
            // toast.success('Password changed successfully');
        } catch (error) {
            // Error handled in service
        }
    };

    const handleImageClick = () => {
        // Open modal (will show preview if imageUrl exists, edit mode otherwise)
        setShowImageModal(true);
    };

    const currentRoles = Array.from(new Set(userData?.role || [])); // Remove duplicates
    const hasApprovedPaymentPending = upgradeRequests.some(r => r.status === 'approved' && r.paymentStatus === 'pending');
    const hasInstructorRole = hasRole(userData?.role, Role.INSTRUCTOR) && !hasApprovedPaymentPending;

    const fetchUpgradeStatus = async () => {
        try {
            const requests = await upgradeService.getUpgradeStatus();
            setUpgradeRequests(requests);
            console.log('upgradeRequests in dancer profile:', requests);
        } catch (error) {
            console.error('Failed to fetch upgrade status:', error);
        } finally {
            setLoadingUpgradeStatus(false);
        }
    };

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
                preferredLocation: userData.preferredLocation || '',
                gender: userData.gender || '',
                danceStyleLevels: userData.danceStyleLevels || {},
                achievements: userData.achievements || [],
                certificates: userData.certificates || [],
                availableForPrograms: userData.availableForPrograms || false
            });
            fetchUpgradeStatus().then(() => {
                const hasApprovedPending = upgradeRequests.some(r => r.status === 'approved' && r.paymentStatus === 'pending');
                if (hasApprovedPending && userData.role.includes('instructor')) {
                    const cleanedUser = {
                        ...userData,
                        role: userData.role.filter(r => r !== 'instructor')
                    };
                    dispatch(loginUser({ user: cleanedUser, token: localStorage.getItem('token') || '' }));
                    setDidClean(true);
                }
            });
        }
    }, [userData, didClean]);

    const handleProfileUpdate = async () => {
        try {
            // Validation: Experience years
            const expValidation = validateExperienceYears(profileData.experienceYears, 50);
            if (!expValidation.isValid) {
                toast.error(expValidation.error);
                return;
            }

            const toastId = toast.loading('Updating profile...');

            // Handle deferred certificate uploads
            const updatedCertificates = await Promise.all(
                (profileData.certificates || []).map(async (cert: any) => {
                    if (!cert) return null; // Skip null certificates
                    if (cert.file) {
                        // This is a new certificate that needs uploading
                        try {
                            const response = await uploadCertificate(cert.file);
                            // response is { success: true, data: { certificate: ... } }
                            // or sometimes just the data depending on backend/axios interceptor
                            // Based on logs: {success: true, data: { certificate: ... }}
                            // And dancer.service.ts returns response.data

                            // Check structure
                            const uploadedCert = response.data?.certificate || response.certificate;

                            if (!uploadedCert) {
                                console.error('Unexpected upload response structure:', response);
                                return null;
                            }
                            return uploadedCert;
                        } catch (error) {
                            console.error('Failed to upload certificate:', error);
                            toast.error(`Failed to upload certificate: ${cert.name}`);
                            return null; // Skip failed uploads
                        }
                    }
                    return cert; // Return existing certificate as is
                })
            );
            console.log("updatedCertificates : ", updatedCertificates);
            // Filter out any failed uploads (nulls)
            const finalCertificates = updatedCertificates.filter(cert => cert !== null);

            // Prepare data for update
            const dataToUpdate = {
                ...profileData,
                certificates: finalCertificates
            };

            const response = await DancerAxios.patch('/profile', dataToUpdate);

            if (response.status === 200) {
                if (response.data?.token) {
                    localStorage.setItem('token', response.data.token);
                }
                toast.success('Profile updated successfully!', { id: toastId });

                const { user } = response.data;
                dispatch(loginUser({ user, token: localStorage.getItem('token') || '' }));
                setShowEditModal(false);
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
    // const handleLike = async () => {
    //     try {
    //         const response = await UserAxios.post(`/dancers/${userData?._id}/like`);
    //         if (response.status === 200) {
    //             toast.success('Liked!');
    //         }
    //     } catch (error: any) {
    //         toast.error('Failed to like');
    //     }
    // };
    const likeCount =
        Array.isArray(userData?.likes) ? userData.likes.length
            : typeof userData?.likes === 'number' ? userData.likes
                : 0;

    // const fetchUpgradeStatus = async () => {
    //     try {
    //         const requests = await upgradeService.getUpgradeStatus();
    //         setUpgradeRequests(requests);
    //         console.log('upgradeRequests in dancer profile:', upgradeRequests);
    //     } catch (error) {
    //         console.error('Failed to fetch upgrade status:', error);
    //     } finally {
    //         setLoadingUpgradeStatus(false);
    //     }
    // };
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

                                    {/* Like Button */}
                                    {isDancer && (
                                        <button
                                            // onClick={handleLike}
                                            className="mt-4 sm:mt-0 px-4 py-2 text-white rounded-lg flex items-center transition-colors text-lg"
                                        >
                                            <Heart size={24} className="text-pink-600 fill-pink-600 mr-2" />
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
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="px-4 py-2 bg-purple-600/50 hover:bg-purple-600 text-white rounded-lg flex items-center transition-colors border border-purple-500"
                                    >
                                        <Edit2 size={18} className="mr-2" />
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={() => setShowPasswordModal(true)}
                                        className="px-4 py-2 bg-purple-600/50 hover:bg-purple-600 text-white rounded-lg flex items-center transition-colors border border-purple-500"
                                    >
                                        <Settings size={18} className="mr-2" />
                                        Change Password
                                    </button>
                                </div>
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
                                    <label className="text-purple-200 text-sm">Preferred Location</label>
                                    <p className="text-white text-lg">{userData?.preferredLocation || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-purple-200 text-sm">Gender</label>
                                    <p className="text-white text-lg">{userData?.gender || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-purple-200 text-sm">Available for Programs</label>
                                    <p className="text-white text-lg">{userData?.availableForPrograms ? 'Yes' : 'No'}</p>
                                </div>
                            </div>

                            {/* Dance Styles & Levels Section */}
                            {userData?.danceStyles && userData.danceStyles.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-xl font-bold text-white mb-4">Dance Styles & Proficiency Levels</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {userData.danceStyles.map((style, index) => (
                                            <div key={index} className="bg-purple-900/30 px-4 py-3 rounded-lg border border-purple-500/20">
                                                <p className="text-white font-semibold text-base">{style}</p>
                                                {userData.danceStyleLevels?.[style] && (
                                                    <p className="text-purple-300 text-sm mt-1">{userData.danceStyleLevels[style]}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Certificates Section */}
                            {userData?.certificates && userData.certificates.length > 0 && (
                                <div className="mt-6 max-w-6xl">
                                    <h3 className="text-xl font-bold text-white mb-4">Certificates</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                        {userData.certificates.map((cert: any, index: number) => {
                                            if (!cert) return null;
                                            return (
                                                <div key={index} className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/20">
                                                    <h4 className="text-white font-semibold text-lg">{cert.name}</h4>
                                                    {cert.url && (
                                                        <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 text-sm mt-2 inline-block">
                                                            View Certificate →
                                                        </a>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Achievements Section */}
                            {userData?.achievements && userData.achievements.length > 0 && (
                                <div className="mt-6 max-w-6xl">
                                    <h3 className="text-xl font-bold text-white mb-4">Achievements</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {userData.achievements.map((achievement: any, index: number) => (
                                            <div key={index} className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/20">
                                                <h4 className="text-white font-semibold text-lg">{achievement.awardName}</h4>
                                                <p className="text-purple-200 text-sm mt-1">{achievement.position}</p>
                                                <p className="text-purple-300 text-sm mt-1">{achievement.year}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
            </div >
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

                    {/* Selected Dance Styles with Level Selection */}
                    {profileData.danceStyles.filter(s => danceStyleOptions.includes(s) && s !== 'Other').length > 0 && (
                        <div className="mt-4 space-y-3">
                            <p className="text-purple-300 text-sm font-medium">Set proficiency level for each style:</p>
                            {profileData.danceStyles.filter(s => danceStyleOptions.includes(s) && s !== 'Other').map((style, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-purple-900/50 p-3 rounded-lg">
                                    <span className="text-white font-medium">{style}</span>
                                    <select
                                        value={(profileData.danceStyleLevels as any)?.[style] || 'Beginner'}
                                        onChange={(e) => {
                                            const newLevels = { ...(profileData.danceStyleLevels as any) || {} };
                                            newLevels[style] = e.target.value;
                                            setProfileData({ ...profileData, danceStyleLevels: newLevels });
                                        }}
                                        className="px-3 py-1.5 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                        <option value="Professional">Professional</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}

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

                {/* Preferred Location */}
                <div>
                    <label className="block text-white font-medium mb-2">Preferred Location</label>
                    <input
                        type="text"
                        value={profileData.preferredLocation}
                        onChange={(e) => setProfileData({ ...profileData, preferredLocation: e.target.value })}
                        className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., New York, Los Angeles"
                    />
                </div>

                {/* Gender */}
                <div>
                    <label className="block text-white font-medium mb-2">Gender</label>
                    <select
                        value={profileData.gender}
                        onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                        className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                </div>

                {/* Achievements */}
                <div>
                    <label className="block text-white font-medium mb-2">Achievements</label>
                    <div className="space-y-2">
                        {(profileData.achievements as any[] || []).map((achievement: any, index: number) => (
                            <div key={index} className="bg-purple-900/50 p-2 rounded-lg flex items-center gap-2">
                                <div className="grid grid-cols-3 gap-2 flex-1">
                                    <input
                                        type="text"
                                        value={achievement.awardName || ''}
                                        onChange={(e) => {
                                            const newAchievements = [...(profileData.achievements as any[])];
                                            newAchievements[index] = { ...newAchievements[index], awardName: e.target.value };
                                            setProfileData({ ...profileData, achievements: newAchievements });
                                        }}
                                        className="px-3 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                        placeholder="Award Name"
                                    />
                                    <input
                                        type="text"
                                        value={achievement.position || ''}
                                        onChange={(e) => {
                                            const newAchievements = [...(profileData.achievements as any[])];
                                            newAchievements[index] = { ...newAchievements[index], position: e.target.value };
                                            setProfileData({ ...profileData, achievements: newAchievements });
                                        }}
                                        className="px-3 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                        placeholder="Position"
                                    />
                                    <input
                                        type="number"
                                        value={achievement.year || ''}
                                        onChange={(e) => {
                                            const newAchievements = [...(profileData.achievements as any[])];
                                            newAchievements[index] = { ...newAchievements[index], year: parseInt(e.target.value) || '' };
                                            setProfileData({ ...profileData, achievements: newAchievements });
                                        }}
                                        className="px-3 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                        placeholder="Year"
                                        min="1900"
                                        max={new Date().getFullYear()}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newAchievements = (profileData.achievements as any[]).filter((_: any, i: number) => i !== index);
                                        setProfileData({ ...profileData, achievements: newAchievements });
                                    }}
                                    className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                                    title="Remove Achievement"
                                >
                                    <Minus size={18} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                const newAchievements = [...(profileData.achievements as any[]), { awardName: '', position: '', year: '' }];
                                setProfileData({ ...profileData, achievements: newAchievements });
                            }}
                            className="w-full px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                            + Add Achievement
                        </button>
                    </div>
                </div>

                {/* Certificates */}
                <div>
                    <label className="block text-white font-medium mb-2">Certificates</label>
                    <div className="space-y-3">
                        {/* List of uploaded certificates */}
                        {(profileData.certificates as any[] || []).map((certificate: any, index: number) => {
                            if (!certificate) return null;
                            console.log("certificate : ", certificate);
                            return (
                                <div key={index} className="bg-purple-900/50 p-3 rounded-lg">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FileImage className="h-4 w-4 text-purple-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={certificate.name || ''}
                                            onChange={(e) => {
                                                const newCertificates = [...(profileData.certificates as any[])];
                                                newCertificates[index] = { ...newCertificates[index], name: e.target.value };
                                                setProfileData({ ...profileData, certificates: newCertificates });
                                            }}
                                            className="w-full pl-10 pr-20 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                            placeholder="Certificate Name"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-1 gap-1">
                                            <a
                                                href={certificate.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 text-purple-300 hover:text-white hover:bg-purple-700 rounded-md transition-colors"
                                                title="View Certificate"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newCertificates = (profileData.certificates as any[]).filter((_: any, i: number) => i !== index);
                                                    setProfileData({ ...profileData, certificates: newCertificates });
                                                }}
                                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-md transition-colors"
                                                title="Remove Certificate"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Upload New Certificate */}
                        <div className="mt-4">
                            {/* <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-500/30 border-dashed rounded-lg cursor-pointer bg-purple-900/30 hover:bg-purple-900/50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-8 h-8 mb-4 text-purple-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                    </svg>
                                    <p className="mb-2 text-sm text-purple-300"><span className="font-semibold">Click to upload certificate</span></p>
                                    <p className="text-xs text-purple-400">PDF, JPG, PNG (MAX. 5MB)</p>
                                </div>
                                <input
                                    type="file"
                                    className="bg-purple-900/50 p-3 rounded-lg"
                                    accept=".pdf,image/*"
                                    onChange={handleCertificateUpload}
                                />
                            </label> */}
                            <input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={handleCertificateUpload}
                                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white file:cursor-pointer"
                            />
                        </div>
                        {/* Certificate Upload */}
                        {/* <div> */}
                        {/* <label className="block text-white font-medium mb-2">Certificate (Optional)</label> */}
                        {/* {profileData.certificates && <p className="text-sm text-green-400 mt-1">✓ {profileData.certificates[profileData.certificates.length - 1].name}</p>} */}
                        {/* </div> */}
                    </div>
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

            {/* Change Password Modal */}
            <FormModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                title="Change Password"
                icon={<Settings className="text-purple-300" size={32} />}
                onSubmit={handleChangePassword}
                submitText="Update Password"
                submitButtonClass="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
                <label className="block text-white font-medium mb-2">Current Password</label>
                <div className="relative">
                    <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter current password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                    >
                        {showCurrentPassword ? <Eye className="w-5 h-5 text-white" /> : <EyeOff className="w-5 h-5 text-white" />}
                    </button>
                </div>
                <label className="block text-white font-medium mb-2">New Password</label>
                <div className="relative">
                    <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter new password (min 6 chars)"
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                    >
                        {showNewPassword ? <Eye className="w-5 h-5 text-white" /> : <EyeOff className="w-5 h-5 text-white" />}
                    </button>
                </div>
                <label className="block text-white font-medium mb-2">Confirm New Password</label>
                <div className="relative">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Confirm new password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                    >
                        {showConfirmPassword ? <Eye className="w-5 h-5 text-white" /> : <EyeOff className="w-5 h-5 text-white" />}
                    </button>
                </div>
            </FormModal>

            {/* Unified Profile Image Modal */}
            <ProfileImageModal
                isOpen={showImageModal}
                imageUrl={userData?.profileImage}
                onClose={() => setShowImageModal(false)}
                onUploadComplete={handleUploadComplete}
                userName={userData?.username}
                aspectRatio={1}
            />

        </div >
    );

};

export default Profile;