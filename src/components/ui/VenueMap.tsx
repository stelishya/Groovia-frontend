import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import { MapPin, Search, X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in React Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface LocationPickerProps {
  onSelect: (latlng: L.LatLng, address?: string) => void;
  position: L.LatLng | null;
}

function LocationPicker({ onSelect, position }: LocationPickerProps) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
      reverseGeocode(e.latlng);
    },
  });

  const reverseGeocode = async (latlng: L.LatLng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      const data = await response.json();
      if (data.display_name) {
        onSelect(latlng, data.display_name);
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    }
  };

  return position ? <Marker position={position} /> : null;
}

function MapUpdater({ center }: { center: L.LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

interface VenueMapProps {
  onVenueSelect: (venue: { lat: number; lng: number; address: string }) => void;
  initialCenter?: [number, number];
  className?: string;
}

export default function VenueMap({ onVenueSelect, initialCenter = [20.5937, 78.9629], className = "" }: VenueMapProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [address, setAddress] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<L.LatLng>(L.latLng(initialCenter[0], initialCenter[1]));

  const handleLocationSelect = (latlng: L.LatLng, addr?: string) => {
    setPosition(latlng);
    if (addr) {
      setAddress(addr);
      onVenueSelect({
        lat: latlng.lat,
        lng: latlng.lng,
        address: addr,
      });
    }
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultClick = (result: SearchResult) => {
    const latlng = L.latLng(parseFloat(result.lat), parseFloat(result.lon));
    setPosition(latlng);
    setMapCenter(latlng);
    setAddress(result.display_name);
    setSearchQuery("");
    setSearchResults([]);
    onVenueSelect({
      lat: latlng.lat,
      lng: latlng.lng,
      address: result.display_name,
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchLocation(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a location..."
          className="w-full px-4 py-2 pl-10 bg-purple-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {searchQuery && (
          <X
            className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 cursor-pointer"
            size={20}
            onClick={() => {
              setSearchQuery("");
              setSearchResults([]);
            }}
          />
        )}
      </div>

      {/* Search Results Dropdown */}
      {searchResults.length > 0 && (
        <div className="bg-purple-800 rounded-lg max-h-48 overflow-y-auto border border-purple-500">
          {searchResults.map((result) => (
            <div
              key={result.place_id}
              onClick={() => handleSearchResultClick(result)}
              className="px-4 py-2 hover:bg-purple-700 cursor-pointer text-white text-sm border-b border-purple-600 last:border-b-0"
            >
              <MapPin className="inline mr-2" size={16} />
              {result.display_name}
            </div>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {!isSearching && searchQuery && searchResults.length === 0 && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm">
            ❌ Location not found. Try a different search term or click on the map.
          </p>
        </div>
      )}

      {isSearching && (
        <p className="text-yellow-400 text-xs">Searching...</p>
      )}

      {/* Map Container */}
      <MapContainer
        center={initialCenter}
        zoom={13}
        className="h-64 w-full rounded-xl border-2 border-purple-500"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationPicker onSelect={handleLocationSelect} position={position} />
        <MapUpdater center={mapCenter} />
      </MapContainer>

      {/* Selected Location Display */}
      {position && address && (
        <div className="bg-purple-800 p-3 rounded-lg">
          <p className="text-white text-sm">
            <MapPin className="inline mr-2" size={16} />
            <span className="font-medium">Selected:</span> {address}
          </p>
          <p className="text-purple-300 text-xs mt-1">
            Coordinates: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </p>
        </div>
      )}

      <p className="text-purple-300 text-xs">
        💡 Tip: Search for a location or click on the map to select a venue
      </p>
    </div>
  );
}