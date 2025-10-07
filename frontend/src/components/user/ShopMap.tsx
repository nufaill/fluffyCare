import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { userService, type ServiceLocation, type UserLocation } from '@/services/user/user.service';
import { AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
    shadowSize: [41, 41],
  });
};

// Always return red icon for shops
const getShopIcon = () => {
  return createCustomIcon('red');
};

interface ShopAvailability {
  lunchBreak: { start: string; end: string };
  teaBreak: { start: string; end: string };
  workingDays: string[];
  openingTime: string;
  closingTime: string;
  customHolidays: string[];
}

interface ExtendedServiceLocation extends ServiceLocation {
  shopAvailability?: ShopAvailability;
}

interface ShopMapProps {
  shop: ExtendedServiceLocation[];
  onLocationUpdate?: (location: UserLocation) => void;
  className?: string;
  height?: string;
  showUserLocation?: boolean;
  enableLocationTracking?: boolean;
  mapStyle?: 'default' | 'satellite' | 'terrain';
  filters?: {
    serviceType?: string;
    radius?: number;
    minRating?: number;
    currentAvailability?: boolean;
    selectedDay?: string;
    selectedTime?: string;
  };
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
  setLocationLoading,
}) => {
  const map = useMap();

  useEffect(() => {
    if (userLocation && showUserLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13);
    }
  }, [userLocation, showUserLocation, map]);

  useEffect(() => {
    if (enableLocationTracking && onLocationUpdate) {
      setLocationLoading(true);
      setLocationError(null);

      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by this browser');
        setLocationLoading(false);
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      };

      const success = (position: GeolocationPosition) => {
        const location: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };
        onLocationUpdate(location);
        setLocationLoading(false);
        setLocationError(null);
      };

      const error = (err: GeolocationPositionError) => {
        let errorMessage = 'Unable to get your location';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      };

      navigator.geolocation.getCurrentPosition(success, error, options);

      const watchId = navigator.geolocation.watchPosition(success, error, options);
      return () => {
        if (watchId) navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [enableLocationTracking, onLocationUpdate, map, setLocationError, setLocationLoading]);

  return null;
};

const isShopOpen = (shop: ExtendedServiceLocation, selectedDay?: string, selectedTime?: string): boolean => {
  if (!shop.shopAvailability) return true;
  const { workingDays, openingTime, closingTime, lunchBreak } = shop.shopAvailability;

  const now = new Date();
  const currentDay = now.toLocaleString('en-US', { weekday: 'long' });
  const currentTime = now.toTimeString().slice(0, 5);
  const checkDay = selectedDay || currentDay;
  const checkTime = selectedTime || currentTime;

  if (!workingDays.includes(checkDay)) return false;

  const [openHour, openMinute] = openingTime.split(':').map(Number);
  const [closeHour, closeMinute] = closingTime.split(':').map(Number);
  const [checkHour, checkMinute] = checkTime.split(':').map(Number);

  const openTimeInMinutes = openHour * 60 + openMinute;
  const closeTimeInMinutes = closeHour * 60 + closeMinute;
  const checkTimeInMinutes = checkHour * 60 + checkMinute;

  if (checkTimeInMinutes < openTimeInMinutes || checkTimeInMinutes > closeTimeInMinutes) {
    return false;
  }

  if (lunchBreak.start && lunchBreak.end) {
    const [lunchStartHour, lunchStartMinute] = lunchBreak.start.split(':').map(Number);
    const [lunchEndHour, lunchEndMinute] = lunchBreak.end.split(':').map(Number);
    const lunchStartTimeInMinutes = lunchStartHour * 60 + lunchStartMinute;
    const lunchEndTimeInMinutes = lunchEndHour * 60 + lunchEndMinute;

    if (checkTimeInMinutes >= lunchStartTimeInMinutes && checkTimeInMinutes <= lunchEndTimeInMinutes) {
      return false;
    }
  }

  return true;
};

