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

export const Services = () => {
  const [showMap, setShowMap] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [mapServices, setMapServices] = useState<ServiceLocation[]>([]);
  const [mapStyle, setMapStyle] = useState<'default' | 'satellite' | 'terrain'>('default');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [fetchTimeout, setFetchTimeout] = useState<NodeJS.Timeout | null>(null);

  const { services, loading, error, filters, updateFilters, refreshServices, total } = useServices({
    page: currentPage,
    pageSize,
  });

  const handleToggleMap = () => {
    setShowMap(!showMap);
  };

  const handleLocationUpdate = (location: UserLocation) => {
    setUserLocation((prev) => {
      if (prev && prev.lat === location.lat && prev.lng === location.lng) {
        return prev; // Prevent re-render if location hasn't changed
      }
      console.log('User location updated:', location); // Debug log
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

        console.log('Fetching nearby services with filters:', {
          location: userLocation,
          radius: filters.nearMe ? (filters.radius || 5000) : 5000,
          serviceType: filters.serviceType,
        });

        const request = {
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: filters.nearMe ? (filters.radius || 5000) : 5000,
          serviceType: filters.serviceType?.length ? filters.serviceType.join(',') : undefined,
          // petType: filters.petType?.length ? filters.petType.join(',') : undefined, // Uncomment if backend supports
        };

        const fetchedShops = await userService.getNearbyServices(request);
        console.log('Fetched nearby services:', fetchedShops.length); // Debug log
        setMapServices(fetchedShops);
      } catch (error) {
        console.error("Failed to fetch services:", error);
        setMapServices([]); // Clear map services on error
      }
    }, 500); // Debounce by 500ms

    setFetchTimeout(timeout);
  };

  // Load shops when map is shown or filters change
  useEffect(() => {
    if (showMap && userLocation) {
      console.log('Map visible and location available, loading shops...'); // Debug log
      loadShopsWithLocation();
    }
    
    return () => {
      if (fetchTimeout) clearTimeout(fetchTimeout);
    };
  }, [showMap, userLocation, filters.serviceType, filters.radius, filters.nearMe]);

  const handlePageChange = (page: number, newPageSize?: number) => {
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1); // Reset to first page when page size changes
    } else {
      setCurrentPage(page);
    }
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFiltersChange = (newFilters: Partial<FilterOptions>) => {
    console.log('Filters changed:', newFilters); // Debug log
    setCurrentPage(1); // Reset to first page when filters change
    updateFilters(newFilters);
  };

  const handleClearFilters = () => {
    console.log('Clearing all filters'); // Debug log
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

  useEffect(() => {
    console.log('Current active filters:', {
      search: filters.search,
      rating: filters.rating,
      petType: filters.petType,
      serviceType: filters.serviceType,
      priceRange: filters.priceRange,
      duration: filters.duration,
    });
  }, [filters]);

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pet Services</h1>
          <p className="text-muted-foreground">
            Find the perfect care for your beloved pets
          </p>
          
          {/* Show active filter summary */}
          {(filters.search || filters.rating > 0) && (
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {filters.search && (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                  Search: "{filters.search}"
                </span>
              )}
              {filters.rating > 0 && (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                  Rating: {filters.rating}+ stars
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
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Loading services...</p>
            </div>
          )}

          {!loading && services.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-lg font-medium mb-1">No services found</p>
                <p className="text-sm text-muted-foreground">
                  {filters.search 
                    ? `No results for "${filters.search}"`
                    : 'Try adjusting your filters to see more results'}
                </p>
              </div>
              <button 
                onClick={handleClearFilters} 
                className="text-primary hover:underline font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : !loading && services.length > 0 ? (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, total)} of {total} service{total !== 1 ? 's' : ''}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {services.map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
              
              <Pagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal
                pageSizeOptions={[6, 12, 24, 48]}
                className="mt-8"
                disabled={loading}
              />
            </>
          ) : null}
        </div>
      </div>
      <Footer />
    </>
  );
};