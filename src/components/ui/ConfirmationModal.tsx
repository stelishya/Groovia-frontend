import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

const ConfirmationModal = ({
    show,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'warning',
    isLoading = false,
}: ConfirmationModalProps) => {
    if (!show) return null;

    const variantStyles = {
        danger: {
            icon: 'text-red-500',
            button: 'bg-red-600 hover:bg-red-700',
            border: 'border-red-500/30',
        },
        warning: {
            icon: 'text-yellow-500',
            button: 'bg-yellow-600 hover:bg-yellow-700',
            border: 'border-yellow-500/30',
        },
        info: {
            icon: 'text-blue-500',
            button: 'bg-blue-600 hover:bg-blue-700',
            border: 'border-blue-500/30',
        },
    };

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                className={`bg-gray-800 rounded-2xl p-6 max-w-md w-full border ${styles.border} shadow-2xl`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                        <AlertTriangle className={`${styles.icon} mr-3`} size={28} />
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Message */}
                <p className="text-gray-300 mb-6 ml-11">{message}</p>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-6 py-2 ${styles.button} text-white rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;