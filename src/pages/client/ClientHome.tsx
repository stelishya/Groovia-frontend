import {
    House, MessageSquare, Calendar, Briefcase, Trophy, CreditCard,
    User as UserIcon, LogOut, Settings, Search, Bell, X,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { logoutUser } from "../../redux/slices/user.slice";
import { type RootState } from "../../redux/store";
import Sidebar from "../../components/shared/Sidebar";
import DancerCard from "../../components/ui/Card";
import FormModal from "../../components/ui/FormModal";
import VenueMap from "../../components/ui/VenueMap";
import { GitPullRequest } from "lucide-react";
import { useEffect, useState } from "react";
import getAllDancers, { sendRequestToDancers } from "../../services/client/browseDancers.service";
import { toggleLike } from "../../services/dancer/dancer.service";
import { getClientEventRequests } from '../../services/client/client.service';
import toast from "react-hot-toast";
import UserNavbar from "../../components/shared/Navbar";



const Header = () => (
    <header className="flex justify-end items-center p-4">
        {/* <div className="relative w-80 mr-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
            <input type="text" placeholder="Search Workshops, Competitions..." className="w-full bg-purple-700 text-white placeholder-purple-300 rounded-lg py-2 pl-10 focus:outline-none" />
        </div> */}
        <Bell className="text-white text-2xl mr-6 cursor-pointer" />
        <img src="https://img.icons8.com/?size=128&id=tZuAOUGm9AuS&format=png" alt="User" className="w-10 h-10 rounded-full cursor-pointer" />
    </header>
);
interface Dancer {
    _id: string;
    username: string;
    //   email: string;
    //   phone?: string;
    //   role:string;
    profileImage?: string;
    bio?: string;
    // experienceYears?: number;
    // portfolioLinks?: string[];
    danceStyles?: string[];
    likes?: string[];
    createdAt: string;
    updatedAt: string;
}
interface EventRequest {
    _id: string;
    dancerId: { // dancerId is an object after population
        _id: string;
        username: string;
        profileImage?: string;
    } | null;
}
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
    const [loading, setLoading] = useState(true)
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
            const response: { success: boolean; data?: { requests: EventRequest[] } } = await getClientEventRequests(new URLSearchParams);
            console.log("response in fetchSentRequests in ClientHome.tsx", response)
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
            // const response = await getAllDancers();
            // console.log("response in fetchUsers in UserDetails.tsx", response)
            // if (response.users && Array.isArray(response.users)) {
            //     const mappedDancers: Dancer[] = response.users.map((user: any) => ({
            //         _id: user._id.toString(),
            //         username: user.username,
            //         // email: user.email,
            //         // phone: user.phone || '',
            //         role: Array.isArray(user.role) ? user.role[0] : user.role,
            //         profileImage: user.profileImage || '',
            //         bio: user.bio,
            //         experienceYears: user.experienceYears,
            //         portfolioLinks: user.portfolioLinks,
            //         danceStyles: user.danceStyles,
            //         likes: user.likes,
            //         createdAt: user.createdAt,
            //         updatedAt: user.updatedAt,
            //     }));
            //     console.log("mappedUsers", mappedDancers)
            //     setDancers(mappedDancers);
            // } else {
            //     console.error('Failed to fetch dancers - Invalid response structure:', response.message);
            // }

            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (style) params.append('danceStyle', style);
            // if (city) params.append('location', city);
            if (sortBy) params.append('sortBy', sortBy);
            params.append('page', currentPage.toString());
            // params.append('limit', pageSize.toString());
            console.log("params", params)

            //  const response = await ClientAxios.get(`/dancers?${params.toString()}`);
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
        // }
    }


    const handleOpenRequestModal = (dancer: Dancer) => {
        setSelectedDancer(dancer);
        setIsRequestModalOpen(true);
        // Reset form data and errors when opening modal
        setRequestData({
            event: '',
            date: '',
            venue: '',
            budget: '',
        });
        setFormErrors({
            event: '',
            date: '',
            venue: '',
            budget: '',
        });
    };

    const handleCloseRequestModal = () => {
        setIsRequestModalOpen(false);
        setSelectedDancer(null);
        setFormErrors({
            event: '',
            date: '',
            venue: '',
            budget: '',
        });
    };

    const validateForm = () => {
        const errors = {
            event: '',
            date: '',
            venue: '',
            budget: '',
        };
        let isValid = true;

        // Validate event
        if (!requestData.event.trim()) {
            errors.event = 'Event name is required';
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
            const response = await sendRequestToDancers(selectedDancer._id, requestData);
            console.log("response of sendRequestToDancers in ClientHome.tsx", response)
            // Add the dancer's ID to the set of requested dancers
            setRequestedDancerIds(prevIds => new Set(prevIds).add(selectedDancer._id));
            handleCloseRequestModal();
            fetchSentRequests(); // Refetch requests to ensure UI is up-to-date
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

    // const handleFilter = () => {
    //     const params = new URLSearchParams();
    //     if (filters.search) params.append('search', filters.search);
    //     if (filters.style) params.append('style', filters.style);
    //     if (filters.city) params.append('location', filters.city);
    // };
    return (
        <main className="flex-grow p-8 bg-deep-purple text-white overflow-y-auto">
            <UserNavbar />
            <div className="mt-8">
                <h1 className="text-5xl font-light leading-tight">BOOK, TRACK, ENJOY – <br /> ALL IN ONE PLATFORM</h1>
                <p className="text-gray-400 mt-4 max-w-lg">Your ultimate destination for dance education, competitive showcases, and community engagement.</p>
                <button className="mt-8 px-10 py-4 font-bold text-white rounded-full bg-gradient-to-r from-pink-500 to-orange-400 hover:opacity-90">Explore Oppurtunities</button>
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="mt-12 p-6 
        bg-gradient-to-r from-purple-500 to-black-200
        rounded-xl flex items-center justify-between">

                </div>
            </div> */}

            {/*  bg-purple-500/70  */}
            {/* <div className="mt-12 p-6 
        bg-gradient-to-r from-purple-500 to-black-200
        rounded-xl flex items-center justify-between">
            <div className="flex items-center">
                <img src="https://i.pravatar.cc/80?img=32" alt="Elena Petrova" className="w-16 h-16 rounded-4xl border-2 border-purple-400" />
                <div className="ml-4">
                    <div className="flex items-center">
                        <h3 className="text-xl font-bold">{userData?.username?.charAt(0).toUpperCase() + userData?.username?.slice(1)}</h3>
                        <span className="ml-3 text-xs bg-blue-500 rounded-full px-2 py-0.5">{userData?.role?.map((role:string)=>role.charAt(0).toUpperCase() + role.slice(1)).join(', ')}</span>
                    </div>
                    <p className="text-sm text-gray-300">Contemporary & Hip-Hop Dance</p>
                </div>
            </div>
            
        </div> */}
            <div className="min-h-screen mt-12  p-6">
                <h1 className="text-3xl font-semibold  mb-8 text-purple-500/70">
                    💃🏻 Browse Dancers
                </h1>

                {/* Filters */}
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
                    <select
                        className="border border-purple-300 bg-purple-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                    >
                        <option value="">All Styles</option>
                        <option value="Hip-Hop">Hip Hop</option>
                        <option value="Classical">Classical</option>
                        <option value="Contemporary">Contemporary</option>
                        <option value="Folk">Folk</option>
                        <option value="Breakdance">Breakdance</option>
                    </select>

                    <select
                        className="border border-purple-300 bg-purple-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="likes">Sort by Likes</option>
                        <option value="name">Sort by Name</option>
                    </select>
                    </div>
                    {/* <input
                        type="text"
                        placeholder="City"
                        className="border border-purple-300 bg-purple-700 rounded-lg px-4 py-2 w-48 focus:ring-2 focus:ring-blue-400"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    /> */}

                    {/* <button
                        onClick={handleFilter}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Filter
                    </button> */}
                </div>

                {/* Dancer Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                            onChange={(e) => {
                                setRequestData({ ...requestData, event: e.target.value });
                                if (formErrors.event) setFormErrors({ ...formErrors, event: '' });
                            }}
                            className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                formErrors.event ? 'border-2 border-red-500' : ''
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
                            className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                formErrors.date ? 'border-2 border-red-500' : ''
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
                            className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                formErrors.venue ? 'border-2 border-red-500' : ''
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
                        <label className="block text-white font-medium mb-2">Budget</label>
                        <input
                            type="text"
                            value={requestData.budget}
                            onChange={(e) => {
                                setRequestData({ ...requestData, budget: e.target.value });
                                if (formErrors.budget) setFormErrors({ ...formErrors, budget: '' });
                            }}
                            className={`w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                formErrors.budget ? 'border-2 border-red-500' : ''
                                }`}
                            placeholder="e.g., $500 - $1000"
                        />
                        {formErrors.budget && (
                            <p className="text-red-400 text-sm mt-1">{formErrors.budget}</p>
                        )}
                    </div>
                </FormModal>
            )}

        </main>
    )
};

export default function Home() {
    const { userData } = useSelector((state: RootState) => state.user);
    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar />
            <Dashboard userData={userData} />
        </div>
    );
}