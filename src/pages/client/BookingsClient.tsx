import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MapPin, Calendar, ChevronRight, ChevronLeft, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import { getClientEventRequests, updateEventBookingStatus } from '../../services/client/client.service';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { DancerEventRequest } from '../../types/event.types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

const RequestCard = ({
    request,
    onCancelClick,
    onViewMap,
    onPaymentClick
}: {
    request: DancerEventRequest,
    onCancelClick: (id: string) => void,
    onViewMap: (venue: string) => void,
    onPaymentClick: (request: DancerEventRequest) => void
}) => (
    <div className="bg-gradient-to-br from-deep-purple to-purple-500 rounded-lg p-6">
        <div className="flex justify-between items-start">
            {/* Left side - Dancer Info */}
            <div className="flex items-start mr-4">
                <div className="flex-shrink-0">
                    <img
                        src={request.dancerId?.profileImage || 'https://img.icons8.com/?size=128&id=tZuAOUGm9AuS&format=png'}
                        alt={request.dancerId?.username || 'Unassigned'}
                        className="w-12 h-12 rounded-full border-2 border-white"
                    />
                </div>
                <div className="ml-2">
                    <h3 className="text-lg font-semibold text-white">{request.dancerId?.username || 'Unassigned'}</h3>
                    <div className="mt-0.5 flex flex-wrap gap-1">
                        {request.dancerId?.danceStyles?.slice(0, 3).map((style, index) => (
                            <span key={index} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                                {style || 'No styles'}
                            </span>
                        ))}
                        {(!request.dancerId?.danceStyles || request.dancerId?.danceStyles.length === 0) && (
                            <span className="text-xs text-white/70 italic">No dance styles listed</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Vertical Divider */}
            <div className="h-24 w-px bg-white/30"></div>

            {/* Right side - Event Details */}
            <div className="flex-1 pl-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="text-sm font-semibold text-white/80 mb-1">Event Details</h4>
                        <p className="text-white font-medium">{request.event}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full mb-2 ${request.status === 'pending' ? 'bg-yellow-500 text-black' :
                        request.status === 'rejected' ? 'bg-red-500 text-white' :
                            'bg-green-500 text-white'
                        }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center text-white/90">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(request.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}</span>
                    </div>
                    <div className="flex items-center text-white/90">
                        <span>₹{request.budget}</span>
                    </div>
                    {request.acceptedAmount && (
                        <div className="flex items-center text-green-300 font-semibold">
                            <IndianRupee className="w-4 h-4 mr-2" />
                            <span>Agreed: ₹ {request.acceptedAmount}</span>
                        </div>
                    )}
                    <div className="flex items-center text-white/90">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="mr-2">{request.venue || 'Venue not specified'}</span>
                        {request.venue && (
                            <button
                                onClick={() => onViewMap(request.venue)}
                                className="text-purple-300 hover:text-purple-100 underline text-xs"
                            >
                                View on Map
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mt-4 space-x-3">
            {request.status === 'pending' && (
                <>
                    <button onClick={() => onCancelClick(request._id)} className="bg-orange-500/70 text-white font-bold px-3 py-2 rounded-md text-sm">Cancel Request</button>
                </>
            )}
            {request.status === 'accepted' && (
                <>
                    {/* Only show Pay button if payment is not completed */}
                    {request.paymentStatus !== 'paid' ? (
                        <button
                            onClick={() => onPaymentClick(request)}
                            className={`font-bold px-3 py-2 border rounded-md text-sm transition-colors ${request.paymentStatus === 'failed'
                                ? 'bg-red-600/50 text-white border-red-800 hover:bg-red-700'
                                : 'bg-purple-600/50 text-white border-purple-800 hover:bg-purple-700'
                                }`}
                        >
                            {request.paymentStatus === 'failed' ? 'Retry Payment' : `Pay ₹${request.acceptedAmount || 0} to Confirm`}
                        </button>
                    ) : (
                        <span className="bg-green-500/20 text-green-300 font-bold px-3 py-2 rounded-md text-sm border border-green-500/50">
                            Payment Completed
                        </span>
                    )}

                    <button className="bg-purple-500 text-white font-bold px-3 py-2 rounded-md text-sm">Message</button>
                </>
            )}
        </div>
    </div>
);

const BookingsPage = () => {
    const [requests, setRequests] = useState<DancerEventRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    const [totalRequests, setTotalRequests] = useState(0);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [mapModalOpen, setMapModalOpen] = useState(false);
    const [selectedVenue, setSelectedVenue] = useState<string>('');
    const [venueCoords, setVenueCoords] = useState<[number, number] | null>(null);
    const [loadingCoords, setLoadingCoords] = useState(false);
    const navigate = useNavigate();

    console.log("requests in bookings page in bookings client :", requests)

    const handleUpdateStatus = async (id: string, status: 'cancelled') => {
        try {
            const updatedRequest = await updateEventBookingStatus(id, status);
            setRequests(prevRequests =>
                prevRequests.map(req => req._id === id ? { ...req, status: updatedRequest.data.request.status } : req)
            );
            toast.success('Request cancelled successfully');
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error('Failed to cancel request');
        }
    };

    const handleCancelClick = (id: string) => {
        setSelectedRequestId(id);
        setModalOpen(true);
    };

    const confirmCancel = () => {
        if (selectedRequestId) {
            handleUpdateStatus(selectedRequestId, 'cancelled');
            setModalOpen(false);
            setSelectedRequestId(null);
        }
    };

    const handleViewMap = async (venue: string) => {
        setSelectedVenue(venue);
        setMapModalOpen(true);
        setLoadingCoords(true);

        try {
            // Geocode the venue address
            const response = await fetch(
                `${import.meta.env.VITE_OPENSTREETMAP_URL}?format=json&q=${encodeURIComponent(venue)}&limit=1`
            );
            const data = await response.json();
            if (data && data.length > 0) {
                setVenueCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
            } else {
                // Default to India center if geocoding fails
                setVenueCoords([20.5937, 78.9629]);
            }
        } catch (error) {
            console.error('Failed to geocode venue:', error);
            setVenueCoords([20.5937, 78.9629]);
        } finally {
            setLoadingCoords(false);
        }
    };

    const handlePayment = (request: DancerEventRequest) => {
        if (!request.acceptedAmount) {
            toast.error("No accepted amount to pay.");
            return;
        }

        navigate(`/event/${request._id}/checkout`, { state: { eventBooking: request } });
    };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', currentPage.toString());
            params.append('limit', pageSize.toString());
            if (search) params.append('search', search);
            if (status) params.append('status', status);
            if (sortBy) params.append('sortBy', sortBy);

            const data = await getClientEventRequests(params);
            console.log('Processed API Response:', data);
            if (Array.isArray(data.data.requests)) {
                console.log("requests in bookings page in bookings client :", data.data.requests)
                console.log("total in bookings page in bookings client :", data.data.total)
                setRequests(data.data.requests || []);
                setTotalRequests(data.data.total || 0);
            } else {
                // If response is an object with requests/total properties
                setRequests(data.data.requests || []);
                setTotalRequests(data.data.total || 0);
            }
        } catch (error) {
            console.error("Failed to fetch requests", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchRequests();
        }, 500); // Debounce search input

        return () => {
            clearTimeout(handler);
        };
    }, [currentPage, pageSize, search, status, sortBy]);

    return (
        <div className="flex-grow p-8 bg-[#0a0516] text-white overflow-y-auto">
            {/* <Header /> */}
            <div className="flex border-b border-purple-700 mb-6">
                <button className="py-2 px-4 text-white border-b-2 border-purple-500 font-semibold">Event Requests History ({requests.length})</button>
            </div>
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-1/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                    <input type="text" placeholder="Search by event..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-purple-700 text-white placeholder-purple-300 rounded-lg py-2 pl-10 focus:outline-none" />
                    {search && <X className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 cursor-pointer" onClick={() => setSearch('')} />}
                </div>
                <div className="flex items-center space-x-4">
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-purple-700 text-white border border-purple-500 rounded-lg py-2 px-4 focus:outline-none">
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="confirmed">Confirmed</option>
                    </select>
                    <div className="flex items-center">
                        <span className="text-gray-400 mr-2">Sort by:</span>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-purple-700 text-white rounded-lg py-2 px-4 focus:outline-none">
                            <option value="date">Sort by Date</option>
                            <option value="budget">Sort by Budget</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                {loading ? (
                    <p>Loading requests...</p>
                ) : requests.length > 0 ? (
                    requests.map(req => (
                        <RequestCard
                            key={req._id}
                            request={req}
                            onCancelClick={handleCancelClick}
                            onViewMap={handleViewMap}
                            onPaymentClick={handlePayment}
                        />
                    ))
                ) : (
                    <p>No event requests found.</p>
                )}
            </div>

            {/* Pagination */}
            <div className='flex justify-between items-center mt-8 space-x-4'>
                <div className="flex justify-end items-center mt-8 space-x-4">
                    <h3>Showing {requests.length} of {totalRequests} requests</h3>
                </div>
                <div className="flex justify-end items-center mt-8 space-x-4">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft />
                    </button>
                    <span className="text-white">Page {currentPage} of {Math.max(1, Math.ceil(totalRequests / pageSize))}</span>
                    <button
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={currentPage >= Math.ceil(totalRequests / pageSize)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight />
                    </button>
                </div>
            </div>
            {modalOpen && (
                <ConfirmationModal
                    show={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onConfirm={confirmCancel}
                    title="Confirm Cancellation"
                    message="Are you sure you want to cancel this booking request?"
                />
            )}
            {mapModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-purple-900 rounded-2xl p-6 max-w-3xl w-full border border-purple-500">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-white flex items-center">
                                <MapPin className="mr-2" />
                                Venue Location
                            </h3>
                            <button
                                onClick={() => setMapModalOpen(false)}
                                className="text-white hover:text-gray-300 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <p className="text-purple-300 mb-4">{selectedVenue}</p>
                        {loadingCoords ? (
                            <div className="h-96 flex items-center justify-center bg-purple-800 rounded-xl">
                                <p className="text-white">Loading map...</p>
                            </div>
                        ) : venueCoords ? (
                            <MapContainer
                                center={venueCoords}
                                zoom={15}
                                className="h-96 w-full rounded-xl border-2 border-purple-500"
                                style={{ zIndex: 0 }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={venueCoords}>
                                    <Popup>{selectedVenue}</Popup>
                                </Marker>
                            </MapContainer>
                        ) : (
                            <div className="h-96 flex items-center justify-center bg-purple-800 rounded-xl">
                                <p className="text-white">Unable to load location</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};



const BookingsClient: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-900">
            <BookingsPage />
        </div>
    );
};

export default BookingsClient;