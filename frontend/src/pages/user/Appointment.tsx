import { useState, useEffect, useMemo } from "react"
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  Plus,
  X,
  CheckCircle,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  Menu,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import ToasterSetup from "@/components/ui/ToasterSetup"
import Header from "@/components/user/Header"
import Footer from "@/components/user/Footer"
import { ModernSidebar } from "@/components/user/App-sidebar"
import { Link } from "react-router-dom"
import type { RootState } from "@/redux/store"
import { useSelector } from "react-redux"
import Useraxios from "@/api/user.axios"
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary"
import { Pagination } from "@/components/ui/Pagination"
import { useMobile } from "@/hooks/chat/use-mobile"

interface Appointment {
  _id: string
  petId: {
    profileImage: any
    _id: string
    name: string
    breed: string
    image?: string
    age?: number
  }
  serviceId: {
    _id: string
    name: string
    price: number
    duration: number
  }
  shopId: {
    _id: string
    name: string
    city: string
    streetAddress: string
    phone?: string
  }
  staffId: {
    _id: string
    name: string
  }
  slotDetails?: {
    date?: string
    startTime: string
    endTime: string
  }
  appointmentStatus: string
  paymentDetails?: {
    status?: string
    method?: string
  }
  requestStatus?: string
  createdAt: string
  updatedAt?: string
  notes?: string
  userId?: {
    _id: string
    email: string
    phone: string
  }
  bookingNumber?: string
}

interface Stats {
  completed: number
  upcoming: number
  pending: number
  ongoing: number
  totalSpent: number
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
    case "paid":
      return "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25"
    case "completed":
      return "bg-green-600 text-white border-green-600 shadow-lg shadow-green-600/25"
    case "ongoing":
      return "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/25"
    case "pending":
      return "bg-yellow-500 text-white border-yellow-500 shadow-lg shadow-yellow-500/25"
    case "cancelled":
    case "refunded":
      return "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/25"
    default:
      return "bg-gray-500 text-white border-gray-500 shadow-lg shadow-gray-500/25"
  }
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
    case "completed":
      return <CheckCircle className="w-4 h-4 animate-pulse" />
    case "pending":
      return <Clock className="w-4 h-4 animate-spin" />
    case "ongoing":
      return <Clock className="w-4 h-4 animate-bounce" />
    case "cancelled":
      return <X className="w-4 h-4" />
    default:
      return <Calendar className="w-4 h-4" />
  }
}

