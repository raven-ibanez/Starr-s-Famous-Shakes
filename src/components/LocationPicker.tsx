import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Loader2, MapPin } from 'lucide-react';

// Fix for default marker icon missing in React Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (lat: number, lng: number, address?: string) => void;
}

// Component to handle map clicks
function LocationMarker({ position, setPosition, onLocationSelect }: any) {
    const map = useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition({ lat, lng });
            onLocationSelect(lat, lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
}

// Component to update map view when position changes externally
function MapUpdater({ position }: { position: { lat: number; lng: number } | null }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 15);
        }
    }, [position, map]);
    return null;
}

export default function LocationPicker({ initialLat, initialLng, onLocationSelect }: LocationPickerProps) {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
        initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Default center (Manila) if no initial position
    const defaultCenter = { lat: 14.5995, lng: 120.9842 };
    const center = position || defaultCenter;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length < 3) {
                setSuggestions([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=ph`
                );
                const data = await response.json();
                setSuggestions(data);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Error searching location:', error);
            } finally {
                setIsSearching(false);
            }
        }, 1000); // 1 second debounce

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        // Manual search trigger (optional if auto-search is working, but acts as a fallback or immediate trigger)
        if (!searchQuery.trim()) return;

        // Close suggestions to show we are searching or just selecting top result could be an option, 
        // but for now let's just keep the debounce logic as primary.
        // If we want "Enter" to pick the first result:
        if (suggestions.length > 0) {
            handleSuggestionClick(suggestions[0]);
        }
    };

    const handleSuggestionClick = (suggestion: any) => {
        const newLat = parseFloat(suggestion.lat);
        const newLng = parseFloat(suggestion.lon);

        setPosition({ lat: newLat, lng: newLng });
        onLocationSelect(newLat, newLng, suggestion.display_name);
        setSearchQuery(suggestion.display_name);
        setShowSuggestions(false);
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (!showSuggestions && e.target.value.length >= 3) {
                                    setShowSuggestions(true);
                                }
                            }}
                            onFocus={() => {
                                if (suggestions.length > 0) setShowSuggestions(true);
                            }}
                            placeholder="Search address (e.g., SM Megamall)"
                            className="w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        </div>
                    </div>
                </form>

                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-[1000] w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 max-h-60 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 text-sm flex items-start gap-2 transition-colors"
                            >
                                <span className="mt-0.5 text-gray-400 opacity-70">
                                    <MapPin className="w-3.5 h-3.5" />
                                </span>
                                <span className="text-gray-700 line-clamp-2">{suggestion.display_name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-300 relative z-0">
                <MapContainer
                    center={center}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                        position={position}
                        setPosition={setPosition}
                        onLocationSelect={(lat: number, lng: number) => {
                            // We don't fetch address on click to avoid API rate limits, just coordinates
                            onLocationSelect(lat, lng);
                        }}
                    />
                    <MapUpdater position={position} />
                </MapContainer>
            </div>
            <p className="text-xs text-gray-500 text-center">
                Search for a location or click on the map to pin the exact branch location.
            </p>
        </div>
    );
}
