import { useState, useEffect } from 'react';
import { Crown, Check, X, Calendar, Mail, User as UserIcon, MapPin, Award, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/admin/Sidebar';
import { UserAxios } from '../../api/user.axios';

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
    paymentStatus: 'pending' | 'paid';
    createdAt: string;
}

const Approvals = () => {
    const [requests, setRequests] = useState<UpgradeRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<UpgradeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<UpgradeRequest | null>(null);
    const [adminNote, setAdminNote] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    useEffect(() => {
        // Filter requests based on search query
        const filtered = requests.filter(request =>
            request.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.danceStyles.some(style => style.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredRequests(filtered);
        setCurrentPage(1); // Reset to first page when search changes
    }, [searchQuery, requests]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const endpoint = filter === 'pending'
                ? '/upgrade-requests/pending'
                : '/upgrade-requests';

            const response = await UserAxios.get(endpoint);
            const data = filter === 'all' ? response.data : response.data.filter((r: UpgradeRequest) => r.status === filter);
            setRequests(data);
            setFilteredRequests(data);
        } catch (error) {
            toast.error('Failed to fetch upgrade requests');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

    const handleApprove = async (id: string) => {
        try {
            const response = await UserAxios.patch(`/upgrade-requests/${id}/approve`, {
                adminNote
            });
            console.log("Approve response", response.data);
            toast.success('Request approved!', {
                duration: 5000,
                style: {
                    background: '#D1FAE5',
                    color: '#059669',
                }
            });
            setSelectedRequest(null);
            setAdminNote('');
            setActionType(null);
            fetchRequests();
        } catch (error) {
            toast.error('Failed to approve request');
            console.error(error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await UserAxios.patch(`/upgrade-requests/${id}/reject`, {
                adminNote
            });
            toast.success('Request rejected', {
                duration: 3000,
            });
            setSelectedRequest(null);
            setAdminNote('');
            setActionType(null);
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
        <div className="flex h-screen bg-[#0B1120]">
            <Sidebar />
            <div className="flex-1 ml-64 overflow-y-auto">
                <div className="min-h-screen p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="bg-[#1a2332] rounded-lg shadow-md border border-gray-800 p-6 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Crown className="text-yellow-500 mr-3" size={32} />
                                    <div>
                                        <h1 className="text-3xl font-bold text-white">Instructor Upgrade Requests</h1>
                                        <p className="text-gray-400">Review and approve dancer upgrade requests</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${filter === f
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="bg-[#1a2332] rounded-lg shadow-md border border-gray-800 p-4 mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by username, email, or dance style..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                />
                                {searchQuery && <X className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" size={20} onClick={() => setSearchQuery('')} />}
                            </div>
                        </div>

                        {/* Requests List */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-4 text-gray-400">Loading requests...</p>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="bg-[#1a2332] rounded-lg shadow-md border border-gray-800 p-12 text-center">
                                <Crown className="text-gray-600 mx-auto mb-4" size={64} />
                                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Requests Found</h3>
                                {/* <p className="text-gray-500">There are no {filter} upgrade requests at the moment.</p> */}
                                <p className="text-gray-500">{searchQuery ? 'No requests match your search criteria.' : `There are no ${filter} upgrade requests at the moment.`}</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {currentRequests.map((request) => (
                                    <div key={request._id} className="bg-[#1a2332] rounded-lg shadow-md border border-gray-800 p-6 hover:shadow-lg hover:border-blue-600/50 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mr-4">
                                                    <UserIcon className="text-blue-400" size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">{request.username}</h3>
                                                    <p className="text-gray-400 flex items-center">
                                                        <Mail size={16} className="mr-1" />
                                                        {request.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </div>

                                        {/* First Row: Experience | Requested On */}
                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-sm text-gray-400 mb-1 flex items-center">
                                                    <Award size={16} className="mr-1" />
                                                    Experience
                                                </p>
                                                <p className="font-semibold text-white">{request.experienceYears} years</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400 mb-1 flex items-center">
                                                    <Calendar size={16} className="mr-1" />
                                                    Requested On
                                                </p>
                                                <p className="font-semibold text-white">{new Date(request.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        {/* Second Row: Dance Styles | Bio */}
                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-sm text-gray-400 mb-2">Dance Styles:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {request.danceStyles.map((style, idx) => (
                                                        <span key={idx} className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                                                            {style}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400 mb-2">Bio:</p>
                                                <p className="text-gray-300">{request.bio}</p>
                                            </div>
                                        </div>


                                        {request.preferredLocation && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-400 mb-1 flex items-center">
                                                    <MapPin size={16} className="mr-1" />
                                                    Preferred Location
                                                </p>
                                                <p className="font-semibold text-white">{request.preferredLocation}</p>
                                            </div>
                                        )}

                                        {request.portfolioLinks && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-400 mb-1">Portfolio Links:</p>
                                                <p className="text-blue-400">{request.portfolioLinks}</p>
                                            </div>
                                        )}

                                        {request.certificateUrl && (
                                            <div className="mb-4">
                                                <a
                                                    href={`http://localhost:5000${request.certificateUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 hover:underline flex items-center"
                                                >
                                                    <Award size={16} className="mr-1" />
                                                    View Certificate
                                                </a>
                                            </div>
                                        )}

                                        {request.additionalMessage && (
                                            <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                                                <p className="text-sm text-gray-400 mb-1">Additional Message:</p>
                                                <p className="text-gray-300 italic">"{request.additionalMessage}"</p>
                                            </div>
                                        )}

                                        {request.status === 'pending' && (
                                            <div className="flex gap-3 mt-4">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setActionType('approve');
                                                    }}
                                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center transition-colors"
                                                >
                                                    <Check size={18} className="mr-2" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setActionType('reject');
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

                        {/* Pagination */}
                        {!loading && filteredRequests.length > 0 && (
                            <div className="flex justify-between items-center mt-6">
                                <div className="text-gray-400 text-sm">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRequests.length)} of {filteredRequests.length} requests
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-white px-4">
                                        Page {currentPage} of {Math.max(1, totalPages)}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Moda l */}

            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                            {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to {actionType} this request for <strong>{selectedRequest.username}</strong>?
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
                                    setActionType(null);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            {actionType === 'approve' ? (
                                <button
                                    onClick={() => handleApprove(selectedRequest._id)}
                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Approve
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleReject(selectedRequest._id)}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Reject
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            )}
        </div>
    );
};

export default Approvals;