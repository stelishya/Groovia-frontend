import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import type { RootState } from '../../redux/store';
import { getEventById } from '../../services/client/client.service';
// import type { EventRequest } from '../../types/BookingsClient.type';
import Checkout from '../../components/shared/Checkout';
import type { EventRequest } from './BookingsClient';

const EventCheckoutPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector((state: RootState) => state.user.userData);
    const [eventRequest, setEventRequest] = useState<EventRequest | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEventRequest = async () => {
            // Check if data was passed via navigation state
            const stateEvent = location.state?.eventBooking as EventRequest | undefined;
            if (stateEvent) {
                setEventRequest(stateEvent);
                setLoading(false);
                return;
            }

            if (!id) return;
            try {
                const eventData = await getEventById(id);
                if (eventData) {
                    setEventRequest(eventData);
                } else {
                    toast.error('Failed to load event details');
                    navigate('/bookings');
                }
            } catch (error) {
                console.error('Error fetching event:', error);
                toast.error('Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchEventRequest();
    }, [id, navigate, location.state]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!eventRequest) {
        // return null;
        return (
            <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
                <p className="text-white text-xl">Event not found</p>
            </div>
        );
    }

    return (
        <Checkout
            eventRequest={eventRequest}
            userEmail={user?.email || ''}
            onUpgrade={() => navigate('/bookings')}
            onCancel={() => navigate(-1)}
        />
    );
};

export default EventCheckoutPage;
