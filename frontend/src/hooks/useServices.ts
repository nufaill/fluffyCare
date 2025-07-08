// hooks/useServices.ts
import { useState, useEffect } from 'react';
import { PetServiceService } from '@/services/user/petservice.service';
import type { PetService, FilterOptions } from '@/types/service';

export const useServices = (initialFilters?: FilterOptions) => {
  const [services, setServices] = useState<PetService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters || {
    petType: [],
    serviceType: [],
    priceRange: [0, 200],
    duration: [0, 24],
    rating: 0,
    nearMe: false,
  });

  const petServiceService = new PetServiceService();

  const fetchServices = async (currentFilters: FilterOptions) => {
    setLoading(true);
    setError(null);
    try {
      const data = await petServiceService.getAllServices(currentFilters);
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(filters);
  }, [filters]);

  const updateFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const refreshServices = () => {
    fetchServices(filters);
  };

  return {
    services,
    loading,
    error,
    filters,
    updateFilters,
    refreshServices
  };
};