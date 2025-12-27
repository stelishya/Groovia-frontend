import React from 'react';
import { MessageSquare, Video, Edit, Trash2 } from 'lucide-react';
import { WorkshopMode } from '../../types/workshop.type';

interface InstructorWorkshopCardProps {
    title: string;
    status: 'Upcoming' | 'Active' | 'Completed';
    fee: number;
    date: string;
    time: string;
    mode: WorkshopMode;
    attendeesCount: number;
    maxAttendees: number;
    onViewDetails: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const InstructorWorkshopCard: React.FC<InstructorWorkshopCardProps> = ({
    title,
    status,
    fee,
    date,
    time,
    mode,
    attendeesCount,
    maxAttendees,
    onViewDetails,
    onEdit,
    onDelete,
}) => {
    // Status badge styling
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Upcoming':
                return 'text-purple-200 bg-purple-500/20';
            case 'Active':
                return 'text-green-300 bg-green-500/20';
            case 'Completed':
                return 'text-gray-400 bg-gray-500/20';
            default:
                return 'text-gray-300 bg-gray-500/20';
        }
    };

    return (
        <div className="bg-purple-700/50 backdrop-blur-md rounded-xl p-5 border border-purple-500 shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white leading-tight max-w-[70%]">
                    {title}
                </h3>
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(status)}`}>
                        {status}
                    </span>
                    <div className="flex gap-2 text-gray-300">
                        <MessageSquare size={16} className="cursor-pointer hover:text-white" />
                        {mode === WorkshopMode.ONLINE && <Video size={16} className="cursor-pointer hover:text-white" />}
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-6">
                <div className="text-sm text-gray-200">
                    <p>{new Date(date).toLocaleDateString('en-IN')} • {time}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Mode : <span className="text-white font-medium">{mode}</span></span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Fee : ₹<span className="text-white font-medium">{fee}</span></span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Attendees {attendeesCount} / {maxAttendees}</span>
                    {/* Progress bar could go here */}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={onViewDetails}
                    className="flex-1 bg-[#4c1d95]/80 hover:bg-[#5b21b6] text-white py-2 rounded-lg font-medium transition-colors duration-200 border border-purple-500/30 text-sm"
                >
                    View Details
                </button>
                <button
                    onClick={onEdit}
                    className="p-2 bg-blue-600/80 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 border border-blue-500/30"
                    title="Edit Workshop"
                >
                    <Edit size={18} />
                </button>
                <button
                    onClick={onDelete}
                    className="p-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 border border-red-500/30"
                    title="Delete Workshop"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default InstructorWorkshopCard;
