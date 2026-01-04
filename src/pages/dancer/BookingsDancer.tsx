
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, MapPin, Calendar, IndianRupee, User, PartyPopper, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getEventRequests } from '../../services/dancer/dancer.service';
import { fetchMyProfile } from '../../services/user/auth.service';
import Sidebar from '../../components/shared/Sidebar';
import { updateEventBookingStatus } from '../../services/client/client.service';
import { getBookedWorkshops } from '../../services/workshop/workshop.service';
import { UserTable } from '../../components/ui/Table';
import type { Workshop } from '../../types/workshop.type';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import UserNavbar from '../../components/shared/Navbar';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

interface Client {
    _id: string;
    username: string;
    profileImage?: string;
}

interface EventRequest {
    _id: string;
    clientId: Client | null;
    event: string;
    date: string;
    venue: string;
    budget: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    paymentStatus?: string;
}


// const Header = ({ user }: { user: Client | null }) => (
//     <header className="flex justify-between items-center mb-8">
//         <div>
//             <h1 className="text-3xl font-bold text-white">Bookings Management</h1>
//             <p className="text-gray-400">Manage your client requests & workshop bookings</p>
//         </div>
//         <div className="flex items-center space-x-4">
//             <Bell className="text-white" />
//             <img src={user?.profileImage} alt="User" className="w-10 h-10 rounded-full" />
//         </div>
//     </header>
// );

const RequestCard = ({ request, onAcceptClick, onDeclineClick, onViewMap }: { request: EventRequest, onAcceptClick: (id: string) => void, onDeclineClick: (id: string) => void, onViewMap: (venue: string) => void }) => (
    <div className="bg-purple-700/50 rounded-lg p-4 flex justify-between items-center border border-purple-500">
        <div className="flex items-center">
            <img src={request.clientId?.profileImage || 'https://img.icons8.com/?size=128&id=tZuAOUGm9AuS&format=png'} alt={request.clientId?.username || 'Unknown'} className="w-12 h-12 rounded-full mr-4" />
            <div className="flex flex-col gap-1">
                <div className='flex items-center'>
                    <User className='inline mr-1 text-gray-200' size={14} />
                    <h3 className="font-bold text-white">{request.clientId?.username || 'Unknown Client'}</h3>
                </div>
                <div className='flex items-center'>
                    <PartyPopper className='inline mr-1 text-gray-200' size={14} />
                    <h2 className="text-md text-gray-200">{request.event}</h2>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                    <MapPin className="inline mr-1" size={14} />
                    <span className="mr-2">{request.venue.substring(0, 40)}</span>
                    <button
                        onClick={() => onViewMap(request.venue)}
                        className="text-purple-300 hover:text-purple-100 underline text-xs"
                    >
                        View on Map
                    </button>
                </div>
                <div className='flex items-center'>
                    <Calendar className="inline mr-1 text-gray-200" size={14} />
                    <p className="text-sm text-gray-400">{new Date(request.date).toLocaleDateString('en-IN')}</p>
                </div>
                <div className='flex items-center'>
                    <IndianRupee className='inline mr-1 text-gray-200' size={14} />
                    <p className="text-sm text-gray-400">Budget: {request.budget}</p>
                </div>
            </div>
        </div>
        <div className="flex flex-col items-end">
            <span className={`text-xs px-2 py-1 rounded-full mb-2 ${request.status === 'pending' ? 'bg-yellow-500 text-black' :
                request.status === 'rejected' ? 'bg-red-500 text-white' :
                    'bg-green-500 text-white'
                }`}>
                {request.status}
            </span>
            <div className="flex space-x-2">
                {(() => {
                    const isDatePassed = new Date(request.date) < new Date(new Date().setHours(0, 0, 0, 0));

                    if (isDatePassed && (request.status === 'pending' || (request.status === 'accepted' && request.paymentStatus !== 'paid'))) {
                        return (
                            <span className="text-red-400 text-sm font-medium px-3 py-1 bg-red-400/10 rounded-md border border-red-400/20">
                                Event Date Passed
                            </span>
                        );
                    }

                    if (request.status === 'pending') {
                        return (
                            <>
                                <button onClick={() => onAcceptClick(request._id)} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm">Accept</button>
                                <button onClick={() => onDeclineClick(request._id)} className="bg-red-500 text-white px-3 py-1 rounded-md text-sm">Decline</button>
                            </>
                        );
                    }

                    if (request.status === 'accepted') {
                        return (
                            <>
                                <h3 className='text-sm text-white bg-blue-500/60 px-2 py-1 rounded-md'>Payment Request Sent</h3>
                                <button className="bg-purple-500 text-white px-3 py-1 rounded-md text-sm">Message</button>
                            </>
                        );
                    }
                    return null;
                })()}
            </div>
        </div>
    </div>
);

