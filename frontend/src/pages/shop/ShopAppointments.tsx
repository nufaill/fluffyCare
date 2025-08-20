"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle,
  X,
  UserCheck,
  Info,
  DollarSign,
  Zap,
  Star,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Navbar from "@/components/shop/Navbar"
import Footer from "@/components/user/Footer"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary"
import { PetCareLayout } from "@/components/layout/PetCareLayout"
import { Pagination } from "@/components/ui/Pagination"
import ShopAxios from "@/api/shop.axios"

interface Appointment {
  _id: string
  petId: {
    profileImage: any
    _id: string
    name: string
    breed: string
    image?: string
    age?: number
    gender?: string
    weight?: number
    additionalNotes?: string
    friendlyWithPets?: boolean
    friendlyWithOthers?: boolean
    trainedBefore?: boolean
    vaccinationStatus?: string
    medication?: string
  }
  serviceId: {
    _id: string
    name: string
    price: number
    durationHour: number
  }
  shopId: {
    _id: string
    name: string
    address: string
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
  paymentStatus: string
  paymentMethod?: string
  requestStatus?: string
  createdAt: string
  updatedAt?: string
  notes?: string
  userId?: {
    _id: string
    fullName: string
    email: string
    phone: string
  }
}

interface Stats {
  completed: number
  ongoing: number
  pending: number
  totalSpent: number
}

const AppointmentStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const

type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus]

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-500 shadow-emerald-200"
    case "completed":
      return "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-blue-200"
    case "pending":
      return "bg-gradient-to-r from-amber-400 to-amber-500 text-white border-amber-400 shadow-amber-200"
    case "cancelled":
      return "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-400 shadow-gray-200"
    case "ongoing":
      return "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-500 shadow-purple-200"
    default:
      return "bg-gradient-to-r from-gray-300 to-gray-400 text-white border-gray-300 shadow-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return <CheckCircle className="w-4 h-4 animate-pulse" />
    case "completed":
      return <Star className="w-4 h-4 animate-bounce" />
    case "pending":
      return <Clock className="w-4 h-4 animate-spin" />
    case "cancelled":
      return <X className="w-4 h-4" />
    case "ongoing":
      return <Zap className="w-4 h-4 animate-pulse" />
    default:
      return <Calendar className="w-4 h-4" />
  }
}

