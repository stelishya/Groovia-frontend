import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, Plus, Search, Upload, Crop, X } from "lucide-react";
import { getCompetitions } from "../../services/client/client.service";
import type { Competition } from "../../services/client/client.service";
import UserNavbar from "../../components/shared/Navbar";
import Sidebar from "../../components/shared/Sidebar";
// import ImageCropModal from "../../components/ui/ImageCropModal";
import CreateCompetitionModal from "../../components/ui/CreateCompetitionModal";
import type { CreateCompetitionData } from "../../types/competition.type";

interface CreateCompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (blob: Blob) => void;
  showCropModal: boolean;
  tempImageSrc: string;
  onShowCropModal: (show: boolean) => void;
  onSetTempImageSrc: (src: string) => void;
}

const CompetitionsPage = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOrganizer] = useState(true); // Mock organizer role
  const [showCreateModal, setShowCreateModal] = useState(false);
  // const [showCropModal, setShowCropModal] = useState(false);
  // const [tempImageSrc, setTempImageSrc] = useState<string>('');
  const [editingWorkshop, setEditingWorkshop] = useState<Competition | null>(null);
  const [viewingWorkshop, setViewingWorkshop] = useState<Competition | null>(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        setLoading(true);
        const data = await getCompetitions();
        setCompetitions(data);
      } catch (err) {
        console.error('Failed to fetch competitions:', err);
        setError('Failed to load competitions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  // const handleCropComplete = (croppedImageBlob: Blob) => {
  //   const reader = new FileReader();
  //   reader.onloadend = () => {
  //     const result = reader.result as string;
  //     // This will be handled by the modal's form state
  //     setShowCropModal(false);
  //   };
  //   reader.readAsDataURL(croppedImageBlob);
  // };

  const handleCreateCompetition = () => {
    setShowCreateModal(true);
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
            Competitions ({competitions.length})
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
        <div className="space-y-4">
          {competitions.map((competition, index) => (
            <div
              key={competition._id}
              className="bg-gradient-to-br from-deep-purple to-purple-500 rounded-lg p-6"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Competition Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 mr-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                <img 
                  src={competition.posterImage} 
                  alt={competition.title}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-white"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-1">{competition.title}</h3>
                      <p className="text-white/80 text-sm line-clamp-2">{competition.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">
                          {competition.style}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(competition.status)}`}>
                  {competition.status}
                        </span>
                  </div>
                  </div>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="h-24 w-px bg-white/30"></div>

                {/* Competition Details */}
                <div className="flex-1 pl-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-white/90">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">{new Date(competition.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}</span>
                    </div>
                    {competition.location && (
                      <div className="flex items-center text-white/90">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm line-clamp-1">{competition.location}</span>
                          </div>
                    )}
                    <div className="flex items-center text-white/90">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">{competition.registeredDancers.length} / {competition.maxParticipants} participants</span>
                          </div>
                    <div className="flex items-center text-white/90 mt-3">
                      <span className="text-lg font-bold text-white">${competition.fee}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end mt-4 space-x-3">
                {competition.registeredDancers.length >= competition.maxParticipants ? (
                  <button className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm cursor-not-allowed">
                    Fully Booked
                  </button>
                ) : (
                  <>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">
                      View Details
                    </button>
                    {!isOrganizer && (
                      <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600">
                        Register Now
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Create Competition Modal */}
        {/* <CreateCompetitionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCompetition}
          initialData={editingCompetition ? {
            ...editingCompetition,
          }as unknown as CreateCompetitionData:undefined}
          isEditing={editingCompetition}
          // onCropComplete={handleCropComplete}
          // showCropModal={showCropModal}
          // tempImageSrc={tempImageSrc}
          // onShowCropModal={setShowCropModal}
          // onSetTempImageSrc={setTempImageSrc}
        /> */}
        {/* <CompetitionDetailsModal
                isOpen={!!viewingCompetition}
                onClose={() => setViewingCompetition(null)}
                competition={viewingCompetition}
            /> */}

        {/* Image Crop Modal */}
        {/* <ImageCropModal
          isOpen={showCropModal}
          imageSrc={tempImageSrc}
          onClose={() => setShowCropModal(false)}
          onCropComplete={handleCropComplete}
          aspectRatio={16/9}
        /> */}
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