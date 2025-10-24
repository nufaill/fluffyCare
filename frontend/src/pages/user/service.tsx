import { useState, useEffect } from 'react';
import { ServiceCard } from '@/components/user/ServiceCard';
import { FilterBar } from '@/components/user/FilterBar';
import { Pagination } from '@/components/ui/Pagination';
import { useServices } from '@/hooks/useServices';
import { ShopMap, type UserLocation } from '@/components/user/ShopMap';
import { Loader2, AlertCircle } from 'lucide-react';
import Header from "@/components/user/Header";
import Footer from "@/components/user/Footer";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { userService, type ServiceLocation } from "@/services/user/user.service";
import Useraxios from "@/api/user.axios";
import type { PetService } from "@/types/service";

interface FilterOptions {
  petType: string[];
  serviceType: string[];
  priceRange: [number, number];
  duration: [number, number];
  rating: number;
  nearMe: boolean;
  search: string;
  radius?: number;
  currentAvailability: boolean;
  selectedDay: string;
  selectedTime: string;
}

interface ServiceWithRating extends PetService {
  averageRating?: number;
  totalReviews?: number;
  distance?: number;
}

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const Services = () => {
  const [showMap, setShowMap] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [mapServices, setMapServices] = useState<ServiceLocation[]>([]);
  const [mapStyle, setMapStyle] = useState<'default' | 'satellite' | 'terrain'>('default');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [fetchTimeout, setFetchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [_servicesWithRatings, setServicesWithRatings] = useState<ServiceWithRating[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [clientFilteredServices, setClientFilteredServices] = useState<ServiceWithRating[]>([]);

  const { services, loading, error, filters, updateFilters, refreshServices } = useServices({
    page: currentPage,
    pageSize,
  });

  useEffect(() => {
    const fetchRatingsAndFilter = async () => {
      if (!services || services.length === 0) {
        setServicesWithRatings([]);
        setClientFilteredServices([]);
        return;
      }

      setRatingsLoading(true);

      try {
        const ratingPromises = services.map(async (service) => {
          if (!service?.shopId?._id) {
            return {
              ...service,
              averageRating: 0,
              totalReviews: 0,
              distance: undefined,
            };
          }

          try {
            const response = await Useraxios.get(`/shops/${service.shopId._id}/reviews/summary`);
            
            let distance: number | undefined = undefined;
            if (userLocation && service.shopId?.location?.coordinates) {
              const [lng, lat] = service.shopId.location.coordinates;
              distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                lat,
                lng
              );
            }

            if (response.status === 200 && response.data?.data) {
              return {
                ...service,
                averageRating: response.data.data.averageRating || 0,
                totalReviews: response.data.data.totalReviews || 0,
                distance,
              };
            }
          } catch (err) {
            console.error(`Failed to fetch rating for shop ${service.shopId._id}:`, err);
          }

          return {
            ...service,
            averageRating: 0,
            totalReviews: 0,
            distance: undefined,
          };
        });

        const servicesWithRatingData = await Promise.all(ratingPromises);
        setServicesWithRatings(servicesWithRatingData);

        let filtered = [...servicesWithRatingData];

        if (filters.rating > 0) {
          filtered = filtered.filter(service => {
            const meetsRating = (service.averageRating || 0) >= filters.rating;
            return meetsRating;
          });
        }

        if (filters.nearMe && userLocation) {
          const radius = filters.radius || 5000; 
          filtered = filtered.filter(service => {
            if (!service.distance) return false;
            return service.distance <= radius;
          });

          filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        if (filters.search && filters.search.trim()) {
          const searchLower = filters.search.toLowerCase().trim();

          filtered = filtered.filter(service => {
            const serviceName = (service.name || '').toLowerCase();
            const shopName = (typeof service.shopId === 'object' && service.shopId.name)
              ? service.shopId.name.toLowerCase()
              : '';
            const serviceType = typeof service.serviceTypeId === 'object' && service.serviceTypeId.name
              ? service.serviceTypeId.name.toLowerCase()
              : typeof service.serviceTypeId === 'string'
                ? service.serviceTypeId.toLowerCase()
                : '';

            const petTypes = Array.isArray(service.petTypeIds)
              ? service.petTypeIds.map(pt =>
                typeof pt === 'object' && pt.name ? pt.name.toLowerCase() :
                  typeof pt === 'string' ? pt.toLowerCase() : ''
              ).join(' ')
              : '';

            const city = (typeof service.shopId === 'object' && service.shopId.city)
              ? service.shopId.city.toLowerCase()
              : '';

            const matchFound = serviceName.includes(searchLower) ||
              shopName.includes(searchLower) ||
              serviceType.includes(searchLower) ||
              petTypes.includes(searchLower) ||
              city.includes(searchLower);

            return matchFound;
          });
        }

        setClientFilteredServices(filtered);
      } catch (err) {
        console.error('Error fetching ratings:', err);
        setClientFilteredServices(services);
      } finally {
        setRatingsLoading(false);
      }
    };

    fetchRatingsAndFilter();
  }, [services, filters.rating, filters.search, filters.nearMe, filters.radius, userLocation]);

  const handleToggleMap = () => {
    setShowMap(!showMap);
  };

  const handleLocationUpdate = (location: UserLocation) => {
    setUserLocation((prev) => {
      if (prev && prev.lat === location.lat && prev.lng === location.lng) {
        return prev;
      }
      return location;
    });
  };

  const loadShopsWithLocation = async () => {
    if (fetchTimeout) clearTimeout(fetchTimeout);

    const timeout = setTimeout(async () => {
      try {
        if (!userLocation) {
          console.warn('User location not available');
          return;
        }

        const request = {
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: filters.nearMe ? (filters.radius || 5000) : 5000,
          serviceType: filters.serviceType?.length ? filters.serviceType.join(',') : undefined,
        };

        const fetchedShops = await userService.getNearbyServices(request);
        setMapServices(fetchedShops);
      } catch (error) {
        console.error("Failed to fetch services:", error);
        setMapServices([]);
      }
    }, 500);

    setFetchTimeout(timeout);
  };

  useEffect(() => {
    if (showMap && userLocation) {
      loadShopsWithLocation();
    }

    return () => {
      if (fetchTimeout) clearTimeout(fetchTimeout);
    };
  }, [showMap, userLocation, filters.serviceType, filters.radius, filters.nearMe]);

  const handlePageChange = (page: number, newPageSize?: number) => {
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    } else {
      setCurrentPage(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFiltersChange = (newFilters: Partial<FilterOptions>) => {
    setCurrentPage(1);
    updateFilters(newFilters);
  };

  const handleClearFilters = () => {
    setCurrentPage(1);
    updateFilters({
      petType: [],
      serviceType: [],
      priceRange: [0, 20000],
      duration: [0, 24],
      rating: 0,
      nearMe: false,
      search: '',
      radius: undefined,
      currentAvailability: false,
      selectedDay: '',
      selectedTime: '',
    });
  };

  const totalFilteredServices = clientFilteredServices.length;
  const paginatedServices = clientFilteredServices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const isLoadingData = loading || ratingsLoading;

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pet Services</h1>
          <p className="text-muted-foreground">
            Find the perfect care for your beloved pets
          </p>

          {(filters.search || filters.rating > 0 || filters.nearMe) && (
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {filters.search && (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                  🔍 Search: "{filters.search}"
                </span>
              )}
              {filters.rating > 0 && (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                  ⭐ Rating: {filters.rating}+ stars
                </span>
              )}
              {filters.nearMe && userLocation && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full font-medium">
                  📍 Within {((filters.radius || 5000) / 1000).toFixed(1)} km
                </span>
              )}
              {totalFilteredServices > 0 && (
                <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full font-medium">
                  ✓ {totalFilteredServices} result{totalFilteredServices !== 1 ? 's' : ''} found
                </span>
              )}
            </div>
          )}
        </div>

        <FilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onToggleMap={handleToggleMap}
          showMap={showMap}
          userLocation={userLocation}
        />

        {showMap && (
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Services Map</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {mapServices.length} service{mapServices.length !== 1 ? 's' : ''} found nearby
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={mapStyle}
                  onChange={(e) => setMapStyle(e.target.value as any)}
                  className="text-sm border border-border rounded px-2 py-1 bg-background"
                  aria-label="Map style"
                >
                  <option value="default">Street Map</option>
                  <option value="satellite">Satellite</option>
                  <option value="terrain">Terrain</option>
                </select>
                <button
                  onClick={loadShopsWithLocation}
                  className="text-sm bg-primary text-white px-3 py-1 rounded hover:bg-primary/90 transition-colors"
                  disabled={!userLocation}
                  aria-label="Refresh map"
                >
                  Refresh Map
                </button>
              </div>
            </div>

            {!userLocation && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Waiting for your location... Please allow location access to see nearby services.
                </AlertDescription>
              </Alert>
            )}

            <ShopMap
              shop={mapServices}
              onLocationUpdate={handleLocationUpdate}
              showUserLocation={true}
              enableLocationTracking={true}
              mapStyle={mapStyle}
              height="500px"
              className="rounded-lg border border-border"
              filters={{
                serviceType: filters.serviceType?.length ? filters.serviceType.join(',') : undefined,
                radius: filters.nearMe ? (filters.radius || 5000) : undefined,
                minRating: filters.rating,
                currentAvailability: filters.currentAvailability || false,
                selectedDay: filters.selectedDay || '',
                selectedTime: filters.selectedTime || '',
              }}
            />

            <div className="mt-2 text-xs text-muted-foreground">
              <p>🔵 Blue marker: Your location | 🔴 Red markers: Pet services</p>
            </div>
          </div>
        )}

        {error && (
          <Alert className="mb-6 border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive">
              {error}
              <button
                onClick={refreshServices}
                className="ml-2 underline hover:no-underline"
              >
                Try again
              </button>
            </AlertDescription>
          </Alert>
        )}

        <div>
          {isLoadingData && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                {ratingsLoading ? 'Loading ratings and filtering...' : 'Loading services...'}
              </p>
            </div>
          )}

          {!isLoadingData && clientFilteredServices.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-lg font-medium mb-1">No services found</p>
                <p className="text-sm text-muted-foreground mb-2">
                  {filters.nearMe && !userLocation
                    ? 'Please enable location access to find nearby services'
                    : filters.nearMe && userLocation
                      ? `No services found within ${((filters.radius || 5000) / 1000).toFixed(1)} km of your location`
                      : filters.rating > 0 && filters.search
                        ? `No services found matching "${filters.search}" with ${filters.rating}+ star rating`
                        : filters.rating > 0
                          ? `No services found with ${filters.rating}+ star rating`
                          : filters.search
                            ? `No results for "${filters.search}"`
                            : 'Try adjusting your filters to see more results'}
                </p>
                {services.length > 0 && clientFilteredServices.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    ({services.length} service{services.length !== 1 ? 's' : ''} available before filtering)
                  </p>
                )}
              </div>
              <button
                onClick={handleClearFilters}
                className="text-primary hover:underline font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : !isLoadingData && clientFilteredServices.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalFilteredServices)} of {totalFilteredServices} service{totalFilteredServices !== 1 ? 's' : ''}
                  {(filters.rating > 0 || filters.search || filters.nearMe) && (
                    <span className="ml-2 text-primary font-medium">
                      (filtered
                      {filters.nearMe ? ` by location` : ''}
                      {filters.rating > 0 ? ` by ${filters.rating}+ stars` : ''}
                      {filters.search ? ` & search` : ''})
                    </span>
                  )}
                </div>
                {services.length !== totalFilteredServices && (
                  <div className="text-xs text-muted-foreground">
                    {services.length} total services loaded
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {paginatedServices.map((service) => (
                  <ServiceCard 
                    key={service._id} 
                    service={service}
                  />
                ))}
              </div>

              {totalFilteredServices > pageSize && (
                <Pagination
                  current={currentPage}
                  total={totalFilteredServices}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal
                  pageSizeOptions={[6, 12, 24, 48]}
                  className="mt-8"
                  disabled={isLoadingData}
                />
              )}
            </>
          ) : null}
        </div>
      </div>
      <Footer />
    </>
  );
};