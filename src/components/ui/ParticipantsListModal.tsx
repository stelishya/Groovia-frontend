import React, { useState, useMemo } from 'react';
import { X, Search, Mail, Filter, User, ArrowUpDown, ChevronDown } from 'lucide-react';
import type { Competition } from '../../services/competition.service';
import { useNavigate } from 'react-router-dom';

interface RegisteredDancer {
    dancerId: {
        _id: string;
        username: string;
        email: string;
        profileImage?: string;
        role?: string[];
        availableForPrograms?: boolean;
    };
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded' | 'paid';
    score: number;
    registeredAt: string;
    attendance?: boolean;
}

interface ParticipantsListModalProps {
    isOpen: boolean;
    onClose: () => void;
    competition: Competition | null;
}

type SortOption = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc';

const ParticipantsListModal: React.FC<ParticipantsListModalProps> = ({ isOpen, onClose, competition }) => {
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('date-desc');
    const navigate = useNavigate();

    const participants = (competition?.registeredDancers || []) as RegisteredDancer[];

    const filteredAndSortedParticipants = useMemo(() => {
        // Filter
        let filtered = participants.filter((p) => {
            const matchesStatus = filterStatus === 'all' || p.paymentStatus === filterStatus;
            const dancerName = p.dancerId?.username?.toLowerCase() || '';
            const dancerEmail = p.dancerId?.email?.toLowerCase() || '';
            const matchesSearch = dancerName.includes(searchQuery.toLowerCase()) ||
                dancerEmail.includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return (a.dancerId?.username || '').localeCompare(b.dancerId?.username || '');
                case 'name-desc':
                    return (b.dancerId?.username || '').localeCompare(a.dancerId?.username || '');
                case 'date-asc':
                    return new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime();
                case 'date-desc':
                    return new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime();
                default:
                    return 0;
            }
        });

        return filtered;
    }, [participants, filterStatus, searchQuery, sortBy]);

    console.log("filteredAndSortedParticipants : ", filteredAndSortedParticipants);

    // Early return after all hooks to follow React's Rules of Hooks
    if (!isOpen || !competition) return null;

    const getStatusColor = (status: string) => {
        if (status === 'paid' || status === 'completed') return 'text-green-400 bg-green-400/10 border-green-400/20';
        if (status === 'failed') return 'text-red-400 bg-red-400/10 border-red-400/20';
        if (status === 'pending') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
        if (status === 'refunded') return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    };

    const handleViewProfile = (dancerId: string) => {
        onClose();
        navigate(`/dancer-profile/${dancerId}`);
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

                {/* Filters & Sorting */}
                <div className="p-6 border-b border-white/10 space-y-4">
                    {/* Search and Sort Row */}
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

                        {/* Sort Dropdown */}
                        <div className="relative min-w-[180px]">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="w-full appearance-none bg-[#242428] text-white rounded-lg py-2.5 pl-10 pr-10 focus:outline-none focus:ring-1 focus:ring-purple-500 border border-white/10 cursor-pointer"
                            >
                                <option value="date-desc">📅 Date (Newest)</option>
                                <option value="date-asc">📅 Date (Oldest)</option>
                                <option value="name-asc">👤 Name (A-Z)</option>
                                <option value="name-desc">👤 Name (Z-A)</option>
                            </select>
                            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>

                    {/* Payment Status Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {[
                            { id: 'all', label: 'All', count: participants.length },
                            { id: 'paid', label: 'Paid', count: participants.filter(p => p.paymentStatus === 'paid').length },
                            { id: 'completed', label: 'Completed', count: participants.filter(p => p.paymentStatus === 'completed').length },
                            { id: 'pending', label: 'Pending', count: participants.filter(p => p.paymentStatus === 'pending').length },
                            { id: 'failed', label: 'Failed', count: participants.filter(p => p.paymentStatus === 'failed').length },
                            { id: 'refunded', label: 'Refunded', count: participants.filter(p => p.paymentStatus === 'refunded').length },
                        ].filter(status => status.count > 0 || status.id === 'all').map((status) => (
                            <button
                                key={status.id}
                                onClick={() => setFilterStatus(status.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filterStatus === status.id
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30 scale-105'
                                    : 'bg-[#242428] text-gray-400 hover:text-white hover:bg-[#2a2a2e] border border-white/10'
                                    }`}
                            >
                                {status.label}
                                <span className={`ml-1.5 ${filterStatus === status.id ? 'text-purple-200' : 'text-gray-500'}`}>
                                    ({status.count})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredAndSortedParticipants.length > 0 ? (
                        <div className="space-y-3">
                            {filteredAndSortedParticipants.map((participant, index: number) => {
                                const dancer = participant.dancerId;
                                const isInstructor = dancer.role?.includes('instructor');
                                const isAvailable = dancer.availableForPrograms;
                                const showProfileButton = isInstructor || isAvailable;
                                console.log("dancer._id", dancer._id);
                                return (
                                    <div
                                        key={dancer._id || index}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#242428] p-4 rounded-xl border border-white/5 hover:border-purple-500/20 transition-colors group"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
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
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-medium flex items-center gap-2">
                                                    <span className="truncate">{dancer.username || 'Unknown User'}</span>
                                                    {/* {isInstructor && (
                                                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30 flex-shrink-0">
                                                            PRO
                                                        </span>
                                                    )} */}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-400 truncate">
                                                    <Mail size={12} className="flex-shrink-0" />
                                                    <span className="truncate">{dancer.email || 'No email'}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-1">
                                                    Registered: {new Date(participant.registeredAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 justify-between sm:justify-end flex-shrink-0">
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(participant.paymentStatus)}`}>
                                                {participant.paymentStatus.charAt(0).toUpperCase() + participant.paymentStatus.slice(1)}
                                            </div>
                                            {showProfileButton && (
                                                <button
                                                    onClick={() => handleViewProfile(dancer._id)}
                                                    className="px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white rounded-lg text-xs font-medium transition-colors border border-purple-500/30 hover:border-transparent whitespace-nowrap"
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
                            <p className="text-lg font-medium">No participants found</p>
                            <p className="text-sm text-gray-600 mt-1">Try adjusting your filters or search query</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-[#151518] rounded-b-xl flex justify-between text-xs text-gray-500">
                    <span>Total Participants: {participants.length}</span>
                    <span>Showing: {filteredAndSortedParticipants.length}</span>
                </div>
            </div>
        </div>
    );
};

export default ParticipantsListModal;
