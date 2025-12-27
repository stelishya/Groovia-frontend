import React from 'react';
import { Calendar, MapPin, User, ArrowUpRight } from 'lucide-react';

interface WorkshopCardProps {
    image: string;
    title: string;
    category: string;
    price: number;
    instructorName: string;
    studioName?: string; // Optional, as it might be online or same as instructor
    date: string;
    onBook: () => void;
    actionLabel?: string;
    paymentStatus?: 'paid' | 'failed';
    deadline?: string;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({
    image,
    title,
    category,
    price,
    instructorName,
    studioName,
    date,
    onBook,
    actionLabel = 'View Details',
    paymentStatus,
    deadline
}) => {
    const isDeadlinePassed = deadline ? new Date(deadline) < new Date() : false;

    return (
        <div className="border-[#a855f7] border-2 bg-purple-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-transform duration-300 ease-in-out
        hover:-translate-y-2 flex flex-col h-full relative group">
            {/* Image Container */}
            <div className="p-4 pb-0">
                <div className="relative h-48 w-full rounded-xl overflow-hidden">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Overlay gradient if needed */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Title */}
                <h3 className="text-xl font-bold text-purple-300 mb-2 line-clamp-2 leading-tight">
                    {title}
                </h3>

                {/* Category Tag & Price */}
                <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-white/30 backdrop-blur-sm text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                        {category}
                    </span>
                    <span className="text-2xl font-bold text-pink-200">
                        ₹{price}
                    </span>
                </div>
                {paymentStatus && (
                    <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold text-center ${paymentStatus === 'paid'
                        ? 'bg-green-500/20 text-green-400 border border-green-500'
                        : paymentStatus === 'failed'
                            ? 'bg-red-500/20 text-red-400 border border-red-500'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                        }`}>
                        {paymentStatus === 'paid' ? '✓ Paid' : '✗ Payment Failed'}
                    </div>
                )}
                {isDeadlinePassed && !paymentStatus && (
                    <div className="mt-2 px-3 py-1 rounded-full text-xs font-semibold text-center bg-gray-500/20 text-gray-400 border border-gray-500">
                        ⏰ Registration Closed
                    </div>
                )}

                {/* Details */}
                <div className="space-y-2 mb-6 flex-grow">
                    <div className="flex items-center text-white/90 text-sm">
                        <User size={16} className="mr-2 flex-shrink-0" />
                        <span className="truncate">{instructorName}</span>
                    </div>
                    {studioName && (
                        <div className="flex items-center text-white/90 text-sm">
                            <MapPin size={16} className="mr-2 flex-shrink-0" />
                            <span className="truncate">{studioName}</span>
                        </div>
                    )}
                    <div className="flex items-center text-white/90 text-sm">
                        <Calendar size={16} className="mr-2 flex-shrink-0" />
                        {/* <span>{new Date(date).toLocaleDateString('en-IN')}</span> */}
                        <span>{new Date(date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}</span>
                    </div>
                </div>

                {/* Book Button */}
                <div className="flex w-full mt-auto">
                    <button
                        onClick={onBook}
                        className="w-full justify-center bg-[#c084fc] hover:bg-[#d8b4fe] text-white px-6 py-2 rounded-lg font-semibold flex items-center transition-colors duration-200 shadow-md"
                    >
                        {/* {isDeadlinePassed && actionLabel === 'Book Now' ? 'Registration Closed' : actionLabel} */}
                        {actionLabel}
                        <ArrowUpRight size={18} className="ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkshopCard;
