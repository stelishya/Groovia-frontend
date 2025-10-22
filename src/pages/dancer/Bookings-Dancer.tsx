

import React, { useEffect, useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { getEventRequests } from '../../services/dancer/dancer.service';
import Sidebar from '../../components/shared/Sidebar';

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

const RequestCard = ({ request }: { request: EventRequest }) => (
    <div className="bg-purple-800 rounded-lg p-4 flex justify-between items-center">
        <div className="flex items-center">
            <img src={request.clientId.profileImage || 'https://i.pravatar.cc/40'} alt={request.clientId.username} className="w-12 h-12 rounded-full mr-4" />
            <div>
                <h3 className="font-bold text-white">{request.clientId.username}</h3>
                <p className="text-sm text-gray-400">{request.event}</p>
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
                        <button className="bg-green-500 text-white px-3 py-1 rounded-md text-sm">Accept</button>
                        <button className="bg-red-500 text-white px-3 py-1 rounded-md text-sm">Decline</button>
                    </>
                )}
                {request.status === 'accepted' && (
                    <>
                        <button className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm">View Details</button>
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

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await getEventRequests();
                setRequests(data.requests || []);
            } catch (error) {
                console.error("Failed to fetch requests", error);
            }
            setLoading(false);
        };
        fetchRequests();
    }, []);

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
                    <input type="text" placeholder="Search Requests..." className="w-full bg-purple-700 text-white placeholder-purple-300 rounded-lg py-2 pl-10 focus:outline-none" />
                </div>
                <div className="flex items-center space-x-4">
                    <select className="bg-purple-700 text-white rounded-lg py-2 px-4 focus:outline-none">
                        <option>All Status</option>
                        <option>Pending</option>
                        <option>Accepted</option>
                        <option>Rejected</option>
                    </select>
                    <div className="flex items-center">
                        <span className="text-gray-400 mr-2">Sort by:</span>
                        <button className="bg-purple-600 text-white py-2 px-4 rounded-lg">Date (Newest)</button>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                {loading ? (
                    <p>Loading requests...</p>
                ) : requests.length > 0 ? (
                    requests.map(req => <RequestCard key={req._id} request={req} />)
                ) : (
                    <p>No client requests found.</p>
                )}
            </div>
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