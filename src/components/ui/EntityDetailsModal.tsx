import React from 'react';
import { X, Calendar, MapPin, Video, Users, DollarSign, IndianRupee, Clock } from 'lucide-react';
import { WorkshopMode, type Workshop } from '../../types/workshop.type';
import type { Competition } from '../../services/competition.service';

// Union type for all supported entities
type EntityData = Workshop | Competition;

interface GenericDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: EntityData | null;
    entityType: 'workshop' | 'competition';
}

const GenericDetailsModal: React.FC<GenericDetailsModalProps> = ({ isOpen, onClose, data, entityType }) => {
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-900 border border-purple-500/30 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={24} />
                </button>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3">
                        <img
                            src={data.posterImage}
                            alt={data.title}
                            className="w-full h-auto rounded-lg object-cover aspect-[3/4]"
                        />
                    </div>

                    <div className="w-full md:w-2/3 space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">{data.title}</h2>
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-200 text-xs rounded-full">
                                {data.style}
                            </span>
                        </div>

                        <p className="text-gray-300 text-sm">{data.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-300">
                                <IndianRupee size={16} className="text-purple-400" />
                                <span>{data.fee}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <Users size={16} className="text-purple-400" />
                                {entityType === 'workshop' ? (
                                    <span>{(data as Workshop).participants?.length || 0} / {data.maxParticipants}</span>
                                ) : (
                                    <>
                                        <span>{(data as Competition).registeredDancers?.length || 0} / {data.maxParticipants}</span>
                                        <div className="bg-gray-800 p-3 rounded-lg">
                                            <p className="text-xs text-gray-400 mb-1">Age Category</p>
                                            <p className="text-white text-sm">{(data as Competition).age_category}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <Calendar size={16} className="text-purple-400" />
                                {entityType === 'workshop' ? (
                                    <span>{new Date((data as Workshop).startDate).toLocaleDateString('en-IN')} - {new Date((data as Workshop).endDate).toLocaleDateString('en-IN')}</span>
                                ) : (
                                    <>
                                        <div>
                                            <span>{new Date((data as Competition).date).toLocaleDateString('en-IN')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Clock size={16} className="text-purple-400" />
                                            <span>{(data as Competition).duration}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                {entityType === 'workshop' ? (
                                    <>
                                        {(data as Workshop).mode === WorkshopMode.ONLINE ? <Video size={16} className="text-purple-400" /> : <MapPin size={16} className="text-purple-400" />}
                                        <span>{(data as Workshop).mode === WorkshopMode.ONLINE ? 'Online' : (data as Workshop).location}</span>
                                    </>
                                ) : (
                                    <>
                                        {(data as Competition).mode === 'online' ? <Video size={16} className="text-purple-400" /> : <MapPin size={16} className="text-purple-400" />}
                                        <span>{(data as Competition).mode === 'online' ? 'Online' : (data as Competition).location}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Workshop-specific: Meeting Link */}
                        {entityType === 'workshop' && (data as Workshop).mode !== WorkshopMode.OFFLINE && (data as Workshop).meetingLink && (
                            <div className="bg-gray-800 p-3 rounded-lg">
                                <p className="text-xs text-gray-400 mb-1">Meeting Link</p>
                                <a href={(data as Workshop).meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm hover:underline break-all">
                                    {(data as Workshop).meetingLink}
                                </a>
                            </div>
                        )}

                        {/* Competition-specific: Meeting Link */}
                        {entityType === 'competition' && (data as Competition).mode === 'online' && (data as Competition).meeting_link && (
                            <div className="bg-gray-800 p-3 rounded-lg">
                                <p className="text-xs text-gray-400 mb-1">Meeting Link</p>
                                <a href={(data as Competition).meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm hover:underline break-all">
                                    {(data as Competition).meeting_link}
                                </a>
                            </div>
                        )}

                        {/* Workshop-specific: Sessions */}
                        {entityType === 'workshop' && (
                            <div>
                                <h3 className="text-white font-medium mb-2">Sessions</h3>
                                <div className="space-y-2">
                                    {(data as Workshop).sessions.map((session, index) => (
                                        <div key={index} className="flex justify-between items-center bg-gray-800 p-2 rounded text-sm">
                                            <span className="text-gray-300">{new Date(session.date).toLocaleDateString()}</span>
                                            <span className="text-white">{session.startTime} - {session.endTime}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Competition-specific: Additional Info */}
                        {entityType === 'competition' && (
                            <>
                                <div className="bg-gray-800 p-3 rounded-lg">
                                    <p className="text-xs text-gray-400 mb-1">Category & Level</p>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 bg-blue-500/20 text-blue-200 text-xs rounded-full">
                                            {(data as Competition).category}
                                        </span>
                                        <span className="px-2 py-1 bg-green-500/20 text-green-200 text-xs rounded-full">
                                            {(data as Competition).level}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-800 p-3 rounded-lg">
                                    <p className="text-xs text-gray-400 mb-1">Registration Deadline</p>
                                    <p className="text-white text-sm">
                                        {new Date((data as Competition).registrationDeadline).toLocaleDateString('en-IN')}
                                    </p>
                                </div>
                                {(data as Competition).document && (
                            <div className="bg-gray-800 p-3 rounded-lg">
                                <p className="text-xs text-gray-400 mb-1">Rules & Regulations</p>
                                <a href={(data as Competition).document} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm hover:underline">
                                    View Document
                                </a>
                            </div>
                        )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenericDetailsModal;
