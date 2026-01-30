import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import WorkshopCard from "../../components/ui/WorkshopCard";
import CompetitionCard from "../../components/ui/CompetitionCard";
import { getAllWorkshops } from "../../services/workshop/workshop.service";
import { getAllCompetitions } from "../../services/competition.service";
import type { Workshop } from "../../types/workshop.type";
import type { Competition } from "../../services/competition.service";

export const CompetitionsSection = () => {
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompetitions = async () => {
            setLoading(true);
            try {
                // Fetch top 3 most booked (popularity) competitions
                const response = await getAllCompetitions({
                    sortBy: 'popularity',
                    status: 'active',
                    limit: '3'
                } as any);
                const list = response?.data || [];
                setCompetitions(list.slice(0, 3));
            } catch (error) {
                console.error("Failed to fetch competitions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCompetitions();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "active": return "bg-green-500 text-white";
            case "closed": return "bg-red-500 text-white";
            case "completed": return "bg-blue-500 text-white";
            default: return "bg-gray-500 text-white";
        }
    };

    return (
        <div className="mt-12 p-6 rounded-xl">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-purple-500">
                    Top Competitions
                </h1>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-white text-xl">Loading competitions...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {competitions.length > 0 ? (
                        <>
                            {competitions.map((competition) => (
                                <CompetitionCard
                                    key={competition._id}
                                    competition={competition}
                                    isOrganizer={false}
                                    onViewDetails={(comp) => navigate(`/competition/${comp._id}`)}
                                    getStatusColor={getStatusColor}
                                />
                            ))}
                            <div
                                onClick={() => navigate('/competitions')}
                                className="flex flex-col items-center justify-center p-6 bg-white/5 border border-purple-500/20 rounded-xl cursor-pointer hover:bg-white/10 transition-all group min-h-[300px]"
                            >
                                <div className="p-4 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors mb-4">
                                    <ArrowRight size={32} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                                </div>
                                <span className="text-xl font-medium text-purple-300 group-hover:text-white transition-colors">Explore More</span>
                            </div>
                        </>
                    ) : (
                        <p className="text-center col-span-full text-gray-500 text-2xl py-12">
                            No upcoming competitions found 🏆
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchWorkshops = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('sortBy', 'popularity');
            params.append('status', 'upcoming');
            params.append('page', '1');
            params.append('limit', '3');
            params.append('skipTotal', 'true');

            const response = await getAllWorkshops(params);
            if (response.success && response.data) {
                const list = Array.isArray(response.data) ? response.data : response.data.workshops || [];
                setWorkshops(list.slice(0, 3));
            }
        } catch (error) {
            console.error("Failed to fetch workshops:", error);
            setWorkshops([])
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchWorkshops();
    }, []);

    return (
        <div className="p-4 text-white bg-[#0a0516]">
            <div className="pl-12 pt-8">
                <h1 className="text-5xl font-light leading-tight">LEARN, PERFORM, COMPETE,<br />TEACH – ALL IN ONE PLATFORM</h1>
                <p className="text-purple-400/80 font-medium mt-4 max-w-lg">Your ultimate destination for dance education, competitive showcases, and community engagement.</p>
                <button
                    onClick={() => navigate('/workshops')}
                    className="mt-8 px-10 py-4 font-bold text-white rounded-full bg-gradient-to-r from-pink-500 to-orange-400 hover:opacity-90 transition-opacity"
                >
                    Explore Opportunities
                </button>
            </div>

            {/* Workshops Feed Section */}
            <div className="mt-16 p-6 rounded-xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold text-purple-500">
                        Popular Workshops
                    </h1>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-white text-xl">Loading workshops...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {workshops.length > 0 ? (
                            <>
                                {workshops.map((workshop) => (
                                    <WorkshopCard
                                        key={workshop._id}
                                        image={workshop.posterImage}
                                        title={workshop.title}
                                        category={workshop.style}
                                        price={workshop.fee}
                                        instructorName={workshop.instructor?.username || 'Unknown'}
                                        studioName={workshop.location || 'Online'}
                                        date={workshop.startDate}
                                        onBook={() => navigate(`/workshop/${workshop._id}`)}
                                    />
                                ))}
                                <div
                                    onClick={() => navigate('/workshops')}
                                    className="flex flex-col items-center justify-center p-6 bg-white/5 border border-purple-500/20 rounded-xl cursor-pointer hover:bg-white/10 transition-all group min-h-[300px]"
                                >
                                    <div className="p-4 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors mb-4">
                                        <ArrowRight size={32} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                                    </div>
                                    <span className="text-xl font-medium text-purple-300 group-hover:text-white transition-colors">Explore More</span>
                                </div>
                            </>
                        ) : (
                            <p className="text-center col-span-full text-gray-500 text-2xl py-12">
                                No upcoming workshops found 🎭
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Competitions Feed Section */}
            <CompetitionsSection />

            <div className="mt-20 py-8 text-center text-gray-500 text-sm border-t border-purple-900/30">
                © {new Date().getFullYear()} Groovia. All rights reserved.
            </div>
        </div>
    )
};

export default function Home() {
    return (
        <Dashboard />
    );
}