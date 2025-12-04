import React from 'react';
import { X, Calendar, MapPin, Video, Users, DollarSign, IndianRupee } from 'lucide-react';
import { WorkshopMode, type Workshop } from '../../types/workshop.type';

interface WorkshopDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    workshop: Workshop | null;
}

const WorkshopDetailsModal: React.FC<WorkshopDetailsModalProps> = ({ isOpen, onClose, workshop }) => {
    if (!isOpen || !workshop) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-900 border border-purple-500/30 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={24} />
                </button>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3">
                        <img
                            src={workshop.posterImage}
                            alt={workshop.title}
                            className="w-full h-auto rounded-lg object-cover aspect-[3/4]"
                        />
                    </div>

                    <div className="w-full md:w-2/3 space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">{workshop.title}</h2>
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-200 text-xs rounded-full">
                                {workshop.style}
                            </span>
                        </div>

                        <p className="text-gray-300 text-sm">{workshop.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-300">
                                <IndianRupee size={16} className="text-purple-400" />
                                <span>{workshop.fee}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <Users size={16} className="text-purple-400" />
                                <span>{workshop.participants?.length || 0} / {workshop.maxParticipants}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <Calendar size={16} className="text-purple-400" />
                                <span>{new Date(workshop.startDate).toLocaleDateString('en-IN')} - {new Date(workshop.endDate).toLocaleDateString('en-IN')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                {workshop.mode === WorkshopMode.ONLINE ? <Video size={16} className="text-purple-400" /> : <MapPin size={16} className="text-purple-400" />}
                                <span>{workshop.mode === WorkshopMode.ONLINE ? 'Online' : workshop.location}</span>
                            </div>
                        </div>

                        {workshop.mode !== WorkshopMode.OFFLINE && workshop.meetingLink && (
                            <div className="bg-gray-800 p-3 rounded-lg">
                                <p className="text-xs text-gray-400 mb-1">Meeting Link</p>
                                <a href={workshop.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm hover:underline break-all">
                                    {workshop.meetingLink}
                                </a>
                            </div>
                        )}

                        <div>
                            <h3 className="text-white font-medium mb-2">Sessions</h3>
                            <div className="space-y-2">
                                {workshop.sessions.map((session, index) => (
                                    <div key={index} className="flex justify-between items-center bg-gray-800 p-2 rounded text-sm">
                                        <span className="text-gray-300">{new Date(session.date).toLocaleDateString()}</span>
                                        <span className="text-white">{session.startTime} - {session.endTime}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkshopDetailsModal;
