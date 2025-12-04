import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { getCompetitionById } from '../../services/competition.service';
import type { Competition } from '../../services/competition.service';
import Checkout from '../../components/shared/Checkout';
import toast from 'react-hot-toast';

const CompetitionCheckoutPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user.userData);
    const [competition, setCompetition] = useState<Competition | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompetition = async () => {
            if (!id) return;
            try {
                const result = await getCompetitionById(id);
                if (result) {
                    setCompetition(result);
                } else {
                    toast.error('Failed to load competition details');
                    navigate('/competitions');
                }
            } catch (error) {
                console.error('Error fetching competition:', error);
                toast.error('Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchCompetition();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!competition) {
        // return null;
        return (
            <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
                <p className="text-white text-xl">Competition not found</p>
            </div>
        );
    }

    return (
        <Checkout
            competition={competition}
            userEmail={user?.email || ''}
            onUpgrade={() => navigate('/bookings')}
            onCancel={() => navigate(-1)}
        />
    );
};

export default CompetitionCheckoutPage;
