import type React from "react"
import { useState } from "react"
import Navbar from "@/components/admin/Navbar"
import Sidebar from "@/components/admin/Sidebar"
import { TrendingUp, Calendar, XCircle, DollarSign, BarChart3, PieChart, Star } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import type { RootState } from "@/redux/store"
import { logoutAdmin as logoutAdminAction } from "@/redux/slices/admin.slice"
import { logoutAdmin } from "@/services/admin/admin.service"
import Footer from "@/components/user/Footer"

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const adminData = useSelector((state: RootState) => state.admin.adminDatas)
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard")
  const [, setSearchQuery] = useState("")

  // Sample data for dashboard
  const stats = [
    {
      title: "Total Booking",
      value: "75",
      change: "+4% (30 days)",
      icon: Calendar,
      color: "bg-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Services",
      value: "357",
      change: "+5% (30 days)",
      icon: TrendingUp,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Cancelled",
      value: "65",
      change: "+20% (30 days)",
      icon: XCircle,
      color: "bg-red-500",
      bgColor: "bg-red-50",
    },
    {
      title: "Total Revenue",
      value: "$120",
      change: "+12% (30 days)",
      icon: DollarSign,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
    },
  ]

  const handleMenuItemClick = (item: string) => {
    setActiveMenuItem(item)
  }

  const handleLogout = async () => {
    try {
      await logoutAdmin()
      dispatch(logoutAdminAction())
      navigate("/admin/login")
    } catch (error) {
      console.error("Logout failed:", error)
      // Even if API fails, clear Redux state and redirect
      dispatch(logoutAdminAction())
      navigate("/admin/login")
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    console.log("Searching for:", query)
  }

  const renderDashboardContent = () => {
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Hi, {adminData?.fullName}. Welcome back to Sedap Admin!</p>
            </div>
            <div className="text-right">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Filter Periode</p>
                <p className="text-xs text-blue-600">17 April 2025 - 21 May 2025</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 text-white ${stat.color.replace("bg-", "text-")}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Pie Chart</h3>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-600">Chart</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-600">Show Value</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white font-bold">61%</span>
                </div>
                <p className="text-sm text-gray-600">Total Services</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white font-bold">22%</span>
                </div>
                <p className="text-sm text-gray-600">Customer Growth</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold">62%</span>
                </div>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>
          </div>

          {/* Chart Services */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Chart Services</h3>
                <p className="text-sm text-gray-500">Lorem ipsum dolor sit amet, consectetur adip</p>
              </div>
              <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                Save Report
              </button>
            </div>

            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-12 w-12 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Revenue Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Revenue</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <PieChart className="h-12 w-12 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Customer Map</h3>
              <select className="text-sm border border-gray-300 rounded px-3 py-1">
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-12 w-12 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Customer Review</h3>
              <p className="text-sm text-gray-500">Eum fuga consequuntur utadip et.</p>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <span className="sr-only">Previous</span>←
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <span className="sr-only">Next</span>→
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((review) => (
              <div key={review} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Customer Name</h4>
                    <p className="text-sm text-gray-500">2 days ago</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Lorem ipsum is simply dummy text of the printing and typesetting industry.
                </p>
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">4.5</span>
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
      {/* Sidebar */}
      <Sidebar activeItem={activeMenuItem} onItemClick={handleMenuItemClick} onLogout={handleLogout} />

      {/* Navbar */}
      <Navbar userName="NUFAIL" onSearch={handleSearch} />

      {/* Main Content */}
      <main className="ml-64 pt-16 p-6">
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>

      {/* Footer */}
      <div className="ml-64 pt-16 p-6">
        <Footer />
      </div>
    </div>
  )
}

export default AdminDashboard
