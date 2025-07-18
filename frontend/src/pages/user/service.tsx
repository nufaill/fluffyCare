import { useState, useEffect } from 'react';
import { ServiceCard } from '@/components/user/ServiceCard';
import { FilterBar } from '@/components/user/FilterBar';
import { Pagination } from '@/components/ui/Pagination';
import { useServices } from '@/hooks/useServices';
import { ServiceMap, type ServiceLocation, type UserLocation } from '@/components/user/ServiceMap';
import { Loader2, AlertCircle } from 'lucide-react';
import Header from "@/components/user/Header";
import Footer from "@/components/user/Footer";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { userService } from "@/services/user/user.service";

export const Services = () => {
  const [showMap, setShowMap] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [mapServices, setMapServices] = useState<ServiceLocation[]>([]);
  const [mapStyle, setMapStyle] = useState<'default' | 'satellite' | 'terrain'>('default');

  const { services, loading, error, filters, updateFilters, refreshServices, total } = useServices({
    page: currentPage,
    pageSize,
  });

  const handleToggleMap = () => {
    setShowMap(!showMap);
  };

  const loadServicesWithLocation = async () => {
    try {
      const data = await userService.getServicesWithLocation();
      setMapServices(data);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  };

  const handleLocationUpdate = (location: UserLocation) => {
    userService.setUserLocation(location, true);
    console.log("Location updated:", location);
  };

  useEffect(() => {
    if (showMap && mapServices.length === 0) {
      loadServicesWithLocation();
    }
  }, [showMap]);

  const handlePageChange = (page: number, newPageSize?: number) => {
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1); // Reset to first page when page size changes
    } else {
      setCurrentPage(page);
    }
  };

  const handleFiltersChange = (newFilters: any) => {
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
                  onClick={loadServicesWithLocation}
                  className="text-sm bg-primary text-white px-3 py-1 rounded hover:bg-primary/90"
                >
                  Refresh Map
                </button>
              </div>
            </div>

            <ServiceMap
              services={mapServices}
              onLocationUpdate={handleLocationUpdate}
              showUserLocation={true}
              enableLocationTracking={true}
              mapStyle={mapStyle}
              height="500px"
              className="rounded-lg border border-border"
            />

            <div className="mt-2 text-xs text-muted-foreground">
              <p>🔴 Red marker: Your location | 🔵 Blue markers: Pet services</p>
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