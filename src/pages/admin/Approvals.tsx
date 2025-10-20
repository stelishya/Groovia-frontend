import { useState, useEffect } from 'react';
import { Crown, Check, X, Calendar, Mail, User as UserIcon, MapPin, Award, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface UpgradeRequest {
    _id: string;
    username: string;
    email: string;
    danceStyles: string[];
    experienceYears: number;
    bio: string;
    portfolioLinks?: string;
    certificateUrl?: string;
    availableForWorkshops: boolean;
    preferredLocation?: string;
    additionalMessage?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

const Approvals = () => {
    const [requests, setRequests] = useState<UpgradeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<UpgradeRequest | null>(null);
    const [adminNote, setAdminNote] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const endpoint = filter === 'pending' 
                ? 'http://localhost:5000/users/upgrade-requests/pending'
                : 'http://localhost:5000/users/upgrade-requests';
            
            const response = await axios.get(endpoint);
            const data = filter === 'all' ? response.data : response.data.filter((r: UpgradeRequest) => r.status === filter);
            setRequests(data);
        } catch (error) {
            toast.error('Failed to fetch upgrade requests');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await axios.patch(`http://localhost:5000/users/upgrade-requests/${id}/approve`, {
                adminNote
            });
            toast.success('Request approved! User upgraded to instructor role.', {
                duration: 5000,
                style: {
                    background: '#D1FAE5',
                    color: '#059669',
                }
            });
            setSelectedRequest(null);
            setAdminNote('');
            fetchRequests();
        } catch (error) {
            toast.error('Failed to approve request');
            console.error(error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await axios.patch(`http://localhost:5000/users/upgrade-requests/${id}/reject`, {
                adminNote
            });
            toast.success('Request rejected', {
                duration: 3000,
            });
            setSelectedRequest(null);
            setAdminNote('');
            fetchRequests();
        } catch (error) {
            toast.error('Failed to reject request');
            console.error(error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Crown className="text-yellow-500 mr-3" size={32} />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Instructor Upgrade Requests</h1>
                                <p className="text-gray-600">Review and approve dancer upgrade requests</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                                        filter === f
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Requests List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <Crown className="text-gray-400 mx-auto mb-4" size={64} />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Requests Found</h3>
                        <p className="text-gray-500">There are no {filter} upgrade requests at the moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {requests.map((request) => (
                            <div key={request._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                                            <UserIcon className="text-purple-600" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">{request.username}</h3>
                                            <p className="text-gray-600 flex items-center">
                                                <Mail size={16} className="mr-1" />
                                                {request.email}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(request.status)}`}>
                                        {request.status}
                                    </span>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1 flex items-center">
                                            <Award size={16} className="mr-1" />
                                            Experience
                                        </p>
                                        <p className="font-semibold">{request.experienceYears} years</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1 flex items-center">
                                            <Calendar size={16} className="mr-1" />
                                            Requested On
                                        </p>
                                        <p className="font-semibold">{new Date(request.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-2">Dance Styles:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {request.danceStyles.map((style, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                                {style}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-1">Bio:</p>
                                    <p className="text-gray-800">{request.bio}</p>
                                </div>

                                {request.preferredLocation && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 mb-1 flex items-center">
                                            <MapPin size={16} className="mr-1" />
                                            Preferred Location
                                        </p>
                                        <p className="font-semibold">{request.preferredLocation}</p>
                                    </div>
                                )}

                                {request.portfolioLinks && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 mb-1">Portfolio Links:</p>
                                        <p className="text-blue-600">{request.portfolioLinks}</p>
                                    </div>
                                )}

                                {request.certificateUrl && (
                                    <div className="mb-4">
                                        <a 
                                            href={`http://localhost:5000${request.certificateUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline flex items-center"
                                        >
                                            <Award size={16} className="mr-1" />
                                            View Certificate
                                        </a>
                                    </div>
                                )}

                                {request.additionalMessage && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Additional Message:</p>
                                        <p className="text-gray-800 italic">"{request.additionalMessage}"</p>
                                    </div>
                                )}

                                {request.status === 'pending' && (
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={() => setSelectedRequest(request)}
                                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center transition-colors"
                                        >
                                            <Check size={18} className="mr-2" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedRequest(request);
                                                setAdminNote('');
                                            }}
                                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center transition-colors"
                                        >
                                            <X size={18} className="mr-2" />
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                            {selectedRequest.status === 'pending' ? 'Confirm Action' : 'Add Note'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to {selectedRequest.status === 'pending' ? 'process' : 'update'} this request for <strong>{selectedRequest.username}</strong>?
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Note (Optional)
                            </label>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                rows={3}
                                placeholder="Add a note for the user..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setSelectedRequest(null);
                                    setAdminNote('');
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleApprove(selectedRequest._id)}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleReject(selectedRequest._id)}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Approvals;