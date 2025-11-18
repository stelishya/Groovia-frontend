import { Crown, Building2, CheckCircle, CreditCard } from 'lucide-react';
import React, { useState } from 'react';

import { toast } from 'react-hot-toast';
// import UserAxios from '../../services/user/axios.service';
import { upgradeService } from '../../services/user/upgradeRole.service';

import FormModal from '../ui/FormModal';

interface InstructorFormData {
    danceStyles: string[];
    experienceYears: string;
    bio: string;
    portfolioLinks: string;
    certificate: File | null;
    // availableForWorkshops: boolean;
    preferredLocation: string;
    additionalMessage: string;
}

interface OrganizerFormData {
    organizationName: string;
    experienceYears: string;
    pastEvents: string;
    description: string;
    licenseDocument: File | null;
    message: string;
}

type UpgradeType = 'instructor' | 'organizer';
type FormData = InstructorFormData | OrganizerFormData;

interface UpgradeRoleModalProps {
    show: boolean;
    onClose: () => void;
    // onSubmit: (formData: FormData) => Promise<void>;
    upgradeType: UpgradeType;
    userData: any;
}

const UpgradeRoleModal = ({ show, onClose, upgradeType, userData }: UpgradeRoleModalProps) => {
    const [upgradeFormData, setUpgradeFormData] = useState<FormData>(
        upgradeType === 'instructor'
            ? {
                danceStyles: [],
                experienceYears: '',
                bio: '',
                portfolioLinks: '',
                certificate: null,
                //   availableForWorkshops: false,
                preferredLocation: '',
                additionalMessage: '',
            }
            : {
                organizationName: '',
                experienceYears: '',
                pastEvents: '',
                description: '',
                licenseDocument: null,
                message: '',
            }
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    // Dance style options
    const danceStyles = [
        'Bharatanatyam', 'Kathak', 'Odissi', 'Kuchipudi', 'Mohiniyattam',
        'Hip-Hop', 'Contemporary', 'Ballet', 'Jazz', 'Salsa',
        'Bollywood', 'Folk', 'Freestyle', 'Ballroom', 'Tap', 'Breakdance', 'Other'
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (upgradeType === 'instructor') {
                setUpgradeFormData(prev => ({ ...prev, certificate: e.target.files![0] }));
            } else {
                setUpgradeFormData(prev => ({ ...prev, licenseDocument: e.target.files![0] }));
            }
        }
    };

    const handleDanceStyleToggle = (style: string) => {
        if (upgradeType === 'instructor') {
            const instructorData = upgradeFormData as InstructorFormData;
            setUpgradeFormData({
                ...instructorData,
                danceStyles: instructorData.danceStyles.includes(style)
                    ? instructorData.danceStyles.filter(s => s !== style)
                    : [...instructorData.danceStyles, style]
            });
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // await handleUpgradeRole(upgradeFormData);
            if (upgradeType === 'instructor') {
                const instructorData = upgradeFormData as InstructorFormData;

                // Validation for instructor
                if (instructorData.danceStyles.length === 0) {
                    toast.error('Please select at least one dance style');
                    setIsSubmitting(false);
                    return;
                }
                if (!instructorData.experienceYears || parseInt(instructorData.experienceYears) < 0) {
                    toast.error('Please enter valid years of experience');
                    setIsSubmitting(false);
                    return;
                }
                if (!instructorData.bio.trim()) {
                    toast.error('Please provide a bio');
                    setIsSubmitting(false);
                    return;
                }
                if (!userData?.email) {
                    toast.error('User email not found. Please log in again.');
                    return;
                }

                // service for instructor
                const response = await upgradeService.upgradeToInstructor({
                    danceStyles: instructorData.danceStyles,
                    experienceYears: instructorData.experienceYears,
                    bio: instructorData.bio,
                    portfolioLinks: instructorData.portfolioLinks,
                    preferredLocation: instructorData.preferredLocation,
                    additionalMessage: instructorData.additionalMessage,
                    email: userData.email,
                    certificate: instructorData.certificate || undefined
                });

                if (response.status === 201 || response.status === 200) {
                    toast.success('Upgrade request submitted!',{
                        duration: 5000
                    });
                    onClose();
                }
            } else {
                // Handle organizer upgrade
                const organizerData = upgradeFormData as OrganizerFormData;
                // Validation for organizer
                if (!organizerData.organizationName.trim()) {
                    toast.error('Please provide organization name');
                    setIsSubmitting(false);
                    return;
                }
                if (!organizerData.experienceYears || parseInt(organizerData.experienceYears) < 0) {
                    toast.error('Please enter valid years of experience');
                    setIsSubmitting(false);
                    return;
                }
                if (!organizerData.description.trim()) {
                    toast.error('Please provide a description');
                    setIsSubmitting(false);
                    return;
                }
                if (!organizerData.message.trim()) {
                    toast.error('Please provide a message to admin');
                    setIsSubmitting(false);
                    return;
                }
                if (!userData?.email) {
                    toast.error('User email not found. Please log in again.');
                    setIsSubmitting(false);
                    return;
                }
                // service for organizer
                const response = await upgradeService.upgradeToOrganizer({
                    organizationName: organizerData.organizationName,
                    experienceYears: organizerData.experienceYears,
                    pastEvents: organizerData.pastEvents,
                    description: organizerData.description,
                    message: organizerData.message,
                    email: userData.email,
                    licenseDocument: organizerData.licenseDocument || undefined
                });
                if (response.status === 201 || response.status === 200) {
                    toast.success('Organizer request submitted! We will review and get back to you.', {
                        duration: 5000
                    })
                    onClose();
                }
            }
            setTimeout(()=>{
                window.location.reload();
            },3000)
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit');
        } finally {
            setIsSubmitting(false);
        }
    };

    // if (!show) return null;
    // const danceStyles = ['Ballet', 'Contemporary', 'Hip-Hop', 'Jazz', 'Salsa', 'Ballroom', 'Tap', 'Breakdance'];
    // Determine modal props based on upgrade type
    const modalConfig = upgradeType === 'instructor'
        ? {
            title: 'Upgrade to Instructor',
            icon: <Crown className="text-yellow-400" size={32} />,
            submitButtonClass: 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600'
        }
        : {
            title: 'Upgrade to Organizer',
            icon: <Building2 className="text-purple-400" size={32} />,
            submitButtonClass: 'bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600'
        };
    return (
        // <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        //     <div className="bg-purple-900 rounded-2xl p-6 max-w-2xl w-full border border-purple-500 my-8">
        //         <div className="flex items-center justify-between mb-6">
        //             <div className="flex items-center">
        //                 {upgradeType === 'instructor' ? (
        //                     <>
        //                         <Crown className="text-yellow-400 mr-3" size={32} />
        //                         <h3 className="text-2xl font-bold text-white">Upgrade to Instructor</h3>
        //                     </>
        //                 ) : (
        //                     <>
        //                         <Building2 className="text-blue-400 mr-3" size={32} />
        //                         <h3 className="text-2xl font-bold text-white">Upgrade to Organizer</h3>
        //                     </>
        //                 )}
        //             </div>
        //             <button onClick={onClose} className="text-white hover:text-gray-300 text-2xl">
        //                 ×
        //             </button>
        //         </div>

        //         <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        //             {upgradeType === 'instructor' ? (
        //                 <InstructorForm
        //                     upgradeFormData={upgradeFormData as InstructorFormData}
        //                     setUpgradeFormData={setUpgradeFormData}
        //                     danceStyles={danceStyles}
        //                     handleDanceStyleToggle={handleDanceStyleToggle}
        //                     handleFileChange={handleFileChange}
        //                 />
        //             ) : (
        //                 <OrganizerForm
        // upgradeFormData={upgradeFormData as OrganizerFormData}
        // setUpgradeFormData={setUpgradeFormData}
        // handleFileChange={handleFileChange}
        //                 />
        //             )}
        //         </div>

        //         <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-purple-700">
        //             <button
        //                 onClick={onClose}
        //                 className="px-6 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 transition-colors"
        //                 disabled={isSubmitting}
        //             >
        //                 Cancel
        //             </button>
        //             <button
        //                 onClick={handleSubmit}
        //                 disabled={isSubmitting}
        //                 className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        //             >
        //                 {isSubmitting ? 'Submitting...' : 'Submit Request'}
        //             </button>
        //         </div>
        //     </div>
        // </div>
        <FormModal
            isOpen={show}
            onClose={onClose}
            title={modalConfig.title}
            icon={modalConfig.icon}
            onSubmit={handleSubmit}
            submitText="Submit Request"
            submitButtonClass={modalConfig.submitButtonClass}
            isLoading={isSubmitting}
        >
            {upgradeType === 'instructor' ? (
                <InstructorForm
                    upgradeFormData={upgradeFormData as InstructorFormData}
                    setUpgradeFormData={setUpgradeFormData}
                    danceStyles={danceStyles}
                    handleDanceStyleToggle={handleDanceStyleToggle}
                    handleFileChange={handleFileChange}
                />
            ) : (
                <OrganizerForm
                    upgradeFormData={upgradeFormData as OrganizerFormData}
                    setUpgradeFormData={setUpgradeFormData}
                    handleFileChange={handleFileChange}
                />
            )}
        </FormModal>
    );
};

