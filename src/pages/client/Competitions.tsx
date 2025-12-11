import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, Edit, Trash, ScanLine } from "lucide-react";
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
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import {
  getOrganizerCompetitions,
  getRegisteredCompetitions,
  createCompetition,
  updateCompetition,
  deleteCompetition
} from "../../services/competition.service";

const CompetitionsPage = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  const [viewingCompetition, setViewingCompetition] = useState<Competition | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCompetition, setDeletingCompetition] = useState<Competition | null>(null);

  const navigate = useNavigate();

  const { userData } = useSelector((state: RootState) => state.user);

  // Memoize isOrganizer to prevent unnecessary re-renders
  const isOrganizer = useMemo(() => userData?.role?.includes('organizer') || false, [userData?.role]);

  const fetchCompetitions = useCallback(async () => {
    try {
      setLoading(true);
      let data: Competition[] = [];

      if (isOrganizer) {
        data = await getOrganizerCompetitions();
      } else {
        data = await getRegisteredCompetitions();
      }

      setCompetitions(data || []);
    } catch (err) {
      console.error('Failed to fetch competitions:', err);
      setError('Failed to load competitions. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [isOrganizer]);

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

  const handleEditClick = useCallback((competition: Competition) => {
    setEditingCompetition(competition);
    setShowCreateModal(true);
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "active": return "bg-green-500 text-white";
      case "closed": return "bg-red-500 text-white";
      case "completed": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  }, []);

  // Handle S3 image URL - if it's just a key, construct the full URL
  const getImageUrl = useCallback((imageKey: string) => {
    if (!imageKey) return '/placeholder-competition.jpg';
    // If it's already a full URL, return it
    if (imageKey.startsWith('http')) return imageKey;
    // Otherwise, it's an S3 key - backend returns signed URLs
    return imageKey;
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <div className="flex-grow p-8 bg-deep-purple text-white overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-white">Loading competitions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-900">
        <div className="flex-grow p-8 bg-deep-purple text-white overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow p-8 bg-deep-purple text-white overflow-y-auto">
      <UserNavbar title="Dance Competitions" subTitle="Discover and participate in exciting dance competitions" />

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
            className="w-full bg-purple-700 text-white placeholder-purple-300 rounded-lg py-2 pl-10 focus:outline-none"
          />
        </div>
        {isOrganizer && (
          <div className="flex gap-2">
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
      </div>

      {/* Competitions Table */}
      {competitions.length > 0 ? (
        <div className="bg-purple-800/30 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-900/50 border-b border-purple-700">
              {/* {competitions.map((competition) => {
                  const userRegistration = competition.registeredDancers?.find(
                    (dancer: any) => dancer.dancerId === userData?._id || dancer.dancerId?._id === userData?._id
                  );
                  const paymentStatus = userRegistration?.paymentStatus;

                  return ( */}
                <tr>
                  <th className="px-6 py-4 text-center text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Competition
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Fee
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-purple-300 uppercase tracking-wider">
                    View
                  </th>
                  {isOrganizer && (
                    <th className="px-6 py-4 text-center text-xs font-medium text-purple-300 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                  {!isOrganizer && (
                    <th className="px-6 py-4 text-center text-xs font-medium text-purple-300 uppercase tracking-wider">
                      Payment
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-purple-800/20 divide-y divide-purple-700">
                {competitions.map((competition) => {
                  const userRegistration = competition.registeredDancers?.find(
                    (dancer: any) => dancer.dancerId === userData?._id || dancer.dancerId?._id === userData?._id
                  );
                  const paymentStatus = userRegistration?.paymentStatus;

                  return (
                    <tr
                      key={competition._id}
                      className="hover:bg-purple-700/30 transition-colors"
                    >
                      {/* Competition Info with Image */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(competition.posterImage)}
                            alt={competition.title}
                            className="w-12 h-12 rounded-lg object-cover border-2 border-purple-500"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-competition.jpg';
                            }}
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-white truncate max-w-xs">
                              {competition.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-purple-600/50 text-purple-200 text-xs rounded-full">
                                {competition.style}
                              </span>
                              <span className="px-2 py-0.5 bg-purple-600/50 text-purple-200 text-xs rounded-full">
                                {competition.level}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {new Date(competition.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-xs text-purple-300">
                          {competition.duration}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-white max-w-xs truncate">
                          {competition.mode === 'online' ? (
                            <span className="text-purple-300">🌐 Online</span>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <span>{competition.location?.substring(0, 20) || 'TBA'}</span>
                              {/* <span className="text-purple-300">📍View Location</span> */}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Participants */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {competition.registeredDancers.length} / {competition.maxParticipants}
                        </div>
                        <div className="w-full bg-purple-900 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-purple-500 h-1.5 rounded-full"
                            style={{
                              width: `${(competition.registeredDancers.length / competition.maxParticipants) * 100}%`
                            }}
                          />
                        </div>
                      </td>

                      {/* Fee */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-white">
                          ₹{competition.fee}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(competition.status)}`}>
                          {competition.status}
                        </span>
                        {paymentStatus && (
                          <div className="mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentStatus === 'paid'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : paymentStatus === 'failed'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              }`}>
                              {paymentStatus}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setViewingCompetition(competition)}
                            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700 transition-colors"
                          >
                            View
                          </button>
                        </td>
                      {/* Actions */}

                        <td>
                          <div className="flex justify-end gap-2">

                          {isOrganizer && (
                            <>
                              <button
                                onClick={() => handleEditClick(competition)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
                                >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingCompetition(competition);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition-colors flex items-center gap-1"
                                >
                                <Trash size={14} />
                              </button>
                            </>
                          )}
                                </div>
                          </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {paymentStatus === 'failed' && !isOrganizer && (
                            <button
                              onClick={() => navigate(`/competition/${competition._id}/checkout`)}
                              className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs hover:bg-orange-700 transition-colors"
                            >
                              Retry Payment
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            {isOrganizer
              ? "You haven't created any competitions yet."
              : "You haven't registered for any competitions yet."}
          </p>
          {isOrganizer && (
            <button
              onClick={handleCreateCompetition}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create Your First Competition
            </button>
          )}
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