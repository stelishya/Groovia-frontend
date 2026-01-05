import { Calendar, Clock, MapPin, Users, Video, AlertCircle, ArrowLeft, FileText, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getCompetitionById } from "../../services/competition.service";
import type { Competition } from "../../services/competition.service";
import { CompetitionMode } from "../../types/competition.type";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import bgImage from "../../assets/bg.jpg"

// import { CompetitionMode, type Competition } from "../../types/competition.type";

export default function CompetitionDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [competition, setCompetition] = useState<Competition | null>(null);
    const [loading, setLoading] = useState(true);
    const [venueCoords, setVenueCoords] = useState<[number, number]>([20.5937, 78.9629]);
    const [loadingCoords, setLoadingCoords] = useState(false);
    const location = useLocation();
    const isRegistered = location.state?.isRegistered;
    const paymentStatus = location.state?.paymentStatus;

    useEffect(() => {
        const fetchCompetition = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const result = await getCompetitionById(id);
                if (result) {
                    console.log("competition result ahn", result);
                    setCompetition(result);
                } else {
                    console.error("Failed to fetch competition: No data returned");
                }
            } catch (error) {
                console.error("Failed to fetch competition:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompetition();
    }, [id]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    };

    // const formatTime = (timeString: string) => {
    //     const [hours, minutes] = timeString.split(':');
    //     const hour = parseInt(hours);
    //     const ampm = hour >= 12 ? 'PM' : 'AM';
    //     const hour12 = hour % 12 || 12;
    //     return `${hour12}:${minutes} ${ampm}`;
    // };
    const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
    const [mapModalOpen, setMapModalOpen] = useState(false);
    const handleViewMap = async (venue: string) => {
        setSelectedVenue(venue);
        setMapModalOpen(true);
        setLoadingCoords(true);
        try {
            // Geocode the venue address
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(venue)}&limit=1`
            );
            const data = await response.json();
            if (data && data.length > 0) {
                setVenueCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
            } else {
                // Default to India center if geocoding fails
                setVenueCoords([20.5937, 78.9629]);
            }
        } catch (error) {
            console.error('Failed to geocode venue:', error);
            setVenueCoords([20.5937, 78.9629]);
        } finally {
            setLoadingCoords(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
                <p className="text-white text-xl">Loading competition details...</p>
            </div>
        );
    }

    if (!competition) {
        return (
            <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white text-xl mb-4">Competition not found</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }
    console.log("typeof competition.organizer_id",typeof competition.organizer_id )
    const organizer = typeof competition.organizer_id === 'object' ? competition.organizer_id : { _id: competition.organizer_id, username: 'Unknown Organizer', profileImage: '' };

    return (
        <div className="min-h-screen bg-[#0f0f13] text-white">
            {/* Hero Section */}
            <div className="relative h-[60vh] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 opacity-90" />
                <img
                    // src="/src/assets/bg.jpg"
                    src={bgImage}
                    alt="background image"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f13] via-[#0f0f13]/50 to-transparent" />

                <div className="relative container mx-auto px-4 h-full flex flex-col justify-between py-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-2 left-3 w-14 h-14  rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all duration-200 z-10"
                        // className="flex items-center gap-2 px-4 py-2 bg-purple-600/80 hover:bg-purple-700 rounded-lg transition-colors w-fit z-10"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex flex-col lg:flex-row gap-8 items-start z-10">
                        {/* Left side - Title and Info */}
                        <div className="flex-1 mt-14">
                            <div className="flex flex-wrap gap-3 mb-4">
                                <span className="px-4 py-1 bg-purple-600/80 border border-purple-400/40 rounded-full text-sm font-semibold uppercase tracking-wider">
                                    {competition.style}
                                </span>
                                <span className="px-4 py-1 bg-pink-600/80 border border-pink-400/40 rounded-full text-sm font-semibold uppercase tracking-wider">
                                    {competition.mode}
                                </span>
                                <span className="px-4 py-1 bg-blue-600/80 border border-blue-400/40 rounded-full text-sm font-semibold uppercase tracking-wider">
                                    {competition.level}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-100 bg-clip-text text-transparent">
                                {competition.title}
                            </h1>

                            <div className="flex items-center gap-4 text-gray-200">
                                <button
                                    className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                                    onClick={() => navigate(`/dancer-profile/${organizer._id}`)}
                                >
                                    <img
                                        src={organizer.profileImage || `https://ui-avatars.com/api/?name=${organizer.username}`}
                                        alt={organizer.username}
                                        className="w-14 h-14 rounded-full border-2 border-purple-400 object-cover hover:border-purple-300 transition-colors"
                                        onError={(e) => {
                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${organizer.username}`;
                                        }}
                                    />
                                    <div className="text-left">
                                        <p className="text-sm text-gray-400">Organizer</p>
                                        <p className="font-semibold text-lg hover:text-purple-300 transition-colors">{organizer.username}</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Right side - Poster Image */}
                        <div className="lg:w-96 w-full">
                            <div className="relative rounded-2xl overflow-hidden border-4 border-purple-400/30 shadow-2xl group">
                                <img
                                    src={competition.posterImage}
                                    alt={competition.title}
                                    className="w-full h-80 lg:h-96 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 relative z-20">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <div className="p-8 bg-purple-900/30 backdrop-blur border border-purple-500/30 rounded-xl hover:border-purple-400/50 transition-all duration-300">
                            <h2 className="text-2xl font-bold mb-4">About This Competition</h2>
                            <p className="text-gray-300 leading-relaxed text-lg">
                                {competition.description}
                            </p>
                        </div>

                        {/* Competition Details Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-6 bg-purple-900/30 backdrop-blur border border-purple-500/30 rounded-xl hover:border-purple-400/50 hover:scale-105 transition-all duration-300 group">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Start Date</p>
                                        <p className="font-semibold">{formatDate(competition.date)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-purple-900/30 backdrop-blur border border-purple-500/30 rounded-xl hover:border-purple-400/50 hover:scale-105 transition-all duration-300 group">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-pink-600/20 text-pink-400 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Registration Deadline</p>
                                        <p className="font-semibold">{formatDate(competition.registrationDeadline)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-purple-900/30 backdrop-blur border border-purple-500/30 rounded-xl hover:border-purple-400/50 hover:scale-105 transition-all duration-300 group">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Age Category</p>
                                        <p className="font-semibold">{competition.age_category}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-purple-900/30 backdrop-blur border border-purple-500/30 rounded-xl hover:border-purple-400/50 hover:scale-105 transition-all duration-300 group">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-green-600/20 text-green-400 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Duration</p>
                                        <p className="font-semibold">{competition.duration}</p>
                                    </div>
                                </div>
                            </div>

                            {competition.mode === CompetitionMode.OFFLINE && competition.location && (
                                <div className="p-6 bg-purple-900/30 backdrop-blur border border-purple-500/30 rounded-xl hover:border-purple-400/50 transition-all duration-300 group">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-400 mb-1">Location</p>
                                            <p className="font-semibold mb-2">{competition.location}</p>
                                            <button
                                                onClick={() => handleViewMap(competition.location!)}
                                                className="text-sm text-purple-400 hover:text-purple-300 underline-offset-4 hover:underline flex items-center gap-1"
                                            >
                                                <MapPin size={14} />
                                                View on Map
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {competition.mode === CompetitionMode.ONLINE && competition.meeting_link && (
                                <div className="p-6 bg-purple-900/30 backdrop-blur border border-purple-500/30 rounded-xl hover:border-purple-400/50 hover:scale-105 transition-all duration-300 group">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <Video className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400 mb-1">Meeting Link</p>
                                            <a href={competition.meeting_link} target="_blank" rel="noopener noreferrer" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors underline-offset-4 hover:underline">
                                                Join Online Session
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-6 bg-purple-900/30 backdrop-blur border border-purple-500/30 rounded-xl hover:border-purple-400/50 hover:scale-105 transition-all duration-300 group">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Participants</p>
                                        <p className="font-semibold">
                                            {competition.registeredDancers?.length || 0} / {competition.maxParticipants} registered
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {competition.document && (
                                <div className="p-6 bg-purple-900/30 backdrop-blur border border-purple-500/30 rounded-xl hover:border-purple-400/50 hover:scale-105 transition-all duration-300 group">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-orange-600/20 text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400 mb-1">Document</p>
                                            <a href={competition.document} target="_blank" rel="noopener noreferrer" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors underline-offset-4 hover:underline">
                                                View Document
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Registration Card */}
                        <div className="p-8 bg-gradient-to-br from-purple-900/50 via-pink-900/50 to-purple-900/50 backdrop-blur border border-purple-400/30 rounded-xl sticky top-6">
                            <div className="text-center mb-6">
                                <p className="text-sm text-gray-300 mb-2">Competition Fee</p>
                                <p className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent">
                                    ₹{competition.fee}
                                </p>
                            </div>

                            <div className="space-y-3">
                                {isRegistered ? (
                                    paymentStatus === 'failed' ? (
                                        <button
                                            onClick={() => navigate(`/competition/${competition._id}/checkout`)}
                                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 text-lg rounded-lg transition-all duration-300 hover:scale-105"
                                        >
                                            Retry Payment
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold cursor-not-allowed opacity-75"
                                        >
                                            ✓ Registered
                                        </button>
                                    )
                                ) : (
                                    <button
                                        onClick={() => navigate(`/competition/${competition._id}/checkout`)}
                                        className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:opacity-90 text-white font-semibold py-4 text-lg rounded-lg transition-all duration-300 hover:scale-105"
                                    >
                                        Register Now
                                    </button>
                                )}
                            </div>

                            <div className="mt-6 p-4 rounded-lg bg-purple-600/20 border border-purple-400/30">
                                <p className="text-sm text-gray-300 text-center">
                                    <span className="font-semibold text-purple-300">
                                        {(competition.maxParticipants || 0) - (competition.registeredDancers?.length || 0)}
                                    </span>{" "}
                                    spots remaining
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Location Map Modal */}
            {mapModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-purple-900 rounded-2xl p-6 max-w-3xl w-full border border-purple-500">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-white flex items-center">
                                <MapPin className="mr-2" />
                                Venue Location
                            </h3>
                            <button
                                onClick={() => setMapModalOpen(false)}
                                className="text-white hover:text-gray-300 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <p className="text-purple-300 mb-4">{selectedVenue}</p>
                        {loadingCoords ? (
                            <div className="h-96 flex items-center justify-center bg-purple-800 rounded-xl">
                                <p className="text-white">Loading map...</p>
                            </div>
                        ) : venueCoords ? (
                            <MapContainer
                                center={venueCoords}
                                zoom={15}
                                className="h-96 w-full rounded-xl border-2 border-purple-500"
                                style={{ zIndex: 0 }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={venueCoords}>
                                    <Popup>{selectedVenue}</Popup>
                                </Marker>
                            </MapContainer>
                        ) : (
                            <div className="h-96 flex items-center justify-center bg-purple-800 rounded-xl">
                                <p className="text-white">Unable to load location</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
