

import React, { useEffect, useState } from 'react';
import { Search, Bell, X } from 'lucide-react';
import { getEventRequests } from '../../services/dancer/dancer.service';
import Sidebar from '../../components/shared/Sidebar';
import { updateEventBookingStatus } from '../../services/client/client.service';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

interface Client {
    _id: string;
    username: string;
    profileImage?: string;
}

interface EventRequest {
    _id: string;
    clientId: Client;
    event: string;
    date: string;
    venue: string;
    budget: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
}


const Header = () => (
    <header className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-white">Bookings Management</h1>
            <p className="text-gray-400">Manage your client requests & workshop bookings</p>
        </div>
        <div className="flex items-center space-x-4">
            <Bell className="text-white" />
            <img src="https://i.pravatar.cc/40?img=33" alt="User" className="w-10 h-10 rounded-full" />
        </div>
    </header>
);

const RequestCard = ({ request, onAcceptClick }: { request: EventRequest, onAcceptClick: (id: string) => void }) => (
    <div className="bg-purple-800 rounded-lg p-4 flex justify-between items-center">
        <div className="flex items-center">
            <img src={request.clientId.profileImage || 'https://i.pravatar.cc/40'} alt={request.clientId.username} className="w-12 h-12 rounded-full mr-4" />
            <div>
                <h3 className="font-bold text-white">{request.clientId.username}</h3>
                <p className="text-sm text-gray-400">{request.event}</p>
                <p className="text-sm text-gray-400">{request.venue}</p>
                <p className="text-sm text-gray-400">{new Date(request.date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-400">Budget: {request.budget}</p>
            </div>
        </div>
        <div className="flex flex-col items-end">
            <span className={`text-xs px-2 py-1 rounded-full mb-2 ${request.status === 'pending' ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white'}`}>
                {request.status}
            </span>
            <div className="flex space-x-2">
                {request.status === 'pending' && (
                    <>
                        <button onClick={() => onAcceptClick(request._id)} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm">Accept</button>
                        <button className="bg-red-500 text-white px-3 py-1 rounded-md text-sm">Decline</button>
                    </>
                )}
                {request.status === 'accepted' && (
                    <>
                        <button className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm">Send Payment Request</button>
                        <button className="bg-purple-500 text-white px-3 py-1 rounded-md text-sm">Message</button>
                    </>
                )}
            </div>
        </div>
    </div>
);

const BookingsPage = () => {
    const [requests, setRequests] = useState<EventRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalRequests, setTotalRequests] = useState(0);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

    const handleUpdateStatus = async (id: string, status: 'accepted' | 'rejected' | 'cancelled') => {
        try {
            const updatedRequest = await updateEventBookingStatus(id, status);
            setRequests(prevRequests => 
                prevRequests.map(req => req._id === id ? { ...req, status: updatedRequest.request.status } : req)
            );
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleAcceptClick = (id: string) => {
        setSelectedRequestId(id);
        setModalOpen(true);
    };

    const confirmAccept = () => {
        if (selectedRequestId) {
            handleUpdateStatus(selectedRequestId, 'accepted');
        }
        setModalOpen(false);
        setSelectedRequestId(null);
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

    return (
        <div className="flex-grow p-8 bg-deep-purple text-white overflow-y-auto">
            <Header />
            <div className="flex border-b border-purple-700 mb-6">
                <button className="py-2 px-4 text-white border-b-2 border-purple-500 font-semibold">Client Requests ({requests.length})</button>
                <button className="py-2 px-4 text-gray-400">Booked Workshops (0)</button>
            </div>
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-1/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                    <input type="text" placeholder="Search by event..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-purple-700 text-white placeholder-purple-300 rounded-lg py-2 pl-10 focus:outline-none" />
                    {search && <X className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 cursor-pointer" onClick={() => setSearch('')} />}
                </div>
                <div className="flex items-center space-x-4">
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
                </div>
            </div>
            <div className="space-y-4">
                {loading ? (
                    <p>Loading requests...</p>
                ) : requests.length > 0 ? (
                    requests.map(req => <RequestCard key={req._id} request={req} onAcceptClick={handleAcceptClick} />)
                ) : (
                    <p>No client requests found.</p>
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-end items-center mt-8 space-x-4">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <span className="text-white">Page {currentPage} of {Math.ceil(totalRequests / pageSize)}</span>
                <button 
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage >= Math.ceil(totalRequests / pageSize)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
            {modalOpen && (
                <ConfirmationModal
                show={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={confirmAccept}
                title="Confirm Acceptance"
                message="Are you sure you want to accept this booking request?"
                />
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
            )}
        </div>
    );
};

const BookingsDancer = () => {
    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar activeMenu='Bookings'/>
            <BookingsPage />
        </div>
    );
};

export default BookingsDancer;