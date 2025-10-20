import { Crown, Building2 } from 'lucide-react';
import { useState } from 'react';

interface InstructorFormData {
    danceStyles: string[];
    experienceYears: string;
    bio: string;
    portfolioLinks: string;
    certificate: File | null;
    availableForWorkshops: boolean;
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
    onSubmit: (formData: FormData) => Promise<void>;
    upgradeType: UpgradeType;
}

const UpgradeRoleModal = ({ show, onClose, onSubmit, upgradeType }: UpgradeRoleModalProps) => {
    const [formData, setFormData] = useState<FormData>(
        upgradeType === 'instructor'
            ? {
                  danceStyles: [],
                  experienceYears: '',
                  bio: '',
                  portfolioLinks: '',
                  certificate: null,
                  availableForWorkshops: false,
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (upgradeType === 'instructor') {
                setFormData(prev => ({ ...prev, certificate: e.target.files![0] }));
            } else {
                setFormData(prev => ({ ...prev, licenseDocument: e.target.files![0] }));
            }
        }
    };

    const handleDanceStyleToggle = (style: string) => {
        if (upgradeType === 'instructor') {
            const instructorData = formData as InstructorFormData;
            setFormData({
                ...instructorData,
                danceStyles: instructorData.danceStyles.includes(style)
                    ? instructorData.danceStyles.filter(s => s !== style)
                    : [...instructorData.danceStyles, style],
            });
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!show) return null;

    const danceStyles = ['Ballet', 'Contemporary', 'Hip-Hop', 'Jazz', 'Salsa', 'Ballroom', 'Tap', 'Breakdance'];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-purple-900 rounded-2xl p-6 max-w-2xl w-full border border-purple-500 my-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        {upgradeType === 'instructor' ? (
                            <>
                                <Crown className="text-yellow-400 mr-3" size={32} />
                                <h3 className="text-2xl font-bold text-white">Upgrade to Instructor</h3>
                            </>
                        ) : (
                            <>
                                <Building2 className="text-blue-400 mr-3" size={32} />
                                <h3 className="text-2xl font-bold text-white">Upgrade to Organizer</h3>
                            </>
                        )}
                    </div>
                    <button onClick={onClose} className="text-white hover:text-gray-300 text-2xl">
                        ×
                    </button>
                </div>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {upgradeType === 'instructor' ? (
                        <InstructorForm
                            formData={formData as InstructorFormData}
                            setFormData={setFormData}
                            danceStyles={danceStyles}
                            handleDanceStyleToggle={handleDanceStyleToggle}
                            handleFileChange={handleFileChange}
                        />
                    ) : (
                        <OrganizerForm
                            formData={formData as OrganizerFormData}
                            setFormData={setFormData}
                            handleFileChange={handleFileChange}
                        />
                    )}
                </div>

                <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-purple-700">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Instructor Form Component
const InstructorForm = ({
    formData,
    setFormData,
    danceStyles,
    handleDanceStyleToggle,
    handleFileChange,
}: {
    formData: InstructorFormData;
    setFormData: (data: any) => void;
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
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.danceStyles.includes(style)
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
                value={formData.experienceYears}
                onChange={e => setFormData((prev: any) => ({ ...prev, experienceYears: e.target.value }))}
                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="e.g., 5"
            />
        </div>

        {/* Bio */}
        <div>
            <label className="block text-white font-medium mb-2">Bio *</label>
            <textarea
                value={formData.bio}
                onChange={e => setFormData((prev: any) => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 h-24"
                placeholder="Tell us about your dance journey and teaching goals..."
            />
        </div>

        {/* Portfolio Links */}
        <div>
            <label className="block text-white font-medium mb-2">Portfolio Links (Optional)</label>
            <input
                type="text"
                value={formData.portfolioLinks}
                onChange={e => setFormData((prev: any) => ({ ...prev, portfolioLinks: e.target.value }))}
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
            {formData.certificate && <p className="text-sm text-green-400 mt-1">✓ {formData.certificate.name}</p>}
        </div>

        {/* Available for Workshops */}
        <div className="flex items-center">
            <input
                type="checkbox"
                id="availableForWorkshops"
                checked={formData.availableForWorkshops}
                onChange={e => setFormData((prev: any) => ({ ...prev, availableForWorkshops: e.target.checked }))}
                className="w-4 h-4 text-yellow-500 bg-purple-800 border-purple-600 rounded focus:ring-yellow-500"
            />
            <label htmlFor="availableForWorkshops" className="ml-2 text-white">
                Available for Workshops
            </label>
        </div>

        {/* Preferred Location */}
        <div>
            <label className="block text-white font-medium mb-2">Preferred Location (Optional)</label>
            <input
                type="text"
                value={formData.preferredLocation}
                onChange={e => setFormData((prev: any) => ({ ...prev, preferredLocation: e.target.value }))}
                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="City, State"
            />
        </div>

        {/* Additional Message */}
        <div>
            <label className="block text-white font-medium mb-2">Additional Message (Optional)</label>
            <textarea
                value={formData.additionalMessage}
                onChange={e => setFormData((prev: any) => ({ ...prev, additionalMessage: e.target.value }))}
                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 h-20"
                placeholder="Anything else you'd like us to know..."
            />
        </div>
    </>
);

// Organizer Form Component
const OrganizerForm = ({
    formData,
    setFormData,
    handleFileChange,
}: {
    formData: OrganizerFormData;
    setFormData: (data: any) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
    <>
        {/* Organization Name */}
        <div>
            <label className="block text-white font-medium mb-2">Organization Name *</label>
            <input
                type="text"
                value={formData.organizationName}
                onChange={e => setFormData((prev: any) => ({ ...prev, organizationName: e.target.value }))}
                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Event company or group name"
            />
        </div>

        {/* Experience Years */}
        <div>
            <label className="block text-white font-medium mb-2">Years of Experience *</label>
            <input
                type="number"
                min="0"
                value={formData.experienceYears}
                onChange={e => setFormData((prev: any) => ({ ...prev, experienceYears: e.target.value }))}
                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Years organizing events"
            />
        </div>

        {/* Past Events */}
        <div>
            <label className="block text-white font-medium mb-2">Past Events (Optional)</label>
            <input
                type="text"
                value={formData.pastEvents}
                onChange={e => setFormData((prev: any) => ({ ...prev, pastEvents: e.target.value }))}
                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Links or details of past events (comma separated)"
            />
        </div>

        {/* Description */}
        <div>
            <label className="block text-white font-medium mb-2">Description *</label>
            <textarea
                value={formData.description}
                onChange={e => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
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
                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer"
            />
            {formData.licenseDocument && (
                <p className="text-sm text-green-400 mt-1">✓ {formData.licenseDocument.name}</p>
            )}
        </div>

        {/* Message to Admin */}
        <div>
            <label className="block text-white font-medium mb-2">Message to Admin *</label>
            <textarea
                value={formData.message}
                onChange={e => setFormData((prev: any) => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                placeholder="Why do you want to become an organizer?"
            />
        </div>
    </>
);

export default UpgradeRoleModal;
export type { InstructorFormData, OrganizerFormData, UpgradeType };