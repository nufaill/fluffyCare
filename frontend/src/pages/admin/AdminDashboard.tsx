import type React from "react"
import { useState } from "react"
import Navbar from "@/components/admin/Navbar"
import Sidebar from "@/components/admin/sidebar"
import {
  Calendar,
  XCircle,
  DollarSign,
  BarChart3,
  Star,
  Store,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  Award,
  GraduationCap,
  Heart,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import type { RootState } from "@/redux/store"
import { logoutAdmin as logoutAdminAction } from "@/redux/slices/admin.slice"
import { logoutAdmin } from "@/services/admin/admin.service"
import Footer from "@/components/user/Footer"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const adminData = useSelector((state: RootState) => state.admin.adminDatas)
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard")
  const [, setSearchQuery] = useState("")

  const [showRevenueGraph, setShowRevenueGraph] = useState(false)
  const [showShopsGraph, setShowShopsGraph] = useState(false)
  const [showCustomersGraph, setShowCustomersGraph] = useState(false)
  const [showBookingsGraph, setShowBookingsGraph] = useState(false)
  const [showServiceTypeGraph, setShowServiceTypeGraph] = useState(false)

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

  const customersChartData = [
    { month: "Jan", total: 8200, new: 180, active: 1200 },
    { month: "Feb", total: 8350, new: 150, active: 1280 },
    { month: "Mar", total: 8520, new: 170, active: 1350 },
    { month: "Apr", total: 8720, new: 200, active: 1420 },
    { month: "May", total: 8942, new: 222, active: 1456 },
  ]

  const bookingsChartData = [
    { day: "Mon", bookings: 78, completed: 72, cancelled: 6 },
    { day: "Tue", bookings: 85, completed: 80, cancelled: 5 },
    { day: "Wed", bookings: 92, completed: 87, cancelled: 5 },
    { day: "Thu", bookings: 89, completed: 84, cancelled: 5 },
    { day: "Fri", bookings: 95, completed: 90, cancelled: 5 },
    { day: "Sat", bookings: 110, completed: 103, cancelled: 7 },
    { day: "Sun", bookings: 88, completed: 82, cancelled: 6 },
  ]

  const serviceTypePieData = [
    { name: "Grooming", value: 45280, color: "#3B82F6" },
    { name: "Training", value: 32150, color: "#10B981" },
    { name: "Daycare", value: 28900, color: "#8B5CF6" },
    { name: "Veterinary", value: 19800, color: "#EF4444" },
  ]

  const handleMenuItemClick = (item: string) => {
    setActiveMenuItem(item)
  }

  const handleLogout = () => {
    dispatch(logoutAdminAction())
    logoutAdmin().then(() => {
      navigate("/login")
    })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const StatCard = ({
    stat,
    index,
    onToggleGraph,
    showGraph,
  }: {
    stat: any
    index: number
    onToggleGraph?: () => void
    showGraph?: boolean
  }) => {
    const Icon = stat.icon
    return (
      <div
        className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2 group-hover:scale-105 transition-transform duration-200">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500">{stat.change}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div
              className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-200`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            {onToggleGraph && (
              <button
                onClick={onToggleGraph}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-600 transition-colors"
              >
                <BarChart3 className="h-3 w-3" />
                <span>Graph</span>
                {showGraph ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const RevenueChart = () => (
    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Revenue Trends</h3>
          <p className="text-sm text-gray-600">Monthly revenue and commission tracking</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">6M</button>
          <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">1Y</button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={revenueChartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3B82F6"
            strokeWidth={3}
            name="Revenue"
            dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="commission"
            stroke="#10B981"
            strokeWidth={2}
            name="Commission"
            dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#EF4444"
            strokeDasharray="5 5"
            strokeWidth={2}
            name="Target"
            dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )

  const ShopsChart = () => (
    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Shop Growth & Status</h3>
        <p className="text-sm text-gray-600">Track shop registrations and status changes</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={shopsChartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend />
          <Bar dataKey="active" fill="#10B981" name="Active Shops" />
          <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
          <Bar dataKey="suspended" fill="#EF4444" name="Suspended" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  const CustomersChart = () => (
    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Customer Growth</h3>
        <p className="text-sm text-gray-600">Total customers and new registrations over time</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={customersChartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} name="Total Customers" />
          <Line type="monotone" dataKey="new" stroke="#10B981" strokeWidth={2} name="New Registrations" />
          <Line type="monotone" dataKey="active" stroke="#8B5CF6" strokeWidth={2} name="Active Users" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )

  const BookingsChart = () => (
    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Weekly Booking Patterns</h3>
        <p className="text-sm text-gray-600">Daily booking volume and completion rates</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={bookingsChartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend />
          <Bar dataKey="completed" fill="#10B981" name="Completed" />
          <Bar dataKey="cancelled" fill="#EF4444" name="Cancelled" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  const ServiceTypePieChart = () => (
    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Service Revenue Distribution</h3>
        <p className="text-sm text-gray-600">Revenue breakdown by service category</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={serviceTypePieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {serviceTypePieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )

  const revenueStats = [
    { title: "Total Revenue", value: "$234,567", change: "+12%", icon: DollarSign, color: "bg-emerald-100" },
    { title: "Total Commission", value: "$29,321", change: "+15%", icon: Award, color: "bg-gray-100" },
    { title: "Active Shops", value: "1,200", change: "+5%", icon: Store, color: "bg-indigo-100" },
    { title: "New Customers", value: "894", change: "+10%", icon: Users, color: "bg-cyan-100" },
  ]

  const serviceTypes = [
    { name: "Grooming", bookings: 45280, revenue: 45280, icon: DollarSign, color: "bg-emerald-100" },
    { name: "Training", bookings: 32150, revenue: 32150, icon: GraduationCap, color: "bg-gray-100" },
    { name: "Daycare", bookings: 28900, revenue: 28900, icon: Heart, color: "bg-indigo-100" },
    { name: "Veterinary", bookings: 19800, revenue: 19800, icon: AlertTriangle, color: "bg-cyan-100" },
  ]

  const shopStats = [
    { title: "Total Shops", value: "1,200", change: "+5%", icon: Store, color: "bg-indigo-100" },
    { title: "Active Shops", value: "1,100", change: "+4%", icon: CheckCircle, color: "bg-green-100" },
    { title: "Pending Shops", value: "50", change: "+3%", icon: Clock, color: "bg-amber-100" },
    { title: "Suspended Shops", value: "100", change: "-2%", icon: XCircle, color: "bg-red-100" },
  ]

  const customerStats = [
    { title: "Total Customers", value: "8,942", change: "+10%", icon: Users, color: "bg-cyan-100" },
    { title: "New Customers", value: "894", change: "+10%", icon: UserPlus, color: "bg-emerald-100" },
    { title: "Active Customers", value: "7,000", change: "+8%", icon: Heart, color: "bg-pink-100" },
    { title: "Inactive Customers", value: "942", change: "-5%", icon: XCircle, color: "bg-red-100" },
  ]

  const bookingStats = [
    { title: "Total Bookings", value: "2,156", change: "+12%", icon: Calendar, color: "bg-purple-100" },
    { title: "Completed Bookings", value: "2,156", change: "+12%", icon: CheckCircle, color: "bg-green-100" },
    { title: "Pending Bookings", value: "156", change: "+3%", icon: Clock, color: "bg-amber-100" },
    { title: "Cancelled Bookings", value: "102", change: "-4%", icon: XCircle, color: "bg-red-100" },
  ]

  const peakHours = [
    { time: "9:00 AM", bookings: 89 },
    { time: "10:00 AM", bookings: 85 },
    { time: "11:00 AM", bookings: 92 },
    { time: "12:00 PM", bookings: 89 },
    { time: "1:00 PM", bookings: 95 },
    { time: "2:00 PM", bookings: 110 },
    { time: "3:00 PM", bookings: 88 },
  ]

  const renderDashboardContent = () => {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-lg text-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-gray-100 text-lg">
                Hi, {adminData?.fullName}. Welcome back to your comprehensive admin panel!
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/20">
              <p className="text-sm font-medium text-white/90">Filter Period</p>
              <p className="text-xs text-gray-100">17 April 2025 - 21 May 2025</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Revenue Insights</h2>
            <button
              onClick={() => setShowRevenueGraph(!showRevenueGraph)}
              className="ml-auto flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>{showRevenueGraph ? "Hide" : "Show"} Graph</span>
              {showRevenueGraph ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {revenueStats.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
          </div>
          {showRevenueGraph && <RevenueChart />}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Revenue by Service Type</h3>
              <p className="text-gray-600">Breakdown of revenue across different pet services</p>
            </div>
            <div className="flex space-x-2">
              <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 transition-colors">
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Year</option>
              </select>
              <button
                onClick={() => setShowServiceTypeGraph(!showServiceTypeGraph)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Chart</span>
                {showServiceTypeGraph ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceTypes.map((service, index) => {
              const Icon = service.icon
              return (
                <div
                  key={index}
                  className="group p-6 border border-gray-100 rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div
                      className={`p-3 ${service.color} rounded-lg group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-500">{service.bookings} bookings</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${service.revenue.toLocaleString()}</p>
                </div>
              )
            })}
          </div>
          {showServiceTypeGraph && <ServiceTypePieChart />}
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Store className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Shops Overview</h2>
            <button
              onClick={() => setShowShopsGraph(!showShopsGraph)}
              className="ml-auto flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>{showShopsGraph ? "Hide" : "Show"} Graph</span>
              {showShopsGraph ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {shopStats.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
          </div>
          {showShopsGraph && <ShopsChart />}
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Users className="h-6 w-6 text-cyan-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Analytics</h2>
            <button
              onClick={() => setShowCustomersGraph(!showCustomersGraph)}
              className="ml-auto flex items-center space-x-2 px-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg text-sm font-medium hover:bg-cyan-100 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>{showCustomersGraph ? "Hide" : "Show"} Graph</span>
              {showCustomersGraph ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {customerStats.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
          </div>
          {showCustomersGraph && <CustomersChart />}
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Bookings & Services</h2>
            <button
              onClick={() => setShowBookingsGraph(!showBookingsGraph)}
              className="ml-auto flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>{showBookingsGraph ? "Hide" : "Show"} Graph</span>
              {showBookingsGraph ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bookingStats.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
          </div>
          {showBookingsGraph && <BookingsChart />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Peak Booking Hours</h3>
              <p className="text-gray-600">Most popular booking times today</p>
            </div>
            <div className="space-y-4">
              {peakHours.map((hour, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{hour.time}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-gray-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(hour.bookings / 89) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8">{hour.bookings}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Status Breakdown</h3>
              <p className="text-gray-600">Current status of all bookings</p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-semibold text-gray-900">Completed</p>
                    <p className="text-sm text-gray-600">2,156 bookings</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">89.2%</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Clock className="h-8 w-8 text-amber-500" />
                  <div>
                    <p className="font-semibold text-gray-900">Pending</p>
                    <p className="text-sm text-gray-600">156 bookings</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-amber-600">6.6%</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="font-semibold text-gray-900">Cancelled</p>
                    <p className="text-sm text-gray-600">102 bookings</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-red-600">4.2%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Shops Ratings Overview</h2>
          </div>

          {/* Horizontally scrollable shops ratings */}
          <div className="flex space-x-6 overflow-x-auto pb-4">
            {[1, 2, 3, 4, 5, 6].map((shop) => (
              <div
                key={shop}
                className="min-w-[280px] bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-shrink-0"
              >
                <div className="flex items-center space-x-4">
                  {/* Shop Logo */}
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Star className="h-8 w-8 text-white fill-current" />
                  </div>

                  {/* Shop Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      Shop Name {shop}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {[...Array(4)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 text-yellow-400 fill-current"
                        />
                      ))}
                      <Star className="h-5 w-5 text-gray-300" /> 
                      <span className="ml-2 text-sm text-gray-600">4.2 / 5</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Based on {Math.floor(Math.random() * 5000) + 200} reviews
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking List</h2>
            <p className="text-gray-600">Booking list content will be displayed here.</p>
          </div>
        )
      case "ServicesDetail":
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Services Detail</h2>
            <p className="text-gray-600">Services detail content will be displayed here.</p>
          </div>
        )
      case "Shops":
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Shops</h2>
            <p className="text-gray-600">Shops content will be displayed here.</p>
          </div>
        )
      case "Reviews":
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
            <p className="text-gray-600">Reviews content will be displayed here.</p>
          </div>
        )
      case "Verification":
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification</h2>
            <p className="text-gray-600">Verification content will be displayed here.</p>
          </div>
        )
      case "CustomerPetsDetail":
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer & Pets Detail</h2>
            <p className="text-gray-600">Customer and pets detail content will be displayed here.</p>
          </div>
        )
      default:
        return renderDashboardContent()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem={activeMenuItem} onItemClick={handleMenuItemClick} onLogout={handleLogout} />
      <Navbar userName="NUFAIL" onSearch={handleSearch} />
      <main className="ml-64 pt-16 p-6">
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>
      <div className="ml-64 pt-16 p-6">
        <Footer />
      </div>
    </div>
  )
}

export default AdminDashboard
