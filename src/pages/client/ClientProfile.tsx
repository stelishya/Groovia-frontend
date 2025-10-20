import { useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../redux/store';
import { User, Settings, ArrowLeft, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserAxios } from '../../api/auth.axios';
import Sidebar from '../../components/shared/Sidebar';
import UserNavbar from '../../components/shared/userNavbar';

const Profile = () => {
    const navigate = useNavigate();
    const { userData } = useSelector((state: RootState) => state.user);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
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
    const handleUpgradeRole = async () => {
        try {
            // TODO: Implement upgrade role API call
            // Validation
            
            if (!upgradeFormData.bio.trim()) {
                toast.error('Please provide a bio');
                return;
                // toast.success('Upgrade request submitted! We will review and get back to you.', {
                //     duration: 5000,
                //     style: {
                //         background: '#D1FAE5',
                //         color: '#059669',
                //         border: '1px solid #34D399'
                //     }
                // });
                // setShowUpgradeModal(false);
            }
            if (!userData?.email) {
                toast.error('User email not found. Please log in again.');
                return;
            }
            const formData = new FormData();
            // formData.append('danceStyles', JSON.stringify(upgradeFormData.danceStyles));
            // formData.append('experienceYears', upgradeFormData.experienceYears);
            formData.append('bio', upgradeFormData.bio);
            formData.append('portfolioLinks', upgradeFormData.portfolioLinks);
            formData.append('availableForWorkshops', String(upgradeFormData.availableForWorkshops));
            formData.append('preferredLocation', upgradeFormData.preferredLocation);
            formData.append('additionalMessage', upgradeFormData.additionalMessage);
            formData.append('email', userData.email)
            if (upgradeFormData.certificate) {
                formData.append('certificate', upgradeFormData.certificate);
            }
            console.log('Upgrade request data:', upgradeFormData);
            console.log('User email:', userData.email);
            console.log('FormData contents:');
            for (const [key, value] of formData.entries()) {
                console.log(` ${key}:`, value);
            }
            const response = await UserAxios.post('/upgrade-role', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201 || response.status === 200) {
                toast.success('Upgrade request submitted! We will review and get back to you.', {
                    duration: 5000,
                    style: {
                        background: '#D1FAE5',
                        color: '#059669',
                        border: '1px solid #34D399',
                    },
                });
                setShowUpgradeModal(false);
            }
        } catch (error: any) {
            // toast.error('Failed to submit upgrade request');
            const errorMessage = error.response?.data?.message || 'Failed to submit upgrade request';
            toast.error(errorMessage);
            console.error('Upgrade role error:', error.response?.data);
        }
    };

    const currentRoles = userData?.role || [];
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
                <main className="flex-1 overflow-y-auto bg-gray-900">
                    <UserNavbar />
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

                                    {/* Settings Button */}
                                    <button className="mt-4 sm:mt-0 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center transition-colors">
                                        <Settings size={18} className="mr-2" />
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Upgrade Role Section */}
                        {!hasOrganizerRole && (
                            <div className="mt-6 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/30">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <Crown className="text-yellow-400" size={32} />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="text-xl font-bold text-white mb-2">Upgrade to Organizer Role</h3>
                                        <p className="text-purple-100 mb-4">
                                            Unlock additional features by upgrading to a Organizer role. As a Organizer, you can:
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
                        )}

                        {/* User Details */}
                        <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                            <h2 className="text-2xl font-bold text-white mb-4">Account Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-purple-200 text-sm">Username</label>
                                    <p className="text-white text-lg">{userData?.username}</p>
                                </div>
                                <div>
                                    <label className="text-purple-200 text-sm">Email</label>
                                    <p className="text-white text-lg">{userData?.email}</p>
                                </div>
                                <div>
                                    <label className="text-purple-200 text-sm">Phone</label>
                                    <p className="text-white text-lg">{userData?.phone || 'Not provided'}</p>
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
                    </div>
                </main>
            </div>
            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-purple-900 rounded-2xl p-6 max-w-2xl w-full border border-purple-500 my-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <Crown className="text-yellow-400 mr-3" size={32} />
                                <h3 className="text-2xl font-bold text-white">Upgrade to Instructor</h3>
                            </div>
                            <button onClick={() => setShowUpgradeModal(false)} className="text-white hover:text-gray-300 text-2xl">
                                ×
                            </button>
                        </div>
                        <form className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            {/* Dance Styles */}
                            {/* <div>
                                <label className="block text-white font-medium mb-2">Dance Styles *</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {danceStyleOptions.map(style => (
                                        <button
                                            key={style}
                                            type="button"
                                            onClick={() => handleDanceStyleToggle(style)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${upgradeFormData.danceStyles.includes(style)
                                                ? 'bg-yellow-500 text-white'
                                                : 'bg-purple-700 text-purple-200 hover:bg-purple-600'
                                                }`}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                            </div> */}
                            {/* Experience Years */}

                            {/* <div>
 <label className="block text-white font-medium mb-2">Years of Experience *</label>
 <input type="number" min="0" max="50" value={upgradeFormData.experienceYears} onChange={(e) => handleExperienceYearsChange(e.target.value)} className="w-full bg-purple-700 text-white rounded-lg py-2 px-4 focus:outline-none" />
 </div>
 </form>
 </div>
 </div> */}
                            {/* <div>
                                <label className="block text-white font-medium mb-2">Years of Experience *</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={upgradeFormData.experienceYears}
                                    onChange={(e) => setUpgradeFormData(prev => ({ ...prev, experienceYears: e.target.value }))}
                                    className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    placeholder="e.g., 5"
                                />
                            </div> */}
                            {/* Bio */}
                            <div>
                                <label className="block text-white font-medium mb-2">Bio *</label>
                                <textarea
                                    value={upgradeFormData.bio}
                                    onChange={(e) => setUpgradeFormData(prev => ({ ...prev, bio: e.target.value }))}
                                    className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 h-24"
                                    placeholder="Tell us about your dance journey and teaching goals..."
                                />
                            </div>
                            {/* Portfolio Links */}
                            <div>
                                <label className="block text-white font-medium mb-2">Portfolio Links (Optional)</label>
                                <input
                                    type="text"
                                    value={upgradeFormData.portfolioLinks}
                                    onChange={(e) => setUpgradeFormData(prev => ({ ...prev, portfolioLinks: e.target.value }))}
                                    className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    placeholder="Instagram, YouTube, etc. (comma separated)"
                                />
                            </div>
                            {/* Certificate Upload */}
                            <div>
                                <label className="block text-white font-medium mb-2">Certificate (Optional)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                    className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-500 file:text-white file:cursor-pointer"
                                />
                                {upgradeFormData.certificate && (
                                    <p className="text-sm text-green-400 mt-1">✓ {upgradeFormData.certificate.name}</p>
                                )}
                            </div>
                            {/* Available for Workshops */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="availableForWorkshops"
                                    checked={upgradeFormData.availableForWorkshops}
                                    onChange={(e) => setUpgradeFormData(prev => ({ ...prev, availableForWorkshops: e.target.checked }))}
                                    className="w-5 h-5 text-yellow-500 bg-purple-800 border-purple-600 rounded focus:ring-yellow-500"
                                />
                                <label htmlFor="availableForWorkshops" className="ml-2 text-white font-medium">
                                    Available to conduct workshops
                                </label>
                            </div>
                            {/* Preferred Location */}
                            <div>
                                <label className="block text-white font-medium mb-2">Preferred Location</label>
                                <input
                                    type="text"
                                    value={upgradeFormData.preferredLocation}
                                    onChange={(e) => setUpgradeFormData(prev => ({ ...prev, preferredLocation: e.target.value }))}
                                    className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    placeholder="City / Region"
                                />
                            </div>
                            {/* Additional Message */}
                            <div>
                                <label className="block text-white font-medium mb-2">Additional Message (Optional)</label>
                                <textarea
                                    value={upgradeFormData.additionalMessage}
                                    onChange={(e) => setUpgradeFormData(prev => ({ ...prev, additionalMessage: e.target.value }))}
                                    className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 h-20"
                                    placeholder="Any note for the admin..."
                                />
                            </div>
                        </form>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpgradeRole}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-lg font-bold transition-all"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default Profile;