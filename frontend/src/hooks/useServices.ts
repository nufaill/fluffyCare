import { useState, useEffect } from 'react';
import { PetServiceService } from '@/services/user/petservice.service';
import type { PetService, FilterOptions } from '@/types/service';

interface UseServicesProps {
  page?: number;
  pageSize?: number;
  initialFilters?: FilterOptions;
}

export const useServices = ({ page = 1, pageSize = 9, initialFilters }: UseServicesProps = {}) => {
  const [services, setServices] = useState<PetService[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    petType: initialFilters?.petType || [],
    serviceType: initialFilters?.serviceType || [],
    priceRange: initialFilters?.priceRange || [0, 20000],
    duration: initialFilters?.duration || [0, 24],
    rating: initialFilters?.rating || 0,
    nearMe: initialFilters?.nearMe || false,
    search: initialFilters?.search || '',
  });

  const petServiceService = new PetServiceService();

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await petServiceService.getAllServices({
        ...filters,
        page,
        pageSize,
      });
      setServices(response.services || []);
      setTotal(response.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [filters, page, pageSize]);

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const refreshServices = () => {
    fetchServices();
  };

  return {
    services,
    total,
    loading,
    error,
    filters,
    updateFilters,
    refreshServices,
  };
};