const BookingsPage = () => {
    const [, setUser] = useState<Client | null>(null);
    const [requests, setRequests] = useState<EventRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    // const [pageSize, setPageSize] = useState(5);
    const pageSize = 5
    const [totalRequests, setTotalRequests] = useState(0);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'accept' | 'decline' | null>(null);
    const [mapModalOpen, setMapModalOpen] = useState(false);
    const [selectedVenue, setSelectedVenue] = useState<string>('');
    const [venueCoords, setVenueCoords] = useState<[number, number] | null>(null);
    const [loadingCoords, setLoadingCoords] = useState(false);
    const [activeTab, setActiveTab] = useState<'requests' | 'workshops'>('requests');

    // State for booked workshops
    const [workshopSearch, setWorkshopSearch] = useState('');
    const [workshopSortBy, setWorkshopSortBy] = useState('date');
    const [workshopPage] = useState(1);
    const [workshopLimit] = useState(10);


    const [bookedWorkshops, setBookedWorkshops] = useState<Workshop[]>([]);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [acceptAmount, setAcceptAmount] = useState('');

    // Initialize activeTab from URL search params
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'workshops' || tabParam === 'requests') {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchBookedWorkshops = async () => {
            if (activeTab !== 'workshops') return; // Only fetch when on workshops tab

            setLoading(true);
            try {
                const response = await getBookedWorkshops({
                    search: workshopSearch,
                    sortBy: workshopSortBy,
                    page: workshopPage,
                    limit: workshopLimit
                });
                console.log("Booked Workshops", response);
                if (response.success) {
                    setBookedWorkshops(response.data.workshops);
                    setTotalRequests(response.data.total || 0);
                }
            } catch (error) {
                console.error("Failed to fetch booked workshops", error);
                toast.error("Failed to load booked workshops");
            } finally {
                setLoading(false);
            }
        };

        // Debounce the search
        const handler = setTimeout(() => {
            fetchBookedWorkshops();
        }, 300);

        return () => clearTimeout(handler);
    }, [activeTab, workshopPage, workshopLimit, workshopSearch, workshopSortBy]);

    const handleUpdateStatus = async (id: string, status: 'accepted' | 'rejected' | 'cancelled', amount?: number) => {
        try {
            const response = await updateEventBookingStatus(id, status, amount);
            // Backend returns: {success: true, data: {message, request} }
            const updatedRequest = response.data?.request;
            if (updatedRequest) {
                setRequests(prevRequests =>
                    prevRequests.map(req => req._id === id ? { ...req, status: updatedRequest.status } : req)
                );

                // Show notification based on status
                if (status === 'accepted') {
                    toast.success('Request accepted! 🎉');
                } else if (status === 'rejected') {
                    toast.error('Request rejected');
                } else if (status === 'cancelled') {
                    toast.success('Request cancelled');
                }
            }
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error('Failed to update request status');
        }
    };

    const [error, setError] = useState('');

    const handleAcceptClick = (id: string) => {
        setSelectedRequestId(id);
        setActionType('accept');
        setAcceptAmount(''); // Reset amount
        setError(''); // Reset error
        setModalOpen(true);

    };

    const handleDeclineClick = (id: string) => {
        setSelectedRequestId(id);
        setActionType('decline');
        setModalOpen(true);
    };

    const confirmAction = () => {
        if (selectedRequestId && actionType) {
            if (actionType === 'accept') {
                if (!acceptAmount) {
                    setError("Please enter an amount");
                    return;
                }

                const selectedRequest = requests.find(r => r._id === selectedRequestId);
                if (selectedRequest) {
                    let minBudget = 0;
                    let maxBudget = 0;
                    // Remove non-numeric characters except hyphen
                    const budgetStr = selectedRequest.budget.toString().replace(/[^0-9-]/g, '');

                    if (budgetStr.includes('-')) {
                        const parts = budgetStr.split('-');
                        if (parts.length === 2) {
                            minBudget = parseFloat(parts[0]);
                            maxBudget = parseFloat(parts[1]);
                        }
                    } else {
                        maxBudget = parseFloat(budgetStr);
                        // If single value, treat it as max (or potentially min depending on context, but usually "Budget: 5000" implies max limit)
                        // However user requested "between min and max". If single value, maybe strict equal? 
                        // Assuming single value is the MAX budget for now as per previous logic.
                    }

                    const amount = parseFloat(acceptAmount);

                    if (maxBudget > 0 && amount > maxBudget) {
                        setError(`Amount cannot exceed the budget of ₹${maxBudget}`);
                        // toast.error(`Amount cannot exceed the budget of ₹${maxBudget}`);
                        return;
                    }
                    if (minBudget > 0 && amount < minBudget) {
                        setError(`Amount must be at least ₹${minBudget}`);
                        return;
                    }
                }
            }

            const status = actionType === 'accept' ? 'accepted' : 'rejected';
            const amount = actionType === 'accept' ? parseFloat(acceptAmount) : undefined;

            handleUpdateStatus(selectedRequestId, status, amount);
            setModalOpen(false);
            setSelectedRequestId(null);
            setActionType(null);
            setAcceptAmount('');
            setError('');
        }
    };

    const handleViewMap = async (venue: string) => {
        setSelectedVenue(venue);
        setMapModalOpen(true);
        setLoadingCoords(true);

        try {
            // Geocode the venue address
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(venue)}&limit=1`
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

    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('page', currentPage.toString());
                params.append('limit', pageSize.toString());
                if (search) params.append('search', search);
                if (status) params.append('status', status);
                if (sortBy) params.append('sortBy', sortBy);

                const data = await getEventRequests(params);
                setRequests(data.requests || []);
                setTotalRequests(data.total || 0);
            } catch (error) {
                console.error("Failed to fetch requests", error);
            }
            setLoading(false);
        };

        const handler = setTimeout(() => {
            fetchRequests();
        }, 500); // Debounce search input

        return () => {
            clearTimeout(handler);
        };
    }, [currentPage, pageSize, search, status, sortBy]);

    useEffect(() => {
        const getProfile = async () => {
            try {
                const { profile } = await fetchMyProfile();
                setUser(profile.user);
            } catch (error) {
                console.error("Failed to fetch user profile", error);
            }
        };
        getProfile();
    }, []);

    return (
        <div className="flex-grow p-8 bg-deep-purple text-white overflow-y-auto">
            {/* ... header and tabs ... */}
            <UserNavbar title="Bookings Management" subTitle="Manage your client requests & workshop bookings" />
            <div className="flex border-b border-purple-700 mb-6">
                <button
                    className={`py-2 px-4 font-semibold ${activeTab === 'workshops' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400'}`}
                    onClick={() => {
                        setActiveTab('workshops');
                        const params = new URLSearchParams(searchParams);
                        params.set('tab', 'workshops');
                        setSearchParams(params);
                    }}
                >
                    Booked Workshops ({bookedWorkshops.length})
                </button>
                <button
                    className={`py-2 px-4 font-semibold ${activeTab === 'requests' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400'}`}
                    onClick={() => {
                        setActiveTab('requests');
                        const params = new URLSearchParams(searchParams);
                        params.set('tab', 'requests');
                        setSearchParams(params);
                    }}
                >
                    Client Event Requests ({requests.length})
                </button>
            </div>
            <div className="flex justify-between items-center mb-6">
                {activeTab === 'requests' ? (
                    <div className="relative w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                        <input type="text" placeholder="Search by event..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-purple-700 text-white placeholder-purple-300 rounded-lg py-2 pl-10 focus:outline-none" />
                        {search && <X className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 cursor-pointer" onClick={() => setSearch('')} />}
                    </div>
                ) : (
                    <div className="relative w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                        <input type="text" placeholder="Search by workshop..." value={workshopSearch} onChange={(e) => setWorkshopSearch(e.target.value)} className="w-full bg-purple-700 text-white placeholder-purple-300 rounded-lg py-2 pl-10 focus:outline-none" />
                        {workshopSearch && <X className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 cursor-pointer" onClick={() => setWorkshopSearch('')} />}
                    </div>
                )}
                <div className="flex items-center space-x-4">
                    {activeTab === 'requests' ? (
                        <>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-purple-700 text-white rounded-lg py-2 px-4 focus:outline-none">
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <div className="flex items-center">
                                <span className="text-gray-400 mr-2">Sort by:</span>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-purple-700 text-white rounded-lg py-2 px-4 focus:outline-none">
                                    <option value="date">Sort by Date</option>
                                    <option value="budget">Sort by Budget</option>
                                </select>
                            </div>
                        </>
                    ) : (
                        <select
                            value={workshopSortBy}
                            onChange={(e) => setWorkshopSortBy(e.target.value)}
                            className="bg-[#a855f7] text-white px-4 py-2 rounded-lg focus:outline-none"
                        >
                            <option value="startDate">Sort by Date</option>
                            <option value="fee">Sort by Price</option>
                            <option value="title">Sort by Title</option>
                        </select>
                    )}
                </div>
            </div>
            <div className="space-y-4">
                {loading ? (
                    <p>Loading...</p>
                ) : activeTab === 'requests' ? (
                    requests.length > 0 ? (
                        requests.map(req => <RequestCard key={req._id} request={req} onAcceptClick={handleAcceptClick} onDeclineClick={handleDeclineClick} onViewMap={handleViewMap} />)
                    ) : (
                        <p>No client requests found.</p>
                    )
                ) : (
                    bookedWorkshops.length > 0 ? (
                        <UserTable
                            data={bookedWorkshops}
                            variant="dancer-workshop"
                            onView={(workshop) => {
                                // Using default workshop card navigation logic
                                // Need to ensure state is passed if required by WorkshopDetails page
                                // The original code passed state: { isRegistered: true, paymentStatus: workshop.userParticipant.paymentStatus }
                                navigate(`/workshop/${workshop._id}`, {
                                    state: {
                                        isRegistered: true,
                                        paymentStatus: workshop.userParticipant?.paymentStatus
                                    }
                                });
                            }}
                        />
                    ) : (
                        <p>No booked workshops found.</p>
                    )
                )}
            </div>

            {/* Pagination */}
            <div className='flex justify-between items-center mt-8 space-x-4'>
                {activeTab === 'requests' ? (
                    <div className="flex justify-end items-center mt-8 space-x-4">
                        <h3>Showing {requests.length} of {totalRequests} requests</h3>
                    </div>
                ) : (
                    <div className="flex justify-end items-center mt-8 space-x-4">
                        <h3>Showing {bookedWorkshops.length} of {bookedWorkshops.length} bookings</h3>
                    </div>
                )}

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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-purple-900 rounded-2xl p-6 max-w-md w-full border border-purple-500/30 shadow-2xl">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                                <h3 className="text-xl font-bold text-white">
                                    {actionType === 'accept' ? 'Confirm Acceptance' : 'Confirm Decline'}
                                </h3>
                            </div>
                            <button
                                onClick={() => {
                                    setModalOpen(false);
                                    setActionType(null);
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <p className="text-gray-300 mb-6">
                            {actionType === 'accept'
                                ? 'Please confirm the agreed amount for this event.'
                                : 'Are you sure you want to decline this booking request?'}
                        </p>

                        {actionType === 'accept' && (
                            <div className="mb-6">
                                {(() => {
                                    const selectedRequest = requests.find(r => r._id === selectedRequestId);
                                    return selectedRequest ? (
                                        <>
                                            <h2 className="text-lg font-semibold text-white mb-2">Budget : {selectedRequest.budget}</h2>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Agreed Amount (₹)</label>
                                            <input
                                                type="number"
                                                placeholder="Enter amount"
                                                value={acceptAmount}
                                                onChange={(e) => {
                                                    setAcceptAmount(e.target.value);
                                                    if (error) setError('');
                                                }}
                                                className={`w-full bg-purple-800 border ${error ? 'border-red-500' : 'border-purple-600'} rounded-lg py-2 px-3 text-white focus:outline-none focus:border-purple-400`}
                                            />
                                            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
                                        </>

                                    ) : null;
                                })()}
                            </div>
                        )}

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setModalOpen(false);
                                    setActionType(null);
                                }}
                                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                className={`px-6 py-2 text-white rounded-lg transition-colors font-semibold ${actionType === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {actionType === 'accept' ? 'Confirm' : 'Decline'}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
            {/* Map Modal ... */}
            {
                mapModalOpen && (
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
                    // <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    //     <div className="bg-purple-800 rounded-lg p-6 w-full max-w-md mx-4">
                    //         <h2 className="text-xl font-bold text-white mb-4">Confirm Acceptance</h2>
                    //         <p className="text-gray-300 mb-6">Are you sure you want to accept this booking request?</p>
                    //         <div className="flex justify-end space-x-4">
                    //             <button onClick={() => setModalOpen(false)} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">Cancel</button>
                    //             <button onClick={confirmAccept} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">Confirm</button>
                    //         </div>
                    //     </div>
                    // </div>
                )
            }
        </div >
    );
};

const BookingsDancer = () => {
    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar activeMenu='Bookings' />
            <BookingsPage />
        </div>
    );
};

export default BookingsDancer;