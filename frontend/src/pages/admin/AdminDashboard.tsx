import React, { useState, useEffect } from "react"
import Navbar from "@/components/admin/Navbar"
import Sidebar from "@/components/admin/sidebar"
import {
  Calendar,
  XCircle,
  DollarSign,
  Star,
  Store,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  TrendingUp,
  Users as UsersIcon,
  UserCheck,
  UserX,
  ArrowDownCircle,
  IndianRupee,
} from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logoutAdmin as logoutAdminAction } from "@/redux/slices/admin.slice"
import { logoutAdmin } from "@/services/admin/admin.service"
import Footer from "@/components/user/Footer"
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary"
import {
  ShopsChart,
  CustomersChart,
  CustomerDemographicsChart,
  BookingsChart,
} from "../../components/admin/dashboard/AnalyticsCharts"
import { StatCard, type Stat } from "../../components/admin/dashboard/StatComponents"
import { useDataFetching } from "../../components/admin/dashboard/DataFetching"
import { walletService } from "@/services/walletService"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { RootState } from "@/redux/store"

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showRevenueGraph, setShowRevenueGraph] = useState(false)
  const [showShopsGraph, setShowShopsGraph] = useState(false)
  const [showCustomersGraph, setShowCustomersGraph] = useState(false)
  const [showBookingsGraph, setShowBookingsGraph] = useState(false)
  const [showServiceTypeGraph, setShowServiceTypeGraph] = useState(false)
  const [walletData, setWalletData] = useState<any>(null)
  const [walletError, setWalletError] = useState<string | null>(null)
  const [isLoadingWallet, setIsLoadingWallet] = useState(true)
  const admin = useSelector((state: RootState) => state.admin.adminDatas)
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard")

  const {
    shopsOverview,
    customerAnalytics,
    isLoadingCustomers,
    customersError,
    analytics,
    isLoadingAnalytics,
    analyticsError,
    shopRatings,
    setRatingsPage,
    loading,
    error,
  } = useDataFetching()

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setIsLoadingWallet(true)
        if (!admin?._id) {
          setWalletError("Admin ID not found")
          setIsLoadingWallet(false)
          return
        }
        const adminId = admin._id
        const response = await walletService.getAdminWallet(adminId, "admin")
        setWalletData(response)
      } catch (err: any) {
        setWalletError(err.message || "Failed to fetch wallet data")
      } finally {
        setIsLoadingWallet(false)
      }
    }

    fetchWalletData()
  }, [admin])

  const customerChartData = customerAnalytics?.chartData || [
    { month: "Jan", total: 8200, new: 180, active: 1200 },
    { month: "Feb", total: 8350, new: 150, active: 1280 },
    { month: "Mar", total: 8520, new: 170, active: 1350 },
    { month: "Apr", total: 8720, new: 200, active: 1420 },
    { month: "May", total: 8942, new: 222, active: 1456 },
  ]

  const revenueChartData = [
    { month: "Jan", revenue: 35000, commission: 4375, target: 40000 },
    { month: "Feb", revenue: 38000, commission: 4750, target: 40000 },
    { month: "Mar", revenue: 42000, commission: 5250, target: 40000 },
    { month: "Apr", revenue: 45280, commission: 5660, target: 40000 },
    { month: "May", revenue: 48000, commission: 6000, target: 40000 },
    { month: "Jun", revenue: 52000, commission: 6500, target: 40000 },
  ]

  const shopsChartData = [
    { month: "Jan", total: 1180, active: 1089, pending: 15, suspended: 76 },
    { month: "Feb", total: 1195, active: 1105, pending: 12, suspended: 78 },
    { month: "Mar", total: 1210, active: 1125, pending: 18, suspended: 67 },
    { month: "Apr", total: 1230, active: 1145, pending: 16, suspended: 69 },
    { month: "May", total: 1247, active: 1156, pending: 18, suspended: 73 },
  ]

  const bookingsChartData = analytics?.dailyBookings || []

  const serviceTypePieData = (analytics?.serviceTypeBreakdown || []).map((item, index) => ({
    name: item.name,
    value: item.value,
    color: ["#3B82F6", "#10B981", "#8B5CF6", "#EF4444"][index % 4],
  }))

  const handleMenuItemClick = (item: string) => {
    setActiveMenuItem(item)
    setIsSidebarOpen(false)
  }

  const handleLogout = () => {
    dispatch(logoutAdminAction())
    logoutAdmin().then(() => {
      navigate("/login")
    })
  }

  const handleSidebarClose = () => {
    setIsSidebarOpen(false)
  }

  const totalDebited = walletData?.transactions
    ?.filter((transaction: any) => transaction.type === "debit")
    .reduce((sum: number, transaction: any) => sum + transaction.amount, 0) || 0

  const revenueStats: Stat[] = walletData && shopsOverview ? [
    {
      title: "Total Revenue",
      value: `₹ ${walletData.balance.toLocaleString()}`,
      change: "",
      icon: IndianRupee,
      color: "bg-emerald-50"
    },
    {
      title: "Total Debited",
      value: `₹ ${totalDebited.toLocaleString()}`,
      change: "",
      icon: ArrowDownCircle,
      color: "bg-gray-50"
    },
    {
      title: "Total Shops",
      value: shopsOverview.totalShops.toLocaleString(),
      change: "",
      icon: Store,
      color: "bg-indigo-50"
    },
    {
      title: "Total Customers",
      value: customerAnalytics?.total?.toLocaleString() || "0",
      change: "",
      icon: UserPlus,
      color: "bg-cyan-50"
    },
  ] : []

  const shopStats: Stat[] = shopsOverview ? [
    { title: "Total Shops", value: shopsOverview.totalShops.toLocaleString(), change: "", icon: Store, color: "bg-indigo-50" },
    { title: "Active Shops", value: shopsOverview.activeShops.toLocaleString(), change: "", icon: CheckCircle, color: "bg-green-50" },
    { title: "Pending Shops", value: shopsOverview.pendingShops.toLocaleString(), change: "", icon: Clock, color: "bg-amber-50" },
    { title: "Inactive Shops", value: shopsOverview.inactiveShops.toLocaleString(), change: "", icon: XCircle, color: "bg-red-50" },
  ] : []

  const customerStats: Stat[] = [
    {
      title: "Total Customers",
      value: customerAnalytics?.total?.toLocaleString() || "0",
      change: "",
      icon: Users,
      color: "bg-cyan-50"
    },
    {
      title: "New Customers",
      value: customerAnalytics?.newThisMonth?.toLocaleString() || "0",
      change: "",
      icon: UserPlus,
      color: "bg-emerald-50"
    },
    {
      title: "Active Customers",
      value: customerAnalytics?.active?.toLocaleString() || "0",
      change: "",
      icon: UserCheck,
      color: "bg-blue-50"
    },
    {
      title: "Inactive Customers",
      value: customerAnalytics?.inactive?.toLocaleString() || "0",
      change: "",
      icon: UserX,
      color: "bg-red-50"
    },
  ]

  const bookingStats: Stat[] = [
    {
      title: "Total Bookings",
      value: analytics?.overall.total.toLocaleString() || "0",
      change: "",
      icon: Calendar,
      color: "bg-purple-50",
    },
    {
      title: "Completed Bookings",
      value: analytics?.overall.completed.toLocaleString() || "0",
      change: "",
      icon: CheckCircle,
      color: "bg-green-50",
    },
    {
      title: "Pending Bookings",
      value: analytics?.overall.pending.toLocaleString() || "0",
      change: "",
      icon: Clock,
      color: "bg-amber-50",
    },
    {
      title: "Cancelled Bookings",
      value: analytics?.overall.cancelled.toLocaleString() || "0",
      change: "",
      icon: XCircle,
      color: "bg-red-50",
    },
  ]

  const renderShopAnalyticsSection = () => {
    if (loading) {
      return (
        <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 rounded-lg animate-pulse">
                <Store className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Shop Analytics</h2>
            </div>
            <button
              onClick={() => setShowShopsGraph(!showShopsGraph)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
            >
              <Store className="h-4 w-4" />
              <span>{showShopsGraph ? "Hide" : "Show"} Graph</span>
            </button>
          </div>
          <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Shop Analytics</h2>
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )
    }

    return (
      <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Store className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Shop Analytics</h2>
          </div>
          <button
            onClick={() => setShowShopsGraph(!showShopsGraph)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
          >
            <Store className="h-4 w-4" />
            <span>{showShopsGraph ? "Hide" : "Show"} Graph</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {shopStats.map((stat, index) => (
            <StatCard
              key={index}
              stat={stat}
              index={index}
              onToggleGraph={() => setShowShopsGraph(!showShopsGraph)}
              showGraph={showShopsGraph}
            />
          ))}
        </div>
        {showShopsGraph && (
          <ShopsChart
            revenueChartData={revenueChartData}
            shopsChartData={shopsChartData}
            customerChartData={customerChartData}
            bookingsChartData={bookingsChartData}
            serviceTypePieData={serviceTypePieData}
            customerAnalytics={customerAnalytics}
            showCustomersGraph={showCustomersGraph}
            setShowCustomersGraph={setShowCustomersGraph}
            showRevenueGraph={showRevenueGraph}
            setShowRevenueGraph={setShowRevenueGraph}
            showShopsGraph={showShopsGraph}
            setShowShopsGraph={setShowShopsGraph}
            showBookingsGraph={showBookingsGraph}
            setShowBookingsGraph={setShowBookingsGraph}
            showServiceTypeGraph={showServiceTypeGraph}
            setShowServiceTypeGraph={setShowServiceTypeGraph}
          />
        )}
      </div>
    )
  }

  const renderCustomerAnalyticsSection = () => {
    if (isLoadingCustomers) {
      return (
        <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan-50 rounded-lg animate-pulse">
                <Users className="h-6 w-6 text-cyan-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Customer Analytics</h2>
            </div>
            <button
              onClick={() => setShowCustomersGraph(!showCustomersGraph)}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg text-sm font-medium hover:bg-cyan-100 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>{showCustomersGraph ? "Hide" : "Show"} Graph</span>
            </button>
          </div>
          <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      )
    }

    if (customersError) {
      return (
        <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Customer Analytics</h2>
          <div className="text-red-600 text-sm">{customersError}</div>
        </div>
      )
    }

    return (
      <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-50 rounded-lg">
              <Users className="h-6 w-6 text-cyan-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Customer Analytics</h2>
          </div>
          <button
            onClick={() => setShowCustomersGraph(!showCustomersGraph)}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg text-sm font-medium hover:bg-cyan-100 transition-colors"
          >
            <Users className="h-4 w-4" />
            <span>{showCustomersGraph ? "Hide" : "Show"} Graph</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {customerStats.map((stat, index) => (
            <StatCard
              key={index}
              stat={stat}
              index={index}
              onToggleGraph={() => setShowCustomersGraph(!showCustomersGraph)}
              showGraph={showCustomersGraph}
            />
          ))}
        </div>
        {showCustomersGraph && (
          <div>
            <CustomersChart
              revenueChartData={revenueChartData}
              shopsChartData={shopsChartData}
              customerChartData={customerChartData}
              bookingsChartData={bookingsChartData}
              serviceTypePieData={serviceTypePieData}
              customerAnalytics={customerAnalytics}
              showCustomersGraph={showCustomersGraph}
              setShowCustomersGraph={setShowCustomersGraph}
              showRevenueGraph={showRevenueGraph}
              setShowRevenueGraph={setShowRevenueGraph}
              showShopsGraph={showShopsGraph}
              setShowShopsGraph={setShowShopsGraph}
              showBookingsGraph={showBookingsGraph}
              setShowBookingsGraph={setShowBookingsGraph}
              showServiceTypeGraph={showServiceTypeGraph}
              setShowServiceTypeGraph={setShowServiceTypeGraph}
            />
            <CustomerDemographicsChart
              revenueChartData={revenueChartData}
              shopsChartData={shopsChartData}
              customerChartData={customerChartData}
              bookingsChartData={bookingsChartData}
              serviceTypePieData={serviceTypePieData}
              customerAnalytics={customerAnalytics}
              showCustomersGraph={showCustomersGraph}
              setShowCustomersGraph={setShowCustomersGraph}
              showRevenueGraph={showRevenueGraph}
              setShowRevenueGraph={setShowRevenueGraph}
              showShopsGraph={showShopsGraph}
              setShowShopsGraph={setShowShopsGraph}
              showBookingsGraph={showBookingsGraph}
              setShowBookingsGraph={setShowBookingsGraph}
              showServiceTypeGraph={showServiceTypeGraph}
              setShowServiceTypeGraph={setShowServiceTypeGraph}
            />
          </div>
        )}
        {customerAnalytics?.engagement && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Engagement Rate</h4>
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-1">
                {((customerAnalytics.active / customerAnalytics.total) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">
                {customerAnalytics.active} active out of {customerAnalytics.total} total customers
              </p>
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <UsersIcon className="h-5 w-5 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Repeat Rate</h4>
              </div>
              <p className="text-2xl font-bold text-green-600 mb-1">
                {customerAnalytics.engagement.repeatCustomers}
              </p>
              <p className="text-sm text-gray-600">Customers with multiple bookings</p>
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Churn Rate</h4>
              </div>
              <p className="text-2xl font-bold text-red-600 mb-1">
                {customerAnalytics.engagement.churnRate}%
              </p>
              <p className="text-sm text-gray-600">Lost customers this month</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderDashboardContent = () => {
    return (
      <div>
        <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Revenue Overview</h2>
            </div>
            <button
              onClick={() => setShowRevenueGraph(!showRevenueGraph)}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
            >
              <DollarSign className="h-4 w-4" />
              <span>{showRevenueGraph ? "Hide" : "Show"} Graph</span>
            </button>
          </div>
          {isLoadingWallet ? (
            <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ) : walletError ? (
            <div className="text-red-600 text-sm">{walletError}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {revenueStats.map((stat, index) => (
                <StatCard key={index} stat={stat} index={index} />
              ))}
            </div>
          )}
        </div>

        {renderShopAnalyticsSection()}

        {renderCustomerAnalyticsSection()}

        <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Bookings Overview</h2>
            </div>
            <button
              onClick={() => setShowBookingsGraph(!showBookingsGraph)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>{showBookingsGraph ? "Hide" : "Show"} Graph</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bookingStats.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
          </div>
          {showBookingsGraph && (
            <BookingsChart
              revenueChartData={revenueChartData}
              shopsChartData={shopsChartData}
              customerChartData={customerChartData}
              bookingsChartData={bookingsChartData}
              serviceTypePieData={serviceTypePieData}
              customerAnalytics={customerAnalytics}
              showCustomersGraph={showCustomersGraph}
              setShowCustomersGraph={setShowCustomersGraph}
              showRevenueGraph={showRevenueGraph}
              setShowRevenueGraph={setShowRevenueGraph}
              showShopsGraph={showShopsGraph}
              setShowShopsGraph={setShowShopsGraph}
              showBookingsGraph={showBookingsGraph}
              setShowBookingsGraph={setShowBookingsGraph}
              showServiceTypeGraph={showServiceTypeGraph}
              setShowServiceTypeGraph={setShowServiceTypeGraph}
            />
          )}
        </div>

        {isLoadingAnalytics ? (
          <div className="text-center py-8 text-gray-600">Loading shop-wise data...</div>
        ) : analyticsError ? (
          <div className="text-center py-8 text-red-600">{analyticsError}</div>
        ) : (
          <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Shop-wise Bookings</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-100 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      <Store className="h-4 w-4 inline mr-2 text-indigo-600" /> Shop Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      <Calendar className="h-4 w-4 inline mr-2 text-purple-600" /> Total
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      <Clock className="h-4 w-4 inline mr-2 text-amber-600" /> Pending
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      <CheckCircle className="h-4 w-4 inline mr-2 text-blue-600" /> Confirmed
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      <TrendingUp className="h-4 w-4 inline mr-2 text-purple-600" /> Ongoing
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      <CheckCircle className="h-4 w-4 inline mr-2 text-green-600" /> Completed
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      <XCircle className="h-4 w-4 inline mr-2 text-red-600" /> Cancelled
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.shopWise.length ? (
                    analytics.shopWise.map((shop) => (
                      <tr key={shop.shopId} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{shop.shopName}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{shop.total}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{shop.pending}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{shop.confirmed}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{shop.ongoing}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{shop.completed}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{shop.cancelled}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-600">
                        No shop-wise data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Shops Ratings Overview</h2>
            </div>
          </div>

          {shopRatings && (
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                Showing {shopRatings.pagination.currentPage} of {shopRatings.pagination.totalPages} pages
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setRatingsPage((prev) => Math.max(prev - 1, 1))}
                  disabled={!shopRatings.pagination.hasPrevious}
                  className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setRatingsPage((prev) => prev + 1)}
                  disabled={!shopRatings.pagination.hasNext}
                  className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shopRatings?.shopRatings.map((shop) => {
              const ratingBreakdownData = [
                { name: "5 Stars", value: shop.ratingBreakdown[5], color: "#10B981" },
                { name: "4 Stars", value: shop.ratingBreakdown[4], color: "#3B82F6" },
                { name: "3 Stars", value: shop.ratingBreakdown[3], color: "#F59E0B" },
                { name: "2 Stars", value: shop.ratingBreakdown[2], color: "#EF4444" },
                { name: "1 Star", value: shop.ratingBreakdown[1], color: "#6B7280" },
              ].filter((item) => item.value > 0)

              return (
                <div
                  key={shop.shopId}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={cloudinaryUtils.getFullUrl(shop.shopLogo || "")}
                      alt={`${shop.shopName} logo`}
                      className="h-12 w-12 rounded-full object-cover"
                      onError={(e) => (e.currentTarget.src = "/default-logo.png")}
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{shop.shopName}</h3>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < Math.round(shop.averageRating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                              }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {shop.averageRating.toFixed(1)} / 5
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Based on {shop.totalReviews} reviews</p>
                    </div>
                  </div>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ratingBreakdownData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {ratingBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeMenuItem) {
      case "Dashboard":
        return renderDashboardContent()
      case "BookingList":
        return (
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking List</h2>
            <p className="text-gray-600">Booking list content will be displayed here.</p>
          </div>
        )
      case "ServicesDetail":
        return (
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Services Detail</h2>
            <p className="text-gray-600">Services detail content will be displayed here.</p>
          </div>
        )
      case "Shops":
        return (
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Shops</h2>
            <p className="text-gray-600">Shops content will be displayed here.</p>
          </div>
        )
      case "Reviews":
        return (
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
            <p className="text-gray-600">Reviews content will be displayed here.</p>
          </div>
        )
      case "Verification":
        return (
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Verification</h2>
            <p className="text-gray-600">Verification content will be displayed here.</p>
          </div>
        )
      case "CustomerPetsDetail":
        return (
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer & Pets Detail</h2>
            <p className="text-gray-600">Customer and pets detail content will be displayed here.</p>
          </div>
        )
      default:
        return renderDashboardContent()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        userName="NUFAIL"
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex">
        <Sidebar
          activeItem={activeMenuItem}
          onItemClick={handleMenuItemClick}
          onLogout={handleLogout}
          isOpen={isSidebarOpen}
          onClose={handleSidebarClose}
        />
        <main className="flex-1 pt-16 p-6 md:ml-64 overflow-y-auto min-h-screen">
          {renderContent()}
        </main>
      </div>
      <div className="md:ml-64 p-6">
        <Footer />
      </div>
    </div>
  )
}

export default AdminDashboard;