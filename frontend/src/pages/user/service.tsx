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
import { userService } from "@/services/user/user.service";
import type { ServiceLocation } from '@/services/user/user.service';

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
      return location;
    });
  };

  const loadShopsWithLocation = () => {
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
          // petType: filters.petType?.length ? filters.petType.join(',') : undefined, // Uncomment if backend supports
        };
        const fetchedShops = await userService.getNearbyServices(request);
        setMapServices(fetchedShops);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      }
    }, 500); // Debounce by 500ms

    setFetchTimeout(timeout);
  };

  useEffect(() => {
    if (showMap && userLocation) {
      loadShopsWithLocation();
    }
    return () => {
      if (fetchTimeout) clearTimeout(fetchTimeout);
    };
  }, [showMap, userLocation, filters]);

  const handlePageChange = (page: number, newPageSize?: number) => {
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    } else {
      setCurrentPage(page);
    }
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
      duration: [0, 12],
      rating: 0,
      nearMe: false,
      search: '',
      radius: undefined,
      currentAvailability: false, 
      selectedDay: '', 
      selectedTime: '', 
    });
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pet Services</h1>
          <p className="text-muted-foreground">Find the perfect care for your beloved pets</p>
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
              <h3 className="text-lg font-semibold">Services Map</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={mapStyle}
                  onChange={(e) => setMapStyle(e.target.value as any)}
                  className="text-sm border border-border rounded px-2 py-1 bg-background"
                >
                  <option value="default">Street Map</option>
                  <option value="satellite">Satellite</option>
                  <option value="terrain">Terrain</option>
                </select>
                <button
                  onClick={loadShopsWithLocation}
                  className="text-sm bg-primary text-white px-3 py-1 rounded hover:bg-primary/90"
                >
                  Refresh Map
                </button>
              </div>
            </div>

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
              <p>🔵 Blue marker: Your location | 🔴 Red markers: Pet shops</p>
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
            <div className="flex justify-center mb-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {services.length === 0 && !loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No services found</p>
              <button onClick={handleClearFilters} className="text-primary hover:underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
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
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};