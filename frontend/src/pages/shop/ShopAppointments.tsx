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
  upcoming: number
  pending: number
  totalSpent: number
}

const AppointmentStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
    case "completed":
      return "bg-green-500 text-white"
    case "pending":
      return "bg-yellow-500 text-white"
    case "cancelled":
      return "bg-red-500 text-white"
    case "ongoing":
      return "bg-blue-500 text-white"
    default:
      return "bg-gray-500 text-white"
  }
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
    case "completed":
      return <CheckCircle className="w-4 h-4" />
    case "pending":
      return <Clock className="w-4 h-4" />
    case "cancelled":
      return <X className="w-4 h-4" />
    case "ongoing":
      return <Clock className="w-4 h-4" />
    default:
      return <Calendar className="w-4 h-4" />
  }
}

export default function ShopAppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<Stats>({ completed: 0, upcoming: 0, pending: 0, totalSpent: 0 })
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
  }, [shopId, currentPage, pageSize, statusFilter])

  const handleAppointmentStatusChange = async (appointmentId: string, newStatus: string) => {
    const validStatus = newStatus.toLowerCase();
    if (!["pending", "confirmed", "ongoing", "completed", "cancelled"].includes(validStatus)) {
      throw new Error("Invalid appointment status");
    }

    if (validStatus === "cancelled") {
      setCancelAppointmentId(appointmentId)
      setShowCancelDialog(true)
      return
    }

    const prevStatus = appointments.find((apt) => apt._id === appointmentId)?.appointmentStatus.toLowerCase() || ""

    // Optimistic update for non-cancel statuses
    setAppointments((prev) =>
      prev.map((apt) => (apt._id === appointmentId ? { ...apt, appointmentStatus: validStatus } : apt)),
    );

    try {
      let response;
      switch (validStatus) {
        case "confirmed":
          response = await ShopAxios.patch(`/appointments/${appointmentId}/confirm`);
          break;
        case "ongoing":
          response = await ShopAxios.patch(`/appointments/${appointmentId}/ongoing`);
          break;
        case "completed":
          response = await ShopAxios.patch(`/appointments/${appointmentId}/complete`);
          break;
        default:
          response = await ShopAxios.patch(`/appointments/${appointmentId}/status`, {
            appointmentStatus: validStatus,
          });
          break;
      }

      if (response.status === 200) {
        toast({
          title: "Success",
          description: `Appointment status updated to ${validStatus} successfully`,
        });
      }
    } catch (err: any) {
      // Revert on error
      setAppointments((prev) =>
        prev.map((apt) => (apt._id === appointmentId ? { ...apt, appointmentStatus: prevStatus } : apt)),
      );
      console.error("Failed to update appointment status:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update appointment status",
        variant: "destructive",
      });
    }
  }

  const handleCancelSubmit = async () => {
    if (!cancelAppointmentId || !cancelReason.trim()) {
      toast({
        title: "Error",
        description: "Cancellation reason is required",
        variant: "destructive",
      });
      return;
    }

    const prevStatus = appointments.find((apt) => apt._id === cancelAppointmentId)?.appointmentStatus || ""

    // Optimistic update
    setAppointments((prev) =>
      prev.map((apt) => (apt._id === cancelAppointmentId ? { ...apt, appointmentStatus: "cancelled" } : apt)),
    );

    try {
      const response = await ShopAxios.patch(`/appointments/${cancelAppointmentId}/cancel`, {
        reason: cancelReason,
      });

      if (response.status === 200) {
        toast({
          title: "Success",
          description: `Appointment status updated to cancelled successfully`,
        });
      }
      setShowCancelDialog(false)
      setCancelReason("")
      setCancelAppointmentId(null)
    } catch (err: any) {
      // Revert on error
      setAppointments((prev) =>
        prev.map((apt) => (apt._id === cancelAppointmentId ? { ...apt, appointmentStatus: prevStatus } : apt)),
      );
      console.error("Failed to cancel appointment:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to cancel appointment",
        variant: "destructive",
      });
    }
  }

  const calculateStats = (appointmentsData: Appointment[]): Stats => {
    if (!Array.isArray(appointmentsData)) return { completed: 0, upcoming: 0, pending: 0, totalSpent: 0 }

    const now = new Date()
    const stats = {
      completed: 0,
      upcoming: 0,
      pending: 0,
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
        case "confirmed":
        case "booked":
        case "ongoing":
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
        appointment.staffId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "all" || appointment.appointmentStatus.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
      (new Date(apt.createdAt) >= new Date() && apt.appointmentStatus !== "cancelled") ||
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

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const { petId, staffId, serviceId, slotDetails, appointmentStatus, _id, createdAt, userId } = appointment

    return (
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-black truncate">{serviceId?.name || "Unknown service"}</h3>
              <Badge className={`${getStatusColor(appointmentStatus)} px-2 py-1 text-xs flex items-center gap-1`}>
                {getStatusIcon(appointmentStatus)}
                <span>{appointmentStatus}</span>
              </Badge>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{formatDate(createdAt) || "No date"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>
                  {slotDetails?.startTime ? formatTime(slotDetails.startTime) : "No time"} - 
                  {slotDetails?.endTime ? formatTime(slotDetails.endTime) : "No time"} - 
                  {slotDetails?.date ? formatDate(slotDetails.date) : "No date"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-gray-500" />
                <span className="truncate">{staffId?.name || "Staff"}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-gray-500" />
                <span className="truncate">{userId?.fullName || "Client"}, {userId?.phone || "Phone"}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-black">${serviceId?.price?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-black hover:bg-gray-100"
                onClick={() => setSelectedPet(petId)}
              >
                <Info className="w-4 h-4 mr-1" />
                View Details
              </Button>
              <select
                key={rerenderKey}
                value={appointmentStatus}
                onChange={(e) => handleAppointmentStatusChange(_id, e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
              >
                <option value={AppointmentStatus.PENDING}>Pending</option>
                <option value={AppointmentStatus.CONFIRMED}>Confirmed</option>
                <option value={AppointmentStatus.ONGOING}>Ongoing</option>
                <option value={AppointmentStatus.COMPLETED}>Completed</option>
                <option value={AppointmentStatus.CANCELLED}>Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-black">Loading appointments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-black mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-black text-white hover:bg-gray-800"
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
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black">Shop Appointments</h1>
            <p className="text-gray-600 mt-1">Efficiently manage your pet care appointments</p>
          </div>

          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search by pet, service, staff, or client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border-gray-300"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 border-gray-300">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40 border-gray-300">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="created-desc">Recently Created</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-gray-200 bg-white">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-xl font-bold text-black">{stats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>
            <Card className="border-gray-200 bg-white">
              <CardContent className="p-6 text-center">
                <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-xl font-bold text-black">{stats.upcoming}</div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </CardContent>
            </Card>
            <Card className="border-gray-200 bg-white">
              <CardContent className="p-6 text-center">
                <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-xl font-bold text-black">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardContent>
            </Card>
            <Card className="border-gray-200 bg-white">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-xl font-bold text-black">${stats.totalSpent.toFixed(0)}</div>
                <div className="text-sm text-gray-600">Total Earned</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="upcoming" className="mb-8">
            <TabsList className="grid grid-cols-2 gap-2">
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-black data-[state=active]:text-white">
                Upcoming ({upcomingAppointments.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="data-[state=active]:bg-black data-[state=active]:text-white">
                Past ({pastAppointments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6">
              {upcomingAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard key={appointment._id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <Card className="border-gray-200 bg-white">
                  <CardContent className="p-6 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-black">No upcoming appointments</h3>
                    <p className="text-gray-600">New bookings will appear here.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              {pastAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastAppointments.map((appointment) => (
                    <AppointmentCard key={appointment._id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <Card className="border-gray-200 bg-white">
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-black">No past appointments</h3>
                    <p className="text-gray-600">Your shop's appointment history will appear here.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <Pagination
            current={currentPage}
            total={totalAppointments}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={true}
            pageSizeOptions={[10, 20, 50]}
            className="mt-8"
          />
        </div>

        <Dialog open={!!selectedPet} onOpenChange={() => setSelectedPet(null)}>
          <DialogContent className="max-w-md mx-auto bg-white border-gray-200 rounded-lg p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-black text-center">Pet Details - {selectedPet?.name}</DialogTitle>
            </DialogHeader>
            <DialogClose className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <X className="w-6 h-6" />
            </DialogClose>
            {selectedPet && (
              <div className="space-y-4 mt-4">
                <div className="flex justify-center">
                  <img
                    src={
                      selectedPet?.profileImage && typeof selectedPet.profileImage === "string"
                        ? cloudinaryUtils.getFullUrl(selectedPet.profileImage)
                        : "/placeholder.svg?height=64&width=64&query=cute pet dog cat"
                    }
                    alt={selectedPet?.name || "Pet"}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-black">{selectedPet.name}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Breed</p>
                    <p className="font-medium text-black">{selectedPet.breed}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-medium text-black">{selectedPet.age || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium text-black">{selectedPet.gender || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Weight</p>
                    <p className="font-medium text-black">{selectedPet.weight ? `${selectedPet.weight} kg` : "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Friendly with Pets</p>
                    <p className="font-medium text-black">{selectedPet.friendlyWithPets ? "Yes" : "No"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Friendly with Others</p>
                    <p className="font-medium text-black">{selectedPet.friendlyWithOthers ? "Yes" : "No"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Trained Before</p>
                    <p className="font-medium text-black">{selectedPet.trainedBefore ? "Yes" : "No"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Vaccination Status</p>
                    <p className="font-medium text-black">{selectedPet.vaccinationStatus || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Medication</p>
                    <p className="font-medium text-black">{selectedPet.medication || "None"}</p>
                  </div>
                  {selectedPet.additionalNotes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Additional Notes</p>
                      <p className="font-medium text-black">{selectedPet.additionalNotes}</p>
                    </div>
                  )}
                </div>
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-2">Please provide a reason for cancellation:</p>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowCancelDialog(false)}>
                Close
              </Button>
              <Button onClick={handleCancelSubmit}>Submit</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Footer />
      </div>
    </PetCareLayout>
  )
}