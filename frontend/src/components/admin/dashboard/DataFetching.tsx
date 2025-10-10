import { useEffect, useState } from "react";
import type { PaginatedShopRatings, CustomerAnalytics } from "./StatComponents";
import { createBaseAxios } from '@/api/base.axios';

let AdminAxios = createBaseAxios('/admin');

interface ShopsOverview {
  totalShops: number;
  activeShops: number;
  inactiveShops: number;
  pendingShops: number;
  monthlyData?: Array<{
    month: string;
    totalShops: number;
    activeShops: number;
    pendingShops: number;
    suspendedShops: number;
  }>;
}

interface Analytics {
  overall: {
    total: number;
    pending: number;
    confirmed: number;
    ongoing: number;
    completed: number;
    cancelled: number;
  };
  shopWise: any[];
  serviceTypeBreakdown: any[];
  dailyBookings: any[];
}

export const useDataFetching = () => {
  const [shops, setShops] = useState<{ shopId: string; shopName: string }[]>([]);
  const [shopsOverview, setShopsOverview] = useState<ShopsOverview | null>(null);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics | null>(null);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [shopRatings, setShopRatings] = useState<PaginatedShopRatings | null>(null);
  const [ratingsPage, setRatingsPage] = useState(1);
  const [ratingsLimit, setRatingsLimit] = useState(10);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShops = async () => {
    try {
      const response = await AdminAxios.get("/shops");
      setShops(
        response.data.data.shops.map((s: any) => ({
          shopId: s._id,
          shopName: s.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching shops:", error);
    }
  };

  const fetchShopsOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the main shops overview data
      const response = await AdminAxios.get('shops/shops-overview');
      
      if (response.data.success) {
        const overviewData = response.data.data;
        
        // If monthlyData is not included in the response, you might need to fetch it separately
        // or ensure your backend API returns it
        if (!overviewData.monthlyData) {
          console.warn('monthlyData not found in shops-overview response');
          // Optionally set default empty array or fetch from another endpoint
          overviewData.monthlyData = [];
        }
        
        setShopsOverview(overviewData);
      } else {
        throw new Error(response.data.message || 'Failed to fetch data');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching shops overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    setAnalyticsError(null);
    try {
      let url = "/appointments/analytics";
      if (selectedShop) {
        url += `?shopId=${selectedShop}`;
      }
      const response = await AdminAxios.get(url);
      
      if (response.data.success) {
        const analyticsData = response.data.data;
        
        // Ensure all required fields exist with defaults
        setAnalytics({
          overall: analyticsData.overall || {
            total: 0,
            pending: 0,
            confirmed: 0,
            ongoing: 0,
            completed: 0,
            cancelled: 0,
          },
          shopWise: analyticsData.shopWise || [],
          serviceTypeBreakdown: analyticsData.serviceTypeBreakdown || [],
          dailyBookings: analyticsData.dailyBookings || [],
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch analytics');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 
                          "Failed to fetch analytics data. Please try again later.";
      setAnalyticsError(errorMessage);
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const fetchCustomerAnalytics = async () => {
    setIsLoadingCustomers(true);
    setCustomersError(null);
    try {
      const response = await AdminAxios.get("/users/users-analytics");
      
      if (response.data.success) {
        const customerData = response.data.data;
        
        // Ensure chartData exists with defaults
        if (!customerData.chartData) {
          console.warn('chartData not found in users-analytics response');
          customerData.chartData = [];
        }
        
        setCustomerAnalytics(customerData);
      } else {
        throw new Error(response.data.message || 'Failed to fetch customer analytics');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 
                          "Failed to fetch customer analytics data. Please try again later.";
      setCustomersError(errorMessage);
      console.error("Error fetching customer analytics:", error);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const fetchShopRatings = async (page: number, limit: number, activeMenuItem: string) => {
    if (activeMenuItem !== "Dashboard") return;
    try {
      const response = await AdminAxios.get(`/shops/ratings?page=${page}&limit=${limit}`);
      
      if (response.data.success) {
        setShopRatings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching shop ratings:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchShopsOverview();
    fetchCustomerAnalytics();
    fetchShops();
  }, []);

  // Fetch analytics when selectedShop changes
  useEffect(() => {
    fetchAnalytics();
  }, [selectedShop]);

  // Fetch shop ratings when page or limit changes
  useEffect(() => {
    fetchShopRatings(ratingsPage, ratingsLimit, "Dashboard");
  }, [ratingsPage, ratingsLimit]);

  return {
    shops,
    shopsOverview,
    customerAnalytics,
    isLoadingCustomers,
    customersError,
    analytics,
    isLoadingAnalytics,
    analyticsError,
    shopRatings,
    ratingsPage,
    setRatingsPage,
    ratingsLimit,
    setRatingsLimit,
    selectedShop,
    setSelectedShop,
    loading,
    error,
  };
};