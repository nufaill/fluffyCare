// pages/Services.tsx
import { useState } from 'react';
import { ServiceCard } from '@/components/user/ServiceCard';
import { FilterBar } from '@/components/user/FilterBar';
import { Pagination } from '@/components/ui/Pagination'; 
import { useServices } from '@/hooks/useServices';
import { Loader2, AlertCircle } from 'lucide-react';
import Header from "@/components/user/Header"
import Footer from "@/components/user/Footer"
import { Alert, AlertDescription } from '@/components/ui/alert';

export const Services = () => {
  const [showMap, setShowMap] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); 
  
  const { services, loading, error, filters, updateFilters, refreshServices } = useServices();

  const handleToggleMap = () => {
    setShowMap(!showMap);
  };

  // Calculate pagination
  const totalServices = services.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentServices = services.slice(startIndex, endIndex);

  const handlePageChange = (page: number, newPageSize?: number) => {
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      // Recalculate current page to maintain position
      const currentItemIndex = (currentPage - 1) * pageSize;
      const newPage = Math.floor(currentItemIndex / newPageSize) + 1;
      setCurrentPage(newPage);
    } else {
      setCurrentPage(page);
    }
  };

  // Reset to first page when filters change
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
    });
  };

  if (loading && services.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading services...</span>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Pet Services</h1>
          <p className="text-muted-foreground">
            Find the perfect care for your beloved pets
          </p>
        </div>

        <FilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onToggleMap={handleToggleMap}
          showMap={showMap} />

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

        <div className="flex gap-6">
          {showMap && (
            <div className="w-1/3">
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-muted-foreground text-center">
                  Map integration would go here
                </p>
              </div>
            </div>
          )}

          <div className={`${showMap ? 'w-2/3' : 'w-full'}`}>
            {loading && services.length > 0 && (
              <div className="flex justify-center mb-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {services.length === 0 && !loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No services found matching your criteria
                </p>
                <button
                  onClick={handleClearFilters}
                  className="text-primary hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {currentServices.map((service) => (
                    <ServiceCard key={service._id} service={service} />
                  ))}
                </div>
                
                {/* Pagination Component */}
                {totalServices > 0 && (
                  <Pagination
                    current={currentPage}
                    total={totalServices}
                    pageSize={pageSize}
                    onChange={handlePageChange}
                    showSizeChanger={true}
                    showQuickJumper={true}
                    showTotal={true}
                    pageSizeOptions={[6, 12, 24, 48]}
                    className="mt-8"
                    disabled={loading}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};