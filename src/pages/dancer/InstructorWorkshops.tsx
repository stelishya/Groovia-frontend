import { useState, useEffect } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import InstructorWorkshopCard from '../../components/ui/InstructorWorkshopCard';
import CreateWorkshopModal from '../../components/ui/CreateWorkshopModal';
import GenericDetailsModal from '../../components/ui/EntityDetailsModal';
import { Search, Plus, ScanLine, Bell, Filter, X } from 'lucide-react';
import { Pagination, UserPagination } from '../../components/ui/Pagination';
import { getInstructorWorkshops, createWorkshop, updateWorkshop, deleteWorkshop, getBookedWorkshops, getAllWorkshops } from '../../services/workshop/workshop.service';
import type { Workshop, CreateWorkshopData } from '../../types/workshop.type';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import UserNavbar from '../../components/shared/Navbar';
import { UserTable } from '../../components/ui/Table';
import { useNavigate, useSearchParams } from 'react-router-dom';
import WorkshopCard from '../../components/ui/WorkshopCard';

const InstructorWorkshops = () => {
    const [workshops, setWorkshops] = useState<Workshop[]>([])
    const [styleFilter, setStyleFilter] = useState('');
    const [modeFilter, setModeFilter] = useState(''); // Online/Offline
    const [sortBy, setSortBy] = useState('startDate'); // startDate, fee, title

    const [filter, setFilter] = useState('All Types');
    const [exploreSearch, setExploreSearch] = useState('');
    const [instructorSearch, setInstructorSearch] = useState('');
    const [bookedSearch, setBookedSearch] = useState('');
    const [instructorWorkshops, setInstructorWorkshops] = useState<Workshop[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
    const [viewingWorkshop, setViewingWorkshop] = useState<Workshop | null>(null);
    const [activeTab, setActiveTab] = useState<'exploreWorkshops' | 'bookedWorkshops' | 'instructorWorkshops'>('exploreWorkshops');

    const [bookedWorkshops, setBookedWorkshops] = useState<Workshop[]>([]);
    const [workshopSortBy, setWorkshopSortBy] = useState('date');
    const [workshopPage, setWorkshopPage] = useState(1);
    const [workshopLimit, setWorkshopLimit] = useState(10);
    const [workshopTotal, setWorkshopTotal] = useState(0);

    const [explorePage, setExplorePage] = useState(1);
    const [instructorPage, setInstructorPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalWorkshops, setTotalWorkshops] = useState(0);
    const pageSize = 8;
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize activeTab from URL search params
    useEffect(() => {
        const tabParam = searchParams.get('tab') as 'exploreWorkshops' | 'bookedWorkshops' | 'instructorWorkshops' | null;
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    const handleTabChange = (tab: 'exploreWorkshops' | 'bookedWorkshops' | 'instructorWorkshops') => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams);
        params.set('tab', tab);
        setSearchParams(params);
    };

    // Reset to page 1 when search or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [exploreSearch, styleFilter, modeFilter, sortBy]);

    useEffect(() => {
        const fetchWorkshops = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();

                // Add search query (explore tab)
                if (exploreSearch) params.append('search', exploreSearch);

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

        const handler = setTimeout(() => {
            fetchWorkshops();
        }, 300); // Debounce search

        return () => clearTimeout(handler);
    }, [exploreSearch, styleFilter, modeFilter, sortBy, currentPage]);


    const fetchInstructorWorkshops = async () => {
        setLoading(true);
        const response = await getInstructorWorkshops();
        if (response.success && response.data) {
            setInstructorWorkshops(response.data);
        } else {
            toast.error(response.message || 'Failed to fetch workshops');
        }
        setLoading(false);
    };
    useEffect(() => {

        fetchInstructorWorkshops();
    }, []);
    useEffect(() => {
        const fetchBookedWorkshops = async () => {
            if (activeTab !== 'bookedWorkshops') return; // Only fetch when on booked workshops tab

            setLoading(true);
            try {
                const response = await getBookedWorkshops({
                    search: bookedSearch,
                    sortBy: workshopSortBy,
                    page: workshopPage,
                    limit: workshopLimit
                });
                console.log("Booked Workshops", response);
                if (response.success) {
                    setBookedWorkshops(response.data.workshops);
                    setWorkshopTotal(response.data.total || (response.data.workshops?.length ?? 0));
                }
            } catch (error) {
                console.error("Failed to fetch booked workshops", error);
                toast.error("Failed to load booked workshops");
            } finally {
                setLoading(false);
            }
        };

        // Debounce the search
        const handler = setTimeout(() => {
            fetchBookedWorkshops();
        }, 300);

        return () => clearTimeout(handler);
    }, [activeTab, workshopPage, workshopLimit, bookedSearch, workshopSortBy]);

    const handleCreateOrUpdateWorkshop = async (data: CreateWorkshopData) => {
        if (editingWorkshop) {
            const response = await updateWorkshop(editingWorkshop._id, data);
            if (response.success) {
                toast.success('Workshop updated successfully!');
                handleCloseModal();
                fetchInstructorWorkshops();
            } else {
                toast.error(response.message || 'Failed to update workshop');
            }
        } else {
            const response = await createWorkshop(data);
            if (response.success) {
                toast.success('Workshop created successfully!');
                handleCloseModal();
                fetchInstructorWorkshops();
            } else {
                toast.error(response.message || 'Failed to create workshop');
            }
        }
    };

    const handleEditClick = (workshop: Workshop) => {
        setEditingWorkshop(workshop);
        setIsCreateModalOpen(true);
    };

    const handleDeleteWorkshop = async (id: string) => {
        const response = await deleteWorkshop(id);
        if (response.success) {
            toast.success('Workshop deleted successfully');
            fetchInstructorWorkshops();
        } else {
            toast.error(response.message || 'Failed to delete workshop');
        }
    };

    const handleViewDetails = (workshop: Workshop) => {
        setViewingWorkshop(workshop);
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setEditingWorkshop(null);
    };

    const getStatus = (workshop: Workshop) => {
        const now = new Date();
        const start = new Date(workshop.startDate);
        const end = new Date(workshop.endDate);

        if (now < start) return 'Upcoming';
        if (now >= start && now <= end) return 'Active';
        return 'Completed';
    };

    const filteredWorkshops = instructorWorkshops.filter(workshop =>
        workshop.title.toLowerCase().includes(instructorSearch.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-[#0f0f13] text-white overflow-hidden">
            <Sidebar activeMenu='Workshops' />

            <div className="flex-1 flex p-8 flex-col overflow-hidden relative">
                {/* Header */}
                {/* <header className="flex justify-between items-center p-8 pb-4">
                    <div>
                        <h1 className="text-4xl font-bold text-purple-400 mb-2">Workshops Management</h1>
                        <p className="text-gray-400">Manage your dance workshops and track attendance</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <Bell className="text-purple-400 w-6 h-6 cursor-pointer hover:text-purple-300" />
                        <img
                            src="https://img.icons8.com/?size=128&id=tZuAOUGm9AuS&format=png"
                            alt="Profile"
                            className="w-10 h-10 rounded-full border-2 border-purple-500 cursor-pointer"
                        />
                    </div>
                </header> */}
                <UserNavbar title='Workshops Management' subTitle='Manage your dance workshops and track attendance' />
                <div className="flex border-b border-purple-700 mb-4">
                    <button
                        className={`py-2 px-4 font-semibold ${activeTab === 'exploreWorkshops' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400'}`}
                        onClick={() => handleTabChange('exploreWorkshops')}
                    >
                        Explore Workshops
                        ({workshops.length})
                    </button>
                    <button
                        className={`py-2 px-4 font-semibold ${activeTab === 'bookedWorkshops' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400'}`}
                        onClick={() => handleTabChange('bookedWorkshops')}
                    >
                        Booked Workshops ({bookedWorkshops.length})
                    </button>
                    <button
                        className={`py-2 px-4 font-semibold ${activeTab === 'instructorWorkshops' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400'}`}
                        onClick={() => handleTabChange('instructorWorkshops')}
                    >
                        Instructor Workshops ({instructorWorkshops.length})
                    </button>
                </div>
                {/* Controls Bar */}
                {/* <div className="px-8 py-6 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-6 py-3 bg-transparent border border-purple-500 text-white rounded-lg hover:bg-purple-500/10 transition-colors">
                            <ScanLine size={20} className="text-purple-400" />
                            <span>QR Scanner</span>
                        </button>
                        <button
                            onClick={() => {
                                setEditingWorkshop(null);
                                setIsCreateModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-transparent border border-purple-500 text-white rounded-lg hover:bg-purple-500/10 transition-colors"
                        >
                            <Plus size={20} className="text-purple-400" />
                            <span>Create Workshop</span>
                        </button>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search Workshops.."
                                className="bg-[#7c3aed] text-white placeholder-purple-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 w-64"
                                value={instructorSearch}
                                onChange={(e) => setInstructorSearch(e.target.value)}
                            />
                            {instructorSearch && (
                                <X
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 cursor-pointer hover:text-white"
                                    size={20}
                                    onClick={() => setInstructorSearch('')}
                                />
                            )}
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9] transition-colors">
                            <span>All Types</span>
                            <Filter size={16} />
                        </button>
                    </div>
                </div> */}
                {/* Workshops Grid */}
                <div className="flex-1 overflow-y-auto  pb-8 custom-scrollbar">
                    {activeTab === 'instructorWorkshops' ? (
                        <>
                            {/* Controls Bar */}
                            <div className="pb-4 pr-3 flex flex-wrap justify-between items-center gap-4">
                                <div className="flex gap-4">
                                    <button className="flex items-center gap-2 px-6 py-3 bg-transparent border border-purple-500 text-white rounded-lg hover:bg-purple-500/10 transition-colors">
                                        <ScanLine size={20} className="text-purple-400" />
                                        <span>QR Scanner</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingWorkshop(null);
                                            setIsCreateModalOpen(true);
                                        }}
                                        className="flex items-center gap-2 px-6 py-3 bg-transparent border border-purple-500 text-white rounded-lg hover:bg-purple-500/10 transition-colors"
                                    >
                                        <Plus size={20} className="text-purple-400" />
                                        <span>Create Workshop</span>
                                    </button>
                                </div>

                                <div className="flex gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search Workshops.."
                                            className="bg-[#7c3aed] text-white placeholder-purple-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 w-64"
                                            value={instructorSearch}
                                            onChange={(e) => setInstructorSearch(e.target.value)}
                                        />
                                        {instructorSearch && (
                                            <X
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 cursor-pointer hover:text-white"
                                                size={20}
                                                onClick={() => setInstructorSearch('')}
                                            />
                                        )}
                                    </div>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9] transition-colors">
                                        <span>All Types</span>
                                        <Filter size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                                {filteredWorkshops.length > 0 ? (
                                    filteredWorkshops
                                        .slice((instructorPage - 1) * pageSize, instructorPage * pageSize)
                                        .map((workshop) => (
                                            <InstructorWorkshopCard
                                                key={workshop._id}
                                                title={workshop.title}
                                                status={getStatus(workshop)}
                                                fee={workshop.fee}
                                                date={workshop.startDate}
                                                time={workshop.sessions[0]?.startTime || 'TBA'}
                                                mode={workshop.mode}
                                                attendeesCount={workshop.participants?.length || 0}
                                                maxAttendees={workshop.maxParticipants}
                                                onViewDetails={() => handleViewDetails(workshop)}
                                                onEdit={() => handleEditClick(workshop)}
                                                onDelete={() => {
                                                    setEditingWorkshop(workshop)
                                                    setIsDeleteModalOpen(true)
                                                }}
                                            />
                                        ))
                                ) : (
                                    <p className="text-center col-span-full text-gray-500 text-xl mt-10">
                                        No workshops found. Create one to get started! 🚀
                                    </p>
                                )}
                            </div>
                        </>

                    ) : activeTab === 'bookedWorkshops' ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <div className="relative w-1/3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                                    <input type="text" placeholder="Search by workshop..." value={bookedSearch} onChange={(e) => setBookedSearch(e.target.value)} className="w-full bg-purple-700 text-white placeholder-purple-300 rounded-lg py-2 pl-10 focus:outline-none" />
                                    {bookedSearch && <X className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 cursor-pointer" onClick={() => setBookedSearch('')} />}
                                </div>
                                <select
                                    value={workshopSortBy}
                                    onChange={(e) => setWorkshopSortBy(e.target.value)}
                                    className="bg-[#a855f7] text-white px-4 py-2 rounded-lg focus:outline-none"
                                >
                                    <option value="startDate">Sort by Date</option>
                                    <option value="fee">Sort by Price</option>
                                    <option value="title">Sort by Title</option>
                                </select>
                            </div>
                            {loading ? (
                                <p className="text-center text-gray-400 mt-10">Loading workshops...</p>
                            ) : bookedWorkshops.length > 0 ? (
                                <UserTable
                                    data={bookedWorkshops}
                                    variant="dancer-workshop"
                                    onView={(workshop) => {
                                        // Using default workshop card navigation logic
                                        // Need to ensure state is passed if required by WorkshopDetails page
                                        // The original code passed state: { isRegistered: true, paymentStatus: workshop.userParticipant.paymentStatus }
                                        navigate(`/workshop/${workshop._id}`, {
                                            state: {
                                                isRegistered: true,
                                                paymentStatus: workshop.userParticipant?.paymentStatus
                                            }
                                        });
                                    }}
                                />
                            ) : (
                                <p>No booked workshops found.</p>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Search and Filters */}
                            <div className="flex flex-wrap gap-4 mb-8">
                                {/* Search Bar */}
                                <div className="relative flex-1 min-w-[250px] max-w-[520px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search workshops..."
                                        value={exploreSearch}
                                        onChange={(e) => setExploreSearch(e.target.value)}
                                        className="w-full bg-purple-700 text-white placeholder-purple-300 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    {exploreSearch && (
                                        <X
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 cursor-pointer hover:text-white"
                                            size={20}
                                            onClick={() => setExploreSearch('')}
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
                                <p className="text-center text-gray-400 mt-10">Loading workshops...</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {workshops.length > 0 ? (
                                        workshops
                                            .slice((explorePage - 1) * pageSize, explorePage * pageSize)
                                            .map((workshop) => (
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
                            )}
                        </>
                    )}
                    {activeTab === 'exploreWorkshops' && workshops.length > 0 && (
                        <UserPagination
                            current={explorePage}
                            total={workshops.length}
                            pageSize={pageSize}
                            onChange={(page) => setExplorePage(page)}
                            // showSizeChanger={false}
                            // showQuickJumper={false}
                            showTotal={(total, range) => (
                                <span className="text-sm text-gray-300">
                                    Showing {range[0]} to {range[1]} of {total} workshops
                                </span>
                            )}
                            className="mt-8"
                        />
                    )}
                    {activeTab === 'instructorWorkshops' && filteredWorkshops.length > 0 && (
                        <UserPagination
                            current={instructorPage}
                            total={filteredWorkshops.length}
                            pageSize={pageSize}
                            onChange={(page) => setInstructorPage(page)}
                            // showSizeChanger={false}
                            // showQuickJumper={false}
                            showTotal={(total, range) => (
                                <span className="text-sm text-gray-300">
                                    Showing {range[0]} to {range[1]} of {total} workshops
                                </span>
                            )}
                            className="mt-8"
                        />
                    )}
                    {activeTab === 'bookedWorkshops' && bookedWorkshops.length > 0 && (
                        <UserPagination
                            current={workshopPage}
                            total={workshopTotal}
                            pageSize={workshopLimit}
                            onChange={(page, size) => {
                                if (size && size !== workshopLimit) {
                                    setWorkshopLimit(size);
                                    setWorkshopPage(1);
                                } else {
                                    setWorkshopPage(page);
                                }
                            }}
                            // showSizeChanger
                            // showQuickJumper
                            showTotal={(total, range) => (
                                <span className="text-sm text-gray-300">
                                    Showing {range[0]} to {range[1]} of {total} bookings
                                </span>
                            )}
                            className="mt-8"
                        />
                    )}
                    <div className="mt-8 text-center text-gray-500 text-sm">
                        © 2025 Groovia. All rights reserved.
                    </div>
                </div>
            </div>
            {isDeleteModalOpen && (
                <ConfirmationModal
                    show={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    title="Delete Workshop"
                    message="Are you sure you want to delete this workshop?"
                    onConfirm={() => {
                        if (editingWorkshop) {
                            handleDeleteWorkshop(editingWorkshop._id);
                            setIsDeleteModalOpen(false);
                            setEditingWorkshop(null);
                        }
                    }
                    }
                />
            )}
            <CreateWorkshopModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleCreateOrUpdateWorkshop}
                initialData={editingWorkshop ? {
                    ...editingWorkshop,
                    // Ensure sessions are mapped correctly if needed, though type compatibility should be handled by TS or runtime
                } as unknown as CreateWorkshopData : undefined}
                isEditing={!!editingWorkshop}
            />

            <GenericDetailsModal
                isOpen={!!viewingWorkshop}
                onClose={() => setViewingWorkshop(null)}
                data={viewingWorkshop}
                entityType="workshop"
            />
        </div>
    );
};

export default InstructorWorkshops;