const suggestedMessages = [
  "Great service, very professional staff!",
  "My pet was well taken care of, highly recommend!",
  "Excellent experience, will book again.",
  "The staff was friendly but the wait time was a bit long.",
  "Good service, but there's room for improvement."
]

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<Stats>({ completed: 0, upcoming: 0, pending: 0, ongoing: 0, totalSpent: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalAppointments, setTotalAppointments] = useState(0)
  const [cancelReason, setCancelReason] = useState("")
  const [showCancelDialog, setShowCancelDialog] = useState<string | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState<string | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMobile()

  const user = useSelector((state: RootState) => state.user.userDatas)
  const userId = user?._id || user?.id || ""

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userId) {
        setError("User not found. Please log in again.")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const appointmentsResponse = await Useraxios.get(`/appointments/user/${userId}`, {
          params: {
            page: currentPage,
            limit: pageSize,
            status: statusFilter === "all" ? undefined : statusFilter,
          },
        })
        const { data, meta } = appointmentsResponse.data
        setAppointments(Array.isArray(data) ? data : [])
        setTotalAppointments(meta?.total || 0)
        const calculatedStats = calculateStats(data)
        setStats(calculatedStats)
        setIsLoading(false)
      } catch (err: any) {
        console.error("Failed to fetch appointments:", err)
        setError("Failed to fetch appointments")
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [userId, currentPage, pageSize, statusFilter])

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false)
    }
  }, [isMobile])

  const calculateStats = (appointmentsData: Appointment[]): Stats => {
    if (!Array.isArray(appointmentsData)) return { completed: 0, upcoming: 0, pending: 0, ongoing: 0, totalSpent: 0 }

    const now = new Date()
    const stats = {
      completed: 0,
      upcoming: 0,
      pending: 0,
      ongoing: 0,
      totalSpent: 0,
    }

    appointmentsData.forEach((appointment) => {
      const appointmentDate = new Date(appointment.createdAt)

      switch (appointment.appointmentStatus.toLowerCase()) {
        case "completed":
          stats.completed++
          stats.totalSpent += appointment.serviceId.price
          break
        case "pending":
          stats.pending++
          break
        case "ongoing":
          stats.ongoing++
          break
        case "confirmed":
        case "booked":
          if (appointmentDate >= now) {
            stats.upcoming++
          }
          break
      }
    })

    return stats
  }

  const filteredAndSortedAppointments = useMemo(() => {
    if (!Array.isArray(appointments)) return []

    const filtered = appointments.filter((appointment) => {
      const matchesSearch =
        appointment.petId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.serviceId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.shopId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.staffId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "price-asc":
          return a.serviceId.price - b.serviceId.price
        case "price-desc":
          return b.serviceId.price - a.serviceId.price
        case "created-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [appointments, searchTerm, sortBy])

  const upcomingAppointments = filteredAndSortedAppointments.filter(
    (apt) =>
      (new Date(apt.createdAt) >= new Date() && apt.appointmentStatus.toLowerCase() !== "cancelled") ||
      apt.appointmentStatus.toLowerCase() === "pending" ||
      apt.appointmentStatus.toLowerCase() === "confirmed" ||
      apt.appointmentStatus.toLowerCase() === "booked" ||
      apt.appointmentStatus.toLowerCase() === "ongoing",
  )

  const pastAppointments = filteredAndSortedAppointments.filter(
    (apt) => apt.appointmentStatus.toLowerCase() === "completed" || apt.appointmentStatus.toLowerCase() === "cancelled",
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const response = await Useraxios.patch(`/appointments/${appointmentId}/cancel`, {
        reason: cancelReason,
      })

      if (response.status === 200) {
        ToasterSetup({
          title: "Success",
          description: "Appointment cancelled successfully",
          variant: "success",
        })
        const appointmentsResponse = await Useraxios.get(`/appointments/user/${userId}`, {
          params: {
            page: currentPage,
            limit: pageSize,
            status: statusFilter === "all" ? undefined : statusFilter,
          },
        })
        const { data, meta } = appointmentsResponse.data
        setAppointments(Array.isArray(data) ? data : [])
        setTotalAppointments(meta?.total || 0)
        setStats(calculateStats(data))
        setShowCancelDialog(null)
        setCancelReason("")
      }
    } catch (err: any) {
      console.error("Failed to cancel appointment:", err)
      const errorMessage = err.response?.data?.message || "Failed to cancel appointment"

      ToasterSetup({
        title: "Error",
        description:
          errorMessage === "This slot has just been booked by another user"
            ? "This appointment slot is no longer available. Please refresh and try again."
            : errorMessage,
        variant: "destructive",
      })

      if (errorMessage === "This slot has just been booked by another user") {
        const fetchAppointments = async () => {
          try {
            const appointmentsResponse = await Useraxios.get(`/appointments/user/${userId}`, {
              params: {
                page: currentPage,
                limit: pageSize,
                status: statusFilter === "all" ? undefined : statusFilter,
              },
            })
            const { data, meta } = appointmentsResponse.data
            setAppointments(Array.isArray(data) ? data : [])
            setTotalAppointments(meta?.total || 0)
            setStats(calculateStats(data))
          } catch (fetchErr) {
            console.error("Failed to refresh appointments:", fetchErr)
            setError("Failed to refresh appointments")
          }
        }
        fetchAppointments()
      }
    }
  }

  const handleSubmitReview = async (appointmentId: string, shopId: string) => {
    try {
      if (!userId) {
        ToasterSetup({
          title: "Error",
          description: "You must be logged in to submit a review",
          variant: "destructive",
        })
        return
      }

      if (!shopId || !/^[0-9a-fA-F]{24}$/.test(shopId)) {
        console.error("Invalid shopId format:", shopId)
        ToasterSetup({
          title: "Error",
          description: "Invalid shop ID. Please try again.",
          variant: "destructive",
        })
        return
      }

      if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
        console.error("Invalid userId format:", userId)
        ToasterSetup({
          title: "Error",
          description: "Invalid user session. Please log in again.",
          variant: "destructive",
        })
        return
      }

      if (reviewRating < 1 || reviewRating > 5) {
        ToasterSetup({
          title: "Error",
          description: "Please select a rating between 1 and 5 stars",
          variant: "destructive",
        })
        return
      }

      const response = await Useraxios.post(`/reviews`, {
        shopId,
        userId,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      })
      if (response.status === 201) {
        ToasterSetup({
          title: "Success",
          description: "Review submitted successfully",
          variant: "success",
        })
        setShowReviewDialog(null)
        setReviewRating(0)
        setReviewComment("")
      }
    } catch (err: any) {
      console.error("Failed to submit review:", err)
      console.error("Error response data:", err.response?.data)

      let errorMessage = "Failed to submit review"

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      ToasterSetup({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handlePageChange = (page: number, newPageSize?: number) => {
    setCurrentPage(page)
    if (newPageSize) {
      setPageSize(newPageSize)
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const { petId, staffId, serviceId, shopId, slotDetails, appointmentStatus, paymentDetails, _id, notes, createdAt, bookingNumber } =
      appointment

    return (
      <Card className="group relative overflow-hidden border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-[2px]">
          <div className="bg-white rounded-2xl h-full w-full" />
        </div>

        <CardContent className="relative p-4 sm:p-8 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-start gap-4 sm:gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-gray-100 transition-transform duration-300 group-hover:scale-110">
                <img
                  src={
                    petId?.profileImage && typeof petId.profileImage === "string"
                      ? cloudinaryUtils.getFullUrl(petId.profileImage)
                      : "/placeholder.svg?height=80&width=80&query=pet"
                  }
                  alt={petId?.name || "Pet"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div
                className={`absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full ${getStatusColor(appointmentStatus)} flex items-center justify-center`}
              >
                {getStatusIcon(appointmentStatus)}
              </div>
            </div>

            <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
                <div className="space-y-1 min-w-0">
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 truncate">
                    {petId?.name || "Unknown Pet"}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {petId?.breed || "Unknown Breed"}
                  </p>
                  {bookingNumber && (
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 truncate">
                      Appointment ID: {bookingNumber}
                    </p>
                  )}
                </div>
                <Badge
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-xs sm:text-sm ${getStatusColor(appointmentStatus)} transition-all duration-300 hover:scale-105 min-w-fit`}
                >
                  {getStatusIcon(appointmentStatus)}
                  <span className="truncate">{appointmentStatus.toUpperCase()}</span>
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900 text-sm sm:text-base">Schedule</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 font-medium">
                {slotDetails?.date ? formatDate(slotDetails.date) : "No date"}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {slotDetails?.startTime ? formatTime(slotDetails.startTime) : "No time"} -
                {slotDetails?.endTime ? formatTime(slotDetails.endTime) : "No time"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-3 sm:p-4 rounded-xl border border-emerald-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 bg-emerald-500 rounded-lg flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900 text-sm sm:text-base">Location</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 font-medium truncate">{shopId?.name}</p>
              <p className="text-xs text-gray-600 truncate">
                {shopId?.city}, {shopId?.streetAddress}
              </p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 gap-3 sm:gap-0">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{serviceId?.name}</p>
                <p className="text-xs text-gray-600 truncate">with {staffId?.name || "Unknown Staff"}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg sm:text-2xl font-bold text-purple-600">₹{serviceId?.price?.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{serviceId?.duration} mins</p>
              </div>
            </div>

            {notes && (
              <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1">Notes</p>
                <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">{notes}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm gap-3 sm:gap-0">
              <div className="space-y-1 w-full sm:w-auto">
                <p className="text-gray-600 truncate">Booked: {formatDate(createdAt)}</p>
                <p className="text-gray-600 truncate">
                  Payment: {paymentDetails?.status} ({paymentDetails?.method || "N/A"})
                </p>
              </div>

              {appointmentStatus.toLowerCase() === "pending" && (
                <Button
                  variant="destructive"
                  className="w-full sm:w-40 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 text-sm"
                  onClick={() => setShowCancelDialog(_id)}
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Cancel
                </Button>
              )}

              {appointmentStatus.toLowerCase() === "completed" && (
                <Button
                  className="w-full sm:w-40 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 text-sm"
                  onClick={() => {
                    setShowReviewDialog(_id)
                    setReviewRating(0)
                    setReviewComment("")
                  }}
                >
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Add Review
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-black">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          {!isMobile && <ModernSidebar />}
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="flex flex-col items-center gap-4">
              <Clock className="h-8 w-8 animate-spin text-gray-900 dark:text-white" />
              <p className="text-gray-600 dark:text-gray-400">Loading your appointments...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-black">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          {!isMobile && <ModernSidebar />}
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm max-w-md w-full">
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-red-100 dark:bg-red-900 rounded-full">
                    <X className="h-8 w-8 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Error Loading Appointments
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {error}
                    </p>
                    <Button
                      onClick={() => window.location.reload()}
                      className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <Header />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        {!isMobile && <ModernSidebar />}

        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 md:hidden">
              <ModernSidebar />
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Page Header */}
          <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 sm:gap-4 border-b border-gray-200 dark:border-gray-800 px-3 sm:px-4 lg:px-6 bg-white dark:bg-black w-full">
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="shrink-0"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  My Appointments
                </h1>
                <Badge className="bg-gray-900 text-white dark:bg-white dark:text-black font-medium shrink-0">
                  {appointments.length}
                </Badge>
              </div>
              <Link to="/book-now">
                <Button
                  size={isMobile ? "sm" : "default"}
                  className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold shrink-0"
                >
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Book Appointment</span>
                </Button>
              </Link>
            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
            <div className="flex flex-col gap-4 sm:gap-6 p-3 sm:p-4 lg:p-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.completed}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                      Completed
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.upcoming}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                      Upcoming
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.ongoing}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                      Ongoing
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{stats.totalSpent.toFixed(0)}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                      Total Spent
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filter */}
              <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by pet, service, shop, staff or booking number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-white text-sm sm:text-base"
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40 border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-white text-sm sm:text-base">
                          <Filter className="h-4 w-4 mr-2 text-gray-400" />
                          <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                          {["all", "confirmed", "pending", "ongoing", "completed", "cancelled", "booked"].map((filter) => (
                            <SelectItem
                              key={filter}
                              value={filter}
                              className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
                            >
                              {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full sm:w-40 border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-white text-sm sm:text-base">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                          <SelectItem value="date-desc" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900">
                            Newest First
                          </SelectItem>
                          <SelectItem value="date-asc" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900">
                            Oldest First
                          </SelectItem>
                          <SelectItem value="price-desc" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900">
                            Price: High to Low
                          </SelectItem>
                          <SelectItem value="price-asc" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900">
                            Price: Low to High
                          </SelectItem>
                          <SelectItem value="created-desc" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900">
                            Recently Created
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appointments Tabs */}
              <Tabs defaultValue="upcoming" className="space-y-6 sm:space-y-8">
                <TabsList className="grid w-full sm:max-w-md mx-auto grid-cols-2 bg-gray-100 p-0.5 sm:p-1 rounded-2xl border shadow-inner">
                  <TabsTrigger
                    value="upcoming"
                    className="flex items-center justify-center gap-1.5 sm:gap-2 font-bold text-gray-600 hover:text-gray-900 transition-all duration-300 rounded-xl py-2 sm:py-2.5 text-sm
                    data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow"
                  >
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    Upcoming ({upcomingAppointments.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="past"
                    className="flex items-center justify-center gap-1.5 sm:gap-2 font-bold text-gray-600 hover:text-gray-900 transition-all duration-300 rounded-xl py-2 sm:py-2.5 text-sm
                    data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow"
                  >
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    Past ({pastAppointments.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-6 sm:space-y-8">
                  {upcomingAppointments.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                      {upcomingAppointments.map((appointment) => (
                        <AppointmentCard key={appointment._id} appointment={appointment} />
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                      <CardContent className="p-6 sm:p-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-full">
                            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              No upcoming appointments
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                              You don't have any upcoming appointments scheduled. Book your first appointment to get started!
                            </p>
                            <Link to="/book-now">
                              <Button
                                size={isMobile ? "sm" : "default"}
                                className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Book Your First Appointment
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="past" className="space-y-6 sm:space-y-8">
                  {pastAppointments.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                      {pastAppointments.map((appointment) => (
                        <AppointmentCard key={appointment._id} appointment={appointment} />
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                      <CardContent className="p-6 sm:p-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-full">
                            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              No past appointments
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                              Your appointment history will appear here once you complete some appointments.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-center">
                <Pagination
                  current={currentPage}
                  total={totalAppointments}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={true}
                  showQuickJumper={true}
                  showTotal={(total, range) => `Showing ${range[0]}-${range[1]} of ${total} appointments`}
                  pageSizeOptions={[10, 20, 50]}
                  className="bg-white rounded-2xl shadow-lg p-3 sm:p-4"
                />
              </div>
            </div>
          </main>
        </div>
      </div>

      {showCancelDialog && (
        <Dialog
          open={!!showCancelDialog}
          onOpenChange={() => {
            setShowCancelDialog(null)
            setCancelReason("")
          }}
        >
          <DialogContent className="sm:max-w-[500px] max-w-full h-[90vh] sm:h-auto border-0 bg-white shadow-2xl rounded-2xl sm:rounded-2xl mx-2">
            <DialogHeader className="pb-4 sm:pb-6">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 text-center">Cancel Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
              <div className="p-3 sm:p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="text-red-800 font-medium text-sm sm:text-base">Please provide a reason for cancelling this appointment:</p>
              </div>
              <Textarea
                placeholder="Enter your cancellation reason here..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="border-2 border-gray-200 bg-gray-50 text-gray-900 focus:border-red-500 focus:bg-white transition-all duration-300 rounded-xl min-h-[80px] sm:min-h-[100px] text-sm"
              />
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  variant="destructive"
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 text-sm"
                  onClick={() => handleCancelAppointment(showCancelDialog)}
                  disabled={!cancelReason.trim()}
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Confirm Cancellation
                </Button>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-bold py-2.5 sm:py-3 rounded-xl transition-all duration-300 text-sm"
                  >
                    Keep Appointment
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showReviewDialog && (
        <Dialog
          open={!!showReviewDialog}
          onOpenChange={() => {
            setShowReviewDialog(null)
            setReviewRating(0)
            setReviewComment("")
          }}
        >
          <DialogContent className="w-[95vw] sm:w-[500px] max-w-full h-auto max-h-[90vh] overflow-y-auto border-0 bg-white shadow-2xl rounded-2xl p-4 sm:p-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg sm:text-2xl font-bold text-gray-900 text-center">
                Add Review
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                <p className="text-blue-800 font-medium text-sm sm:text-base">
                  Rate your experience for this appointment:
                </p>
              </div>

              {/* Rating stars */}
              <div className="flex justify-center gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 sm:w-8 sm:h-8 cursor-pointer ${star <= reviewRating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                      }`}
                    onClick={() => setReviewRating(star)}
                  />
                ))}
              </div>

              {/* Suggested comments */}
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-900">
                  Suggested Comments:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestedMessages.map((message, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-xs sm:text-sm border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg w-auto min-w-[130px] sm:min-w-[150px] text-center"
                      onClick={() => setReviewComment(message)}
                    >
                      {message}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <Textarea
                placeholder="Enter your review comment here..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="border-2 border-gray-200 bg-gray-50 text-gray-900 focus:border-blue-500 focus:bg-white transition-all duration-300 rounded-xl min-h-[100px] text-sm w-full"
              />

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 text-sm"
                  onClick={() => {
                    const appointment = appointments.find(
                      (apt) => apt._id === showReviewDialog
                    );
                    if (appointment) {
                      handleSubmitReview(showReviewDialog, appointment.shopId._id);
                    }
                  }}
                  disabled={reviewRating === 0}
                >
                  <Star className="w-4 h-4 mr-2 flex-shrink-0" />
                  Submit Review
                </Button>

                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold py-2.5 sm:py-3 rounded-xl transition-all duration-300 text-sm"
                  >
                    Cancel
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <Footer />
    </div>
  )
}