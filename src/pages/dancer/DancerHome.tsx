import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "../../components/shared/Sidebar";
import UserNavbar from "../../components/shared/Navbar";
import WorkshopCard from "../../components/ui/WorkshopCard";
import CompetitionCard from "../../components/ui/CompetitionCard";
import { getAllWorkshops } from "../../services/workshop/workshop.service";
import { getAllCompetitions } from "../../services/competition.service";
import type { Workshop } from "../../types/workshop.type";
import type { Competition } from "../../services/competition.service";
import type { RootState } from "../../redux/store";

const CompetitionsSection = () => {
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompetitions = async () => {
            setLoading(true);
            try {
                const data = await getAllCompetitions();
                setCompetitions(data || []);
            } catch (error) {
                console.error("Failed to fetch competitions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCompetitions();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return "bg-green-500 text-white";
            case "closed": return "bg-red-500 text-white";
            case "completed": return "bg-blue-500 text-white";
            default: return "bg-gray-500 text-white";
        }
    };

    return (
        <div className="min-h-screen mt-12 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-semibold text-purple-500">
                    Upcoming Competitions
                </h1>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-white text-xl">Loading competitions...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {competitions.length > 0 ? (
                        competitions.map((competition) => (
                            <CompetitionCard
                                key={competition._id}
                                competition={competition}
                                isOrganizer={false}
                                onViewDetails={(comp) => navigate(`/competition/${comp._id}`)}
                                getStatusColor={getStatusColor}
                            />
                        ))
                    ) : (
                        <p className="text-center col-span-full text-gray-500 text-2xl">
                            No upcoming competitions found 🏆
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

const Dashboard = ({ userData }: { userData: any }) => {
    const navigate = useNavigate();
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(false);

    // Filter & Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [styleFilter, setStyleFilter] = useState('');
    const [modeFilter, setModeFilter] = useState(''); // Online/Offline
    const [sortBy, setSortBy] = useState('startDate'); // startDate, fee, title

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [totalWorkshops, setTotalWorkshops] = useState(0);
    const pageSize = 8; // 8 workshops per page (2 rows of 4)

    const fetchWorkshops = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            // Add search query
            if (searchQuery) params.append('search', searchQuery);

            // Add filters
            if (styleFilter) params.append('style', styleFilter);
            if (modeFilter) params.append('mode', modeFilter);

            // Add sorting
            if (sortBy) params.append('sortBy', sortBy);

            // Add pagination
            params.append('page', currentPage.toString());
            params.append('limit', pageSize.toString());

            const response = await getAllWorkshops(params);
            if (response.success && response.data) {
                setWorkshops(Array.isArray(response.data) ? response.data : response.data.workshops || []);
                setTotalWorkshops(response.data.total || response.data.length || 0);
            }
        } catch (error) {
            console.error("Failed to fetch workshops:", error);
            setWorkshops([])
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchWorkshops();
        }, 500); // Debounce search

        return () => clearTimeout(handler);
    }, [searchQuery, styleFilter, modeFilter, sortBy, currentPage]);

    return (
        <main className="flex-grow p-8 bg-deep-purple text-white overflow-y-auto">
            <UserNavbar />

            <div className="mt-8">
                <h1 className="text-5xl font-light leading-tight">LEARN, PERFORM, COMPETE,<br />TEACH – ALL IN ONE PLATFORM</h1>
                <p className="text-gray-400 mt-4 max-w-lg">Your ultimate destination for dance education, competitive showcases, and community engagement.</p>
                <button className="mt-8 px-10 py-4 font-bold text-white rounded-full bg-gradient-to-r from-pink-500 to-orange-400 hover:opacity-90">Explore Opportunities</button>
            </div>

            {/* Workshops Feed Section */}
            <div className="min-h-screen mt-12 p-6 rounded-xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-semibold text-purple-500">
                        Upcoming Workshops
                    </h1>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-wrap gap-4 mb-8">
                    {/* Search Bar */}
                    <div className="relative flex-1 min-w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" size={20} />
                        <input
                            type="text"
                            placeholder="Search workshops..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                            className="w-[520px] bg-purple-700 text-white placeholder-purple-300 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        {searchQuery && (
                            <X
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 cursor-pointer hover:text-white"
                                size={20}
                                onClick={() => setSearchQuery('')}
                            />
                        )}
                    </div>


                    {/* Dance Style Filter */}
                    <select
                        value={styleFilter}
                        onChange={(e) => {
                            setStyleFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="bg-[#a855f7] text-white px-4 py-2 rounded-lg focus:outline-none"
                    >
                        <option value="">All Styles</option>
                        <option value="Ballet">Ballet</option>
                        <option value="Hip-Hop">Hip-Hop</option>
                        <option value="Contemporary">Contemporary</option>
                        <option value="Jazz">Jazz</option>
                        <option value="Salsa">Salsa</option>
                        <option value="Bharatanatyam">Bharatanatyam</option>
                        <option value="Kathak">Kathak</option>
                        <option value="Popping">Popping</option>
                        <option value="Break">Break</option>
                        <option value="Locking">Locking</option>
                        <option value="Tap">Tap</option>
                        <option value="Belly">Belly</option>
                    </select>

                    {/* Mode Filter */}
                    <select
                        value={modeFilter}
                        onChange={(e) => {
                            setModeFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="bg-[#a855f7] text-white px-4 py-2 rounded-lg focus:outline-none"
                    >
                        <option value="">All Modes</option>
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                    </select>

                    {/* Sort By */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-[#a855f7] text-white px-4 py-2 rounded-lg focus:outline-none"
                    >
                        <option value="startDate">Sort by Date</option>
                        <option value="fee">Sort by Price</option>
                        <option value="title">Sort by Title</option>
                    </select>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-white text-xl">Loading workshops...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {workshops.length > 0 ? (
                                workshops.map((workshop) => (
                                    <WorkshopCard
                                        key={workshop._id}
                                        image={workshop.posterImage}
                                        title={workshop.title}
                                        category={workshop.style}
                                        price={workshop.fee}
                                        instructorName={workshop.instructor.username}
                                        studioName={workshop.location || 'Online'}
                                        date={workshop.startDate}
                                        deadline={workshop.deadline}
                                        onBook={() => navigate(`/workshop/${workshop._id}`)}
                                    />
                                ))
                            ) : (
                                <p className="text-center col-span-full text-gray-500 text-2xl">
                                    No upcoming workshops found 🎭
                                </p>
                            )}
                        </div>
                        {/* Pagination */}
                        {workshops.length > 0 && (
                            <div className="flex justify-between items-center mt-8 pt-6 border-t border-purple-700">
                                <div className="text-gray-300">
                                    Showing {workshops.length} of {totalWorkshops} workshops
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors flex items-center gap-2"
                                    >
                                        <ChevronLeft size={20} />
                                        Previous
                                    </button>
                                    <span className="text-white">
                                        Page {currentPage} of {Math.ceil(totalWorkshops / pageSize)}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        disabled={currentPage >= Math.ceil(totalWorkshops / pageSize)}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors flex items-center gap-2"
                                    >
                                        Next
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Competitions Feed Section */}
            <CompetitionsSection />
        </main>
    )
};

export default function Home() {
    const { userData } = useSelector((state: RootState) => state.user)
    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar activeMenu="Home" />
            <Dashboard userData={userData} />
        </div>
    );
}