import { useState, useEffect } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import InstructorWorkshopCard from '../../components/ui/InstructorWorkshopCard';
import CreateWorkshopModal from '../../components/ui/CreateWorkshopModal';
import WorkshopDetailsModal from '../../components/ui/WorkshopDetailsModal';
import { Search, Plus, ScanLine, Bell, Filter } from 'lucide-react';
import { getInstructorWorkshops, createWorkshop, updateWorkshop, deleteWorkshop } from '../../services/workshop/workshop.service';
import type { Workshop, CreateWorkshopData } from '../../types/workshop.type';
import toast from 'react-hot-toast';

const InstructorWorkshops = () => {
    const [filter, setFilter] = useState('All Types');
    const [searchQuery, setSearchQuery] = useState('');
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
    const [viewingWorkshop, setViewingWorkshop] = useState<Workshop | null>(null);

    const fetchWorkshops = async () => {
        setLoading(true);
        const response = await getInstructorWorkshops();
        if (response.success && response.data) {
            setWorkshops(response.data);
        } else {
            toast.error(response.message || 'Failed to fetch workshops');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchWorkshops();
    }, []);

    const handleCreateOrUpdateWorkshop = async (data: CreateWorkshopData) => {
        if (editingWorkshop) {
            const response = await updateWorkshop(editingWorkshop._id, data);
            if (response.success) {
                toast.success('Workshop updated successfully!');
                handleCloseModal();
                fetchWorkshops();
            } else {
                toast.error(response.message || 'Failed to update workshop');
            }
        } else {
            const response = await createWorkshop(data);
            if (response.success) {
                toast.success('Workshop created successfully!');
                handleCloseModal();
                fetchWorkshops();
            } else {
                toast.error(response.message || 'Failed to create workshop');
            }
        }
    };

    const handleEditClick = (workshop: Workshop) => {
        setEditingWorkshop(workshop);
        setIsCreateModalOpen(true);
    };

    const handleDeleteClick = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this workshop?')) {
            const response = await deleteWorkshop(id);
            if (response.success) {
                toast.success('Workshop deleted successfully');
                fetchWorkshops();
            } else {
                toast.error(response.message || 'Failed to delete workshop');
            }
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

    const filteredWorkshops = workshops.filter(workshop =>
        workshop.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-[#0f0f13] text-white overflow-hidden">
            <Sidebar activeMenu='Workshops'/>

            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <header className="flex justify-between items-center p-8 pb-4">
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
                </header>

                {/* Controls Bar */}
                <div className="px-8 py-6 flex flex-wrap justify-between items-center gap-4">
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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9] transition-colors">
                            <span>All Types</span>
                            <Filter size={16} />
                        </button>
                    </div>
                </div>

                {/* Workshops Grid */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                    {loading ? (
                        <p className="text-center text-gray-400 mt-10">Loading workshops...</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                            {filteredWorkshops.length > 0 ? (
                                filteredWorkshops.map((workshop) => (
                                    <InstructorWorkshopCard
                                        key={workshop._id}
                                        title={workshop.title}
                                        status={getStatus(workshop)}
                                        date={new Date(workshop.startDate).toLocaleDateString()}
                                        time={workshop.sessions[0]?.startTime || 'TBA'}
                                        mode={workshop.mode}
                                        attendeesCount={workshop.participants?.length || 0}
                                        maxAttendees={workshop.maxParticipants}
                                        onViewDetails={() => handleViewDetails(workshop)}
                                        onEdit={() => handleEditClick(workshop)}
                                        onDelete={() => handleDeleteClick(workshop._id)}
                                    />
                                ))
                            ) : (
                                <p className="text-center col-span-full text-gray-500 text-xl mt-10">
                                    No workshops found. Create one to get started! 🚀
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mt-8 text-center text-gray-500 text-sm">
                        © 2025 Groovia. All rights reserved.
                    </div>
                </div>
            </div>

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

            <WorkshopDetailsModal
                isOpen={!!viewingWorkshop}
                onClose={() => setViewingWorkshop(null)}
                workshop={viewingWorkshop}
            />
        </div>
    );
};

export default InstructorWorkshops;
