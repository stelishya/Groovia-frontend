import { useState, useEffect } from 'react';
import { X, Plus, Trash, Upload, MapPin, Crop } from 'lucide-react';
import { type CreateWorkshopData, WorkshopMode } from '../../types/workshop.type';
import VenueMap from '../ui/VenueMap';
import ImageCropModal from '../ui/ImageCropModal';

interface CreateWorkshopModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateWorkshopData) => void;
    initialData?: CreateWorkshopData;
    isEditing?: boolean;
}

const DANCE_STYLES = [
    'Hip-Hop',
    'Classical',
    'Contemporary',
    'Ballet',
    'Jazz',
    'Breakdance',
    'Folk',
    'Salsa',
    'Ballroom',
    'Other'
];

const CreateWorkshopModal: React.FC<CreateWorkshopModalProps> = ({ isOpen, onClose, onSubmit, initialData, isEditing = false }) => {
    const [formData, setFormData] = useState<CreateWorkshopData>({
        title: '',
        description: '',
        style: '',
        mode: WorkshopMode.OFFLINE,
        startDate: '',
        endDate: '',
        fee: 0,
        maxParticipants: 0,
        posterImage: '',
        location: '',
        meetingLink: '',
        deadline: '',
        sessions: [{ date: '', startTime: '', endTime: '' }],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showCustomStyle, setShowCustomStyle] = useState(false);
    const [customStyle, setCustomStyle] = useState('');
    const [showLocationMap, setShowLocationMap] = useState(false);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);
    const [showCropModal, setShowCropModal] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            if (initialData && isEditing) {
                const formattedData = {
                    ...initialData,
                    startDate: new Date(initialData.startDate).toISOString().split('T')[0],
                    endDate: new Date(initialData.endDate).toISOString().split('T')[0],
                    deadline: new Date(initialData.deadline).toISOString().split('T')[0],
                    sessions: initialData.sessions.map(s => ({
                        ...s,
                        date: new Date(s.date).toISOString().split('T')[0]
                    }))
                };
                setFormData(formattedData);
                setImagePreview(formattedData.posterImage);
                setTempImageSrc(formattedData.posterImage);

                if (!DANCE_STYLES.includes(formattedData.style)) {
                    setShowCustomStyle(true);
                    setCustomStyle(formattedData.style);
                }
            } else {
                setFormData({
                    title: '',
                    description: '',
                    style: '',
                    mode: WorkshopMode.OFFLINE,
                    startDate: '',
                    endDate: '',
                    fee: 0,
                    maxParticipants: 0,
                    posterImage: '',
                    location: '',
                    meetingLink: '',
                    deadline: '',
                    sessions: [{ date: '', startTime: '', endTime: '' }],
                });
                setImagePreview('');
                setShowCustomStyle(false);
                setCustomStyle('');
                setTempImageSrc('');
            }
            setErrors({});
        }
    }, [initialData, isEditing, isOpen]);

    if (!isOpen) return null;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.style && !customStyle) newErrors.style = 'Dance style is required';
        if (formData.fee < 0) newErrors.fee = 'Fee cannot be negative';
        if (formData.maxParticipants <= 0) newErrors.maxParticipants = 'Max participants must be greater than 0';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (!formData.deadline) newErrors.deadline = 'Registration deadline is required';
        if (!formData.posterImage) newErrors.posterImage = 'Poster image is required';

        if (formData.mode === WorkshopMode.OFFLINE && !formData.location?.trim()) {
            newErrors.location = 'Location is required for offline workshops';
        }

        if (formData.mode === WorkshopMode.ONLINE && !formData.meetingLink?.trim()) {
            newErrors.meetingLink = 'Meeting link is required for online workshops';
        }

        formData.sessions.forEach((session, index) => {
            if (!session.date) newErrors[`session_${index}_date`] = 'Date is required';
            if (!session.startTime) newErrors[`session_${index}_startTime`] = 'Start time is required';
            if (!session.endTime) newErrors[`session_${index}_endTime`] = 'End time is required';
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

        if (name === 'style') {
            if (value === 'Other') {
                setShowCustomStyle(true);
                setFormData(prev => ({ ...prev, style: '' }));
            } else {
                setShowCustomStyle(false);
                setFormData(prev => ({ ...prev, style: value }));
            }
        }
    };

    const handleSessionChange = (index: number, field: string, value: string) => {
        const newSessions = [...formData.sessions];
        newSessions[index] = { ...newSessions[index], [field]: value };
        setFormData(prev => ({ ...prev, sessions: newSessions }));

        const errorKey = `session_${index}_${field}`;
        if (errors[errorKey]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[errorKey];
                return newErrors;
            });
        }
    };

    const addSession = () => {
        setFormData(prev => ({
            ...prev,
            sessions: [...prev.sessions, { date: '', startTime: '', endTime: '' }]
        }));
    };

    const removeSession = (index: number) => {
        setFormData(prev => ({
            ...prev,
            sessions: prev.sessions.filter((_, i) => i !== index)
        }));
    };

    const handleImageUpload = (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, posterImage: 'Image size should be less than 5MB' }));
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setTempImageSrc(result);
            setShowCropModal(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = (croppedImage: string) => {
        setImagePreview(croppedImage);
        setFormData(prev => ({ ...prev, posterImage: croppedImage }));
        setErrors(prev => ({ ...prev, posterImage: '' }));
        setShowCropModal(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const finalData = {
            ...formData,
            fee: Number(formData.fee),
            maxParticipants: Number(formData.maxParticipants),
            style: showCustomStyle ? customStyle : formData.style,
            meetingLink: formData.mode === WorkshopMode.ONLINE ? formData.meetingLink : undefined,
            location: formData.mode === WorkshopMode.OFFLINE ? formData.location : undefined,
        };

        onSubmit(finalData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-purple-700/90 border border-purple-500/30 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">{isEditing ? 'Edit Workshop' : 'Create New Workshop'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-purple-200 mb-1">Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`w-full bg-purple-500 border-2 ${errors.title ? 'border-red-500' : 'border-purple-800'} rounded-lg p-2 text-white`}
                            />
                            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                        </div>
                        <div>
                            <label className="block text-sm text-purple-200 mb-1">Dance Style *</label>
                            <select
                                name="style"
                                value={showCustomStyle ? 'Other' : formData.style}
                                onChange={handleChange}
                                className={`w-full bg-purple-500 border-2 ${errors.style ? 'border-red-500' : 'border-purple-800'} rounded-lg p-2 text-white`}
                            >
                                <option value="">Select Style</option>
                                {DANCE_STYLES.map(style => (
                                    <option key={style} value={style}>{style}</option>
                                ))}
                            </select>
                            {showCustomStyle && (
                                <input
                                    type="text"
                                    placeholder="Enter custom style"
                                    value={customStyle}
                                    onChange={(e) => setCustomStyle(e.target.value)}
                                    className="w-full bg-purple-500 border-2 border-purple-800 rounded-lg p-2 text-white mt-2"
                                />
                            )}
                            {errors.style && <p className="text-red-400 text-xs mt-1">{errors.style}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-purple-200 mb-1">Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className={`w-full bg-purple-500 border-2 ${errors.description ? 'border-red-500' : 'border-purple-800'} rounded-lg p-2 text-white`}
                            rows={3}
                        />
                        {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-purple-200 mb-1">Mode *</label>
                            <select
                                name="mode"
                                value={formData.mode}
                                onChange={handleChange}
                                className="w-full bg-purple-500 border-2 border-purple-800 rounded-lg p-2 text-white"
                            >
                                <option value={WorkshopMode.OFFLINE}>Offline</option>
                                <option value={WorkshopMode.ONLINE}>Online</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-purple-200 mb-1">Fee (₹) *</label>
                            <input
                                type="number"
                                name="fee"
                                min={0}
                                value={formData.fee}
                                onChange={handleChange}
                                className={`w-full bg-purple-500 border-2 ${errors.fee ? 'border-red-500' : 'border-purple-800'} rounded-lg p-2 text-white`}
                            />
                            {errors.fee && <p className="text-red-400 text-xs mt-1">{errors.fee}</p>}
                            <p className="text-purple-300 text-xs mt-1">Note: A 20% platform fee will be deducted from each booking.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-purple-200 mb-1">Start Date *</label>
                            <input
                                type="date"
                                name="startDate"
                                min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                                value={formData.startDate}
                                onChange={handleChange}
                                className={`w-full bg-purple-500 border-2 ${errors.startDate ? 'border-red-500' : 'border-purple-800'} rounded-lg p-2 text-white`}
                            />
                            {errors.startDate && <p className="text-red-400 text-xs mt-1">{errors.startDate}</p>}
                        </div>
                        <div>
                            <label className="block text-sm text-purple-200 mb-1">End Date *</label>
                            <input
                                type="date"
                                name="endDate"
                                min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                                value={formData.endDate}
                                onChange={handleChange}
                                className={`w-full bg-purple-500 border-2 ${errors.endDate ? 'border-red-500' : 'border-purple-800'} rounded-lg p-2 text-white`}
                            />
                            {errors.endDate && <p className="text-red-400 text-xs mt-1">{errors.endDate}</p>}
                        </div>
                    </div>

                    {/* Sessions */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm text-purple-200">Sessions *</label>
                            <button type="button" onClick={addSession} className="text-purple-300 text-sm flex items-center gap-1 hover:text-purple-100">
                                <Plus size={16} /> Add Session
                            </button>
                        </div>
                        {formData.sessions.map((session, index) => (
                            <div key={index} className="mb-3 p-3 bg-purple-600/50 rounded-lg">
                                <div className="flex gap-2 mb-2">
                                    <div className="flex-1">
                                        <label className="block text-xs text-purple-200 mb-1">Date</label>
                                        <input
                                            type="date"
                                            min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                                            value={session.date}
                                            onChange={(e) => handleSessionChange(index, 'date', e.target.value)}
                                            className={`w-full bg-purple-500 border ${errors[`session_${index}_date`] ? 'border-red-500' : 'border-purple-700'} rounded-lg p-2 text-white text-sm`}
                                        />
                                        {errors[`session_${index}_date`] && <p className="text-red-400 text-xs mt-1">{errors[`session_${index}_date`]}</p>}
                                    </div>
                                    <div className="w-28">
                                        <label className="block text-xs text-purple-200 mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            value={session.startTime}
                                            onChange={(e) => handleSessionChange(index, 'startTime', e.target.value)}
                                            className={`w-full bg-purple-500 border ${errors[`session_${index}_startTime`] ? 'border-red-500' : 'border-purple-700'} rounded-lg p-2 text-white text-sm`}
                                        />
                                        {errors[`session_${index}_startTime`] && <p className="text-red-400 text-xs mt-1">{errors[`session_${index}_startTime`]}</p>}
                                    </div>
                                    <div className="w-28">
                                        <label className="block text-xs text-purple-200 mb-1">End Time</label>
                                        <input
                                            type="time"
                                            value={session.endTime}
                                            onChange={(e) => handleSessionChange(index, 'endTime', e.target.value)}
                                            className={`w-full bg-purple-500 border ${errors[`session_${index}_endTime`] ? 'border-red-500' : 'border-purple-700'} rounded-lg p-2 text-white text-sm`}
                                        />
                                        {errors[`session_${index}_endTime`] && <p className="text-red-400 text-xs mt-1">{errors[`session_${index}_endTime`]}</p>}
                                    </div>
                                    {formData.sessions.length > 1 && (
                                        <button type="button" onClick={() => removeSession(index)} className="self-start mt-6 p-2 text-red-400 hover:bg-red-400/10 rounded-lg">
                                            <Trash size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Other fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-purple-200 mb-1">Max Participants *</label>
                            <input
                                type="number"
                                min={1}
                                name="maxParticipants"
                                value={formData.maxParticipants}
                                onChange={handleChange}
                                className={`w-full bg-purple-500 border ${errors.maxParticipants ? 'border-red-500' : 'border-purple-700'} rounded-lg p-2 text-white`}
                            />
                            {errors.maxParticipants && <p className="text-red-400 text-xs mt-1">{errors.maxParticipants}</p>}
                        </div>
                        <div>
                            <label className="block text-sm text-purple-200 mb-1">Registration Deadline *</label>
                            <input
                                type="date"
                                name="deadline"
                                min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                                value={formData.deadline}
                                onChange={handleChange}
                                className={`w-full bg-purple-500 border ${errors.deadline ? 'border-red-500' : 'border-purple-700'} rounded-lg p-2 text-white`}
                            />
                            {errors.deadline && <p className="text-red-400 text-xs mt-1">{errors.deadline}</p>}
                        </div>
                    </div>

                    {/* Poster Image Upload */}
                    <div>
                        <label className="block text-sm text-purple-200 mb-1">Poster Image *</label>
                        <div
                            className={`border-2 border-dashed ${isDragging ? 'border-purple-400 bg-purple-600/30' : errors.posterImage ? 'border-red-500' : 'border-purple-500'} rounded-lg p-4 text-center cursor-pointer hover:bg-purple-600/20 transition-colors`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('posterImageInput')?.click()}
                        >
                            {imagePreview ? (
                                <div className="relative">
                                    <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded" />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setImagePreview('');
                                            setFormData(prev => ({ ...prev, posterImage: '' }));
                                        }}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowCropModal(true);
                                        }}
                                        className="absolute top-2 left-2 bg-purple-600 text-white rounded-lg p-2 hover:bg-purple-700 flex items-center gap-1"
                                    >
                                        <Crop size={16} /> Crop
                                    </button>
                                </div>
                            ) : (
                                <div className="py-4">
                                    <Upload className="mx-auto mb-2 text-purple-300" size={32} />
                                    <p className="text-purple-200 text-sm">Drag & drop or click to upload</p>
                                    <p className="text-purple-300 text-xs mt-1">Max size: 5MB</p>
                                </div>
                            )}
                        </div>
                        <input
                            id="posterImageInput"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file);
                            }}
                        />
                        {errors.posterImage && <p className="text-red-400 text-xs mt-1">{errors.posterImage}</p>}
                    </div>

                    {formData.mode !== WorkshopMode.ONLINE && (
                        <div>
                            <label className="block text-sm text-purple-200 mb-1">Location *</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className={`flex-1 bg-purple-500 border ${errors.location ? 'border-red-500' : 'border-purple-700'} rounded-lg p-2 text-white`}
                                    placeholder="Enter location address"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowLocationMap(!showLocationMap)}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
                                >
                                    <MapPin size={18} />
                                    {showLocationMap ? 'Hide' : 'Map'}
                                </button>
                            </div>
                            {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
                            {showLocationMap && (
                                <div className="mt-3">
                                    <VenueMap
                                        onVenueSelect={(venue) => {
                                            setFormData(prev => ({ ...prev, location: venue.address }));
                                            setErrors(prev => ({ ...prev, location: '' }));
                                        }}
                                        initialCenter={[20.5937, 78.9629]}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {formData.mode === WorkshopMode.ONLINE && (
                        <div>
                            <label className="block text-sm text-purple-200 mb-1">Meeting Link *</label>
                            <input
                                type="url"
                                name="meetingLink"
                                value={formData.meetingLink}
                                onChange={handleChange}
                                className={`w-full bg-purple-500 border ${errors.meetingLink ? 'border-red-500' : 'border-purple-700'} rounded-lg p-2 text-white`}
                                placeholder="https://meet.google.com/..."
                            />
                            {errors.meetingLink && <p className="text-red-400 text-xs mt-1">{errors.meetingLink}</p>}
                        </div>
                    )}

                    <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-purple-500/30">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-purple-200 hover:text-white">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium">
                            {isEditing ? 'Update Workshop' : 'Create Workshop'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Image Crop Modal */}
            < ImageCropModal
                isOpen={showCropModal}
                imageSrc={tempImageSrc}
                onClose={() => setShowCropModal(false)}
                onCropComplete={handleCropComplete}
                aspectRatio={1}
            />
        </div>
    );
};

export default CreateWorkshopModal;