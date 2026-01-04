import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { getWorkshopById } from '../../services/workshop/workshop.service';
import type { Workshop } from '../../types/workshop.type';
import Checkout from '../../components/shared/Checkout';
import toast from 'react-hot-toast';

const WorkshopCheckoutPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user.userData);
    const [workshop, setWorkshop] = useState<Workshop | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkshop = async () => {
            if (!id) return;
            try {
                const response = await getWorkshopById(id);
                if (response.success) {
                    setWorkshop(response.data);
                } else {
                    toast.error('Failed to load workshop details');
                    navigate('/workshops');
                }
            } catch (error) {
                console.error('Error fetching workshop:', error);
                toast.error('Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchWorkshop();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!workshop) {
        // return null;
        return (
            <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
                <p className="text-white text-xl">Workshop not found</p>
            </div>
        );
    }

    return (
        <Checkout
            workshop={workshop}
            userEmail={user?.email || ''}
            onUpgrade={() => navigate('/bookings')}
            onCancel={() => navigate(-1)}
        />
    );
};

export default WorkshopCheckoutPage;
