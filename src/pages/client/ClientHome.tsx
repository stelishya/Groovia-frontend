import { House, MessageSquare, Calendar, Briefcase, Trophy, CreditCard, User as UserIcon, LogOut, Settings, Search, Bell } from "lucide-react"
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../redux/slices/user.slice";
import { type RootState } from "../../redux/store";
import Sidebar from "../../components/shared/Sidebar";
import DancerCard from "../../components/ui/Card";
import FormModal from "../../components/ui/FormModal";
import { GitPullRequest } from "lucide-react";
import { useEffect, useState } from "react";
import getAllDancers, { sendRequestToDancers } from "../../services/client/browseDancers.service";


const Header = () => (
    <header className="flex justify-end items-center p-4">
        <div className="relative w-80 mr-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
            <input type="text" placeholder="Search Workshops, Competitions..." className="w-full bg-purple-700 text-white placeholder-purple-300 rounded-lg py-2 pl-10 focus:outline-none" />
        </div>
        <Bell className="text-white text-2xl mr-6 cursor-pointer" />
        <img src="https://i.pravatar.cc/40?img=32" alt="User" className="w-10 h-10 rounded-full cursor-pointer" />
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
    experienceYears?: number;
    portfolioLinks?: string[];
    danceStyles?: string[];
    likes?: number;
    createdAt: string;
    updatedAt: string;
}
const Dashboard = ({ userData }: { userData: any }) => {
    console.log("Client Dashboard loaded")

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
    const [style, setStyle] = useState('');
    const [city, setCity] = useState('');
    const [filters, setFilters] = useState({ search: '', style: '', city: '' });
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


    useEffect(() => {
        fetchDancers()
    }, [])

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
            if (filters.search) params.append('search', filters.search);
            if (filters.style) params.append('danceStyle', filters.style);
            if (filters.city) params.append('location', filters.city);
            console.log("params", params)

            //  const response = await ClientAxios.get(`/dancers?${params.toString()}`);
            const response = await getAllDancers(params);
            console.log("response in fetchDancers in ClientHome.tsx", response)
            setDancers(response.dancers || []);
        } catch (error) {
            console.log("error in fetchDancers in ClientHome.tsx", error)
            setDancers([]);
        }
    }

    const handleOpenRequestModal = (dancer: Dancer) => {
        setSelectedDancer(dancer);
        setIsRequestModalOpen(true);
    };

    const handleCloseRequestModal = () => {
        setIsRequestModalOpen(false);
        setSelectedDancer(null);
    };

    const handleConfirmSend = async () => {
        try {
            if (!selectedDancer) return;
    
            console.log(`Sending request to ${selectedDancer.username} with data:`, requestData);
            // API call
            const response = await sendRequestToDancers(selectedDancer._id, requestData);
            console.log("response of sendRequestToDancers in ClientHome.tsx",response)
            handleCloseRequestModal();
            
        } catch (error) {
            console.error("Send request failed", error);
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
            <Header />
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
            <div className="min-h-screen mt-12  p-6 border border-purple-500/50 rounded-xl">
                <h1 className="text-3xl font-semibold text-center mb-8 text-white-800">
                    💃🏻 Browse Dancers
                </h1>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <input
                        type="text"
                        placeholder="Search dancers..."
                        className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-blue-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        <option value="HipHop">Hip Hop</option>
                        <option value="Classical">Classical</option>
                        <option value="Contemporary">Contemporary</option>
                        <option value="Folk">Folk</option>
                    </select>

                    <input
                        type="text"
                        placeholder="City"
                        className="border border-gray-300 rounded-lg px-4 py-2 w-48 focus:ring-2 focus:ring-blue-400"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />

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
                            <DancerCard key={dancer._id} dancer={dancer} onSendRequest={handleOpenRequestModal} />
                        ))
                    ) : (
                        <p className="text-center col-span-full text-gray-500">
                            No dancers found 😢
                        </p>
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
                            className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Event Name"
                        />
                    </div>
                    <div>
                        <label className="block text-white font-medium mb-2">Date</label>
                        <input
                            type="date"
                            value={requestData.date}
                            onChange={(e) => setRequestData({ ...requestData, date: e.target.value })}
                            className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-white font-medium mb-2">Venue</label>
                        <input
                            type="text"
                            value={requestData.venue}
                            onChange={(e) => setRequestData({ ...requestData, venue: e.target.value })}
                            className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Event Venue"
                        />
                    </div>
                    <div>
                        <label className="block text-white font-medium mb-2">Budget</label>
                        <input
                            type="text"
                            value={requestData.budget}
                            onChange={(e) => setRequestData({ ...requestData, budget: e.target.value })}
                            className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., $500 - $1000"
                        />
                    </div>
                </FormModal>
            )}

        </main>
    )
};

export default function Home() {
    const { userData } = useSelector((state: RootState) => state.user)
    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar />
            <Dashboard userData={userData} />
        </div>
    );
}