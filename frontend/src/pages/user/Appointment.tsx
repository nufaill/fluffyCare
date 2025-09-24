
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
      return "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25 "
    case "completed":
      return "bg-green-600 text-white border-green-600 shadow-lg shadow-green-600/25"
    case "ongoing":
      return "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/25 "
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
        appointment.staffId?.name?.toLowerCase().includes(searchTerm.toLowerCase())

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
        });
        return;
      }

      // Validate shopId format
      if (!shopId || !/^[0-9a-fA-F]{24}$/.test(shopId)) {
        console.error("Invalid shopId format:", shopId);
        ToasterSetup({
          title: "Error",
          description: "Invalid shop ID. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Validate userId format  
      if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
        console.error("Invalid userId format:", userId);
        ToasterSetup({
          title: "Error",
          description: "Invalid user session. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      // Validate rating
      if (reviewRating < 1 || reviewRating > 5) {
        ToasterSetup({
          title: "Error",
          description: "Please select a rating between 1 and 5 stars",
          variant: "destructive",
        });
        return;
      }

      const response = await Useraxios.post(`/reviews`, {
        shopId,
        userId,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined, 
      });
      if (response.status === 201) {
        ToasterSetup({
          title: "Success",
          description: "Review submitted successfully",
          variant: "success",
        });
        setShowReviewDialog(null);
        setReviewRating(0);
        setReviewComment("");
      }
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      console.error("Error response data:", err.response?.data);

      let errorMessage = "Failed to submit review";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      ToasterSetup({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (page: number, newPageSize?: number) => {
    setCurrentPage(page)
    if (newPageSize) {
      setPageSize(newPageSize)
    }
  }

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const { petId, staffId, serviceId, shopId, slotDetails, appointmentStatus, paymentDetails, _id, notes, createdAt } =
      appointment

    return (
      <Card className="group relative overflow-hidden border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-[2px]">
          <div className="bg-white rounded-2xl h-full w-full" />
        </div>

        <CardContent className="relative p-8 space-y-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-gray-100 transition-transform duration-300 group-hover:scale-110">
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
                className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${getStatusColor(appointmentStatus)} flex items-center justify-center`}
              >
                {getStatusIcon(appointmentStatus)}
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {petId?.name || "Unknown Pet"}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {petId?.breed || "Unknown Breed"}
                  </p>
                </div>
                <Badge
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${getStatusColor(appointmentStatus)} transition-all duration-300 hover:scale-105`}
                >
                  {getStatusIcon(appointmentStatus)}
                  {appointmentStatus.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Schedule</span>
              </div>
              <p className="text-sm text-gray-700 font-medium">
                {slotDetails?.date ? formatDate(slotDetails.date) : "No date"}
              </p>
              <p className="text-xs text-gray-600">
                {slotDetails?.startTime ? formatTime(slotDetails.startTime) : "No time"} -
                {slotDetails?.endTime ? formatTime(slotDetails.endTime) : "No time"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Location</span>
              </div>
              <p className="text-sm text-gray-700 font-medium">{shopId?.name}</p>
              <p className="text-xs text-gray-600">
                {shopId?.city}, {shopId?.streetAddress}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <div>
                <p className="font-semibold text-gray-900">{serviceId?.name}</p>
                <p className="text-sm text-gray-600">with {staffId?.name || "Unknown Staff"}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">₹{serviceId?.price?.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{serviceId?.duration} mins</p>
              </div>
            </div>

            {notes && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-medium text-gray-900 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <div className="space-y-1">
                <p className="text-gray-600">Booked: {formatDate(createdAt)}</p>
                <p className="text-gray-600">
                  Payment: {paymentDetails?.status} ({paymentDetails?.method || "N/A"})
                </p>
              </div>

              {appointmentStatus.toLowerCase() === "pending" && (
                <Button
                  variant="destructive"
                  className="w-40 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
                  onClick={() => setShowCancelDialog(_id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}

              {appointmentStatus.toLowerCase() === "completed" && (
                <Button
                  className="w-40 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
                  onClick={() => {
                    setShowReviewDialog(_id)
                    setReviewRating(0)
                    setReviewComment("")
                  }}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Add Review
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <ModernSidebar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-8">
          {isLoading && (
            <div className="text-center">
              <p className="text-lg text-gray-600">Loading appointments...</p>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-center">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}
          <div className="relative overflow-hidden bg-gradient-to-r from-black via-gray-900 to-black rounded-3xl p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20" />
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Your Appointments
                </h1>
                <p className="text-gray-300 text-lg">Manage your pet care appointments with ease</p>
              </div>
              <Link to="/book-now">
                <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0">
                  <Plus className="w-5 h-5 mr-2" />
                  Book New Appointment
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 rounded-2xl">
              <CardContent className="p-6 text-center relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-blue-200" />
                <div className="text-3xl font-bold mb-1">{stats.completed}</div>
                <div className="text-sm font-medium text-blue-200">Completed</div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 rounded-2xl">
              <CardContent className="p-6 text-center relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                <Calendar className="w-8 h-8 mx-auto mb-3 text-emerald-200" />
                <div className="text-3xl font-bold mb-1">{stats.upcoming}</div>
                <div className="text-sm font-medium text-emerald-200">Upcoming</div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 rounded-2xl">
              <CardContent className="p-6 text-center relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                <Users className="w-8 h-8 mx-auto mb-3 text-orange-200" />
                <div className="text-3xl font-bold mb-1">{stats.ongoing}</div>
                <div className="text-sm font-medium text-orange-200">Ongoing</div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 rounded-2xl">
              <CardContent className="p-6 text-center relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                <DollarSign className="w-8 h-8 mx-auto mb-3 text-purple-200" />
                <div className="text-3xl font-bold mb-1">₹{stats.totalSpent.toFixed(0)}</div>
                <div className="text-sm font-medium text-purple-200">Total Spent</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 bg-white shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by pet, service, shop, or staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 border-2 border-gray-200 bg-gray-50 text-gray-900 font-medium focus:border-blue-500 focus:bg-white transition-all duration-300 rounded-xl"
                  />
                </div>
                <div className="flex gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48 h-12 border-2 border-gray-200 bg-gray-50 text-gray-900 font-medium hover:bg-white focus:border-blue-500 transition-all duration-300 rounded-xl">
                      <Filter className="w-4 h-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-gray-200 bg-white rounded-xl shadow-xl">
                      <SelectItem value="all" className="hover:bg-gray-50 rounded-lg">
                        All Status
                      </SelectItem>
                      <SelectItem value="confirmed" className="hover:bg-gray-50 rounded-lg">
                        Confirmed
                      </SelectItem>
                      <SelectItem value="pending" className="hover:bg-gray-50 rounded-lg">
                        Pending
                      </SelectItem>
                      <SelectItem value="ongoing" className="hover:bg-gray-50 rounded-lg">
                        Ongoing
                      </SelectItem>
                      <SelectItem value="completed" className="hover:bg-gray-50 rounded-lg">
                        Completed
                      </SelectItem>
                      <SelectItem value="cancelled" className="hover:bg-gray-50 rounded-lg">
                        Cancelled
                      </SelectItem>
                      <SelectItem value="booked" className="hover:bg-gray-50 rounded-lg">
                        Booked
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 h-12 border-2 border-gray-200 bg-gray-50 text-gray-900 font-medium hover:bg-white focus:border-blue-500 transition-all duration-300 rounded-xl">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-gray-200 bg-white rounded-xl shadow-xl">
                      <SelectItem value="date-desc" className="hover:bg-gray-50 rounded-lg">
                        Newest First
                      </SelectItem>
                      <SelectItem value="date-asc" className="hover:bg-gray-50 rounded-lg">
                        Oldest First
                      </SelectItem>
                      <SelectItem value="price-desc" className="hover:bg-gray-50 rounded-lg">
                        Price: High to Low
                      </SelectItem>
                      <SelectItem value="price-asc" className="hover:bg-gray-50 rounded-lg">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="created-desc" className="hover:bg-gray-50 rounded-lg">
                        Recently Created
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="upcoming" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-gray-100 p-1 rounded-2xl border shadow-inner">
              <TabsTrigger
                value="upcoming"
                className="flex items-center justify-center gap-2 font-bold text-gray-600 hover:text-gray-900 transition-all duration-300 rounded-xl py-2.5
               data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow"
              >
                <Calendar className="w-4 h-4" />
                Upcoming ({upcomingAppointments.length})
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="flex items-center justify-center gap-2 font-bold text-gray-600 hover:text-gray-900 transition-all duration-300 rounded-xl py-2.5
               data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow"
              >
                <CheckCircle className="w-4 h-4" />
                Past ({pastAppointments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-8">
              {upcomingAppointments.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard key={appointment._id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <Card className="border-0 bg-white shadow-xl rounded-2xl overflow-hidden">
                  <CardContent className="p-16 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Calendar className="w-12 h-12 text-blue-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">No upcoming appointments</h3>
                    <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                      You don't have any upcoming appointments scheduled. Book your first appointment to get started!
                    </p>
                    <Link to="/book-now">
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0">
                        <Plus className="w-5 h-5 mr-2" />
                        Book Your First Appointment
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-8">
              {pastAppointments.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {pastAppointments.map((appointment) => (
                    <AppointmentCard key={appointment._id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <Card className="border-0 bg-white shadow-xl rounded-2xl overflow-hidden">
                  <CardContent className="p-16 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">No past appointments</h3>
                    <p className="text-gray-600 text-lg">
                      Your appointment history will appear here once you complete some appointments.
                    </p>
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
              className="bg-white rounded-2xl shadow-lg p-4"
            />
          </div>
        </main>
      </div>

      {showCancelDialog && (
        <Dialog
          open={!!showCancelDialog}
          onOpenChange={() => {
            setShowCancelDialog(null)
            setCancelReason("")
          }}
        >
          <DialogContent className="sm:max-w-[500px] border-0 bg-white shadow-2xl rounded-2xl">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-2xl font-bold text-gray-900 text-center">Cancel Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="text-red-800 font-medium">Please provide a reason for cancelling this appointment:</p>
              </div>
              <Textarea
                placeholder="Enter your cancellation reason here..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="border-2 border-gray-200 bg-gray-50 text-gray-900 focus:border-red-500 focus:bg-white transition-all duration-300 rounded-xl min-h-[100px]"
              />
              <div className="flex gap-4">
                <Button
                  variant="destructive"
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
                  onClick={() => handleCancelAppointment(showCancelDialog)}
                  disabled={!cancelReason.trim()}
                >
                  <X className="w-4 h-4 mr-2" />
                  Confirm Cancellation
                </Button>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-bold py-3 rounded-xl transition-all duration-300"
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
          <DialogContent className="sm:max-w-[500px] border-0 bg-white shadow-2xl rounded-2xl">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-2xl font-bold text-gray-900 text-center">Add Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-blue-800 font-medium">Rate your experience for this appointment:</p>
              </div>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 cursor-pointer ${star <= reviewRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    onClick={() => setReviewRating(star)}
                  />
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Suggested Comments:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedMessages.map((message, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-sm border-gray-200 hover:bg-gray-50"
                      onClick={() => setReviewComment(message)}
                    >
                      {message}
                    </Button>
                  ))}
                </div>
              </div>
              <Textarea
                placeholder="Enter your review comment here..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="border-2 border-gray-200 bg-gray-50 text-gray-900 focus:border-blue-500 focus:bg-white transition-all duration-300 rounded-xl min-h-[100px]"
              />
              <div className="flex gap-4">
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
                  onClick={() => {
                    const appointment = appointments.find(apt => apt._id === showReviewDialog)
                    if (appointment) {
                      handleSubmitReview(showReviewDialog, appointment.shopId._id)
                    }
                  }}
                  disabled={reviewRating === 0}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Submit Review
                </Button>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-bold py-3 rounded-xl transition-all duration-300"
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