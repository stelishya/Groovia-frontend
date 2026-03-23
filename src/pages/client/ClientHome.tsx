import { Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useSelector } from "react-redux";
import { type RootState } from "../../redux/store";
import DancerCard from "../../components/ui/Card";
import FormModal from "../../components/ui/FormModal";
import VenueMap from "../../components/ui/VenueMap";
import { GitPullRequest } from "lucide-react";
import { useEffect, useState } from "react";
import getAllDancers, { sendRequestToDancers } from "../../services/client/browseDancers.service";
import { toggleLike } from "../../services/dancer/dancer.service";
import { getClientEventRequests } from '../../services/client/client.service';
import toast from "react-hot-toast";
import { DanceStyles } from "../../utils/constants/danceStyles";
import CustomSelect from "../../components/ui/CustomSelect";

interface Dancer {
    _id: string;
    username: string;
    profileImage?: string;
    bio?: string;
    danceStyles?: string[];
    likes?: string[];
    likesCount?: number;
    createdAt: string;
    updatedAt: string;
}

interface EventRequest {
    _id: string;
    dancerId: {
        _id: string;
        username: string;
        profileImage?: string;
    } | null;
}

const Dashboard = ({ userData }: { userData: any }) => {
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 6;
    const [totalDancers, setTotalDancers] = useState(0);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('likes');
    const [style, setStyle] = useState('');
    const [, setLoading] = useState(true)
    const [dancers, setDancers] = useState<Dancer[]>([])
    const [selectedDancer, setSelectedDancer] = useState<Dancer | null>(null)
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestData, setRequestData] = useState({
        event: '',
        date: '',
        venue: '',
        budget: '',
    });
    const [formErrors, setFormErrors] = useState({
        event: '',
        date: '',
        venue: '',
        budget: '',
    });
    const [requestedDancerIds, setRequestedDancerIds] = useState(new Set<string>());
    const [likedDancers, setLikedDancers] = useState(new Set<string>());
    const [showVenueMap, setShowVenueMap] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchDancers();
        }, 500);
        return () => clearTimeout(handler);
    }, [search, style, currentPage, sortBy]);

    const fetchSentRequests = async () => {
        try {
            const response: { success: boolean; data?: { requests: EventRequest[] } } = await getClientEventRequests(new URLSearchParams);
            if (response.success && response.data && Array.isArray(response.data.requests)) {
                const ids = new Set(
                    response.data.requests
                        .map((req: EventRequest) => req.dancerId?._id)
                        .filter((id): id is string => Boolean(id))
                );
                setRequestedDancerIds(ids);
            }
        } catch (error) {
            console.error("Failed to fetch sent requests:", error);
        }
    };

    useEffect(() => {
        fetchSentRequests();
    }, []);

    const fetchDancers = async (): Promise<void> => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (style) params.append('danceStyle', style);
            if (sortBy) params.append('sortBy', sortBy);
            params.append('page', currentPage.toString());

            const response = await getAllDancers(params);
            if (response.success && response.data) {
                setDancers(response.data.dancers || []);
                setTotalDancers(response.data.total || 0);

                const liked = new Set<string>();
                response.data.dancers.forEach((dancer: Dancer) => {
                    if (dancer.likes?.includes(userData?._id)) {
                        liked.add(dancer._id);
                    }
                });
                setLikedDancers(liked);
            }
        } catch (error) {
            console.error("error in fetchDancers:", error)
            setDancers([]);
        }
    }

    const handleCloseRequestModal = () => {
        setIsRequestModalOpen(false);
        setSelectedDancer(null);
        setFormErrors({ event: '', date: '', venue: '', budget: '' });
    };

    const validateForm = () => {
        const errors = { event: '', date: '', venue: '', budget: '' };
        let isValid = true;

        if (!requestData.event.trim()) {
            errors.event = 'Event name is required';
            isValid = false;
        }

        if (!requestData.date) {
            errors.date = 'Event date is required';
            isValid = false;
        } else {
            const selectedDate = new Date(requestData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate <= today) {
                errors.date = 'Event date must be in the future';
                isValid = false;
            }
        }

        if (!requestData.venue.trim()) {
            errors.venue = 'Venue is required';
            isValid = false;
        }

        if (!requestData.budget.trim()) {
            errors.budget = 'Budget is required';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleConfirmSend = async () => {
        try {
            if (!selectedDancer || !validateForm()) return;

            const response = await sendRequestToDancers(selectedDancer._id, requestData);
            setRequestedDancerIds(prevIds => new Set(prevIds).add(selectedDancer._id));
            handleCloseRequestModal();
            fetchSentRequests();
            if (response.success) {
                toast.success(`Event request sent to ${selectedDancer.username}! 🎉`);
            } else {
                toast.error(response.data?.message || 'Failed to send request');
            }
        } catch (error) {
            console.error("Send request failed", error);
            toast.error('Failed to send event request');
        }
    };

    const handleLike = async (dancerId: string) => {
        try {
            const response = await toggleLike(dancerId);
            const { likesCount, isLiked } = response.data;

            setDancers(prevDancers =>
                prevDancers.map(d => (d._id === dancerId ? { ...d, likesCount, likes: new Array(likesCount).fill(null) } : d))
            );

            setLikedDancers(prevLiked => {
                const newLiked = new Set(prevLiked);
                if (isLiked) newLiked.add(dancerId); else newLiked.delete(dancerId);
                return newLiked;
            });
        } catch (error) {
            console.error("Failed to toggle like", error);
            toast.error('Failed to update like status');
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12">
                <h1 className="text-5xl font-light leading-tight uppercase">Book, Track, Enjoy – <br /> All In One Platform</h1>
                <p className="text-gray-400 mt-4 max-w-lg">Your ultimate destination for dance education, competitive showcases, and community engagement.</p>
            </div>

            <div className="min-h-screen mt-12  p-6">
                <h1 className="text-3xl font-semibold  mb-8 text-purple-500/70">💃🏻 Browse Dancers</h1>

                <div className="flex flex-wrap justify-between gap-4 mb-8">
                    <div className="relative w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                        <input
                            type="text"
                            placeholder="Search dancers..."
                            className="border border-purple-300 bg-purple-700 rounded-lg px-4 py-2 pl-10 w-full focus:ring-2 focus:ring-blue-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && <X className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 cursor-pointer" onClick={() => setSearch('')} />}
                    </div>
                    <div className="relative space-x-4">
                        <CustomSelect
                            options={Object.values(DanceStyles)}
                            value={style}
                            onChange={(val) => setStyle(val)}
                            placeholder="All Styles"
                            className="min-w-[160px]"
                        />

                        <select
                            className="border border-purple-300 bg-purple-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="likes">Sort by Likes</option>
                            <option value="name">Sort by Name</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {dancers.length > 0 ? (
                        dancers.map((dancer) => (
                            <DancerCard
                                key={dancer._id}
                                dancer={dancer}
                                isRequested={requestedDancerIds.has(dancer._id)}
                                onLike={handleLike}
                                isLiked={likedDancers.has(dancer._id)}
                            />
                        ))
                    ) : (
                        <p className="text-center col-span-full text-gray-500 fontSize-2xl">No dancers found 😢</p>
                    )}
                </div>

                <div className='flex justify-between items-center mt-8 space-x-4'>
                    {dancers.length > 0 && (
                        <>
                            <div className="flex justify-start items-center mt-8 space-x-4">
                                <h3>Showing {dancers.length} of {totalDancers} dancers</h3>
                            </div>
                            <div className="flex justify-end items-center mt-8 space-x-4">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft />
                                </button>
                                <span className="text-white">Page {currentPage} of {Math.ceil(totalDancers / pageSize)}</span>
                                <button
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={currentPage >= Math.ceil(totalDancers / pageSize)}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {selectedDancer && (
                <FormModal
                    isOpen={isRequestModalOpen}
                    onClose={handleCloseRequestModal}
                    title={`Send Request to ${selectedDancer.username}`}
                    icon={<GitPullRequest className="text-purple-300" size={32} />}
                    onSubmit={handleConfirmSend}
                    submitText="Send Request"
                    submitButtonClass="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                    <div>
                        <label className="block text-white font-medium mb-2">Event</label>
                        <input
                            type="text"
                            value={requestData.event}
                            onChange={(e) => setRequestData({ ...requestData, event: e.target.value })}
                            className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${formErrors.event ? 'border-2 border-red-500' : ''}`}
                            placeholder="Event Name"
                        />
                        {formErrors.event && <p className="text-red-400 text-sm mt-1">{formErrors.event}</p>}
                    </div>
                    <div>
                        <label className="block text-white font-medium mb-2">Date</label>
                        <input
                            type="date"
                            value={requestData.date}
                            min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                            onChange={(e) => setRequestData({ ...requestData, date: e.target.value })}
                            className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${formErrors.date ? 'border-2 border-red-500' : ''}`}
                        />
                        {formErrors.date && <p className="text-red-400 text-sm mt-1">{formErrors.date}</p>}
                    </div>
                    <div>
                        <label className="block text-white font-medium mb-2">Venue</label>
                        <input
                            type="text"
                            value={requestData.venue}
                            onChange={(e) => setRequestData({ ...requestData, venue: e.target.value })}
                            className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${formErrors.venue ? 'border-2 border-red-500' : ''}`}
                            placeholder="Enter venue address"
                            readOnly={showVenueMap}
                        />
                        {formErrors.venue && <p className="text-red-400 text-sm mt-1">{formErrors.venue}</p>}
                        <button type="button" onClick={() => setShowVenueMap(!showVenueMap)} className="mt-2 text-purple-300 hover:text-purple-100 text-sm underline">
                            {showVenueMap ? 'Hide Map' : 'Select from Map'}
                        </button>
                        {showVenueMap && (
                            <div className="mt-3">
                                <VenueMap
                                    onVenueSelect={(venue) => setRequestData({ ...requestData, venue: venue.address })}
                                    initialCenter={[20.5937, 78.9629]}
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-white font-medium mb-2">Budget Range (₹)</label>
                        <div className="flex space-x-4">
                            <input
                                type="number"
                                value={requestData.budget}
                                onChange={(e) => setRequestData({ ...requestData, budget: e.target.value })}
                                className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${formErrors.budget ? 'border-2 border-red-500' : ''}`}
                                placeholder="Enter budget"
                            />
                        </div>
                        {formErrors.budget && <p className="text-red-400 text-sm mt-1">{formErrors.budget}</p>}
                    </div>
                </FormModal>
            )}
        </div>
    );
};

export default function Home() {
    const { userData } = useSelector((state: RootState) => state.user);
    return <Dashboard userData={userData} />;
}