// Instructor Form Component
const InstructorForm = ({
    upgradeFormData,
    setUpgradeFormData,
    danceStyles,
    handleDanceStyleToggle,
    handleFileChange,
}: {
    upgradeFormData: InstructorFormData;
    setUpgradeFormData: (data: any) => void;
    danceStyles: string[];
    handleDanceStyleToggle: (style: string) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
    <>
        {/* Dance Styles */}
        <div>
            <label className="block text-white font-medium mb-2">Dance Styles *</label>
            <div className="flex flex-wrap gap-2">
                {danceStyles.map(style => (
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
        </div>

        {/* Experience Years */}
        <div>
            <label className="block text-white font-medium mb-2">Years of Experience *</label>
            <input
                type="number"
                min="0"
                value={upgradeFormData.experienceYears}
                onChange={e => setUpgradeFormData((prev: any) => ({ ...prev, experienceYears: e.target.value }))}
                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="e.g., 5"
            />
        </div>

        {/* Bio */}
        <div>
            <label className="block text-white font-medium mb-2">Bio *</label>
            <textarea
                value={upgradeFormData.bio}
                onChange={e => setUpgradeFormData((prev: any) => ({ ...prev, bio: e.target.value }))}
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
                onChange={e => setUpgradeFormData((prev: any) => ({ ...prev, portfolioLinks: e.target.value }))}
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
            {upgradeFormData.certificate && <p className="text-sm text-green-400 mt-1">✓ {upgradeFormData.certificate.name}</p>}
        </div>

        {/* Available for Workshops */}
        {/* <div className="flex items-center">
            <input
                type="checkbox"
                id="availableForWorkshops"
                checked={upgradeFormData.availableForWorkshops}
                onChange={e => setUpgradeFormData((prev: any) => ({ ...prev, availableForWorkshops: e.target.checked }))}
                className="w-4 h-4 text-yellow-500 bg-purple-800 border-purple-600 rounded focus:ring-yellow-500"
            />
            <label htmlFor="availableForWorkshops" className="ml-2 text-white">
                Available for Workshops
            </label>
        </div> */}

        {/* Preferred Location */}
        <div>
            <label className="block text-white font-medium mb-2">Preferred Location (Optional)</label>
            <input
                type="text"
                value={upgradeFormData.preferredLocation}
                onChange={e => setUpgradeFormData((prev: any) => ({ ...prev, preferredLocation: e.target.value }))}
                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="City, State"
            />
        </div>

        {/* Additional Message */}
        <div>
            <label className="block text-white font-medium mb-2">Additional Message (Optional)</label>
            <textarea
                value={upgradeFormData.additionalMessage}
                onChange={e => setUpgradeFormData((prev: any) => ({ ...prev, additionalMessage: e.target.value }))}
                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 h-20"
                placeholder="Anything else you'd like us to know..."
            />
        </div>

    </>
);

// Organizer Form Component
const OrganizerForm = ({
    upgradeFormData,
    setUpgradeFormData,
    handleFileChange,
}: {
    upgradeFormData: OrganizerFormData;
    setUpgradeFormData: (data: any) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
    <>
        {/* Organization Name */}
        <div>
            <label className="block text-white font-medium mb-2">Organization Name *</label>
            <input
                type="text"
                value={upgradeFormData.organizationName}
                onChange={e => setUpgradeFormData((prev: any) => ({ ...prev, organizationName: e.target.value }))}
                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Event company or group name"
            />
        </div>

        {/* Experience Years */}
        <div>
            <label className="block text-white font-medium mb-2">Years of Experience *</label>
            <input
                type="number"
                min="0"
                value={upgradeFormData.experienceYears}
                onChange={e => setUpgradeFormData((prev: any) => ({ ...prev, experienceYears: e.target.value }))}
                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Years organizing events"
            />
        </div>

        {/* Past Events */}
        <div>
            <label className="block text-white font-medium mb-2">Past Events (Optional)</label>
            <input
                type="text"
                value={upgradeFormData.pastEvents}
                onChange={e => setUpgradeFormData((prev: any) => ({ ...prev, pastEvents: e.target.value }))}
                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Links or details of past events (comma separated)"
            />
        </div>

        {/* Description */}
        <div>
            <label className="block text-white font-medium mb-2">Description *</label>
            <textarea
                value={upgradeFormData.description}
                onChange={e => setUpgradeFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
                placeholder="Brief about what kind of events you organize..."
            />
        </div>

        {/* License Document */}
        <div>
            <label className="block text-white font-medium mb-2">License Document (Optional)</label>
            <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white file:cursor-pointer"
            />
            {upgradeFormData.licenseDocument && (
                <p className="text-sm text-green-400 mt-1">✓ {upgradeFormData.licenseDocument.name}</p>
            )}
        </div>

        {/* Message to Admin */}
        <div>
            <label className="block text-white font-medium mb-2">Message to Admin *</label>
            <textarea
                value={upgradeFormData.message}
                onChange={e => setUpgradeFormData((prev: any) => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-20"
                placeholder="Why do you want to become an organizer?"
            />
        </div>
    </>
);

// Reusable UpgradeRoleSection Component
interface UpgradeRoleSectionProps {
    upgradeRequests: any[]; // Array of upgrade requests
    onRequestUpgrade: () => void; // Callback to open upgrade modal
    onPaymentClick: (request: any) => void; // Callback to handle payment
    onRefreshStatus: () => void; // Callback to refresh upgrade status
    roleType: 'instructor' | 'organizer'; // Specify which role this section is for
    userType?: 'dancer' | 'client'; // Optional: for role-specific messaging
    hasRole?: boolean; // Whether user already has this role
}

export const UpgradeRoleSection: React.FC<UpgradeRoleSectionProps> = ({
    upgradeRequests,
    onRequestUpgrade,
    onPaymentClick,
    onRefreshStatus,
    roleType,
    userType,
    hasRole = false
}) => {
    // Don't show if user already has the role
    if (hasRole) return null;

    console.log('upgradeRequests array:', upgradeRequests);
    console.log('roleType in UpgradeRoleSection:', roleType);

    // Find the specific upgrade request for this role type
    const upgradeRequest = upgradeRequests.find(req => req.type === roleType);
    console.log("found upgradeRequest in upgrade role section in UpgradeRoleModal : ", upgradeRequest);

    // Get role-specific configuration
    const getRoleConfig = () => {
        if (roleType === 'instructor') {
            return {
                title: 'Upgrade to Instructor Role',
                description: `Unlock additional features by upgrading to an Instructor role. As an Instructor, you can:`,
                benefits: [
                    'Create and host workshops',
                    'Teach dance classes and courses',
                    'Earn from your expertise',
                    'Build your student community',
                    'Access instructor-only features'
                ],
                icon: <Crown className="text-yellow-400" size={32} />,
                colors: {
                    initial: 'from-yellow-400/20 to-orange-500/20 border-yellow-500/30',
                    pending: 'from-blue-400/20 to-blue-600/20 border-blue-500/30',
                    approved: 'from-green-400/20 to-green-600/20 border-green-500/30',
                    rejected: 'from-red-400/20 to-red-600/20 border-red-500/30'
                },
                buttonColors: 'from-yellow-600 to-orange-600 hover:from-yellow-600 hover:to-orange-600'
            };
        } else {
            return {
                title: 'Upgrade to Organizer Role',
                description: `Unlock additional features by upgrading to an Organizer role. As an Organizer, you can:`,
                benefits: [
                    'Create and manage dance events',
                    'Host competitions and showcases',
                    'Build event communities',
                    'Access event management tools',
                    'Monetize your events'
                ],
                icon: <Building2 className="text-yellow-400" size={32} />,
                colors: {
                    initial: 'from-yellow-400/20 to-orange-500/20 border-yellow-500/30',
                    pending: 'from-blue-400/20 to-blue-600/20 border-blue-500/30',
                    approved: 'from-green-400/20 to-green-600/20 border-green-500/30',
                    rejected: 'from-red-400/20 to-red-600/20 border-red-500/30'
                },
                buttonColors: 'from-orange-500 to-yellow-600 hover:from-yellow-600 hover:to-orange-700'
            };
        }
    };

    const config = getRoleConfig();
    const ROLE_UPGRADE_PRICE = 499; // You can import this constant

    // If no request exists, show the initial upgrade prompt
    if (!upgradeRequest) {
        return (
            <div className={`mt-6 bg-gradient-to-r ${config.colors.initial} backdrop-blur-lg rounded-2xl p-6 border`}>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {config.icon}
                    </div>
                    <div className="ml-4 flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{config.title}</h3>
                        <p className="text-purple-100 mb-4">
                            {config.description}
                        </p>
                        <ul className="list-disc list-inside text-purple-100 space-y-1 mb-4">
                            {config.benefits.map((benefit, index) => (
                                <li key={index}>{benefit}</li>
                            ))}
                        </ul>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onRequestUpgrade}
                                className={`px-6 py-3 bg-gradient-to-r ${config.buttonColors} text-white font-bold rounded-lg transition-all shadow-lg`}
                            >
                                Request Upgrade
                            </button>
                            <span className="text-purple-200 text-sm">
                                One-time payment: ₹{ROLE_UPGRADE_PRICE}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show status based on request state
    if (upgradeRequest.status === 'pending') {
        return (
            <div className={`mt-6 bg-gradient-to-r ${config.colors.pending} backdrop-blur-lg rounded-2xl p-6 border`}>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {React.cloneElement(config.icon, { className: 'text-blue-400', size: 32 })}
                    </div>
                    <div className="ml-4 flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">
                            {roleType.charAt(0).toUpperCase() + roleType.slice(1)} Upgrade Request Submitted
                        </h3>
                        <p className="text-blue-100 mb-4">
                            Your {roleType} upgrade request is under admin review. We'll notify you once it's approved.
                        </p>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <span className="text-blue-200 text-sm">Pending Admin Review</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (upgradeRequest.status === 'approved' || upgradeRequest.status === 'payment_pending') {
        return (
            <div className={`mt-6 bg-gradient-to-r ${config.colors.approved} backdrop-blur-lg rounded-2xl p-6 border`}>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <CheckCircle className="text-green-400" size={32} />
                    </div>
                    <div className="ml-4 flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">
                            🎉 Upgrade Request Approved by Admin!
                        </h3>
                        <p className="text-green-100 mb-4">
                            Congratulations! Your {roleType} upgrade has been approved.
                            Complete the payment to activate your {roleType} role.
                        </p>

                        {upgradeRequest.adminMessage && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                                <p className="text-sm text-green-200">
                                    <span className="font-medium text-white">Admin Message:</span> {upgradeRequest.adminMessage}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-200 text-sm mb-2">One-time payment required:</p>
                                <p className="text-2xl font-bold text-white">₹{ROLE_UPGRADE_PRICE}</p>
                            </div>
                            <button
                                onClick={() => onPaymentClick(upgradeRequest)}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg flex items-center space-x-2"
                            >
                                <CreditCard className="w-5 h-5" />
                                <span>Continue with Payment</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (upgradeRequest.status === 'rejected') {
        return (
            <div className={`mt-6 bg-gradient-to-r ${config.colors.rejected} backdrop-blur-lg rounded-2xl p-6 border`}>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {React.cloneElement(config.icon, { className: 'text-red-400', size: 32 })}
                    </div>
                    <div className="ml-4 flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">Upgrade Request Rejected</h3>
                        <p className="text-red-100 mb-4">
                            Unfortunately, your {roleType} upgrade request was not approved.
                        </p>

                        {upgradeRequest.adminMessage && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                                <p className="text-sm text-red-200">
                                    <span className="font-medium text-white">Admin Message:</span> {upgradeRequest.adminMessage}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={onRequestUpgrade}
                            className={`px-6 py-3 bg-gradient-to-r ${config.buttonColors} text-white font-bold rounded-lg transition-all shadow-lg`}
                        >
                            Request Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // If status is completed, this section won't show because hasRole will be true
    return null;
};

export default UpgradeRoleModal;
export type { InstructorFormData, OrganizerFormData, UpgradeType };