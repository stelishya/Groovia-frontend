import { useState, useEffect } from 'react';
import { X, Upload, MapPin, Crop } from 'lucide-react';
import { type CreateCompetitionData, CompetitionMode } from '../../types/competition.type';
import VenueMap from '../ui/VenueMap';
import ImageCropModal from '../ui/ImageCropModal';
import toast from 'react-hot-toast';

interface CreateCompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCompetitionData) => void;
  initialData?: CreateCompetitionData;
  isEditing?: boolean;
}

// const DANCE_STYLES = [
//   'Hip-Hop',
//   'Classical',
//   'Contemporary',
//   'Ballet',
//   'Jazz',
//   'Breakdance',
//   'Folk',
//   'Salsa',
//   'Ballroom',
//   'Other'
// ];

const CreateCompetitionModal: React.FC<CreateCompetitionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  // onCropComplete,
  // showCropModal,
  // tempImageSrc,
  // onShowCropModal,
  // onSetTempImageSrc
}) => {

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: string;
    style: string;
    customStyle: string;
    level: string;
    age_category: string;
    mode: string;
    duration: string;
    location: string;
    meeting_link: string;
    date: string;
    registrationDeadline: string;
    maxParticipants: string;
    fee: string;
    posterImage: string;
    document: string | File | null;
  }>({
    title: '',
    description: '',
    category: '',
    style: '',
    customStyle: '',
    level: '',
    age_category: '',
    mode: '',
    duration: '',
    location: '',
    meeting_link: '',
    date: '',
    registrationDeadline: '',
    maxParticipants: '',
    fee: '',
    posterImage: '',
    document: '',
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
    if (isEditing && initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || '',
        style: initialData.style || '',
        customStyle: '',
        level: initialData.level || '',
        age_category: initialData.age_category || '',
        mode: initialData.mode || '',
        duration: initialData.duration || '',
        location: initialData.location || '',
        meeting_link: initialData.meeting_link || '',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
        registrationDeadline: initialData.registrationDeadline ? new Date(initialData.registrationDeadline).toISOString().split('T')[0] : '',
        maxParticipants: initialData.maxParticipants?.toString() || '',
        fee: initialData.fee?.toString() || '',
        posterImage: initialData.posterImage || '',
        document: initialData.document || '',
      });

      // Set image preview if posterImage exists
      if (initialData.posterImage) {
        setImagePreview(initialData.posterImage);
      }

      // Check if using custom style
      const standardStyles = ['hip-hop', 'bharatanatyam', 'freestyle', 'ballet', 'contemporary', 'jazz'];
      if (initialData.style && !standardStyles.includes(initialData.style.toLowerCase())) {
        setShowCustomStyle(true);
        setCustomStyle(initialData.style);
      }
    } else {
      // Reset form when creating new competition
      setFormData({
        title: '',
        description: '',
        category: '',
        style: '',
        customStyle: '',
        level: '',
        age_category: '',
        mode: '',
        duration: '',
        location: '',
        meeting_link: '',
        date: '',
        registrationDeadline: '',
        maxParticipants: '',
        fee: '',
        posterImage: '',
        document: '',
      });
      setImagePreview('');
      setShowCustomStyle(false);
      setCustomStyle('');
    }
  }, [isEditing, initialData]);

  const handleImageUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, posterImage: 'Image size should be less than 5MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setTempImageSrc(result);
      setImagePreview(result);
      setFormData(prev => ({ ...prev, posterImage: result }));
      setErrors(prev => ({ ...prev, posterImage: '' }));
    };
    reader.readAsDataURL(file);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Handle special cases
    if (name === 'style') {
      if (value === 'other') {
        setShowCustomStyle(true);
        setFormData(prev => ({ ...prev, style: '' }));
      } else {
        setShowCustomStyle(false);
        setFormData(prev => ({ ...prev, style: value }));
      }
    }

    if (name === 'customStyle') {
      setFormData(prev => ({ ...prev, style: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (name === 'posterImage') {
        const file = files[0];
        if (file.size > 5 * 1024 * 1024) {
          setErrors(prev => ({ ...prev, posterImage: 'Image size should be less than 5MB' }));
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          // const result = reader.result as string;
          // onSetTempImageSrc(result);
          // onShowCropModal(true);
        };
        reader.readAsDataURL(file);
      } else {
        setFormData(prev => ({ ...prev, [name]: files[0] }));
      }
    }
  };

  const handleCropComplete = (croppedImageBlob: Blob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string
      setImagePreview(result);
      setFormData(prev => ({ ...prev, posterImage: result }));
      setErrors(prev => ({ ...prev, posterImage: '' }));
      setShowCropModal(false);
      // Convert blob to file
      // const croppedFile = new File([croppedImageBlob], 'poster-image.jpg', { type: 'image/jpeg' });
      // This would be set in the modal's form state
      // onShowCropModal(false);
    };
    reader.readAsDataURL(croppedImageBlob);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.style && !showCustomStyle) newErrors.style = 'Dance style is required';
    if (!formData.level) newErrors.level = 'Level is required';
    if (!formData.age_category) newErrors.age_category = 'Age category is required';
    if (!formData.mode) newErrors.mode = 'Mode is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';

    if (formData.mode === 'offline' && !formData.location.trim()) {
      newErrors.location = 'Location is required for offline competitions';
    }

    if (formData.mode === 'online' && !formData.meeting_link.trim()) {
      newErrors.meeting_link = 'Meeting link is required for online competitions';
    }

    if (!formData.date) newErrors.date = 'Competition date is required';
    if (!formData.registrationDeadline) newErrors.registrationDeadline = 'Registration deadline is required';
    if (!formData.maxParticipants) newErrors.maxParticipants = 'Max participants is required';
    if (!formData.fee) newErrors.fee = 'Entry fee is required';
    if (!formData.posterImage) newErrors.posterImage = 'Poster image is required';

    // Date validation
    if (formData.date && formData.registrationDeadline) {
      const competitionDate = new Date(formData.date);
      const deadlineDate = new Date(formData.registrationDeadline);
      const today = new Date();

      if (deadlineDate >= competitionDate) {
        newErrors.registrationDeadline = 'Registration deadline must be before competition date';
      }

      if (competitionDate <= today) {
        newErrors.date = 'Competition date must be in the future';
      }

      if (deadlineDate <= today) {
        newErrors.registrationDeadline = 'Registration deadline must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data in create competition modal:', formData);
    if (!validateForm()) {
      toast.error('Please enter valid data');
      return
    }
    console.log('Form data:', formData);

    // Convert base64 image to Blob for file upload
    const base64ToBlob = (base64: string): Blob | null => {
      if (!base64 || !base64.includes(',')) return null;
      const parts = base64.split(',');
      const contentType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
      const byteString = atob(parts[1]);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }
      return new Blob([arrayBuffer], { type: contentType });
    };

    // Create FormData for file upload
    const formDataToSend = new FormData();

    // Add the poster image as a file (only if it's a new base64 image)
    if (formData.posterImage) {
      if (formData.posterImage.startsWith('data:')) {
        // New image upload - convert base64 to blob
        const imageBlob = base64ToBlob(formData.posterImage);
        if (imageBlob) {
          formDataToSend.append('posterImage', imageBlob, 'competition-poster.png');
        }
      } else if (isEditing) {
        // Editing with existing image URL - send the URL as is
        formDataToSend.append('posterImage', formData.posterImage);
      }
    }

    // Add other fields
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('style', showCustomStyle ? customStyle : formData.style);
    formDataToSend.append('mode', formData.mode);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('level', formData.level);
    formDataToSend.append('age_category', formData.age_category);
    formDataToSend.append('duration', formData.duration);
    formDataToSend.append('date', formData.date);
    formDataToSend.append('registrationDeadline', formData.registrationDeadline);
    formDataToSend.append('maxParticipants', formData.maxParticipants);
    formDataToSend.append('fee', formData.fee);

    if (formData.mode === CompetitionMode.ONLINE && formData.meeting_link) {
      formDataToSend.append('meeting_link', formData.meeting_link);
    }
    if (formData.mode === CompetitionMode.OFFLINE && formData.location) {
      formDataToSend.append('location', formData.location);
    }

    if (formData.document) {
      formDataToSend.append('document', formData.document);
    }

    console.log('FormData entries:');
    for (let pair of formDataToSend.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof Blob ? 'Blob/File' : pair[1]));
    }

    onSubmit(formDataToSend as any);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-purple-900/80 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-purple-500/30">
        <div className="p-6 border-b border-purple-500/30">
          <div className="flex justify-between items-center">
            {isEditing ? (
              <h2 className="text-2xl font-bold text-white">Edit Competition</h2>
            ) : (
              <h2 className="text-2xl font-bold text-white">Create New Competition</h2>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block px-3 text-sm font-medium text-purple-200 mb-2">
                  Competition Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full bg-purple-600 border rounded-lg px-3 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 ${errors.title ? 'border-red-500' : 'border-purple-500/30'
                    }`}
                  placeholder="Enter competition title"
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block px-3 text-sm font-medium text-purple-200 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full bg-purple-600 border rounded-lg px-2 py-3 text-purple-200 focus:outline-none focus:border-purple-400 ${errors.category ? 'border-red-500' : 'border-purple-500/30'
                    }`}
                >
                  <option value="">Select Category</option>
                  <option value="solo">Solo</option>
                  <option value="group">Group</option>
                  <option value="duet">Duet</option>
                </select>
                {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
              </div>
            </div>

            <div>
              <label className="block px-3 text-sm font-medium text-purple-200 mb-2">
                Description *
              </label>
              <textarea
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`w-full bg-purple-600 border rounded-lg px-3 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 ${errors.description ? 'border-red-500' : 'border-purple-500/30'
                  }`}
                placeholder="Describe your competition"
              />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Style and Level */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block px-3 text-sm font-medium text-purple-200 mb-2">
                  Dance Style *
                </label>
                <select
                  name="style"
                  value={showCustomStyle ? 'other' : formData.style}
                  onChange={handleInputChange}
                  className={`w-full bg-purple-600 border rounded-lg px-2 py-3 text-purple-200 focus:outline-none focus:border-purple-400 ${errors.style ? 'border-red-500' : 'border-purple-500/30'
                    }`}
                >
                  <option value="">Select Style</option>
                  <option value="hip-hop">Hip Hop</option>
                  <option value="bharatanatyam">Bharatanatyam</option>
                  <option value="freestyle">Freestyle</option>
                  <option value="ballet">Ballet</option>
                  <option value="contemporary">Contemporary</option>
                  <option value="jazz">Jazz</option>
                  <option value="other">Other</option>
                </select>
                {showCustomStyle && (
                  <input
                    type="text"
                    name="customStyle"
                    value={formData.customStyle}
                    onChange={handleInputChange}
                    className="w-full bg-purple-600 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 mt-2"
                    placeholder="Enter custom dance style"
                  />
                )}
                {errors.style && <p className="text-red-400 text-xs mt-1">{errors.style}</p>}
              </div>
              <div>
                <label className="block px-3 text-sm font-medium text-purple-200 mb-2">
                  Level *
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className={`w-full bg-purple-600 border rounded-lg px-2 py-3 text-purple-200 focus:outline-none focus:border-purple-400 ${errors.level ? 'border-red-500' : 'border-purple-500/30'
                    }`}
                >
                  <option value="">Select Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                {errors.level && <p className="text-red-400 text-xs mt-1">{errors.level}</p>}
              </div>
              <div>
                <label className="block px-3 text-sm font-medium text-purple-200 mb-2">
                  Age Category *
                </label>
                <select
                  name="age_category"
                  value={formData.age_category}
                  onChange={handleInputChange}
                  className={`w-full bg-purple-600 border rounded-lg px-2 py-3 text-purple-200 focus:outline-none focus:border-purple-400 ${errors.age_category ? 'border-red-500' : 'border-purple-500/30'
                    }`}
                >
                  <option value="">Select Age Group</option>
                  <option value="5-10">5-10 years</option>
                  <option value="11-15">11-15 years</option>
                  <option value="16-20">16-20 years</option>
                  <option value="21-25">21-25 years</option>
                  <option value="26+">26+ years</option>
                </select>
                {errors.age_category && <p className="text-red-400 text-xs mt-1">{errors.age_category}</p>}
              </div>
            </div>

            {/* Mode and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block px-3 text-sm font-medium text-purple-200 mb-2">
                  Mode *
                </label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleInputChange}
                  className={`w-full bg-purple-600 border rounded-lg px-2 py-3 text-purple-200 focus:outline-none focus:border-purple-400 ${errors.mode ? 'border-red-500' : 'border-purple-500/30'
                    }`}
                >
                  <option value="">Select Mode</option>
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                </select>
                {errors.mode && <p className="text-red-400 text-xs mt-1">{errors.mode}</p>}
              </div>
              <div>
                <label className="block px-3 text-sm font-medium text-purple-200 mb-2">
                  Duration *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className={`w-full bg-purple-600 border rounded-lg px-3 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 ${errors.duration ? 'border-red-500' : 'border-purple-500/30'
                    }`}
                  placeholder="e.g.,5 minutes"
                />
                {errors.duration && <p className="text-red-400 text-xs mt-1">{errors.duration}</p>}
              </div>
            </div>

            {/* Location/Meeting Link */}
            {formData.mode === 'offline' && (
              <div>
                <label className="block px-3 text-sm font-medium text-purple-200 mb-2">
                  Location *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full bg-purple-600 border rounded-lg px-3 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 ${errors.location ? 'border-red-500' : 'border-purple-500/30'
                      }`}
                    placeholder="Enter venue address"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLocationMap(!showLocationMap)}
                    className="mt-2 px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors text-sm"
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

            {formData.mode === 'online' && (
              <div>
                <label className="block px-3 text-sm font-medium text-purple-200 mb-2">
                  Meeting Link *
                </label>
                <input
                  type="url"
                  name="meeting_link"
                  value={formData.meeting_link}
                  onChange={handleInputChange}
                  className={`w-full bg-purple-600 border rounded-lg px-3 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 ${errors.meeting_link ? 'border-red-500' : 'border-purple-500/30'
                    }`}
                  placeholder="https://meet.google.com/..."
                />
                {errors.meeting_link && <p className="text-red-400 text-xs mt-1">{errors.meeting_link}</p>}
              </div>
            )}

            {/* Dates and Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block px-3 text-sm font-medium text-purple-200 mb-2">
                  Competition Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                  className={`w-full bg-purple-600 border rounded-lg px-3 py-3 text-white focus:outline-none focus:border-purple-400 ${errors.date ? 'border-red-500' : 'border-purple-500/30'
                    }`}
                />
                {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className="block px-3 text-sm font-medium text-purple-200 mb-2">
                  Registration Deadline *
                </label>
                <input
                  type="date"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleInputChange}
                  min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                  className={`w-full bg-purple-500 border rounded-lg px-3 py-3 text-white focus:outline-none focus:border-purple-400 ${errors.registrationDeadline ? 'border-red-500' : 'border-purple-500/30'
                    }`}
                />
                {errors.registrationDeadline && <p className="text-red-400 text-xs mt-1">{errors.registrationDeadline}</p>}
              </div>
              <div>
                <label className="block px-3 text-sm font-medium text-purple-200 mb-2">
                  Max Participants *
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full bg-purple-500 border rounded-lg px-3 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 ${errors.maxParticipants ? 'border-red-500' : 'border-purple-500/30'
                    }`}
                  placeholder="100"
                />
                {errors.maxParticipants && <p className="text-red-400 text-xs mt-1">{errors.maxParticipants}</p>}
              </div>
            </div>

            {/* Fee and Poster */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block px-3 text-sm font-medium text-purple-200 mb-2">
                  Entry Fee (₹) *
                </label>
                <input
                  type="number"
                  name="fee"
                  value={formData.fee}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full bg-purple-500 border rounded-lg px-3 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 ${errors.fee ? 'border-red-500' : 'border-purple-500/30'
                    }`}
                  placeholder="500"
                />
                {errors.fee && <p className="text-red-400 text-xs mt-1">{errors.fee}</p>}
                <p className="text-purple-300 text-xs mt-1">Note: A 20% platform fee will be deducted from each registration fee.</p>
              </div>
              <div>
                <label className="block px-3 text-sm font-medium text-purple-200 mb-2">
                  Poster Image *
                </label>
                <div
                  className={`border-2 border-dashed ${isDragging ? 'border-purple-400 bg-purple-600/30' : errors.posterImage ? 'border-red-500' : 'border-purple-500'} rounded-lg p-4 text-center cursor-pointer hover:bg-purple-600/20 transition-colors`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('posterImageInput')?.click()}>
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
                        className="absolute top-0 right-0 bg-gray-500 text-white rounded-full p-1 hover:bg-red-600"
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
                  name="posterImage"
                  accept="image/*"
                  // onChange={handleFileChange}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                // className="w-full bg-purple-500 border rounded-lg px-4 py-3 text-white file:bg-purple-600 file:text-white file:border-none file:rounded file:px-3 file:py-1 file:mr-3"
                />
                {/* {imagePreview && (
                        <div className="mt-3 relative">
                          <img
                            src={imagePreview}
                            alt="Poster preview"
                            className="w-full max-w-xs h-32 object-cover rounded-lg border-2 border-purple-400"
                          />
                          <button
                            type="button"
                            onClick={() => onShowCropModal(true)}
                            className="absolute top-2 left-2 bg-purple-600 text-white rounded-lg p-2 hover:bg-purple-700 flex items-center gap-1 text-sm"
                          >
                            <Plus className="h-4 w-4" />
                            Crop
                          </button>
                        </div>
                      )} */}
                {errors.posterImage && <p className="text-red-400 text-xs mt-1">{errors.posterImage}</p>}
              </div>
            </div>

            {/* Rules/Document */}
            <div>
              <label className="block px-3 text-sm font-medium text-purple-200 mb-2">
                Rules & Regulations (PDF)
              </label>

              {typeof formData.document === 'string' && formData.document ? (
                <div className="flex items-center gap-3 p-3 bg-purple-600/30 border border-purple-500/30 rounded-lg mb-2">
                  <div className="bg-red-500/20 p-2 rounded text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-white text-sm truncate">Existing Document</p>
                    <a
                      href={formData.document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-300 hover:text-purple-200 underline"
                    >
                    <p className="text-purple-200 text-xs truncate opacity-70">
                      {decodeURIComponent(formData.document.split('/').pop()?.split('?')[0].split('-')[2] || 'Document.pdf')}
                    </p>
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, document: null }))}
                    className="p-1 hover:bg-purple-600 rounded text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  name="document"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full bg-purple-500 border border-purple-500/30 rounded-lg px-3 py-3 text-white file:bg-purple-600 file:text-white file:border-none file:rounded file:px-3 file:py-1 file:mr-3"
                />
              )}
              {typeof formData.document !== 'string' && (
                <p className="text-purple-300 text-xs mt-1">Upload PDF containing competition rules (max 5MB)</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-purple-500/30">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-purple-300 hover:text-white border border-purple-500/30 rounded-lg hover:bg-purple-800/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all"
              >
                {isEditing ? 'Update Competition' : 'Create Competition'}
              </button>
            </div>
          </form>
        </div>
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
}

export default CreateCompetitionModal;