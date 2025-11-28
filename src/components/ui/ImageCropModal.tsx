import { useState, useCallback } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { X, RotateCw, ZoomIn } from 'lucide-react';
import { getCroppedImg } from '../../utils/CropImage';

interface ImageCropModalProps {
    isOpen: boolean;
    imageSrc: string;
    onClose: () => void;
    onCropComplete: (croppedImageBlob: Blob) => void;
    aspectRatio?: number;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
    isOpen,
    imageSrc,
    onClose,
    onCropComplete,
    aspectRatio = 1, // Default to square (1:1)
}) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropChange = (location: { x: number; y: number }) => {
        setCrop(location);
    };

    const onCropAreaChange = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropConfirm = async () => {
        if (!croppedAreaPixels) return;

        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
            onCropComplete(croppedBlob);
            onClose();
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-purple-500/30 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-purple-500/30">
                    <h2 className="text-xl font-bold text-white">Crop Image</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative h-96 bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspectRatio}
                        onCropChange={onCropChange}
                        onCropComplete={onCropAreaChange}
                        onZoomChange={setZoom}
                        cropShape="rect"
                        showGrid={true}
                        style={{
                            containerStyle: {
                                backgroundColor: '#000',
                            },
                            cropAreaStyle: {
                                border: '2px solid #a855f7',
                            },
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="p-4 space-y-4 bg-purple-900/30">
                    {/* Zoom Control */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-purple-200 flex items-center gap-2">
                                <ZoomIn size={16} />
                                Zoom
                            </label>
                            <span className="text-xs text-purple-300">{Math.round(zoom * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="w-full h-2 bg-purple-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                    </div>

                    {/* Rotation Control */}
                    {/* <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-purple-200 flex items-center gap-2">
                                <RotateCw size={16} />
                                Rotation
                            </label>
                            <span className="text-xs text-purple-300">{rotation}°</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={360}
                            step={1}
                            value={rotation}
                            onChange={(e) => setRotation(parseInt(e.target.value))}
                            className="w-full h-2 bg-purple-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                    </div> */}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-purple-200 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCropConfirm}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Apply Crop
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #a855f7;
                    cursor: pointer;
                }
                .slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #a855f7;
                    cursor: pointer;
                    border: none;
                }
            `}</style>
        </div>
    );
};

export default ImageCropModal;
