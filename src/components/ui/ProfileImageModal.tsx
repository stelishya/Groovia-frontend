import React, { useState, useCallback } from 'react';
import { X, Edit2, Upload, ZoomOut } from 'lucide-react';
import Cropper, { type Point, type Area } from 'react-easy-crop';
import { getCroppedImg } from '../../utils/CropImage';

interface ProfileImageModalProps {
    isOpen: boolean;
    imageUrl?: string; // For preview mode
    onClose: () => void;
    onUploadComplete: (croppedBlob: Blob) => Promise<void>;
    userName?: string;
    aspectRatio?: number;
}

type ModalMode = 'preview' | 'edit';

const ProfileImageModal: React.FC<ProfileImageModalProps> = ({
    isOpen,
    imageUrl,
    onClose,
    onUploadComplete,
    userName = 'User',
    aspectRatio = 1,
}) => {
    const [mode, setMode] = useState<ModalMode>('preview');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Reset state when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setMode(imageUrl ? 'preview' : 'edit');
            setSelectedImage(null);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setRotation(0);
            setCroppedAreaPixels(null);
        }
    }, [isOpen, imageUrl]);

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setMode('edit');
                // Reset crop settings
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                setRotation(0);
            };
            reader.readAsDataURL(file);
        }
        // Reset input
        event.target.value = '';
    };

    const handleCropAndUpload = async () => {
        if (!selectedImage || !croppedAreaPixels) return;

        setIsProcessing(true);
        try {
            const croppedImageBlob = await getCroppedImg(
                selectedImage,
                croppedAreaPixels,
                rotation
            );

            // Call the async onUploadComplete (which handles upload)
            await onUploadComplete(croppedImageBlob);

            // Close modal after successful upload
            handleClose();
        } catch (error) {
            console.error('Error cropping/uploading image:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        setMode('preview');
        setSelectedImage(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setCroppedAreaPixels(null);
        onClose();
    };

    const handleEditClick = () => {
        document.getElementById('profile-image-file-input')?.click();
    };

    if (!isOpen) return null;

    // Preview Mode
    if (mode === 'preview' && imageUrl) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors p-2 bg-black/50 rounded-full z-10"
                >
                    <X size={28} />
                </button>

                {/* Action buttons */}
                <div className="absolute top-4 left-4 flex gap-2 z-10">
                    <button
                        onClick={handleEditClick}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-lg"
                    >
                        <Edit2 size={18} />
                        <span className="hidden sm:inline">Change Photo</span>
                    </button>
                </div>

                {/* Hidden file input */}
                <input
                    id="profile-image-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {/* Image container */}
                <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
                    <img
                        src={imageUrl}
                        alt="Profile Preview"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>

                {/* User info */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full z-10">
                    <p className="text-white font-medium">{userName}'s Profile Picture</p>
                </div>

                {/* Click outside to close */}
                <div className="absolute inset-0 -z-10" onClick={handleClose} />
            </div>
        );
    }

    // Edit Mode (Cropping)
    const imageToCrop = selectedImage || imageUrl;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
            <div className="bg-gradient-to-br from-purple-900 to-gray-900 rounded-lg shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col border border-purple-500/30">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
                    <h2 className="text-xl font-semibold text-white">
                        {imageUrl ? 'Edit Profile Picture' : 'Add Profile Picture'}
                    </h2>
                    <div className="flex items-center gap-2">
                        {imageToCrop && (
                            <button
                                onClick={handleEditClick}
                                className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm shadow-lg"
                                disabled={isProcessing}
                            >
                                <Upload size={16} />
                                <span className="hidden sm:inline">Choose Different Image</span>
                            </button>
                        )}
                        <button
                            onClick={handleClose}
                            className="text-purple-200 hover:text-white transition-colors p-1"
                            disabled={isProcessing}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Cropper Area */}
                <div className="relative bg-black h-[400px] sm:h-[500px]">
                    {imageToCrop ? (
                        <Cropper
                            image={imageToCrop}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={aspectRatio}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onRotationChange={setRotation}
                            onCropComplete={onCropComplete}
                            cropShape="round"
                            showGrid={false}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <Upload size={48} className="mx-auto text-gray-500 mb-4" />
                                <p className="text-gray-400 mb-4">No image selected</p>
                                <button
                                    onClick={handleEditClick}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                >
                                    Select Image
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Hidden file input */}
                <input
                    id="profile-image-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {/* Controls */}
                {imageToCrop && (
                    <div className="p-4 bg-gradient-to-br from-purple-900/50 to-gray-900/50 space-y-4 border-t border-purple-500/30">
                        {/* Zoom Control */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm text-purple-200">
                                <span className="flex items-center gap-2">
                                    <ZoomOut size={16} />
                                    Zoom
                                </span>
                                <span className="font-semibold text-purple-300">{Math.round(zoom * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-2 bg-purple-900 rounded-lg appearance-none cursor-pointer slider-purple"
                                disabled={isProcessing}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleClose}
                                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium shadow-lg"
                                disabled={isProcessing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCropAndUpload}
                                disabled={isProcessing}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {isProcessing ? 'Uploading...' : 'Crop & Upload'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileImageModal;

// import React from 'react';
// import { X, Edit2, Download } from 'lucide-react';

// interface ImagePreviewModalProps {
//     isOpen: boolean;
//     imageUrl: string;
//     onClose: () => void;
//     onEdit: () => void;
//     userName?: string;
// }

// const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
//     isOpen,
//     imageUrl,
//     onClose,
//     onEdit,
//     userName = 'User',
// }) => {
//     if (!isOpen) return null;

//     const handleDownload = () => {
//         const link = document.createElement('a');
//         link.href = imageUrl;
//         link.download = `${userName}-profile.jpg`;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
//             {/* Close button */}
//             <button
//                 onClick={onClose}
//                 className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors p-2 bg-black/50 rounded-full"
//             >
//                 <X size={28} />
//             </button>

//             {/* Action buttons */}
//             <div className="absolute top-4 left-4 flex gap-2">
//                 <button
//                     onClick={onEdit}
//                     className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-lg"
//                 >
//                     <Edit2 size={18} />
//                     <span className="hidden sm:inline">Change Photo</span>
//                 </button>
//                 <button
//                     onClick={handleDownload}
//                     className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors shadow-lg"
//                 >
//                     <Download size={18} />
//                     <span className="hidden sm:inline">Download</span>
//                 </button>
//             </div>

//             {/* Image container */}
//             <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
//                 <img
//                     src={imageUrl}
//                     alt="Profile Preview"
//                     className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
//                     onClick={(e) => e.stopPropagation()}
//                 />
//             </div>

//             {/* User info */}
//             <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full">
//                 <p className="text-white font-medium">{userName}'s Profile Picture</p>
//             </div>

//             {/* Click outside to close */}
//             <div
//                 className="absolute inset-0 -z-10"
//                 onClick={onClose}
//             />
//         </div>
//     );
// };

// export default ImagePreviewModal;