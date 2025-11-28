// Utility function to geocode venue address and get coordinates
export const geocodeVenue = async (venue: string): Promise<[number, number]> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(venue)}&limit=1`
        );
        const data = await response.json();

        if (data && data.length > 0) {
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }

        // Default to India center if geocoding fails
        return [20.5937, 78.9629];
    } catch (error) {
        console.error('Failed to geocode venue:', error);
        // Default to India center on error
        return [20.5937, 78.9629];
    }
};
