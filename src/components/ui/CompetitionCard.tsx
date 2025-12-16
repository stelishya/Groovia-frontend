import React from 'react';
import { Calendar, MapPin, User, ArrowUpRight, Users } from 'lucide-react';
import { type Competition } from '../../services/competition.service';

interface CompetitionCardProps {
    competition: Competition;
    isOrganizer: boolean;
    onViewDetails: (competition: Competition) => void;
    onRegister?: (competition: Competition) => void;
    onRetryPayment?: (competition: Competition) => void;
    getStatusColor: (status: string) => string;
    paymentStatus?: 'paid' | 'failed' | 'pending';
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({
    competition,
    isOrganizer,
    onViewDetails,
    onRegister,
    onRetryPayment,
    getStatusColor,
    paymentStatus,
}) => {
    const organizerName = typeof competition.organizer_id === 'object' && competition.organizer_id !== null
        ? competition.organizer_id.username
        : 'Unknown Organizer';

    return (
        <div className="border-[#a855f7] border-2 bg-purple-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-transform duration-300 ease-in-out
        hover:-translate-y-2 flex flex-col h-full relative group">
            {/* Image Container */}
            <div className="p-4 pb-0">
                <div className="relative h-48 w-full rounded-xl overflow-hidden">
                    <img
                        src={competition.posterImage}
                        alt={competition.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Status Badge Over Image */}
                    <div className="absolute top-2 right-2">
                        <span className={`text-xs px-2 py-1 rounded-full text-white font-medium shadow-sm ${getStatusColor(competition.status)}`}>
                            {competition.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Title */}
                <h3 className="text-xl font-bold text-purple-300 mb-2 line-clamp-2 leading-tight">
                    {competition.title}
                </h3>

                {/* Category & Fee */}
                <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-white/30 backdrop-blur-sm text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                        {competition.style}
                    </span>
                    <span className="text-2xl font-bold text-pink-200">
                        ₹{competition.fee}
                    </span>
                </div>

                {/* Payment Status */}
                {paymentStatus && (
                    <div className={`mb-3 px-3 py-1 rounded-full text-xs font-semibold text-center ${paymentStatus === 'paid'
                        ? 'bg-green-500/20 text-green-400 border border-green-500'
                        : paymentStatus === 'failed'
                            ? 'bg-red-500/20 text-red-400 border border-red-500'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                        }`}>
                        Payment: {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                    </div>
                )}

                {/* Details */}
                <div className="space-y-2 mb-6 flex-grow">
                    <div className="flex items-center text-white/90 text-sm">
                        <User size={16} className="mr-2 flex-shrink-0" />
                        <span className="truncate">{organizerName}</span>
                    </div>
                    <div className="flex items-center text-white/90 text-sm">
                        <Calendar size={16} className="mr-2 flex-shrink-0" />
                        <span>{new Date(competition.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}</span>
                    </div>
                    {competition.location && (
                        <div className="flex items-center text-white/90 text-sm">
                            <MapPin size={16} className="mr-2 flex-shrink-0" />
                            <span className="truncate">{competition.location}</span>
                        </div>
                    )}
                    <div className="flex items-center text-white/90 text-sm">
                        <Users size={16} className="mr-2 flex-shrink-0" />
                        <span>{competition.registeredDancers.length} / {competition.maxParticipants} participants</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto flex gap-2">
                    {competition.registeredDancers.length >= competition.maxParticipants ? (
                        <button className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold w-full cursor-not-allowed shadow-md">
                            Fully Booked
                        </button>
                    ) : paymentStatus === 'failed' && onRetryPayment ? (
                        <>
                            <button
                                onClick={() => onViewDetails(competition)}
                                className="bg-purple-600/80 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-semibold flex-1 transition-colors duration-200"
                            >
                                Details
                            </button>
                            <button
                                onClick={() => onRetryPayment(competition)}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm font-semibold flex-1 flex items-center justify-center transition-colors duration-200 shadow-md"
                            >
                                Retry Pay
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => onViewDetails(competition)}
                                className="bg-purple-600/80 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-semibold flex-1 transition-colors duration-200"
                            >
                                 View Details
                            </button>
                            {!isOrganizer && onRegister && (
                                <button
                                    onClick={() => onRegister(competition)}
                                    className="bg-[#c084fc] hover:bg-[#d8b4fe] text-white px-4 py-2 rounded-lg text-sm font-semibold flex-1 flex items-center justify-center transition-colors duration-200 shadow-md"
                                >
                                    Register
                                    <ArrowUpRight size={16} className="ml-1" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompetitionCard;
