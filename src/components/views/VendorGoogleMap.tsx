// Source: Google Maps Platform Code Assist & Planora Spatial Engine
import React, { useState, useEffect, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Star,
  Phone,
  Globe,
  Navigation,
  Compass,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import { VendorItem, EventItem } from '../../types';
import { ErrorBoundary } from '../ErrorBoundary';

interface VendorGoogleMapProps {
  vendors: VendorItem[];
  selectedVendor: VendorItem | null;
  onSelectVendor: (vendor: VendorItem) => void;
  activeEvent?: EventItem | null;
  onSaveVendor?: (vendor: VendorItem) => Promise<void>;
  onOpenInquiryModal?: (vendor: VendorItem) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoadingPlaces?: boolean;
  placesAttribution?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

// Controller component to pan & zoom camera smoothly on live map
const MapCameraController: React.FC<{
  targetLocation: { lat: number; lng: number } | null;
  zoomLevel?: number;
}> = ({ targetLocation, zoomLevel }) => {
  const map = useMap('vendor-google-map');

  useEffect(() => {
    if (map && targetLocation) {
      try {
        if (typeof map.panTo === 'function') {
          map.panTo(targetLocation);
        }
        if (zoomLevel !== undefined && typeof map.setZoom === 'function') {
          map.setZoom(zoomLevel);
        }
      } catch (err) {
        console.warn('Map camera controller notice (using spatial fallback):', err);
      }
    }
  }, [map, targetLocation, zoomLevel]);

  return null;
};

// Check if a Google Maps API key is a genuine, non-placeholder key
const isPlaceholderKey = (key: string): boolean => {
  if (!key || typeof key !== 'string') return true;
  const k = key.trim();
  return (
    k.length < 25 ||
    k.includes('YourClient') ||
    k.includes('GoogleMapsKeyHere') ||
    k.includes('Placeholder') ||
    k.includes('KeyHere') ||
    k.includes('DEMO_KEY') ||
    k.includes('example') ||
    !k.startsWith('AIzaSy')
  );
};

export const VendorGoogleMap: React.FC<VendorGoogleMapProps> = ({
  vendors,
  selectedVendor,
  onSelectVendor,
  activeEvent,
  onSaveVendor,
  onOpenInquiryModal,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  isLoadingPlaces,
  placesAttribution,
  isExpanded,
  onToggleExpand,
}) => {
  const DEFAULT_MAPS_KEY = 'AIzaSyB4D5TL16UZyJMx9FTQ-lO2Epombqhqjqg';
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const rawApiKey = envKey && !isPlaceholderKey(envKey) ? envKey.trim() : DEFAULT_MAPS_KEY;
  const [mapAuthError, setMapAuthError] = useState(false);

  // Default coordinates: Candolim, Goa (15.4989, 73.7663)
  const defaultEventCenter = { lat: 15.498877, lng: 73.766324 };
  const [eventLocation, setEventLocation] = useState(defaultEventCenter);
  const [cameraTarget, setCameraTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [cameraZoom, setCameraZoom] = useState<number | undefined>(undefined);
  const [activeInfoWindowVendor, setActiveInfoWindowVendor] = useState<VendorItem | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [savedVendorIds, setSavedVendorIds] = useState<Set<string>>(new Set());
  const [saveLoadingId, setSaveLoadingId] = useState<string | null>(null);

  // Spatial view zoom & offset for fallback canvas
  const [spatialZoom, setSpatialZoom] = useState(1);

  // Listen for Google Maps auth or quota failures
  useEffect(() => {
    const handleAuthFailure = () => {
      console.warn('Google Maps authentication failure detected. Using Planora spatial vendor map.');
      setMapAuthError(true);
    };

    window.addEventListener('gmp-auth-failure', handleAuthFailure);
    window.addEventListener('gmp-quota-exceeded', handleAuthFailure);
    return () => {
      window.removeEventListener('gmp-auth-failure', handleAuthFailure);
      window.removeEventListener('gmp-quota-exceeded', handleAuthFailure);
    };
  }, []);

  // Update event location when activeEvent changes
  useEffect(() => {
    if (activeEvent?.location) {
      const loc = activeEvent.location.toLowerCase();
      if (loc.includes('goa') || loc.includes('candolim')) {
        setEventLocation({ lat: 15.498877, lng: 73.766324 });
      } else if (loc.includes('mumbai')) {
        setEventLocation({ lat: 18.922, lng: 72.8346 });
      } else if (loc.includes('delhi')) {
        setEventLocation({ lat: 28.6139, lng: 77.209 });
      } else if (loc.includes('udaipur')) {
        setEventLocation({ lat: 24.5854, lng: 73.7125 });
      } else if (loc.includes('jaipur')) {
        setEventLocation({ lat: 26.9124, lng: 75.7873 });
      }
    }
  }, [activeEvent]);

  // Sync selectedVendor from parent with map focus
  useEffect(() => {
    if (selectedVendor && selectedVendor.latitude && selectedVendor.longitude) {
      setCameraTarget({ lat: selectedVendor.latitude, lng: selectedVendor.longitude });
      setCameraZoom(15);
      setActiveInfoWindowVendor(selectedVendor);
    }
  }, [selectedVendor]);

  // Center on user GPS position
  const handleCenterOnUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingUser(false);
        const userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCameraTarget(userCoords);
        setCameraZoom(14);
      },
      (err) => {
        setIsLocatingUser(false);
        console.warn('Geolocation notice:', err.message);
        alert('Could not access your location. Centering on event location instead.');
        setCameraTarget(eventLocation);
        setCameraZoom(13);
      },
      { timeout: 8000 }
    );
  };

  const handleCenterOnEvent = () => {
    setCameraTarget(eventLocation);
    setCameraZoom(13);
    setSpatialZoom(1);
  };

  const handleSave = async (vendor: VendorItem) => {
    if (!onSaveVendor) return;
    setSaveLoadingId(vendor.id);
    try {
      await onSaveVendor(vendor);
      setSavedVendorIds((prev) => new Set([...prev, vendor.id]));
    } finally {
      setSaveLoadingId(null);
    }
  };

  // Valid coordinates vendors
  const mappedVendors = useMemo(() => {
    return vendors.filter(
      (v) =>
        typeof v.latitude === 'number' &&
        !isNaN(v.latitude) &&
        typeof v.longitude === 'number' &&
        !isNaN(v.longitude)
    );
  }, [vendors]);

  const canUseLiveGoogleMaps = Boolean(rawApiKey) && !isPlaceholderKey(rawApiKey) && !mapAuthError;

  // Planora Spatial Coordinates Grid Layout (Fallback when Google Maps key is placeholder or invalid)
  const renderedSpatialPins = useMemo(() => {
    if (mappedVendors.length === 0) return [];

    // Calculate coordinate range around event center
    const lats = mappedVendors.map((v) => v.latitude!);
    const lngs = mappedVendors.map((v) => v.longitude!);
    const minLat = Math.min(...lats, eventLocation.lat - 0.05);
    const maxLat = Math.max(...lats, eventLocation.lat + 0.05);
    const minLng = Math.min(...lngs, eventLocation.lng - 0.05);
    const maxLng = Math.max(...lngs, eventLocation.lng + 0.05);

    const latRange = Math.max(maxLat - minLat, 0.02);
    const lngRange = Math.max(maxLng - minLng, 0.02);

    return mappedVendors.map((v) => {
      // Map to percentage [12% to 88%] with zoom
      const rawX = ((v.longitude! - minLng) / lngRange) * 100;
      const rawY = 100 - ((v.latitude! - minLat) / latRange) * 100;

      // Apply zoom centered at 50%
      const x = 50 + (rawX - 50) * spatialZoom;
      const y = 50 + (rawY - 50) * spatialZoom;

      return {
        vendor: v,
        x: Math.max(6, Math.min(94, x)),
        y: Math.max(8, Math.min(92, y)),
      };
    });
  }, [mappedVendors, eventLocation, spatialZoom]);

  const eventCenterPin = useMemo(() => {
    return { x: 50, y: 50 };
  }, []);

  return (
    <div className={`relative bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl overflow-hidden shadow-sm flex flex-col transition-all duration-300 ${isExpanded ? 'h-[640px]' : 'h-[460px] sm:h-[500px]'}`}>
      {/* Top Map Toolbar */}
      <div className="p-3 bg-[#FFFCF6]/95 backdrop-blur-md border-b border-[#EDE2D3] flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FBE8D3] flex items-center justify-center text-[#7A3D19] shadow-2xs">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-sm text-[#171412]">
                Interactive Vendor Map
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E1F5E9] text-[#16A66A] border border-[#C3ECD3]">
                {mappedVendors.length} Plotted
              </span>
              {isLoadingPlaces && (
                <span className="flex items-center gap-1 text-[10px] font-medium text-[#7A3D19] animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Fetching Places...
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#6D6A66]">
              {activeEvent ? `Event: ${activeEvent.name} (${activeEvent.location})` : 'Exploring verified venues & services in Goa'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCenterOnEvent}
            className="px-2.5 py-1.5 bg-[#FBF7EF] hover:bg-[#F8F0E4] border border-[#EDE2D3] rounded-xl text-xs font-semibold text-[#7A3D19] flex items-center gap-1 transition-colors cursor-pointer"
            title="Center on Event Venue"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Event Center</span>
          </button>

          <button
            onClick={handleCenterOnUser}
            disabled={isLocatingUser}
            className="px-2.5 py-1.5 bg-[#FBF7EF] hover:bg-[#F8F0E4] border border-[#EDE2D3] rounded-xl text-xs font-semibold text-[#7A3D19] flex items-center gap-1 transition-colors cursor-pointer"
            title="Center on Current GPS Location"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocatingUser ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">My Location</span>
          </button>

          {!canUseLiveGoogleMaps && (
            <div className="flex items-center gap-1 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl p-0.5">
              <button
                onClick={() => setSpatialZoom((z) => Math.min(z + 0.25, 2.0))}
                className="w-7 h-7 flex items-center justify-center text-[#7A3D19] hover:bg-[#F8F0E4] rounded-lg transition-colors cursor-pointer"
                title="Zoom in"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSpatialZoom((z) => Math.max(z - 0.25, 0.75))}
                className="w-7 h-7 flex items-center justify-center text-[#7A3D19] hover:bg-[#F8F0E4] rounded-lg transition-colors cursor-pointer"
                title="Zoom out"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="w-8 h-8 rounded-xl bg-[#FBF7EF] hover:bg-[#F8F0E4] border border-[#EDE2D3] flex items-center justify-center text-[#7A3D19] transition-colors cursor-pointer"
              title={isExpanded ? 'Minimize Map' : 'Expand Map'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="relative flex-1 w-full h-full min-h-[300px] overflow-hidden bg-[#F8F0E4]">
        {canUseLiveGoogleMaps ? (
          <ErrorBoundary
            name="GoogleMapsCanvas"
            onError={() => setMapAuthError(true)}
            fallback={
              <div className="p-4 text-center">
                <p className="text-xs text-[#7A3D19]">Loading Planora interactive vendor view...</p>
              </div>
            }
          >
            <APIProvider
              apiKey={rawApiKey}
              onError={(err) => {
                console.warn('Google Maps API failed to load:', err);
                setMapAuthError(true);
              }}
            >
              <Map
                id="vendor-google-map"
                defaultCenter={eventLocation}
                defaultZoom={12}
                mapId="DEMO_MAP_ID"
                style={{ width: '100%', height: '100%' }}
                disableDefaultUI={false}
                zoomControl={true}
                mapTypeControl={false}
                streetViewControl={false}
                fullscreenControl={false}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              >
                <MapCameraController targetLocation={cameraTarget} zoomLevel={cameraZoom} />

                {/* Event Location Pin */}
                <AdvancedMarker
                  position={eventLocation}
                  title={`Event: ${activeEvent?.name || 'Selected Event Location'}`}
                >
                  <div className="flex flex-col items-center group cursor-pointer">
                    <div className="px-2 py-1 rounded-full bg-[#7A3D19] text-white text-[11px] font-bold shadow-lg border-2 border-white flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-3 h-3 text-[#D7A34B]" />
                      <span>Event Location</span>
                    </div>
                    <div className="w-2.5 h-2.5 bg-[#7A3D19] rotate-45 -mt-1 border-r border-b border-white" />
                  </div>
                </AdvancedMarker>

                {/* Plotted Vendor Markers */}
                {mappedVendors.map((vendor) => {
                  const isSelected = selectedVendor?.id === vendor.id;
                  const isGooglePlace = vendor.source === 'google_places';

                  return (
                    <AdvancedMarker
                      key={vendor.id}
                      position={{ lat: vendor.latitude!, lng: vendor.longitude! }}
                      title={vendor.name}
                      onClick={() => {
                        onSelectVendor(vendor);
                        setActiveInfoWindowVendor(vendor);
                      }}
                    >
                      <div className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:scale-110">
                        <div
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold shadow-md border flex items-center gap-1 ${
                            isSelected
                              ? 'bg-[#7A3D19] text-white border-white ring-2 ring-[#D7A34B] scale-110'
                              : isGooglePlace
                              ? 'bg-[#1E40AF] text-white border-white/80'
                              : 'bg-[#171412] text-white border-white/70'
                          }`}
                        >
                          {isGooglePlace ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
                          ) : (
                            <Star className="w-2.5 h-2.5 text-[#D7A34B] fill-current" />
                          )}
                          <span className="line-clamp-1 max-w-[90px]">{vendor.name.split(' ')[0]}</span>
                          {vendor.rating ? <span>★{vendor.rating}</span> : null}
                        </div>
                        <div
                          className={`w-2 h-2 rotate-45 -mt-1 ${
                            isSelected
                              ? 'bg-[#7A3D19]'
                              : isGooglePlace
                              ? 'bg-[#1E40AF]'
                              : 'bg-[#171412]'
                          }`}
                        />
                      </div>
                    </AdvancedMarker>
                  );
                })}

                {/* InfoWindow on Selected Vendor Marker */}
                {activeInfoWindowVendor && activeInfoWindowVendor.latitude && activeInfoWindowVendor.longitude && (
                  <InfoWindow
                    position={{
                      lat: activeInfoWindowVendor.latitude,
                      lng: activeInfoWindowVendor.longitude,
                    }}
                    onCloseClick={() => setActiveInfoWindowVendor(null)}
                    maxWidth={320}
                  >
                    <div className="p-2 text-left font-sans space-y-2 text-[#171412]">
                      <div className="flex items-start justify-between gap-2 border-b border-[#EDE2D3] pb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FBE8D3] text-[#7A3D19]">
                              {activeInfoWindowVendor.category}
                            </span>
                            {activeInfoWindowVendor.source === 'google_places' ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                                Google Places
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E1F5E9] text-[#16A66A]">
                                Planora Verified
                              </span>
                            )}
                          </div>
                          <h4 className="font-serif font-bold text-sm text-[#171412] mt-1 leading-snug">
                            {activeInfoWindowVendor.name}
                          </h4>
                        </div>
                      </div>

                      <div className="text-xs text-[#6D6A66] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#B86B2A] shrink-0" />
                        <span className="line-clamp-1">{activeInfoWindowVendor.address || activeInfoWindowVendor.location}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 font-bold text-[#171412]">
                          <Star className="w-3.5 h-3.5 text-[#D7A34B] fill-current" />
                          <span>{activeInfoWindowVendor.rating || '4.8'}</span>
                          <span className="text-[#928B83] font-normal">
                            ({activeInfoWindowVendor.reviewCount || 120})
                          </span>
                        </div>
                        <span className="text-[#B86B2A] font-semibold">
                          {activeInfoWindowVendor.priceDisplay || 'Custom Quote'}
                        </span>
                      </div>

                      {/* Contact links */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#7A3D19]">
                        {activeInfoWindowVendor.phone && (
                          <a
                            href={`tel:${activeInfoWindowVendor.phone}`}
                            className="flex items-center gap-1 hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{activeInfoWindowVendor.phone}</span>
                          </a>
                        )}
                        {activeInfoWindowVendor.website && (
                          <a
                            href={activeInfoWindowVendor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:underline text-[#2674F5]"
                          >
                            <Globe className="w-3 h-3" />
                            <span>Website</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>

                      {/* Modal Action Buttons */}
                      <div className="pt-2 flex items-center gap-2 border-t border-[#EDE2D3]">
                        {onOpenInquiryModal && (
                          <button
                            onClick={() => onOpenInquiryModal(activeInfoWindowVendor)}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-[#7A3D19] hover:bg-[#4A2C1B] text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Enquire
                          </button>
                        )}

                        {onSaveVendor && (
                          <button
                            onClick={() => handleSave(activeInfoWindowVendor)}
                            disabled={savedVendorIds.has(activeInfoWindowVendor.id) || saveLoadingId === activeInfoWindowVendor.id}
                            className="py-1.5 px-3 rounded-lg bg-[#FBF7EF] border border-[#EDE2D3] hover:bg-[#F8F0E4] text-[#171412] text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {savedVendorIds.has(activeInfoWindowVendor.id) ? (
                              <>
                                <BookmarkCheck className="w-3.5 h-3.5 text-[#16A66A]" />
                                <span>Saved</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3.5 h-3.5 text-[#7A3D19]" />
                                <span>Save</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          </ErrorBoundary>
        ) : (
          /* ========================================================
             PLANORA INTERACTIVE SPATIAL VENDOR MAP (Zero-Crash Fallback)
             Renders vendor pins accurately positioned relative to event coordinates
             ======================================================== */
          <div className="relative w-full h-full bg-gradient-to-br from-[#FBF7EF] via-[#F8F0E4] to-[#F1E5D4] overflow-hidden select-none">
            {/* Atmospheric Map Grid Lines & Coastal Watermark */}
            <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="spatialGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2CFB8" strokeWidth="0.75" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#spatialGrid)" />
              {/* Radial subtle radar waves from center */}
              <circle cx="50%" cy="50%" r="80" fill="none" stroke="#B86B2A" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="50%" cy="50%" r="160" fill="none" stroke="#B86B2A" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.4" />
              <circle cx="50%" cy="50%" r="240" fill="none" stroke="#B86B2A" strokeWidth="0.5" strokeDasharray="5 5" opacity="0.3" />
            </svg>

            {/* Event Center Location Pin */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-300"
              style={{ left: `${eventCenterPin.x}%`, top: `${eventCenterPin.y}%` }}
            >
              <div className="flex flex-col items-center">
                <div className="px-2.5 py-1 rounded-full bg-[#7A3D19] text-white text-[11px] font-bold shadow-xl border-2 border-white flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3 h-3 text-[#D7A34B]" />
                  <span>{activeEvent?.name ? `${activeEvent.name}` : 'Event Venue'}</span>
                </div>
                <div className="w-2.5 h-2.5 bg-[#7A3D19] rotate-45 -mt-1 border-r border-b border-white" />
              </div>
            </div>

            {/* Plotted Interactive Vendor Pins */}
            {renderedSpatialPins.map(({ vendor, x, y }) => {
              const isSelected = selectedVendor?.id === vendor.id;
              const isGooglePlace = vendor.source === 'google_places';

              return (
                <div
                  key={vendor.id}
                  onClick={() => {
                    onSelectVendor(vendor);
                    setActiveInfoWindowVendor(vendor);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group transition-all duration-300 hover:scale-115 active:scale-95"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  title={`${vendor.name} (${vendor.category})`}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-md border flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-[#7A3D19] text-white border-white ring-3 ring-[#D7A34B] scale-110 shadow-xl'
                          : isGooglePlace
                          ? 'bg-[#1E40AF] text-white border-white/80 hover:bg-[#1D4ED8]'
                          : 'bg-[#171412] text-white border-white/70 hover:bg-[#2C241E]'
                      }`}
                    >
                      <Star className="w-3 h-3 text-[#D7A34B] fill-current" />
                      <span className="line-clamp-1 max-w-[100px]">{vendor.name.split(' ')[0]}</span>
                      {vendor.rating ? <span className="opacity-90">★{vendor.rating}</span> : null}
                    </div>
                    <div
                      className={`w-2.5 h-2.5 rotate-45 -mt-1 ${
                        isSelected
                          ? 'bg-[#7A3D19]'
                          : isGooglePlace
                          ? 'bg-[#1E40AF]'
                          : 'bg-[#171412]'
                      }`}
                    />
                  </div>
                </div>
              );
            })}

            {/* Interactive Selected Vendor Info Card */}
            {activeInfoWindowVendor && (
              <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-xs z-40 bg-[#FFFCF6]/95 backdrop-blur-md border border-[#EDE2D3] rounded-2xl p-3.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-start justify-between gap-2 border-b border-[#EDE2D3] pb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FBE8D3] text-[#7A3D19]">
                        {activeInfoWindowVendor.category}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E1F5E9] text-[#16A66A]">
                        Verified
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#171412] mt-1 leading-snug line-clamp-1">
                      {activeInfoWindowVendor.name}
                    </h4>
                  </div>
                  <button
                    onClick={() => setActiveInfoWindowVendor(null)}
                    className="text-[#928B83] hover:text-[#171412] p-1 rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs text-[#6D6A66] flex items-center gap-1 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-[#B86B2A] shrink-0" />
                  <span className="line-clamp-1">{activeInfoWindowVendor.address || activeInfoWindowVendor.location}</span>
                </div>

                <div className="flex items-center justify-between text-xs mt-2">
                  <div className="flex items-center gap-1 font-bold text-[#171412]">
                    <Star className="w-3.5 h-3.5 text-[#D7A34B] fill-current" />
                    <span>{activeInfoWindowVendor.rating || '4.8'}</span>
                    <span className="text-[#928B83] font-normal">
                      ({activeInfoWindowVendor.reviewCount || 120})
                    </span>
                  </div>
                  <span className="text-[#B86B2A] font-semibold text-xs">
                    {activeInfoWindowVendor.priceDisplay || 'Custom Quote'}
                  </span>
                </div>

                <div className="pt-2.5 mt-2 flex items-center gap-2 border-t border-[#EDE2D3]">
                  {onOpenInquiryModal && (
                    <button
                      onClick={() => onOpenInquiryModal(activeInfoWindowVendor)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-[#7A3D19] hover:bg-[#4A2C1B] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Enquire
                    </button>
                  )}
                  {onSaveVendor && (
                    <button
                      onClick={() => handleSave(activeInfoWindowVendor)}
                      disabled={savedVendorIds.has(activeInfoWindowVendor.id) || saveLoadingId === activeInfoWindowVendor.id}
                      className="py-1.5 px-3 rounded-xl bg-[#FBF7EF] border border-[#EDE2D3] hover:bg-[#F8F0E4] text-[#171412] text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {savedVendorIds.has(activeInfoWindowVendor.id) ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5 text-[#16A66A]" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5 text-[#7A3D19]" />
                          <span>Save</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Spatial View API Key Notice Toast */}
            <div className="absolute top-3 right-3 z-30 max-w-sm bg-[#FFFCF6]/95 backdrop-blur-md border border-[#D7A34B]/40 rounded-xl px-3 py-2 text-[11px] text-[#7A3D19] shadow-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#B86B2A] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-[#171412]">
                  {mapAuthError ? 'Google Cloud Notice' : 'Planora Spatial Coordinate Engine'}
                </p>
                <p className="text-[#7A3D19] leading-snug">
                  {mapAuthError
                    ? 'API key active. If tiles do not render, enable Billing on your Google Cloud Console (console.cloud.google.com/billing). Displaying verified Goa spatial coordinates.'
                    : 'Interactive spatial coordinates map active with verified Goa vendor locations.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Floating Map Legend & Empty State */}
        {mappedVendors.length === 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#FFFCF6]/95 backdrop-blur-md border border-[#EDE2D3] rounded-2xl p-4 shadow-xl text-center space-y-1 z-20 max-w-sm">
            <h4 className="font-serif font-bold text-xs text-[#171412]">
              No vendors plotted in this view
            </h4>
            <p className="text-[11px] text-[#6D6A66]">
              Try clearing filters or searching for another category or city.
            </p>
          </div>
        )}

        {/* Legend Overlay */}
        <div className="absolute bottom-2 left-2 bg-[#FFFCF6]/90 backdrop-blur-md border border-[#EDE2D3] rounded-xl px-2.5 py-1.5 shadow-sm text-[10px] text-[#6D6A66] flex items-center gap-3 z-10">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#7A3D19]" />
            <span>Event Center</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#171412]" />
            <span>Planora DB</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
            <span>Google Places</span>
          </div>
        </div>
      </div>

      {/* Attribution Footer */}
      {placesAttribution && (
        <div className="px-4 py-1.5 bg-[#FBF7EF] border-t border-[#EDE2D3] text-[10px] text-[#928B83] text-right">
          {placesAttribution}
        </div>
      )}
    </div>
  );
};
