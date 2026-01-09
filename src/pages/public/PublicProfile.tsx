import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { User, MapPin, Star, Instagram, Youtube, Mail, Phone, Link as LinkIcon, FileImage, Eye, Facebook, Linkedin, Twitter, CircleSmall, Heart, GitPullRequest } from 'lucide-react';
import UserNavbar from '../../components/shared/Navbar';
import { getDancerProfile } from '../../services/client/client.service';
import FormModal from '../../components/ui/FormModal';
import VenueMap from '../../components/ui/VenueMap';
import { sendRequestToDancers } from '../../services/client/browseDancers.service';
import { toggleLike } from '../../services/dancer/dancer.service';
import toast from 'react-hot-toast';
import { getClientEventRequests } from '../../services/client/client.service';

const PublicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userData } = useSelector((state: RootState) => state.user);
    const [profileUser, setProfileUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestData, setRequestData] = useState({
        event: '',
        date: '',
        venue: '',
        budget: '',
    });
    const [formErrors, setFormErrors] = useState({
        event: '',
        date: '',
        venue: '',
        budget: '',
    });
    const [showVenueMap, setShowVenueMap] = useState(false);
    const [hasRequested, setHasRequested] = useState(false);

    const isOwnProfile = userData?._id === id || (!id && userData);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                let user = null;
                if (isOwnProfile) {
                    user = userData;
                } else if (id) {
                    // Fetch public dancer profile using the correct endpoint
                    const response = await getDancerProfile(id)
                    // const response = await ClientAxios.get(`/dancer-profile/${id}`);
                    user = response.data.dancer;
                }
                setProfileUser(user);

                if (user) {
                    setLikeCount(user.likes?.length || 0);
                    setIsLiked(user.likes?.includes(userData?._id));
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        const checkRequestedStatus = async () => {
            if (!userData || !id) return;
            try {
                const response: { success: boolean; data?: { requests: any[] } } = await getClientEventRequests(new URLSearchParams());
                if (response.success && response.data && Array.isArray(response.data.requests)) {
                    const isReq = response.data.requests.some((req: any) => req.dancerId?._id === id);
                    setHasRequested(isReq);
                }
            } catch (error) {
                console.error("Failed to check request status", error);
            }
        };

        if (userData || id) {
            fetchProfile();
            if (!isOwnProfile) {
                checkRequestedStatus();
            }
        }
    }, [id, userData, isOwnProfile]);

    const handleLike = async () => {
        if (!userData) {
            toast.error('Please login to like');
            return;
        }
        try {
            const response = await toggleLike(profileUser._id);
            const updatedDancer = response.data?.dancer || response.dancer;

            if (updatedDancer) {
                setIsLiked(updatedDancer.likes.includes(userData._id));
                setLikeCount(updatedDancer.likes.length);
                setProfileUser((prev: any) => ({ ...prev, likes: updatedDancer.likes }));
            }
        } catch (error) {
            console.error("Failed to toggle like", error);
            toast.error('Failed to update like status');
        }
    };

    const handleOpenRequestModal = () => {
        setIsRequestModalOpen(true);
        setRequestData({ event: '', date: '', venue: '', budget: '' });
        setFormErrors({ event: '', date: '', venue: '', budget: '' });
    };

    const handleCloseRequestModal = () => {
        setIsRequestModalOpen(false);
        setFormErrors({ event: '', date: '', venue: '', budget: '' });
    };

    const validateForm = () => {
        const errors = { event: '', date: '', venue: '', budget: '' };
        let isValid = true;

        if (!requestData.event.trim()) { errors.event = 'Event name is required'; isValid = false; }
        if (!requestData.date) { errors.date = 'Event date is required'; isValid = false; }
        else {
            const selectedDate = new Date(requestData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate <= today) { errors.date = 'Event date must be in the future'; isValid = false; }
        }
        if (!requestData.venue.trim()) { errors.venue = 'Venue is required'; isValid = false; }
        if (!requestData.budget.trim()) {
            errors.budget = 'Budget is required';
            isValid = false;
        } else if (requestData.budget.includes('-')) {
            const [minStr, maxStr] = requestData.budget.split('-');
            const min = parseFloat(minStr);
            const max = parseFloat(maxStr);
            if (!isNaN(min) && !isNaN(max) && max <= min) {
                errors.budget = 'Maximum budget must be greater than minimum budget';
                isValid = false;
            }
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleConfirmSend = async () => {
        try {
            if (!validateForm()) return;

            const response = await sendRequestToDancers(profileUser._id, requestData);
            handleCloseRequestModal();

            if (response.success) {
                toast.success(`Event request sent to ${profileUser.username}! 🎉`);
                setHasRequested(true);
            } else {
                toast.error(response.data?.message || 'Failed to send request');
            }
        } catch (error) {
            console.error("Send request failed", error);
            toast.error('Failed to send event request');
        }
    };

    if (loading) return <div className="min-h-screen bg-[#1a103c] flex items-center justify-center text-white">Loading...</div>;
    if (!profileUser) return <div className="min-h-screen bg-[#1a103c] flex items-center justify-center text-white">User not found</div>;

    return (
        <div className="flex h-screen bg-[#0f0a24]">
            {/* <Sidebar activeMenu='Home' /> */}
            <main className="flex-1 overflow-y-auto">
                <UserNavbar />

                <div className="min-h-screen bg-[#0f0a24] p-4 md:p-8 font-sans text-white pl-16">
                    {/* Title with Back Button */}
                    <div className="flex items-center gap-5 mb-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all duration-200"
                        >
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                        <h1 className="text-4xl font-bold text-center pl-24">Dancer Profile</h1>
                    </div>
                    {/* Breadcrumbs */}
                    <div className="max-w-5xl mx-auto mb-4">
                        <nav className="flex items-center space-x-2 text-sm text-purple-300">
                            <button
                                onClick={() => navigate('/home')}
                                className="hover:text-white transition-colors"
                            >
                                Home
                            </button>
                            {/* <span>/</span>
                            <button
                                onClick={() => navigate(-1)}
                                className="hover:text-white transition-colors"
                            >
                                Dancers
                            </button> */}
                            <span>/</span>
                            <span className="text-white font-medium"> Dancer Profile</span>
                        </nav>
                    </div>

                    <div className="max-w-5xl mx-auto space-y-6">

                        {/* Header Section */}
                        <div className="bg-deep-purple-500 opacity-90 border-2 border-purple-500 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row items-start gap-8">
                                {/* Profile Image - Left Side */}
                                <div className="w-40 h-40 rounded-full border-4 border-white/20 shadow-xl overflow-hidden shrink-0">
                                    {profileUser.profileImage ? (
                                        <img src={profileUser.profileImage} alt={profileUser.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-purple-400 flex items-center justify-center">
                                            <User size={64} className="text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Info - Right Side */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h1 className="text-4xl font-bold flex items-center gap-2">
                                            {profileUser.username}
                                            {profileUser.isVerified && <span className="text-blue-300 text-2xl">✓</span>}
                                        </h1>
                                        <div className="flex items-center gap-2 mt-2">
                                            <p className="bg-purple-600 text-xs font-semibold px-3 py-1 rounded-full">
                                                {profileUser.danceStyles?.[0] || "Dancer"}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Bio */}
                                    <p className="text-purple-100 max-w-2xl leading-relaxed">
                                        {profileUser.bio || "No bio provided yet."}
                                    </p>

                                    {/* Location */}
                                    {profileUser.preferredLocation && (
                                        <div className="flex items-center gap-2 text-purple-200">
                                            <MapPin size={18} />
                                            <span>{profileUser.preferredLocation || "Location not available"}</span>
                                        </div>
                                    )}

                                    {/* Gender, Experience, Email, Phone */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        {profileUser.gender && (
                                            <div className="flex items-center gap-2 text-purple-200">
                                                <CircleSmall size={16} />
                                                <span>{profileUser.gender || "Gender not specified"}</span>
                                            </div>
                                        )}
                                        {profileUser.experienceYears && (
                                            <div className="flex items-center gap-2 text-purple-200">
                                                <Star size={16} />
                                                <span>{profileUser.experienceYears || 0} Years Experience</span>
                                            </div>
                                        )}
                                        {profileUser.email && (
                                            <div className="flex items-center gap-2 text-purple-200">
                                                <Mail size={16} />
                                                <span className="truncate">{profileUser.email}</span>
                                            </div>
                                        )}
                                        {profileUser.phoneNumber && (
                                            <div className="flex items-center gap-2 text-purple-200">
                                                <Phone size={16} />
                                                <span>{profileUser.phoneNumber}</span>
                                            </div>
                                        )}
                                        {/* <div className="col-span-2 flex items-center gap-2 text-purple-200">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${profileUser.availableForPrograms ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                                {profileUser.availableForPrograms ? 'Available for Programs' : 'Not Available for Programs'}
                                            </span>
                                        </div> */}
                                    </div>


                                    {/* Social Links */}
                                    {profileUser.portfolioLinks && profileUser.portfolioLinks.length > 0 && (
                                        <div className="flex gap-3 pt-2">
                                            {profileUser.portfolioLinks.map((link: string, index: number) => {
                                                const getSocialIcon = (url: string) => {
                                                    try {
                                                        const hostname = new URL(url).hostname.toLowerCase();
                                                        if (hostname.includes('instagram.com')) return <Instagram size={20} className="text-white hover:text-pink-400 transition-colors" />;
                                                        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return <Youtube size={20} className="text-white hover:text-red-400 transition-colors" />;
                                                        if (hostname.includes('linkedin.com')) return <Linkedin size={20} className="text-white hover:text-blue-500 transition-colors" />;
                                                        if (hostname.includes('twitter.com') || hostname.includes('x.com')) return <Twitter size={20} className="text-white hover:text-sky-400 transition-colors" />;
                                                        if (hostname.includes('facebook.com')) return <Facebook size={20} className="text-white hover:text-blue-600 transition-colors" />;
                                                    } catch (e) { /* Invalid URL */ }
                                                    return <LinkIcon size={20} className="text-white hover:text-purple-300 transition-colors" />;
                                                };
                                                return (
                                                    <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                                                        {getSocialIcon(link)}
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={isOwnProfile ? () => { } : handleLike}
                                            className="px-6 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-semibold transition-all flex items-center gap-2"
                                        >
                                            <Heart className={`${isLiked ? 'fill-pink-500 text-pink-500' : 'text-white'}`} size={20} />
                                            <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
                                        </button>

                                        {!isOwnProfile && userData?.role.includes('client') && (
                                            hasRequested ? (
                                                <button
                                                    disabled
                                                    className="px-6 py-2.5 bg-green-500/50 text-white backdrop-blur-sm rounded-lg font-semibold cursor-default flex items-center gap-2"
                                                >
                                                    <GitPullRequest size={20} />
                                                    Request Sent
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleOpenRequestModal}
                                                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                                                >
                                                    <GitPullRequest size={20} />
                                                    Send Request
                                                </button>
                                            )
                                        )}

                                        {/* {isOwnProfile && (
                                            <button
                                                onClick={() => navigate('/profile/edit')}
                                                className="px-6 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-semibold transition-all flex items-center gap-2"
                                            >
                                                <Edit2 size={18} />
                                                Edit Profile
                                            </button>
                                        )} */}
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-900/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Skills & Styles */}
                            <div className="bg-[#1e1b4b] rounded-3xl p-8 border border-purple-500">
                                <h2 className="text-2xl font-bold mb-6 text-purple-100">Dance Styles & Proficiency Levels</h2>
                                <div className="space-y-4">
                                    {(profileUser.danceStyles || []).map((style: string, index: number) => (
                                        <div key={index} className="bg-[#2e2a5b] p-4 rounded-xl flex justify-between items-center">
                                            <span className="font-semibold text-lg">{style}</span>
                                            {profileUser.danceStyleLevels?.[style] && (
                                                <span className="text-purple-300 text-sm font-medium">{profileUser.danceStyleLevels[style]}</span>
                                            )}
                                        </div>
                                    ))}
                                    {(!profileUser.danceStyles || profileUser.danceStyles.length === 0) && (
                                        <p className="text-gray-400">No dance styles listed.</p>
                                    )}
                                </div>
                            </div>

                            {/* Achievements */}
                            <div className="bg-[#1e1b4b] rounded-3xl p-8 border border-purple-500">
                                <h2 className="text-2xl font-bold mb-6 text-purple-100">Achievements</h2>
                                <div className="space-y-6">
                                    {(profileUser.achievements && profileUser.achievements.length > 0) ? (
                                        profileUser.achievements.map((achievement: any, index: number) => (
                                            <div key={index}>
                                                <h3 className="font-semibold text-lg">{achievement.awardName}</h3>
                                                <p className="text-purple-300 text-sm mt-1">{achievement.position} ({achievement.year})</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400">No achievements listed.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Certificates Section */}
                        {profileUser.certificates && profileUser.certificates.length > 0 && (
                            <div className="bg-[#1e1b4b] rounded-3xl p-8 border border-purple-500">
                                <h2 className="text-2xl font-bold mb-6 text-purple-100">Certificates</h2>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {profileUser.certificates.map((cert: any, index: number) => {
                                        if (!cert) return null;
                                        return (
                                            <div key={index} className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/20">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FileImage className="text-purple-400" size={20} />
                                                    <h4 className="text-white font-semibold text-lg truncate" title={cert.name}>{cert.name}</h4>
                                                </div>
                                                {cert.url && (
                                                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 text-sm inline-flex items-center gap-1">
                                                        View Certificate <Eye size={14} />
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Ratings & Reviews */}
                        {/* <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-center text-white">Ratings & Reviews</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> */}
                        {/* Overall Rating Card */}
                        {/* <div className="bg-[#a855f7] rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-lg">
                                    <h3 className="text-2xl font-bold mb-2 text-white">Overall Rating</h3>
                                    <div className="text-6xl font-bold text-white mb-2">4.9</div>
                                    <div className="flex gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} size={24} className="fill-white text-white" />
                                        ))}
                                    </div>
                                    <p className="text-purple-100 font-medium">Based on 45 reviews</p>
                                </div> */}

                        {/* Review Cards */}
                        {/* <div className="md:col-span-2 space-y-4">
                                    {MOCK_REVIEWS.map((review) => (
                                        <div key={review.id} className="bg-[#c084fc] rounded-2xl p-6 shadow-md text-white">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-lg">{review.name}</h4>
                                                <span className="text-purple-100 text-sm">{review.date}</span>
                                            </div>
                                            <p className="text-purple-50 leading-relaxed mb-2">
                                                {review.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div> */}

                        {/* Contact & Social */}
                        <div className="text-center py-12 space-y-8">
                            <h2 className="text-3xl font-bold text-white">Contact & Social Media</h2>

                            <div className="inline-block bg-[#c084fc] rounded-2xl p-8 max-w-2xl w-full relative overflow-hidden">
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="text-left space-y-2">
                                        <p className="text-xl font-semibold text-purple-900">For bookings, collaborations, or inquiries, please reach out via:</p>
                                        <div className="flex items-center gap-2 text-purple-900 font-medium">
                                            <Mail size={20} />
                                            <span>{profileUser.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-purple-900 font-medium">
                                            <Phone size={20} />
                                            <span>{profileUser.phone || "+1 (555) 123-4567"}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {profileUser.portfolioLinks && profileUser.portfolioLinks.map((link: string, idx: number) => (
                                            <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors">
                                                <LinkIcon className="text-white" size={24} />
                                            </a>
                                        ))}
                                        {/* Fallback icons if no links */}
                                        {(!profileUser.portfolioLinks || profileUser.portfolioLinks.length === 0) && (
                                            <div className="flex gap-4">
                                                <div className="bg-white/20 p-2 rounded-lg"><Instagram className="text-white" /></div>
                                                <div className="bg-white/20 p-2 rounded-lg"><Youtube className="text-white" /></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <footer className="bg-[#6d28d9] rounded-t-3xl mt-12 p-8 text-white">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex gap-4">
                                    <div className="bg-purple-500 p-2 rounded-lg"><Instagram size={20} /></div>
                                    <div className="bg-purple-500 p-2 rounded-lg"><Youtube size={20} /></div>
                                </div>

                                <div className="text-center md:text-left text-sm space-y-1">
                                    <h4 className="font-bold text-lg mb-2">Contact Us</h4>
                                    <p>Monday-Friday: 8am - 5pm PST</p>
                                    <p>3890 S Windermere St.</p>
                                    <p>Englewood, CO 80110</p>
                                </div>

                                <div className="text-center md:text-right text-sm space-y-1">
                                    <h4 className="font-bold text-lg mb-2">About Us</h4>
                                    <p>Our Story</p>
                                    <p>Career</p>
                                    <p>Groovia Blog</p>
                                </div>

                                <div className="text-2xl font-bold tracking-wider">Groovia</div>
                            </div>
                            <div className="text-center text-xs text-purple-200 mt-8">
                                ©2025 Groovia. All rights reserved.
                            </div>
                        </footer>

                    </div>
                </div>
            </main>

            {/* Request Modal */}
            <FormModal
                isOpen={isRequestModalOpen}
                onClose={handleCloseRequestModal}
                title={`Send Request to ${profileUser?.username}`}
                icon={<GitPullRequest className="text-purple-300" size={32} />}
                onSubmit={handleConfirmSend}
                submitText="Send Request"
                submitButtonClass="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
                <div>
                    <label className="block text-white font-medium mb-2">Event</label>
                    <input
                        type="text"
                        value={requestData.event}
                        onChange={(e) => {
                            setRequestData({ ...requestData, event: e.target.value });
                            if (formErrors.event) setFormErrors({ ...formErrors, event: '' });
                        }}
                        className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${formErrors.event ? 'border-2 border-red-500' : ''
                            }`}
                        placeholder="Event Name"
                    />
                    {formErrors.event && <p className="text-red-400 text-sm mt-1">{formErrors.event}</p>}
                </div>
                <div>
                    <label className="block text-white font-medium mb-2">Date</label>
                    <input
                        type="date"
                        value={requestData.date}
                        min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                        onChange={(e) => {
                            setRequestData({ ...requestData, date: e.target.value });
                            if (formErrors.date) setFormErrors({ ...formErrors, date: '' });
                        }}
                        className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${formErrors.date ? 'border-2 border-red-500' : ''
                            }`}
                    />
                    {formErrors.date && <p className="text-red-400 text-sm mt-1">{formErrors.date}</p>}
                </div>
                <div>
                    <label className="block text-white font-medium mb-2">Venue</label>
                    <input
                        type="text"
                        value={requestData.venue}
                        onChange={(e) => {
                            setRequestData({ ...requestData, venue: e.target.value });
                            if (formErrors.venue) setFormErrors({ ...formErrors, venue: '' });
                        }}
                        className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${formErrors.venue ? 'border-2 border-red-500' : ''
                            }`}
                        placeholder="Enter venue address"
                        readOnly={showVenueMap}
                    />
                    {formErrors.venue && <p className="text-red-400 text-sm mt-1">{formErrors.venue}</p>}
                    <button
                        type="button"
                        onClick={() => setShowVenueMap(!showVenueMap)}
                        className="mt-2 text-purple-300 hover:text-purple-100 text-sm underline"
                    >
                        {showVenueMap ? 'Hide Map' : 'Select from Map'}
                    </button>
                    {showVenueMap && (
                        <div className="mt-3">
                            <VenueMap
                                onVenueSelect={(venue) => {
                                    setRequestData({ ...requestData, venue: venue.address });
                                    if (formErrors.venue) setFormErrors({ ...formErrors, venue: '' });
                                }}
                                initialCenter={[20.5937, 78.9629]}
                            />
                        </div>
                    )}
                </div>
                <div>
                    <label className="block text-white font-medium mb-2">Budget Range (₹)</label>
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <input
                                type="number"
                                value={requestData.budget.includes('-') ? requestData.budget.split('-')[0] : requestData.budget}
                                onChange={(e) => {
                                    const min = e.target.value;
                                    const max = requestData.budget.includes('-') ? requestData.budget.split('-')[1] : '';
                                    setRequestData({ ...requestData, budget: `${min}-${max}` });
                                    if (formErrors.budget) setFormErrors({ ...formErrors, budget: '' });
                                }}
                                className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${formErrors.budget ? 'border-2 border-red-500' : ''
                                    }`}
                                placeholder="Min"
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="number"
                                value={requestData.budget.includes('-') ? requestData.budget.split('-')[1] : ''}
                                onChange={(e) => {
                                    const min = requestData.budget.includes('-') ? requestData.budget.split('-')[0] : requestData.budget;
                                    const max = e.target.value;
                                    setRequestData({ ...requestData, budget: `${min}-${max}` });
                                    if (formErrors.budget) setFormErrors({ ...formErrors, budget: '' });
                                }}
                                className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${formErrors.budget ? 'border-2 border-red-500' : ''
                                    }`}
                                placeholder="Max"
                            />
                        </div>
                    </div>
                    {/* <input
                        type="text"
                        value={requestData.budget}
                        onChange={(e) => {
                            setRequestData({ ...requestData, budget: e.target.value });
                            if (formErrors.budget) setFormErrors({ ...formErrors, budget: '' });
                        }}
                        className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${formErrors.budget ? 'border-2 border-red-500' : ''
                            }`}
                        placeholder="e.g., $500 - $1000"
                    /> */}
                    {formErrors.budget && <p className="text-red-400 text-sm mt-1">{formErrors.budget}</p>}
                </div>
            </FormModal>
        </div>
    );
};

export default PublicProfile;
