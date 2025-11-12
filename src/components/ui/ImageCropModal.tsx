// import React, { useState, useCallback } from 'react';
// import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
// import Cropper from 'react-easy-crop';
// import { type Point, type Area } from 'react-easy-crop';

// interface ImageCropModalProps {
//     isOpen: boolean;
//     imageSrc: string;
//     onClose: () => void;
//     onCropComplete: (croppedImageBlob: Blob) => Promise<void>;
//     aspectRatio?: number;
// }

// const ImageCropModal: React.FC<ImageCropModalProps> = ({
//     isOpen,
//     imageSrc,
//     onClose,
//     onCropComplete,
//     aspectRatio = 1, // Default to square (1:1)
// }) => {
//     const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
//     const [zoom, setZoom] = useState(1);
//     const [rotation, setRotation] = useState(0);
//     const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
//     const [isProcessing, setIsProcessing] = useState(false);

//     const onCropChange = (location: Point) => {
//         setCrop(location);
//     };

//     const onZoomChange = (zoom: number) => {
//         setZoom(zoom);
//     };

//     const onCropAreaComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
//         setCroppedAreaPixels(croppedAreaPixels);
//     }, []);

//     const createImage = (url: string): Promise<HTMLImageElement> =>
//         new Promise((resolve, reject) => {
//             const image = new Image();
//             image.addEventListener('load', () => resolve(image));
//             image.addEventListener('error', (error) => reject(error));
//             image.setAttribute('crossOrigin', 'anonymous');
//             image.src = url;
//         });

//     const getCroppedImg = async (
//         imageSrc: string,
//         pixelCrop: Area,
//         rotation = 0
//     ): Promise<Blob> => {
//         const image = await createImage(imageSrc);
//         const canvas = document.createElement('canvas');
//         const ctx = canvas.getContext('2d');

//         if (!ctx) {
//             throw new Error('No 2d context');
//         }

//         const maxSize = Math.max(image.width, image.height);
//         const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

//         canvas.width = safeArea;
//         canvas.height = safeArea;

//         ctx.translate(safeArea / 2, safeArea / 2);
//         ctx.rotate((rotation * Math.PI) / 180);
//         ctx.translate(-safeArea / 2, -safeArea / 2);

//         ctx.drawImage(
//             image,
//             safeArea / 2 - image.width * 0.5,
//             safeArea / 2 - image.height * 0.5
//         );

//         const data = ctx.getImageData(0, 0, safeArea, safeArea);

//         canvas.width = pixelCrop.width;
//         canvas.height = pixelCrop.height;

//         ctx.putImageData(
//             data,
//             Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
//             Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
//         );

//         return new Promise((resolve) => {
//             canvas.toBlob((blob) => {
//                 if (blob) {
//                     resolve(blob);
//                 }
//             }, 'image/jpeg', 0.95);
//         });
//     };

//     const handleCropConfirm = async () => {
//         if (!croppedAreaPixels) return;

//         setIsProcessing(true);
//         try {
//             const croppedImageBlob = await getCroppedImg(
//                 imageSrc,
//                 croppedAreaPixels,
//                 rotation
//             );
//             // Call the async onCropComplete (which now handles upload)
//             await onCropComplete(croppedImageBlob);
//         } catch (error) {
//             console.error('Error cropping/uploading image:', error);
//         } finally {
//             setIsProcessing(false);
//         }
//     };

//     const handleRotate = () => {
//         setRotation((prev) => (prev + 90) % 360);
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
//                 {/* Header */}
//                 <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
//                     <h2 className="text-xl font-bold text-white">Crop Profile Picture</h2>
//                     <button
//                         onClick={onClose}
//                         className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
//                     >
//                         <X size={24} />
//                     </button>
//                 </div>

//                 {/* Crop Area */}
//                 <div className="relative h-96 bg-gray-900">
//                     <Cropper
//                         image={imageSrc}
//                         crop={crop}
//                         zoom={zoom}
//                         rotation={rotation}
//                         aspect={aspectRatio}
//                         onCropChange={onCropChange}
//                         onZoomChange={onZoomChange}
//                         onCropComplete={onCropAreaComplete}
//                         cropShape="round"
//                         showGrid={false}
//                     />
//                 </div>

//                 {/* Controls */}
//                 <div className="bg-gray-50 px-6 py-4 space-y-4">
//                     {/* Zoom Control */}
//                     <div>
//                         <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
//                             <ZoomIn size={16} className="mr-2" />
//                             Zoom
//                         </label>
//                         <div className="flex items-center gap-3">
//                             <ZoomOut size={18} className="text-gray-500" />
//                             <input
//                                 type="range"
//                                 min={1}
//                                 max={3}
//                                 step={0.1}
//                                 value={zoom}
//                                 onChange={(e) => setZoom(Number(e.target.value))}
//                                 className="flex-1 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
//                             />
//                             <ZoomIn size={18} className="text-gray-500" />
//                         </div>
//                     </div>

//                     {/* Rotation Control */}
//                     {/* <div>
//                         <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
//                             <RotateCw size={16} className="mr-2" />
//                             Rotation
//                         </label>
//                         <div className="flex items-center gap-3">
//                             <input
//                                 type="range"
//                                 min={0}
//                                 max={360}
//                                 step={1}
//                                 value={rotation}
//                                 onChange={(e) => setRotation(Number(e.target.value))}
//                                 className="flex-1 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
//                             />
//                             <button
//                                 onClick={handleRotate}
//                                 className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
//                             >
//                                 90°
//                             </button>
//                             <span className="text-sm text-gray-600 w-12 text-right">{rotation}°</span>
//                         </div>
//                     </div> */}
//                 </div>

//                 {/* Footer */}
//                 <div className="bg-white px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
//                     <button
//                         onClick={onClose}
//                         className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         onClick={handleCropConfirm}
//                         disabled={isProcessing}
//                         className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         {isProcessing ? 'Uploading...' : 'Crop & Upload'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ImageCropModal;