import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const serviceTypeColors: { [key: string]: string } = {
  'veterinary': 'red',
  'grooming': 'blue',
  'boarding': 'green',
  'training': 'orange',
  'walking': 'yellow',
  'sitting': 'violet',
  'default': 'grey'
};

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}

export interface ServiceLocation {
  _id: string;
  name: string;
  serviceType: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  rating: number;
  price: number;
  description?: string;
}

interface ServiceMapProps {
  services: ServiceLocation[];
  onLocationUpdate?: (location: UserLocation) => void;
  className?: string;
  height?: string;
  showUserLocation?: boolean;
  enableLocationTracking?: boolean;
  mapStyle?: 'default' | 'satellite' | 'terrain';
}

const MapController: React.FC<{
  userLocation: UserLocation | null;
  showUserLocation: boolean;
  onLocationUpdate?: (location: UserLocation) => void;
  enableLocationTracking: boolean;
  setLocationError: (error: string | null) => void;
  setLocationLoading: (loading: boolean) => void;
}> = ({ 
  userLocation, 
  showUserLocation, 
  onLocationUpdate, 
  enableLocationTracking, 
  setLocationError, 
  setLocationLoading 
}) => {
  const map = useMap();
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    if (enableLocationTracking && onLocationUpdate) {
      setLocationLoading(true);
      setLocationError(null);
      
      const getCurrentLocation = () => {
        if (!navigator.geolocation) {
          console.error('Geolocation is not supported by this browser');
          setLocationError('Geolocation is not supported by this browser');
          setLocationLoading(false);
          
          return;
        }

        const options = {
          enableHighAccuracy: true,
          timeout: 15000, 
          maximumAge: 300000
        };
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location: UserLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: Date.now()
            };
            console.log('📍 User location obtained:', location);
            onLocationUpdate(location);
            setLocationLoading(false);
            setLocationError(null);
            
            // Center map on user location
            map.setView([location.lat, location.lng], 13);
          },
          (error) => {
            console.error('Error getting location:', error);
            let errorMessage = 'Unable to get your location';
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied. Please enable location services.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out.';
                break;
            }
            
            setLocationError(errorMessage);
            setLocationLoading(false);
            
            // Use default location
            const defaultLocation: UserLocation = {
              lat: 40.7128,
              lng: -74.0060,
              timestamp: Date.now()
            };
            onLocationUpdate(defaultLocation);
            map.setView([defaultLocation.lat, defaultLocation.lng], 10);
          },
          options
        );

        // Watch position for real-time updates
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const location: UserLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: Date.now()
            };
            console.log('📍 User location updated:', location);
            onLocationUpdate(location);
          },
          (error) => {
            console.error('Error watching location:', error);
            // Don't set error for watch position failures to avoid spam
          },
          options
        );

        setWatchId(id);
      };

      getCurrentLocation();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
    };
  }, [enableLocationTracking, onLocationUpdate, map, setLocationError, setLocationLoading]);

  return null;
};

export const ServiceMap: React.FC<ServiceMapProps> = ({
  services,
  onLocationUpdate,
  className = '',
  height = '400px',
  showUserLocation = true,
  enableLocationTracking = true,
  mapStyle = 'default'
}) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const handleLocationUpdate = (location: UserLocation) => {
    setUserLocation(location);
    setIsLoading(false);
    if (onLocationUpdate) {
      onLocationUpdate(location);
    }
  };

  const requestLocationPermission = async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);
      
      const result = await navigator.permissions.query({ name: 'geolocation' });
      
      if (result.state === 'denied') {
        setLocationError('Location access denied. Please enable location in your browser settings.');
        setLocationLoading(false);
        return;
      }
      
      // Trigger location update
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location: UserLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: Date.now()
            };
            handleLocationUpdate(location);
            setLocationLoading(false);
          },
          (error) => {
            console.error('Error getting location:', error);
            setLocationError('Unable to get your location. Please try again.');
            setLocationLoading(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationError('Unable to access location services.');
      setLocationLoading(false);
    }
  };

  const getTileLayerUrl = () => {
    switch (mapStyle) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getAttribution = () => {
    switch (mapStyle) {
      case 'satellite':
        return '&copy; <a href="https://www.esri.com/">Esri</a>';
      case 'terrain':
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://opentopomap.org">OpenTopoMap</a>';
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }
  };

  // Create user location icon with a distinct look
  const userLocationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [30, 49], // Slightly larger for user location
    iconAnchor: [15, 49],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Default center (New York City)
  const defaultCenter: [number, number] = [40.7128, -74.0060];

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading map...</span>
          </div>
        </div>
      )}

      {/* Location error notification */}
      {locationError && (
        <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-red-600">⚠️</div>
              <span className="text-sm text-red-700">{locationError}</span>
            </div>
            <button
              onClick={requestLocationPermission}
              disabled={locationLoading}
              className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {locationLoading ? 'Getting...' : 'Try Again'}
            </button>
          </div>
        </div>
      )}

      {/* Location status indicator */}
      {showUserLocation && userLocation && (
        <div className="absolute top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-2 z-10">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-700">Location Active</span>
          </div>
        </div>
      )}

      <MapContainer
        center={userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg border border-gray-300"
      >
        <TileLayer
          url={getTileLayerUrl()}
          attribution={getAttribution()}
        />

        <MapController
          userLocation={userLocation}
          showUserLocation={showUserLocation}
          onLocationUpdate={handleLocationUpdate}
          enableLocationTracking={enableLocationTracking}
          setLocationError={setLocationError}
          setLocationLoading={setLocationLoading}
        />

        {/* User location marker */}
        {showUserLocation && userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="text-sm p-2">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <strong>Your Location</strong>
                </div>
                <div className="text-gray-600 space-y-1">
                  <div>📍 {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</div>
                  <div>🎯 Accuracy: {userLocation.accuracy ? `${Math.round(userLocation.accuracy)}m` : 'Unknown'}</div>
                  <div className="text-xs">
                    🕐 Updated: {new Date(userLocation.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Service markers */}
        {services.map((service) => (
          <Marker
            key={service._id}
            position={[service.location.lat, service.location.lng]}
            icon={createCustomIcon(serviceTypeColors[service.serviceType] || serviceTypeColors.default)}
          >
            <Popup>
              <div className="text-sm max-w-xs p-2">
                <strong className="block mb-2 text-gray-900">{service.name}</strong>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {service.serviceType.charAt(0).toUpperCase() + service.serviceType.slice(1)}
                  </div>
                  <div className="text-xs text-gray-600">📍 {service.address}</div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm flex items-center space-x-1">
                      <span>⭐</span>
                      <span>{service.rating}</span>
                    </span>
                    <span className="text-sm font-semibold text-green-600">₹{service.price}</span>
                  </div>
                  {service.description && (
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                      {service.description}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};