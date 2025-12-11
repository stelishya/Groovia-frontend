import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
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
    return (
        <div className="bg-gradient-to-br from-deep-purple to-purple-500 rounded-lg p-6 h-full flex flex-col">
            {/* Competition Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1 mr-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <img
                                src={competition.posterImage}
                                alt={competition.title}
                                className="w-16 h-16 rounded-lg object-cover border-2 border-white"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{competition.title}</h3>
                            <p className="text-white/80 text-sm line-clamp-2">{competition.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">
                                    {competition.style}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(competition.status)}`}>
                                    {competition.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Competition Details */}
            <div className="flex-1 space-y-2 mb-4">
                <div className="flex items-center text-white/90">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">{new Date(competition.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    })}</span>
                </div>
                {competition.location && (
                    <div className="flex items-center text-white/90">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm line-clamp-1">{competition.location}</span>
                    </div>
                )}
                <div className="flex items-center text-white/90">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">{competition.registeredDancers.length} / {competition.maxParticipants} participants</span>
                </div>
                <div className="flex items-center text-white/90 mt-3">
                    <span className="text-lg font-bold text-white">₹{competition.fee}</span>
                </div>
                {paymentStatus && (
                    <div className="flex items-center mt-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${paymentStatus === 'paid'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : paymentStatus === 'failed'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                            Payment: {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                        </span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-auto">
                {competition.registeredDancers.length >= competition.maxParticipants ? (
                    <button className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm cursor-not-allowed w-full">
                        Fully Booked
                    </button>
                ) : paymentStatus === 'failed' && onRetryPayment ? (
                    <>
                        <button
                            onClick={() => onViewDetails(competition)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 flex-1"
                        >
                            View Details
                        </button>
                        <button
                            onClick={() => onRetryPayment(competition)}
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 flex-1"
                        >
                            Retry Payment
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => onViewDetails(competition)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 flex-1"
                        >
                            View Details
                        </button>
                        {!isOrganizer && onRegister && (
                            <button
                                onClick={() => onRegister(competition)}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 flex-1"
                            >
                                Register Now
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CompetitionCard;
