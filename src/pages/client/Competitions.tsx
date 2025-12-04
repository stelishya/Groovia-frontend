import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { useSelector } from "react-redux";
import { getOrganizerCompetitions, getRegisteredCompetitions, createCompetition, updateCompetition } from "../../services/competition.service";
import type { Competition } from "../../services/competition.service";
import UserNavbar from "../../components/shared/Navbar";
import Sidebar from "../../components/shared/Sidebar";
import CreateCompetitionModal from "../../components/ui/CreateCompetitionModal";
import CompetitionCard from "../../components/ui/CompetitionCard";
import type { CreateCompetitionData } from "../../types/competition.type";
import toast from "react-hot-toast";
import type { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";

// interface CreateCompetitionModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onCropComplete: (blob: Blob) => void;
//   showCropModal: boolean;
//   tempImageSrc: string;
//   onShowCropModal: (show: boolean) => void;
//   onSetTempImageSrc: (src: string) => void;
// }

const CompetitionsPage = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  const [viewingCompetition, setViewingCompetition] = useState<Competition | null>(null);

  const navigate = useNavigate();

  const { userData } = useSelector((state: RootState) => state.user);
  const isOrganizer = userData?.role?.includes('organizer') || false;

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      let data: Competition[] = [];

      if (isOrganizer) {
        data = await getOrganizerCompetitions();
      } else {
        data = await getRegisteredCompetitions();
        console.log("Registered Competitions:", data);
      }

      setCompetitions(data || []);
    } catch (err) {
      console.error('Failed to fetch competitions:', err);
      setError('Failed to load competitions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, [isOrganizer]);

  const handleCreateCompetition = () => {
    setEditingCompetition(null);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingCompetition(null);
  };

  const handleCreateOrUpdateCompetition = async (data: CreateCompetitionData) => {
    try {
      if (editingCompetition) {
        const response = await updateCompetition(editingCompetition._id, data);
        if (response.success) {
          toast.success('Competition updated successfully!');
          handleCloseModal();
          fetchCompetitions();
        } else {
          toast.error(response.message || 'Failed to update competition');
        }
      } else {
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
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500 text-white";
      case "closed": return "bg-red-500 text-white";
      case "completed": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

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
          <button
            onClick={handleCreateCompetition}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-medium rounded-lg shadow-lg flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create Competition
          </button>
        )}
      </div>

      {/* Competitions Grid */}
      {competitions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition) => {
            const userRegistration = competition.registeredDancers?.find(
              (dancer: any) => dancer.dancerId === userData?._id || dancer.dancerId?._id === userData?._id
            );
            const paymentStatus = userRegistration?.paymentStatus;
            return (
              <CompetitionCard
                key={competition._id}
                competition={competition}
                isOrganizer={isOrganizer}
                onViewDetails={(comp) => setViewingCompetition(comp)}
                onRetryPayment={(comp) => navigate(`/competition/${comp._id}/checkout`)}
                paymentStatus={paymentStatus}
                getStatusColor={getStatusColor}
              />
            )
            })}

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