// import React from 'react';
// import { FiHome, FiMessageSquare, FiCalendar, FiBriefcase, FiTrophy, FiCreditCard, FiUser, FiLogOut, FiSettings, FiSearch, FiBell } from 'react-icons/fi';
// import {Search, Bell } from "lucide-react"
import { useSelector } from "react-redux";
import Sidebar from "../../components/shared/Sidebar";
import UserNavbar from "../../components/shared/Navbar";
import type { RootState } from "../../redux/store";
import { Briefcase, Calendar, ChevronLeft, ChevronRight, Search, Trophy, TrophyIcon, X } from "lucide-react";

import WorkshopCard from "../../components/ui/WorkshopCard";
import { getAllWorkshops } from "../../services/workshop/workshop.service";
import type { Workshop } from "../../types/workshop.type";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


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
                // setWorkshops(response.data);
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

    // useEffect(() => {
    //     fetchWorkshops();
    // }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchWorkshops();
        }, 500); // Debounce search

        return () => clearTimeout(handler);
    }, [searchQuery, styleFilter, modeFilter, sortBy, currentPage]);

    return (
        <main className="flex-grow p-8 bg-deep-purple text-white overflow-y-auto">
            <UserNavbar />
            {/* <Header /> */}
            <div className="mt-8">
                <h1 className="text-5xl font-light leading-tight">LEARN, PERFORM, COMPETE,<br />TEACH – ALL IN ONE PLATFORM</h1>
                <p className="text-gray-400 mt-4 max-w-lg">Your ultimate destination for dance education, competitive showcases, and community engagement.</p>
                <button className="mt-8 px-10 py-4 font-bold text-white rounded-full bg-gradient-to-r from-pink-500 to-orange-400 hover:opacity-90">Explore Oppurtunities</button>
            </div>

            {/* <div className="mt-12 p-6 bg-purple-800/50 rounded-xl flex items-center justify-between">
            <div className="flex items-center">
                <img src="https://i.pravatar.cc/80?img=32" alt="Elena Petrova" className="w-16 h-16 rounded-full border-2 border-purple-400" />
                <div className="ml-4">
                    <div className="flex items-center">
                        <h3 className="text-xl font-bold">{userData?.username?.charAt(0).toUpperCase() + userData?.username?.slice(1)}</h3>
                        <span className="ml-3 text-xs bg-blue-500 rounded-full px-2 py-0.5">Dancer</span>
                    </div>
                    <p className="text-sm text-gray-300">{userData?.danceStyles?.join(', ')}</p>
                </div>
            </div>
            <div className="flex space-x-12 text-center">
                <div><div className="text-2xl font-bold">24</div><div className="text-sm text-gray-300">Workshops</div></div>
                <div><div className="text-2xl font-bold">156</div><div className="text-sm text-gray-300">Bookings</div></div>
                <div><div className="text-2xl font-bold">4.8</div><div className="text-sm text-gray-300">Reviews</div></div>
                <div><div className="text-2xl font-bold">8</div><div className="text-sm text-gray-300">Competitions</div></div>
            </div>
        </div> */}

            {/* <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-purple-800/50 p-6 rounded-xl">
                <h4 className="text-xl font-semibold mb-6">Earnings Overview</h4>
                <div className="space-y-4 text-gray-300">
                    <div className="flex justify-between"><span>This Month</span><span className="text-white font-bold">₹ 2,84,000</span></div>
                    <div className="flex justify-between"><span>Workshops</span><span>₹ 1,9200</span></div>
                    <div className="flex justify-between"><span>Event Bookings</span><span>₹ 92100</span></div>
                    <div className="flex justify-between border-t border-purple-700 pt-4 mt-4"><span>Last Month</span><span>₹ 31,220</span></div>
                </div>
                <button className="mt-6 w-full py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-white">View Detailed Report</button>
            </div>
            <div className="bg-purple-800/50 p-6 rounded-xl">
                <h4 className="text-xl font-semibold mb-6">Notifications</h4>
                <div className="space-y-4">
                    <div className="bg-purple-700/70 p-4 rounded-lg flex items-start"><Briefcase className="mr-3 mt-1 text-purple-300"/><div><p>New registration for Contemporary Flow Basics</p><p className="text-xs text-gray-400">2 hours ago</p></div></div>
                    <div className="bg-purple-700/70 p-4 rounded-lg flex items-start"><Calendar className="mr-3 mt-1 text-purple-300"/><div><p>Booking request from Emily & James</p><p className="text-xs text-gray-400">5 hours ago</p></div></div>
                    <div className="bg-purple-700/70 p-4 rounded-lg flex items-start"><TrophyIcon className="mr-3 mt-1 text-purple-300"/><div><p>Competition registration deadline approaching</p><p className="text-xs text-gray-400">1 day ago</p></div></div>
                </div>
                <button className="mt-6 w-full py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600">View All Notifications</button>
            </div>
        </div> */}

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
                    {/* <div className="flex gap-4"> */}
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
                        {/* <option value="popularity">Sort by Popularity</option> */}
                    </select>
                    {/* </div> */}
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
                                <p className="text-center col-span-full text-gray-500 fontSize-2xl">
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