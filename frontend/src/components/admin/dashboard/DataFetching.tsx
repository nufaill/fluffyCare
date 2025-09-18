import { useEffect, useState } from "react";
import AdminAxios from "@/api/admin.axios";
import type { PaginatedShopRatings, CustomerAnalytics } from "./StatComponents";

export const useDataFetching = () => {
  const [shops, setShops] = useState<{ shopId: string; shopName: string }[]>([]);
  const [shopsOverview, setShopsOverview] = useState<{
    totalShops: number;
    activeShops: number;
    inactiveShops: number;
    pendingShops: number;
  } | null>(null);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics | null>(null);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<{
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
  } | null>(null);
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
      const response = await AdminAxios.get('shops/shops-overview');
      if (response.data.success) {
        setShopsOverview(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
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
      setAnalytics(response.data.data);
    } catch (error) {
      setAnalyticsError("Failed to fetch analytics data. Please try again later.");
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
      setCustomerAnalytics(response.data.data);
    } catch (error) {
      setCustomersError("Failed to fetch customer analytics data. Please try again later.");
      console.error("Error fetching customer analytics:", error);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const fetchShopRatings = async (page: number, limit: number, activeMenuItem: string) => {
    if (activeMenuItem !== "Dashboard") return;
    try {
      const response = await AdminAxios.get(`/shops/ratings?page=${page}&limit=${limit}`);
      setShopRatings(response.data.data);
    } catch (error) {
      console.error("Error fetching shop ratings:", error);
    }
  };

  useEffect(() => {
    fetchShopsOverview();
    fetchCustomerAnalytics();
    fetchShops();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedShop]);

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