export default function ShopAppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<Stats>({ completed: 0, ongoing: 0, pending: 0, totalSpent: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalAppointments, setTotalAppointments] = useState(0)
  const [selectedPet, setSelectedPet] = useState<Appointment["petId"] | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelAppointmentId, setCancelAppointmentId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [rerenderKey, setRerenderKey] = useState(0)

  const { toast } = useToast()
  const shop = useSelector((state: RootState) => state.shop.shopData)
  const shopId = shop?._id || shop?.id || ""

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!shopId) {
        setError("Shop not found. Please log in again.")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const appointmentsResponse = await ShopAxios.get(`/appointments/shop/${shopId}`, {
          params: {
            page: currentPage,
            limit: pageSize,
            status: statusFilter === "all" ? undefined : statusFilter,
            search: searchTerm || undefined,
          },
        })
        const { data, meta } = appointmentsResponse.data
        setAppointments(
          Array.isArray(data)
            ? data.map((apt) => ({
                ...apt,
                appointmentStatus: apt.appointmentStatus || AppointmentStatus.PENDING,
              }))
            : [],
        )
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
  }, [shopId, currentPage, pageSize, statusFilter, searchTerm])

  const handleAppointmentStatusChange = async (appointmentId: string, newStatus: string) => {
    const validStatus = newStatus.toLowerCase()
    if (!["pending", "confirmed", "ongoing", "completed", "cancelled"].includes(validStatus)) {
      throw new Error("Invalid appointment status")
    }

    const appointment = appointments.find((apt) => apt._id === appointmentId)
    if (!appointment) return

    const currentStatus = appointment.appointmentStatus.toLowerCase()

    // Status transition validation
    const validTransitions: { [key: string]: string[] } = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["ongoing", "completed", "cancelled"],
      ongoing: ["completed"],
      completed: [],
      cancelled: [],
    }

    if (!validTransitions[currentStatus].includes(validStatus)) {
      toast({
        title: "Error",
        description: `Cannot change status from ${currentStatus} to ${validStatus}`,
        variant: "destructive",
      })
      return
    }

    if (validStatus === "cancelled") {
      setCancelAppointmentId(appointmentId)
      setShowCancelDialog(true)
      return
    }

    const prevStatus = currentStatus

    // Optimistic update
    setAppointments((prev) =>
      prev.map((apt) => (apt._id === appointmentId ? { ...apt, appointmentStatus: validStatus } : apt)),
    )

    try {
      let response
      switch (validStatus) {
        case "confirmed":
          response = await ShopAxios.patch(`/appointments/${appointmentId}/confirm`)
          break
        case "ongoing":
          response = await ShopAxios.patch(`/appointments/${appointmentId}/ongoing`)
          break
        case "completed":
          response = await ShopAxios.patch(`/appointments/${appointmentId}/complete`)
          break
        default:
          response = await ShopAxios.patch(`/appointments/${appointmentId}/status`, {
            appointmentStatus: validStatus,
          })
          break
      }

      if (response.status === 200) {
        toast({
          title: "Success",
          description: `Appointment status updated to ${validStatus} successfully`,
        })
      }
    } catch (err: any) {
      // Revert on error
      setAppointments((prev) =>
        prev.map((apt) => (apt._id === appointmentId ? { ...apt, appointmentStatus: prevStatus } : apt)),
      )
      console.error("Failed to update appointment status:", err)
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update appointment status",
        variant: "destructive",
      })
    }
  }

  const handleCancelSubmit = async () => {
    if (!cancelAppointmentId || !cancelReason.trim()) {
      toast({
        title: "Error",
        description: "Cancellation reason is required",
        variant: "destructive",
      })
      return
    }

    const prevStatus = appointments.find((apt) => apt._id === cancelAppointmentId)?.appointmentStatus || ""

    // Optimistic update
    setAppointments((prev) =>
      prev.map((apt) => (apt._id === cancelAppointmentId ? { ...apt, appointmentStatus: "cancelled" } : apt)),
    )

    try {
      const response = await ShopAxios.patch(`/appointments/${cancelAppointmentId}/cancel`, {
        reason: cancelReason,
      })

      if (response.status === 200) {
        toast({
          title: "Success",
          description: `Appointment status updated to cancelled successfully`,
        })
      }
      setShowCancelDialog(false)
      setCancelReason("")
      setCancelAppointmentId(null)
    } catch (err: any) {
      // Revert on error
      setAppointments((prev) =>
        prev.map((apt) => (apt._id === cancelAppointmentId ? { ...apt, appointmentStatus: prevStatus } : apt)),
      )
      console.error("Failed to cancel appointment:", err)
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to cancel appointment",
        variant: "destructive",
      })
    }
  }

  const calculateStats = (appointmentsData: Appointment[]): Stats => {
    if (!Array.isArray(appointmentsData)) return { completed: 0, ongoing: 0, pending: 0, totalSpent: 0 }

    const now = new Date()
    const stats = {
      completed: 0,
      ongoing: 0,
      pending: 0,
      totalSpent: 0,
    }

    appointmentsData.forEach((appointment) => {
      const appointmentDate = new Date(appointment.slotDetails?.date || appointment.createdAt)

      switch (appointment.appointmentStatus.toLowerCase()) {
        case "completed":
          stats.completed++
          stats.totalSpent += appointment.serviceId.price
          break
        case "pending":
          stats.pending++
          break
        case "confirmed":
        case "ongoing":
          if (appointmentDate >= now) {
            stats.ongoing++
          }
          break
      }
    })

    return stats
  }

  const filteredAndSortedAppointments = useMemo(() => {
    if (!Array.isArray(appointments)) return []

    let filtered = [...appointments]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((appointment) => {
        return (
          appointment.petId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.serviceId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.staffId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.userId?.phone?.includes(searchTerm)
        )
      })
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (appointment) => appointment.appointmentStatus.toLowerCase() === statusFilter.toLowerCase(),
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return (
            new Date(a.slotDetails?.date || a.createdAt).getTime() -
            new Date(b.slotDetails?.date || b.createdAt).getTime()
          )
        case "date-desc":
          return (
            new Date(b.slotDetails?.date || b.createdAt).getTime() -
            new Date(a.slotDetails?.date || a.createdAt).getTime()
          )
        case "price-desc":
          return b.serviceId.price - a.serviceId.price
        case "price-asc":
          return a.serviceId.price - b.serviceId.price
        case "created-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [appointments, searchTerm, statusFilter, sortBy])

  const upcomingAppointments = filteredAndSortedAppointments.filter(
    (apt) =>
      (new Date(apt.slotDetails?.date || apt.createdAt) >= new Date() && apt.appointmentStatus !== "cancelled") ||
      apt.appointmentStatus === "pending" ||
      apt.appointmentStatus === "confirmed" ||
      apt.appointmentStatus === "ongoing",
  )

  const pastAppointments = filteredAndSortedAppointments.filter(
    (apt) => apt.appointmentStatus === "completed" || apt.appointmentStatus === "cancelled",
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

  const handlePageChange = (page: number, newPageSize?: number) => {
    setCurrentPage(page)
    if (newPageSize) {
      setPageSize(newPageSize)
    }
  }

  const getAvailableStatusOptions = (currentStatus: string) => {
    switch (currentStatus.toLowerCase()) {
      case "pending":
        return [
          { value: AppointmentStatus.PENDING, label: "Pending" },
          { value: AppointmentStatus.CONFIRMED, label: "Confirmed" },
          { value: AppointmentStatus.CANCELLED, label: "Cancelled" },
        ]
      case "confirmed":
        return [
          { value: AppointmentStatus.CONFIRMED, label: "Confirmed" },
          { value: AppointmentStatus.ONGOING, label: "Ongoing" },
          { value: AppointmentStatus.COMPLETED, label: "Completed" },
          { value: AppointmentStatus.CANCELLED, label: "Cancelled" },
        ]
      case "ongoing":
        return [
          { value: AppointmentStatus.ONGOING, label: "Ongoing" },
          { value: AppointmentStatus.COMPLETED, label: "Completed" },
        ]
      case "completed":
      case "cancelled":
        return [{ value: currentStatus, label: currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) }]
      default:
        return [{ value: AppointmentStatus.PENDING, label: "Pending" }]
    }
  }

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const { petId, staffId, serviceId, slotDetails, appointmentStatus, _id, createdAt, userId } = appointment
    const isStatusLocked = ["completed", "cancelled"].includes(appointmentStatus.toLowerCase())

    return (
      <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl">
        <div
          className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ padding: "2px" }}
        >
          <div className="bg-white rounded-2xl h-full w-full"></div>
        </div>

        <CardContent className="relative p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300 truncate">
                {serviceId?.name || "Unknown service"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">ID: {_id.slice(-6)}</p>
            </div>
            <Badge
              className={`${getStatusColor(appointmentStatus)} px-3 py-1.5 text-xs flex items-center gap-2 font-semibold rounded-full shadow-lg animate-pulse`}
            >
              {getStatusIcon(appointmentStatus)}
              <span className="capitalize">{appointmentStatus}</span>
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Created</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Schedule</p>
                <p className="text-sm font-semibold text-gray-900">
                  {slotDetails?.startTime ? formatTime(slotDetails.startTime) : "No time"} -
                  {slotDetails?.endTime ? formatTime(slotDetails.endTime) : "No time"}
                </p>
                <p className="text-xs text-gray-500">{slotDetails?.date ? formatDate(slotDetails.date) : "No date"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserCheck className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Staff & Client</p>
                <p className="text-sm font-semibold text-gray-900">{staffId?.name || "Staff"}</p>
                <p className="text-xs text-gray-600">
                  {userId?.fullName || "Client"} • {userId?.phone || "Phone"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Service Price</p>
                <p className="text-lg font-bold text-emerald-600">${serviceId?.price?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              className="group/btn bg-white border-2 border-gray-200 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-300 rounded-xl px-4 py-2"
              onClick={() => setSelectedPet(petId)}
            >
              <Info className="w-4 h-4 mr-2 group-hover/btn:animate-bounce" />
              Pet Details
            </Button>

            <select
              key={rerenderKey}
              value={appointmentStatus}
              onChange={(e) => handleAppointmentStatusChange(_id, e.target.value)}
              className={`text-xs border-2 rounded-xl px-3 py-2 bg-white font-medium transition-all duration-300 ${
                isStatusLocked
                  ? "opacity-50 cursor-not-allowed border-gray-200"
                  : "hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-300 rounded-xl px-4 py-2"
              }`}
              disabled={isStatusLocked}
            >
              {getAvailableStatusOptions(appointmentStatus).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-emerald-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-emerald-200 mx-auto opacity-20"></div>
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">Loading appointments...</p>
          <p className="text-sm text-gray-500">Please wait while we fetch your data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-6">
            <X className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 border-0 rounded-xl px-6 py-3 font-semibold transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <PetCareLayout>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-600 to-blue-600 bg-clip-text text-transparent mb-3">
              Shop Appointments
            </h1>
            <p className="text-gray-600 text-lg">Efficiently manage your pet care appointments with style</p>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="mb-10 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-300" />
                  <Input
                    placeholder="Search by pet, service, staff, or client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 border-2 border-gray-200 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-48 h-12 border-2 border-gray-200 bg-white hover:border-emerald-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl transition-all duration-300">
                    <Filter className="w-4 h-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-gray-200 bg-white rounded-xl shadow-xl">
                    <SelectItem value="all" className="hover:bg-emerald-50 rounded-lg">
                      All Status
                    </SelectItem>
                    <SelectItem value="confirmed" className="hover:bg-emerald-50 rounded-lg">
                      Confirmed
                    </SelectItem>
                    <SelectItem value="pending" className="hover:bg-amber-50 rounded-lg">
                      Pending
                    </SelectItem>
                    <SelectItem value="completed" className="hover:bg-blue-50 rounded-lg">
                      Completed
                    </SelectItem>
                    <SelectItem value="cancelled" className="hover:bg-gray-50 rounded-lg">
                      Cancelled
                    </SelectItem>
                    <SelectItem value="ongoing" className="hover:bg-purple-50 rounded-lg">
                      Ongoing
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full lg:w-48 h-12 border-2 border-gray-200 bg-white hover:border-emerald-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl transition-all duration-300">
                    <TrendingUp className="w-4 h-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-gray-200 bg-white rounded-xl shadow-xl">
                    <SelectItem value="date-desc" className="hover:bg-emerald-50 rounded-lg">
                      Newest First
                    </SelectItem>
                    <SelectItem value="date-asc" className="hover:bg-emerald-50 rounded-lg">
                      Oldest First
                    </SelectItem>
                    <SelectItem value="price-desc" className="hover:bg-emerald-50 rounded-lg">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="price-asc" className="hover:bg-emerald-50 rounded-lg">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="created-desc" className="hover:bg-emerald-50 rounded-lg">
                      Recently Created
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl">
              <CardContent className="p-6 text-center relative z-10">
                <div className="p-3 bg-white/20 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-8 h-8 text-white animate-bounce" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.completed}</div>
                <div className="text-emerald-100 font-medium">Completed</div>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-700 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
            </Card>

            <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl">
              <CardContent className="p-6 text-center relative z-10">
                <div className="p-3 bg-white/20 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.ongoing}</div>
                <div className="text-blue-100 font-medium">Upcoming</div>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-700 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
            </Card>

            <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl">
              <CardContent className="p-6 text-center relative z-10">
                <div className="p-3 bg-white/20 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-white animate-spin" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.pending}</div>
                <div className="text-amber-100 font-medium">Pending</div>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-700 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
            </Card>

            <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl">
              <CardContent className="p-6 text-center relative z-10">
                <div className="p-3 bg-white/20 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-8 h-8 text-white animate-bounce" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">${stats.totalSpent.toFixed(0)}</div>
                <div className="text-purple-100 font-medium">Total Earned</div>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-700 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
            </Card>
          </div>

          <Tabs defaultValue="upcoming" className="mb-10">
            <TabsList className="grid grid-cols-2 gap-2 bg-white border-2 border-gray-200 rounded-2xl p-2 shadow-lg">
              <TabsTrigger
                value="upcoming"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white text-gray-700 hover:bg-gray-100 font-semibold rounded-xl py-3 transition-all duration-300 data-[state=active]:shadow-lg"
              >
                Upcoming ({upcomingAppointments.length})
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white text-gray-700 hover:bg-gray-100 font-semibold rounded-xl py-3 transition-all duration-300 data-[state=active]:shadow-lg"
              >
                Past ({pastAppointments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6 mt-8">
              {upcomingAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard key={appointment._id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <Card className="border-0 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-6">
                      <Calendar className="w-16 h-16 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No upcoming appointments</h3>
                    <p className="text-gray-600 text-lg">New bookings will appear here when they arrive.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-6 mt-8">
              {pastAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pastAppointments.map((appointment) => (
                    <AppointmentCard key={appointment._id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <Card className="border-0 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-6">
                      <CheckCircle className="w-16 h-16 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No past appointments</h3>
                    <p className="text-gray-600 text-lg">Your shop's appointment history will appear here.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <Pagination
              current={currentPage}
              total={totalAppointments}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={true}
              pageSizeOptions={[10, 20, 50]}
              className="mt-4"
            />
          </div>
        </div>

        <Dialog open={!!selectedPet} onOpenChange={() => setSelectedPet(null)}>
          <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-auto bg-white border-0 rounded-2xl shadow-2xl">
            <DialogHeader className="pb-6 border-b border-gray-100">
              <DialogTitle className="text-2xl font-bold text-gray-900 text-center flex items-center justify-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <UserCheck className="w-6 h-6 text-emerald-600" />
                </div>
                Pet Details - {selectedPet?.name}
              </DialogTitle>
            </DialogHeader>
            <DialogClose className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200">
              <X className="w-6 h-6" />
            </DialogClose>
            {selectedPet && (
              <div className="space-y-6 mt-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <img
                      src={
                        selectedPet?.profileImage && typeof selectedPet.profileImage === "string"
                          ? cloudinaryUtils.getFullUrl(selectedPet.profileImage)
                          : "/placeholder.svg?height=120&width=120&query=cute pet dog cat"
                      }
                      alt={selectedPet?.name || "Pet"}
                      className="w-32 h-32 rounded-full object-cover border-4 border-emerald-200 shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 rounded-full">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Name", value: selectedPet.name, icon: UserCheck, color: "emerald" },
                    { label: "Breed", value: selectedPet.breed, icon: Info, color: "blue" },
                    { label: "Age", value: selectedPet.age || "N/A", icon: Calendar, color: "purple" },
                    { label: "Gender", value: selectedPet.gender || "N/A", icon: UserCheck, color: "pink" },
                    {
                      label: "Weight",
                      value: selectedPet.weight ? `${selectedPet.weight} kg` : "N/A",
                      icon: TrendingUp,
                      color: "amber",
                    },
                    {
                      label: "Vaccination Status",
                      value: selectedPet.vaccinationStatus || "N/A",
                      icon: CheckCircle,
                      color: "green",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 bg-${item.color}-50 rounded-xl border border-${item.color}-100 hover:bg-${item.color}-100 transition-colors duration-200`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-${item.color}-100 rounded-lg`}>
                          <item.icon className={`w-4 h-4 text-${item.color}-600`} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{item.label}</p>
                          <p className="font-semibold text-gray-900">{item.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Friendly with Pets", value: selectedPet.friendlyWithPets, color: "emerald" },
                    { label: "Friendly with Others", value: selectedPet.friendlyWithOthers, color: "blue" },
                    { label: "Trained Before", value: selectedPet.trainedBefore, color: "purple" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 bg-${item.color}-50 rounded-xl border border-${item.color}-100 text-center`}
                    >
                      <div className={`p-2 bg-${item.color}-100 rounded-full w-fit mx-auto mb-2`}>
                        {item.value ? (
                          <CheckCircle className={`w-5 h-5 text-${item.color}-600`} />
                        ) : (
                          <X className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{item.label}</p>
                      <p className={`font-semibold ${item.value ? `text-${item.color}-600` : "text-gray-400"}`}>
                        {item.value ? "Yes" : "No"}
                      </p>
                    </div>
                  ))}
                </div>

                {(selectedPet.medication || selectedPet.additionalNotes) && (
                  <div className="space-y-4">
                    {selectedPet.medication && (
                      <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <Info className="w-4 h-4 text-red-600" />
                          </div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Medication</p>
                        </div>
                        <p className="font-semibold text-gray-900 ml-11">{selectedPet.medication}</p>
                      </div>
                    )}

                    {selectedPet.additionalNotes && (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Info className="w-4 h-4 text-gray-600" />
                          </div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Additional Notes</p>
                        </div>
                        <p className="font-semibold text-gray-900 ml-11">{selectedPet.additionalNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={showCancelDialog}
          onOpenChange={(open) => {
            if (!open) {
              setShowCancelDialog(false)
              setCancelReason("")
              setCancelAppointmentId(null)
              setRerenderKey((prev) => prev + 1)
            }
          }}
        >
          <DialogContent className="sm:max-w-md border-0 bg-white rounded-2xl shadow-2xl">
            <DialogHeader className="pb-6 border-b border-gray-100">
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                Cancel Appointment
              </DialogTitle>
            </DialogHeader>
            <div className="py-6">
              <p className="mb-4 text-gray-600">Please provide a reason for cancellation:</p>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                className="min-h-[120px] border-2 border-gray-200 bg-white focus:border-red-500 focus:ring-4 focus:ring-red-100 rounded-xl resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button
                variant="secondary"
                onClick={() => setShowCancelDialog(false)}
                className="border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl px-6 py-2 font-semibold transition-all duration-300"
              >
                Close
              </Button>
              <Button
                onClick={handleCancelSubmit}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border-0 rounded-xl px-6 py-2 font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Submit Cancellation
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </PetCareLayout>
  )
}
