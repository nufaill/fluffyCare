import { useState, useEffect, useMemo } from "react"
import { Calendar, Clock, MapPin, Search, Filter, Plus, Eye, X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Header from "@/components/user/Header"
import Footer from "@/components/user/Footer"
import { ModernSidebar } from "@/components/user/App-sidebar"
import { Link } from "react-router-dom"
import type { RootState } from "@/redux/store"
import { useSelector } from "react-redux"
import Useraxios from "@/api/user.axios"

interface Appointment {
  _id: string
  petId: {
    _id: string
    name: string
    breed: string
    image?: string
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
    address: string
  }
  staffId: {
    _id: string
    name: string
  }
  slotIds: Array<{
    _id?: string
    date?: string
    startTime: string
    endTime: string
  }>
  appointmentStatus: string
  paymentStatus: string
  createdAt: string
  notes?: string
}

interface Stats {
  completed: number
  upcoming: number
  pending: number
  totalSpent: number
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
    case "paid":
    case "completed":
      return "bg-green-100 text-green-800 border-green-200"
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "cancelled":
    case "refunded":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
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
    default:
      return <Calendar className="w-4 h-4" />
  }
}

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<Stats>({ completed: 0, upcoming: 0, pending: 0, totalSpent: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const user = useSelector((state: RootState) => state.user.userDatas || state.user.userDatas || state.user)
  const shop = useSelector((state: RootState) => state.shop.shopData || state.shop.shopData || state.shop)
  
  const userId = user?._id || user?.id

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userId) {
        setError("User not found. Please log in again.")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        const appointmentsResponse = await Useraxios.get(`/appointments/user/${userId}`)
        console.log('Appointments response:', appointmentsResponse.data)
        
        const appointmentsData = appointmentsResponse.data.data || appointmentsResponse.data
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : [])
        
        const calculatedStats = calculateStats(appointmentsData)
        setStats(calculatedStats)
        
        setIsLoading(false)
      } catch (err: any) {
        console.error('Failed to fetch appointments:', err)
        setError("Failed to fetch appointments")
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [userId])

  const calculateStats = (appointmentsData: Appointment[]): Stats => {
    if (!Array.isArray(appointmentsData)) return { completed: 0, upcoming: 0, pending: 0, totalSpent: 0 }

    const now = new Date()
    const stats = {
      completed: 0,
      upcoming: 0,
      pending: 0,
      totalSpent: 0
    }

    appointmentsData.forEach((appointment) => {
      const appointmentDate = new Date(appointment.createdAt)
      
      switch (appointment.appointmentStatus.toLowerCase()) {
        case 'completed':
          stats.completed++
          stats.totalSpent += appointment.serviceId.price
          break
        case 'pending':
          stats.pending++
          break
        case 'confirmed':
        case 'booked':
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
  }, [appointments, searchTerm, statusFilter, sortBy])

  const upcomingAppointments = filteredAndSortedAppointments.filter(
    (apt) =>
      new Date(apt.createdAt) >= new Date() && apt.appointmentStatus !== "Cancelled"
  )

  const pastAppointments = filteredAndSortedAppointments.filter(
    (apt) =>
      new Date(apt.createdAt) < new Date() ||
      apt.appointmentStatus === "Completed" ||
      apt.appointmentStatus === "Cancelled"
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
      await Useraxios.patch(`/appointments/${appointmentId}/cancel`)
      setAppointments((prev) =>
        prev.map((apt) =>
          apt._id === appointmentId ? { ...apt, appointmentStatus: "Cancelled" } : apt
        )
      )
    } catch (err) {
      console.error('Failed to cancel appointment:', err)
      setError("Failed to cancel appointment")
    }
  }

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={appointment.petId?.image || "/placeholder.svg"}
              alt={appointment.petId?.name || "Pet"}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            />
            <div>
              <h3 className="font-semibold text-lg">{appointment.petId?.name}</h3>
              <p className="text-gray-600 text-sm">{appointment.petId?.breed}</p>
            </div>
          </div>
          <Badge className={`px-3 py-1 text-xs font-medium border ${getStatusColor(appointment.appointmentStatus)}`}>
            <span className="flex items-center gap-1">
              {getStatusIcon(appointment.appointmentStatus)}
              {appointment.appointmentStatus}
            </span>
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(appointment.slotIds[0]?.date || appointment.createdAt)} at {formatTime(appointment.slotIds[0]?.startTime)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{appointment.shopId?.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{appointment.serviceId?.name}</p>
              <p className="text-sm text-gray-600">with {appointment.staffId?.name}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">${appointment.serviceId?.price}</p>
              <Badge className={`px-2 py-1 text-xs ${getStatusColor(appointment.paymentStatus)}`}>
                {appointment.paymentStatus}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link to={`/appointments/${appointment._id}`} className="flex-1">
            <Button variant="outline" className="w-full border-gray-300 hover:border-gray-400 bg-transparent">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </Link>

          {appointment.appointmentStatus !== "Completed" && appointment.appointmentStatus !== "Cancelled" && (
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-transparent"
              onClick={() => handleCancelAppointment(appointment._id)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        <ModernSidebar />

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
                <p className="text-gray-600 mt-1">Manage all your pet grooming appointments</p>
              </div>

              <Link to="/book-now">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Book New Appointment
                </Button>
              </Link>
            </div>

            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search by pet name, service, shop, or staff..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-gray-400"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 border-gray-300">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="booked">Booked</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40 border-gray-300">
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
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="upcoming" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:w-96">
                <TabsTrigger value="upcoming" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Upcoming ({upcomingAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="past" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Past ({pastAppointments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {upcomingAppointments.map((appointment) => (
                      <AppointmentCard key={appointment._id} appointment={appointment} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-gray-200 shadow-sm">
                    <CardContent className="p-12 text-center">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
                      <p className="text-gray-600 mb-4">You don't have any upcoming appointments scheduled.</p>
                      <Link to="/book-now">
                        <Button className="bg-black hover:bg-gray-800 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Book Your First Appointment
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {pastAppointments.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {pastAppointments.map((appointment) => (
                      <AppointmentCard key={appointment._id} appointment={appointment} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-gray-200 shadow-sm">
                    <CardContent className="p-12 text-center">
                      <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No past appointments</h3>
                      <p className="text-gray-600">Your appointment history will appear here.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
                  <div className="text-sm text-gray-600">Upcoming</div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">${stats.totalSpent.toFixed(0)}</div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}