const ShopMap: React.FC<ShopMapProps> = ({
  shop = [],
  onLocationUpdate,
  className = '',
  height = '400px',
  showUserLocation = true,
  enableLocationTracking = true,
  mapStyle = 'default',
  filters = {},
}) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [shops, setShops] = useState<ExtendedServiceLocation[]>(shop);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchTimeout, setFetchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [radius, setRadius] = useState<number>(filters.radius || 5000);
  const [currentAvailability, setCurrentAvailability] = useState<boolean>(filters.currentAvailability || false);
  const [selectedDay, setSelectedDay] = useState<string>(filters.selectedDay || '');
  const [selectedTime, setSelectedTime] = useState<string>(filters.selectedTime || '');

  const handleLocationUpdate = (location: UserLocation) => {
    setUserLocation((prev) => {
      if (prev && prev.lat === location.lat && prev.lng === location.lng) {
        return prev;
      }
      setIsLoading(false);
      if (onLocationUpdate) {
        onLocationUpdate(location);
      }
      return location;
    });
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

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location: UserLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: Date.now(),
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
            maximumAge: 60000,
          }
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationError('Unable to access location services.');
      setLocationLoading(false);
    }
  };

  const fetchShops = async (location: UserLocation) => {
    if (fetchTimeout) clearTimeout(fetchTimeout);

    const timeout = setTimeout(async () => {
      try {
        setFetchError(null);
        const request = {
          lat: location.lat,
          lng: location.lng,
          radius: radius,
          serviceType: filters.serviceType,
        };
        const fetchedShops = await userService.getNearbyServices(request);
        const transformedShops = fetchedShops.map((shop) => ({
          ...shop,
          location: {
            lat: shop.location.coordinates[1], 
            lng: shop.location.coordinates[0],
          },
        }));
        const filteredShops = transformedShops
          .filter((shop) => !filters.minRating || shop.rating >= filters.minRating)
          .filter((shop) => !currentAvailability || isShopOpen(shop, selectedDay, selectedTime));
        setShops(filteredShops);
      } catch (error: any) {
        console.error('Error fetching shops:', error);
        let errorMessage = 'Failed to fetch nearby shops. Please try again.';
        if (error.message.includes('NetworkError')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('404')) {
          errorMessage = 'No shops found in the selected area.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        }
        setFetchError(errorMessage);
      }
    }, 500);

    setFetchTimeout(timeout);
  };

  useEffect(() => {
    if (enableLocationTracking) {
      requestLocationPermission();
    } else {
      setIsLoading(false);
    }
    return () => {
      if (fetchTimeout) clearTimeout(fetchTimeout);
    };
  }, [enableLocationTracking]);

  useEffect(() => {
    setRadius(filters.radius || 5000);
    setCurrentAvailability(filters.currentAvailability || false);
    setSelectedDay(filters.selectedDay || '');
    setSelectedTime(filters.selectedTime || '');

    if (userLocation && shop.length === 0) {
      fetchShops(userLocation);
    }
  }, [userLocation, filters, shop]);

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

  const userLocationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [30, 49],
    iconAnchor: [15, 49],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const defaultCenter: [number, number] = [40.7128, -74.0060];

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[1000] rounded-lg">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading map...</span>
          </div>
        </div>
      )}

      {(locationError || fetchError) && (
        <div className="absolute top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3 z-[1000] max-w-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-700">
                {locationError || fetchError}
                <a
                  href="https://support.google.com/chrome/answer/142065"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline ml-1"
                >
                  Learn how to enable location
                </a>
              </AlertDescription>
            </div>
            <button
              onClick={requestLocationPermission}
              disabled={locationLoading}
              className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {locationLoading ? 'Getting...' : 'Retry'}
            </button>
          </div>
        </div>
      )}

      {showUserLocation && userLocation && (
        <div className="absolute top-4 right-4 sm:top-20 bg-green-50 border border-green-200 rounded-lg p-2 z-[1000]">
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

        {showUserLocation && userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
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

        {shops
          .filter((shop) => shop.location && typeof shop.location.lat === 'number' && typeof shop.location.lng === 'number')
          .map((shop) => (
            <Marker
              key={shop.id}
              position={[shop.location.lat, shop.location.lng]}
              icon={getShopIcon()}
            >
              <Popup>
                <div className="text-sm max-w-xs p-2">
                  <strong className="block mb-2 text-gray-900">{shop.name}</strong>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-600">📍 {shop.address || 'Address not available'}</div>
                    {shop.description && (
                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                        {shop.description}
                      </div>
                    )}
                    {shop.distance && (
                      <div className="text-xs text-gray-500 mt-2">
                        Distance: {(shop.distance / 1000).toFixed(2)} km
                      </div>
                    )}
                    {shop.shopAvailability && (
                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                        <div>🕒 {shop.shopAvailability.openingTime} - {shop.shopAvailability.closingTime}</div>
                        <div>📅 {shop.shopAvailability.workingDays.join(', ')}</div>
                        {shop.shopAvailability.lunchBreak.start && (
                          <div>🍴 Lunch Break: {shop.shopAvailability.lunchBreak.start} - {shop.shopAvailability.lunchBreak.end}</div>
                        )}
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

export { ShopMap };
export type { UserLocation };