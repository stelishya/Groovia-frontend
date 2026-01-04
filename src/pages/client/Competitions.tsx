import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, ScanLine, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import type { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";

import UserNavbar from "../../components/shared/Navbar";
import Sidebar from "../../components/shared/Sidebar";
import type { Competition } from "../../services/competition.service";
import type { CreateCompetitionData } from "../../types/competition.type";
import CreateCompetitionModal from "../../components/ui/CreateCompetitionModal";
import GenericDetailsModal from "../../components/ui/EntityDetailsModal";
import ParticipantsListModal from "../../components/ui/ParticipantsListModal";
import { UserTable } from "../../components/ui/Table";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import {
  getOrganizerCompetitions,
  getRegisteredCompetitions,
  createCompetition,
  updateCompetition,
  deleteCompetition,
  getCompetitionById
} from "../../services/competition.service";

const CompetitionsPage = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  const [viewingCompetition, setViewingCompetition] = useState<Competition | null>(null);
  const [viewingParticipantsCompetition, setViewingParticipantsCompetition] = useState<Competition | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCompetition, setDeletingCompetition] = useState<Competition | null>(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [level, setLevel] = useState('');
  const [style, setStyle] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();

  const { userData } = useSelector((state: RootState) => state.user);

  // Memoize isOrganizer to prevent unnecessary re-renders
  const isOrganizer = useMemo(() => userData?.role?.includes('organizer') || false, [userData?.role]);


  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchCompetitions = useCallback(async () => {
    try {
      setLoading(true);
      // let data: Competition[] = [];
      const params = { search: debouncedSearch, sortBy, level, style, page, limit };

      let response;
      if (isOrganizer) {
        response = await getOrganizerCompetitions(params);
      } else {
        response = await getRegisteredCompetitions(params);
      }

      setCompetitions(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch competitions:', err);
      setError('Failed to load competitions. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [isOrganizer, debouncedSearch, sortBy, level, style, page, limit]);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  const handleCreateCompetition = useCallback(() => {
    setEditingCompetition(null);
    setShowCreateModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowCreateModal(false);
    setEditingCompetition(null);
  }, []);

  const handleCreateOrUpdateCompetition = useCallback(async (data: CreateCompetitionData) => {
    try {
      if (editingCompetition) {
        console.log('Editing competition:', data);
        const response = await updateCompetition(editingCompetition._id, data);
        if (response.success) {
          toast.success('Competition updated successfully!');
          handleCloseModal();
          fetchCompetitions();
        } else {
          toast.error(response.message || 'Failed to update competition');
        }
      } else {
        console.log('Creating competition:', data);
        const response = await createCompetition(data);
        if (response.success) {
          toast.success('Competition created successfully!');
          handleCloseModal();
          fetchCompetitions();
        } else {
          toast.error(response.message || 'Failed to create competition');
        }
      }
    } catch (error) {
      console.error('Failed to save competition:', error);
      toast.error('An error occurred while saving');
    }
  }, [editingCompetition, handleCloseModal, fetchCompetitions]);

  const handleDeleteCompetition = useCallback(async (id: string) => {
    const response = await deleteCompetition(id);
    if (response.success) {
      toast.success('Competition deleted successfully');
      fetchCompetitions();
    } else {
      toast.error(response.message || 'Failed to delete competition');
    }
  }, [fetchCompetitions]);

  const handleViewParticipants = useCallback(async (competitionId: string) => {
    try {
      const detailedCompetition = await getCompetitionById(competitionId);
      if (detailedCompetition) {
        setViewingParticipantsCompetition(detailedCompetition);
      } else {
        toast.error("Failed to fetch participant details");
      }
    } catch (error) {
      console.error("Error fetching competition details:", error);
      toast.error("Could not load participants");
    }
  }, []);

  const handleEditClick = useCallback((competition: Competition) => {
    setEditingCompetition(competition);
    setShowCreateModal(true);
  }, []);

  // if (loading) {
  //   return (
  //     <div className="flex h-screen bg-gray-900">
  //       <div className="flex-grow p-8 bg-deep-purple text-white overflow-y-auto flex items-center justify-center">
  //         <div className="text-center">
  //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
  //           <p className="text-white">Loading competitions...</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="flex h-screen bg-gray-900">
  //       <div className="flex-grow p-8 bg-deep-purple text-white overflow-y-auto flex items-center justify-center">
  //         <div className="text-center">
  //           <p className="text-red-400 mb-4">{error}</p>
  //           <button
  //             onClick={() => window.location.reload()}
  //             className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
  //           >
  //             Try Again
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex-grow p-8 bg-deep-purple text-white overflow-y-auto">
      <UserNavbar title="Dance Competitions" subTitle="Discover and participate in exciting dance competitions" />

      {isOrganizer && (
        <div className="flex justify-end gap-2">
          <button className="flex items-center gap-2 px-6 py-3 bg-transparent border border-purple-500 text-white rounded-lg hover:bg-purple-500/10 transition-colors">
            <ScanLine size={20} className="text-purple-400" />
            <span>QR Scanner</span>
          </button>
          <button
            onClick={handleCreateCompetition}
            className="flex items-center gap-2 px-6 py-3 bg-transparent border border-purple-500 text-white rounded-lg hover:bg-purple-500/10 transition-colors"
          // className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-medium rounded-lg shadow-lg flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create Competition
          </button>
        </div>
      )}
      {/* Tabs */}
      <div className="flex border-b border-purple-700 mb-6">
        <button className="py-2 px-4 text-white border-b-2 border-purple-500 font-semibold">
          {isOrganizer ? 'My Competitions' : 'Registered Competitions'} ({competitions.length})
        </button>
      </div>

      {/* Search and Create Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
          <input
            type="text"
            placeholder="Search competitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-purple-700 text-white placeholder-purple-300 rounded-lg py-2 pl-10 focus:outline-none"
          />
          {searchTerm && <X className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 cursor-pointer" onClick={() => setSearchTerm('')} />}
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-purple-700 text-white border border-purple-500 rounded-lg py-2 px-4 focus:outline-none"
          >
            <option value="">Sort By</option>
            <option value="date:asc">Date (Earliest)</option>
            <option value="date:desc">Date (Latest)</option>
            <option value="fee:asc">Fee (Low to High)</option>
            <option value="fee:desc">Fee (High to Low)</option>
          </select>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="bg-purple-700 text-white border border-purple-500 rounded-lg py-2 px-4 focus:outline-none"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="bg-purple-700 text-white border border-purple-500 rounded-lg py-2 px-4 focus:outline-none"
          >
            <option value="">All Styles</option>
            <option value="hip-hop">Hip Hop</option>
            <option value="contemporary">Contemporary</option>
            <option value="ballet">Ballet</option>
            <option value="jazz">Jazz</option>
            <option value="salsa">Salsa</option>
            <option value="freestyle">Free Style</option>
          </select>
        </div>
      </div>

      {/* Competitions Table */}
      {competitions.length > 0 ? (
        <UserTable
          data={competitions}
          variant={isOrganizer ? 'organizer-competition' : 'dancer-competition'}
          currentUserId={userData?._id}
          onView={(competition) => setViewingCompetition(competition)}
          onEdit={(competition) => handleEditClick(competition)}
          onDelete={(competition) => {
            setDeletingCompetition(competition);
            setIsDeleteModalOpen(true);
          }}
          onViewParticipants={(id) => handleViewParticipants(id)}
          onRetryPayment={(competition) => navigate(`/competition/${competition._id}/checkout`)}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            Competitions Not Found
            {/* {isOrganizer
              ? "You haven't created any competitions yet."
              : "You haven't registered for any competitions yet."} */}
          </p>
          {/* {isOrganizer && (
            <button
              onClick={handleCreateCompetition}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create Your First Competition
            </button>
          )} */}
        </div>
      )}

      {/* Pagination Controls */}
      {total >= 1 && (
        <div className="flex justify-between text-center gap-4">
          <div className="flex justify-center items-center mt-6 gap-4">
            <p className="text-white font-medium">Showing {competitions.length} of {total} competitions</p>
          </div>
          <div className="flex justify-center items-center mt-6 gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <span className="text-white font-medium">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Create Competition Modal */}
      <CreateCompetitionModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateOrUpdateCompetition}
        initialData={editingCompetition ? {
          ...editingCompetition,
        } as CreateCompetitionData : undefined}
        isEditing={!!editingCompetition}
      />
      <GenericDetailsModal
        isOpen={!!viewingCompetition}
        onClose={() => setViewingCompetition(null)}
        data={viewingCompetition}
        entityType="competition"
      />
      <ParticipantsListModal
        isOpen={!!viewingParticipantsCompetition}
        onClose={() => setViewingParticipantsCompetition(null)}
        competition={viewingParticipantsCompetition}
      />
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <ConfirmationModal
          show={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Competition"
          message="Are you sure you want to delete this competition? This action cannot be undone."
          onConfirm={() => {
            if (deletingCompetition) {
              handleDeleteCompetition(deletingCompetition._id);
              setIsDeleteModalOpen(false);
              setDeletingCompetition(null);
            }
          }}
        />
      )}
    </div>
  );
};

const CompetitionsClient: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar activeMenu="Competitions" />
      <CompetitionsPage />
    </div>
  );
};

export default CompetitionsClient;