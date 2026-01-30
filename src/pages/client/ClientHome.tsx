import { Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { GitPullRequest } from "lucide-react";
import { type RootState } from "../../redux/store";
import DancerCard from "../../components/ui/Card";
import FormModal from "../../components/ui/FormModal";
import VenueMap from "../../components/ui/VenueMap";
import getAllDancers, { sendRequestToDancers } from "../../services/client/browseDancers.service";
import { toggleLike } from "../../services/dancer/dancer.service";
import { getClientEventRequests } from '../../services/client/client.service';
import { DanceStyles } from "../../utils/constants/danceStyles";
import CustomSelect from "../../components/ui/CustomSelect";
import type { Dancer, EventRequests } from "../../types/event.types";

const Dashboard = ({ userData }: { userData: any }) => {
    console.log("Client Dashboard loaded")

    const [currentPage, setCurrentPage] = useState(1)
    // const [pageSize, setPageSize] = useState(1)
    const pageSize = 6;
    const [totalDancers, setTotalDancers] = useState(0);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('likes');
    const [style, setStyle] = useState('');
    // const [city, setCity] = useState('');
    const [, setLoading] = useState(true)
    const [dancers, setDancers] = useState<Dancer[]>([])
    const [selectedDancer, setSelectedDancer] = useState<Dancer | null>(null)
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestData, setRequestData] = useState({
        event: '',
        date: '',
        venue: '',
        budget: '',
        duration: '',
    });
    const [formErrors, setFormErrors] = useState({
        event: '',
        date: '',
        venue: '',
        budget: '',
        duration: '',
    });
    const [requestedDancerIds, setRequestedDancerIds] = useState(new Set<string>());
    const [likedDancers, setLikedDancers] = useState(new Set<string>());
    const [showVenueMap, setShowVenueMap] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchDancers();
        }, 500); // Debounce search input

        return () => {
            clearTimeout(handler);
        };
    }, [search, style, currentPage, sortBy]);

    const fetchSentRequests = async () => {
        try {
            // const data:{requests:EventRequest[]} = await getClientEventRequests(new URLSearchParams);
            // if (data.requests) {
            //     const ids = new Set(data.requests.map(req => req.dancerId._id));
            const response: { success: boolean; data?: { requests: EventRequests[] } } = await getClientEventRequests(new URLSearchParams);
            console.log("response in fetchSentRequests in ClientHome.tsx", response)
            if (response.success && response.data && Array.isArray(response.data.requests)) {
                const ids = new Set(
                    response.data.requests
                        .map((req: EventRequests) => req.dancerId?._id)
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
            // params.append('limit', pageSize.toString());
            console.log("params", params)

            const response = await getAllDancers(params);
            console.log("response in fetchDancers in ClientHome.tsx", response)
            if (response.success && response.data) {
                setDancers(response.data.dancers || []);
                setTotalDancers(response.data.total || 0);
                console.log("totalDancers", response.data.total)

                // Update liked dancers set
                const liked = new Set<string>();
                response.data.dancers.forEach((dancer: Dancer) => {
                    if (dancer.likes?.includes(userData?._id)) {
                        liked.add(dancer._id);
                    }
                });
                setLikedDancers(liked);
            }
        } catch (error) {
            console.log("error in fetchDancers in ClientHome.tsx", error)
            setDancers([]);
        }
    }

    const handleCloseRequestModal = () => {
        setIsRequestModalOpen(false);
        setSelectedDancer(null);
        setFormErrors({
            event: '',
            date: '',
            venue: '',
            budget: '',
            duration: '',
        });
    };

    const validateForm = () => {
        const errors = {
            event: '',
            date: '',
            venue: '',
            budget: '',
            duration: '',
        };
        let isValid = true;

        // Validate event
        if (!requestData.event.trim()) {
            errors.event = 'Event name is required';
            isValid = false;
        }

        // Validate duration
        if (!requestData.duration.trim()) {
            errors.duration = 'Duration is required';
            isValid = false;
        }

        // Validate date
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

        // Validate venue
        if (!requestData.venue.trim()) {
            errors.venue = 'Venue is required';
            isValid = false;
        }

        // Validate budget
        if (!requestData.budget.trim()) {
            errors.budget = 'Budget is required';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleConfirmSend = async () => {
        try {
            if (!selectedDancer) return;

            // Validate form before sending
            if (!validateForm()) {
                return;
            }

            console.log(`Sending request to ${selectedDancer.username} with data:`, requestData);
            // API call
            const response = await sendRequestToDancers(selectedDancer._id, {
                ...requestData,
                dancerId: selectedDancer._id
            });
            console.log("response of sendRequestToDancers in ClientHome.tsx", response)
            // add the dancer's ID to the set of requested dancers
            setRequestedDancerIds(prevIds => new Set(prevIds).add(selectedDancer._id));
            handleCloseRequestModal();
            fetchSentRequests(); // refetch requests to ensure UI is up-to-date
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
            const updatedDancer = response.data?.dancer || response.dancer;
            if (!updatedDancer) {
                console.log("no dancer data in response")
                toast.error('Failed to update like status');
                return;
            }
            setDancers(prevDancers =>
                prevDancers.map(d => (d._id === dancerId ? updatedDancer : d))
            );

            setLikedDancers(prevLiked => {
                const newLiked = new Set(prevLiked);
                if (newLiked.has(dancerId)) {
                    newLiked.delete(dancerId);
                } else {
                    newLiked.add(dancerId);
                }
                return newLiked;
            });
        } catch (error) {
            console.error("Failed to toggle like", error);
            toast.error('Failed to update like status');
        }
    };

    return (
        <main className="flex-grow p-8 bg-[#0a0516] text-white overflow-y-auto">
            <div className="mt-8">
                <h1 className="text-5xl font-light leading-tight">BOOK, TRACK, ENJOY – <br /> ALL IN ONE PLATFORM</h1>
                <p className="text-gray-400 mt-4 max-w-lg">Your ultimate destination for dance education, competitive showcases, and community engagement.</p>
                <button className="mt-8 px-10 py-4 font-bold text-white rounded-full bg-gradient-to-r from-pink-500 to-orange-400 hover:opacity-90">Explore Oppurtunities</button>
            </div>

            <div className="min-h-screen mt-12  p-6">
                <h1 className="text-3xl font-semibold  mb-8 text-purple-500/90">
                    💃🏻 Browse Dancers
                </h1>

                {/* Filters */}
                <div className="flex flex-wrap justify-between gap-4 mb-8">
                    <div className="relative w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                        <input
                            type="text"
                            placeholder="Search dancers..."
                            className="border border-purple-500 bg-purple-700 rounded-lg px-4 py-2 pl-10 w-full focus:ring-2 focus:ring-blue-400"
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

                {/* Dancer Cards */}
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
                        <p className="text-center col-span-full text-gray-500 fontSize-2xl">
                            No dancers found 😢
                        </p>
                    )}
                </div>

                {/* Pagination */}
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



            { selectedDancer && (
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
                                onChange={(e) => {
                                    setRequestData({ ...requestData, event: e.target.value });
                                    if (formErrors.event) setFormErrors({ ...formErrors, event: '' });
                                }}
                                className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${formErrors.event ? 'border-2 border-red-500' : ''
                                    }`}
                                placeholder="Event Name"
                            />
                            {formErrors.event && (
                                <p className="text-red-400 text-sm mt-1">{formErrors.event}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-white font-medium mb-2">Date</label>
                            <input
                                type="date"
                                value={requestData.date}
                                min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                                onChange={(e) => {
                                    setRequestData({ ...requestData, date: e.target.value });
                                    if (formErrors.date) setFormErrors({ ...formErrors, date: '' });
                                }}
                                className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${formErrors.date ? 'border-2 border-red-500' : ''
                                    }`}
                            />
                            {formErrors.date && (
                                <p className="text-red-400 text-sm mt-1">{formErrors.date}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-white font-medium mb-2">Venue</label>
                            <input
                                type="text"
                                value={requestData.venue}
                                onChange={(e) => {
                                    setRequestData({ ...requestData, venue: e.target.value });
                                    if (formErrors.venue) setFormErrors({ ...formErrors, venue: '' });
                                }}
                                className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${formErrors.venue ? 'border-2 border-red-500' : ''
                                    }`}
                                placeholder="Enter venue address"
                                readOnly={showVenueMap}
                            />
                            {formErrors.venue && (
                                <p className="text-red-400 text-sm mt-1">{formErrors.venue}</p>
                            )}
                            <button
                                type="button"
                                onClick={() => setShowVenueMap(!showVenueMap)}
                                className="mt-2 text-purple-300 hover:text-purple-100 text-sm underline"
                            >
                                {showVenueMap ? 'Hide Map' : 'Select from Map'}
                            </button>
                            {showVenueMap && (
                                <div className="mt-3">
                                    <VenueMap
                                        onVenueSelect={(venue) => {
                                            setRequestData({ ...requestData, venue: venue.address });
                                            if (formErrors.venue) setFormErrors({ ...formErrors, venue: '' });
                                        }}
                                        initialCenter={[20.5937, 78.9629]}
                                    />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-white font-medium mb-2">Budget Range (₹)</label>
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        value={requestData.budget.includes('-') ? requestData.budget.split('-')[0] : requestData.budget}
                                        onChange={(e) => {
                                            const min = e.target.value;
                                            const max = requestData.budget.includes('-') ? requestData.budget.split('-')[1] : '';
                                            setRequestData({ ...requestData, budget: `${min}-${max}` });
                                            if (formErrors.budget) setFormErrors({ ...formErrors, budget: '' });
                                        }}
                                        className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${formErrors.budget ? 'border-2 border-red-500' : ''
                                            }`}
                                        placeholder="Min"
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        value={requestData.budget.includes('-') ? requestData.budget.split('-')[1] : ''}
                                        onChange={(e) => {
                                            const min = requestData.budget.includes('-') ? requestData.budget.split('-')[0] : requestData.budget;
                                            const max = e.target.value;
                                            setRequestData({ ...requestData, budget: `${min}-${max}` });
                                            if (formErrors.budget) setFormErrors({ ...formErrors, budget: '' });
                                        }}
                                        className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${formErrors.budget ? 'border-2 border-red-500' : ''
                                            }`}
                                        placeholder="Max"
                                    />
                                </div>
                            </div>
                            {formErrors.budget && (
                                <p className="text-red-400 text-sm mt-1">{formErrors.budget}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-white font-medium mb-2">Duration</label>
                            <input
                                type="text"
                                value={requestData.duration}
                                onChange={(e) => {
                                    setRequestData({ ...requestData, duration: e.target.value });
                                    if (formErrors.duration) setFormErrors({ ...formErrors, duration: '' });
                                }}
                                className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${formErrors.duration ? 'border-2 border-red-500' : ''
                                    }`}
                                placeholder="e.g., 2 hours"
                            />
                            {formErrors.duration && (
                                <p className="text-red-400 text-sm mt-1">{formErrors.duration}</p>
                            )}
                        </div>
                    </FormModal>
                )
            }

        </main >
    )
};

export default function Home() {
    const { userData } = useSelector((state: RootState) => state.user);
    return (
        <div className="flex h-screen bg-gray-900">
            <Dashboard userData={userData} />
        </div>
    );
}