import React, { useState } from 'react';
import { X, Search, Mail, Filter, User } from 'lucide-react';
import type { Competition } from '../../services/competition.service';
import { useNavigate } from 'react-router-dom';

interface ParticipantsListModalProps {
    isOpen: boolean;
    onClose: () => void;
    competition: Competition | null;
}

const ParticipantsListModal: React.FC<ParticipantsListModalProps> = ({ isOpen, onClose, competition }) => {
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    if (!isOpen || !competition) return null;

    const participants = competition.registeredDancers || [];

    const filteredParticipants = participants.filter((p: any) => {
        const matchesStatus = filterStatus === 'all' || p.paymentStatus === filterStatus;
        const dancerName = p.dancerId?.username?.toLowerCase() || '';
        const dancerEmail = p.dancerId?.email?.toLowerCase() || '';
        const matchesSearch = dancerName.includes(searchQuery.toLowerCase()) ||
            dancerEmail.includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });
    console.log("filteredParticipants : ",filteredParticipants)

    const getStatusColor = (status: string) => {
        if (status === 'paid') return 'text-green-400 bg-green-400/10 border-green-400/20';
        if (status === 'failed') return 'text-red-400 bg-red-400/10 border-red-400/20';
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    };

    const handleViewProfile = (dancerId: string) => {
        onClose();
        navigate(`/public-profile/${dancerId}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a1d] border border-purple-500/20 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Participants List</h2>
                        <p className="text-purple-300 text-sm">{competition.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-6 border-b border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#242428] text-white placeholder-gray-500 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-purple-500 border border-white/10"
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'paid', label: 'Paid' },
                                { id: 'pending', label: 'Pending' },
                                { id: 'failed', label: 'Failed' },
                            ].map((status) => (
                                <button
                                    key={status.id}
                                    onClick={() => setFilterStatus(status.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === status.id
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                        : 'bg-[#242428] text-gray-400 hover:text-white border border-white/10'
                                        }`}
                                >
                                    {status.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredParticipants.length > 0 ? (
                        <div className="space-y-3">
                            {filteredParticipants.map((participant: any, index: number) => {
                                const dancer = participant.dancerId || {};
                                console.log("dancer : ",dancer)
                                const isInstructor = dancer.role?.includes('instructor');
                                const isAvailable = dancer.availableForPrograms;
                                const showProfileButton = isInstructor || isAvailable;

                                return (
                                    <div
                                        key={index}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#242428] p-4 rounded-xl border border-white/5 hover:border-purple-500/20 transition-colors group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full overflow-hidden bg-purple-900/30 flex-shrink-0 border border-white/10">
                                                {dancer.profileImage ? (
                                                    <img
                                                        src={dancer.profileImage}
                                                        alt={dancer.username}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-purple-400">
                                                        <User size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-medium flex items-center gap-2">
                                                    {dancer.username || 'Unknown User'}
                                                    {isInstructor && (
                                                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                                                            P
                                                        </span>
                                                    )}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <Mail size={12} />
                                                    {dancer.email || 'No email'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 justify-between sm:justify-end">
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(participant.paymentStatus)}`}>
                                                {participant.paymentStatus.charAt(0).toUpperCase() + participant.paymentStatus.slice(1)}
                                            </div>
                                            {showProfileButton && (
                                                <button
                                                    onClick={() => handleViewProfile(dancer._id)}
                                                    className="px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white rounded-lg text-xs font-medium transition-colors border border-purple-500/30 hover:border-transparent"
                                                >
                                                    View Profile
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 min-h-[200px]">
                            <Filter size={48} className="mb-4 opacity-20" />
                            <p>No participants found matching your filters</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-[#151518] rounded-b-xl flex justify-between text-xs text-gray-500">
                    <span>Total Participants: {participants.length}</span>
                    <span>Showing: {filteredParticipants.length}</span>
                </div>
            </div>
        </div>
    );
};

export default ParticipantsListModal;
