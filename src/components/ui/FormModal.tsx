import React, { type ReactNode } from 'react';

interface FormModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon?: ReactNode;
    children: ReactNode;
    onSubmit: () => void;
    submitText?: string;
    cancelText?: string;
    submitButtonClass?: string;
    isLoading?: boolean;
}

const FormModal: React.FC<FormModalProps> = ({
    isOpen,
    onClose,
    title,
    icon,
    children,
    onSubmit,
    submitText = 'Submit',
    cancelText = 'Cancel',
    submitButtonClass = 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-purple-900 rounded-2xl p-6 max-w-2xl w-full border border-purple-500 my-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        {icon && <span className="mr-3">{icon}</span>}
                        <h3 className="text-2xl font-bold text-white">{title}</h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-white hover:text-gray-300 text-2xl transition-colors"
                        disabled={isLoading}
                    >
                        ×
                    </button>
                </div>

                {/* Form Content */}
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {children}
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onSubmit}
                        className={`flex-1 px-4 py-3 text-white rounded-lg font-bold transition-all ${submitButtonClass} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : submitText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormModal;