import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, User, Heart, CreditCard, FileText, Phone, Mail, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Header from "@/components/user/Header"
import Footer from "@/components/user/Footer"
import { ModernSidebar } from "@/components/user/App-sidebar"
import { Link, useParams } from "react-router-dom"
import Useraxios from "@/api/user.axios"

interface AppointmentDetails {
  _id: string
  petId: {
    _id: string
    name: string
    breed: string
    age: number
    image?: string
  }
  serviceId: {
    _id: string
    name: string
    description: string
    price: number
    duration: number
  }
  shopId: {
    _id: string
    name: string
    address: string
    phone: string
    email: string
  }
  staffId: {
    _id: string
    name: string
    specialization: string
    image?: string
  }
  slotIds: Array<{
    date: string
    startTime: string
    endTime: string
  }>
  appointmentStatus: string
  paymentStatus: string
  requestStatus: string
  paymentMethod: string
  notes?: string
  createdAt: string
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
    case "paid":
    case "approved":
      return "bg-green-100 text-green-800 border-green-200"
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "cancelled":
    case "failed":
      return "bg-red-100 text-red-800 border-red-200"
    case "completed":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export default function AppointmentDetailsPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>()
  const [appointmentData, setAppointmentData] = useState<AppointmentDetails | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) {
        setError("Appointment ID not found")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await Useraxios.get(`/appointments/${appointmentId}`)
        console.log('Appointment details response:', response.data)
        
        const appointmentData = response.data.data || response.data
        setAppointmentData(appointmentData)
        setIsLoading(false)
      } catch (err: any) {
        console.error('Failed to fetch appointment details:', err)
        setError("Failed to fetch appointment details")
        setIsLoading(false)
      }
    }
    
    fetchAppointment()
  }, [appointmentId])

  const handleCancelAppointment = async () => {
    if (!appointmentId) return

    setIsCancelling(true)
    try {
      await Useraxios.patch(`/appointments/${appointmentId}/cancel`)
      setIsCancelling(false)
      setIsDialogOpen(false)
      
      // Refresh appointment data after cancellation
      const response = await Useraxios.get(`/appointments/${appointmentId}`)
      const appointmentData = response.data.data || response.data
      setAppointmentData(appointmentData)
    } catch (err: any) {
      console.error('Failed to cancel appointment:', err)
      setError("Failed to cancel appointment")
      setIsCancelling(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading appointment details...</p>
        </div>
      </div>
    )
  }

  if (error || !appointmentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "No appointment data available"}</p>
          <Link to="/appointments">
            <Button>Back to Appointments</Button>
          </Link>
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
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Navigation */}
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Link to="/appointments">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 hover:border-gray-400 bg-transparent"
                      >
                        ← Back to All Appointments
                      </Button>
                    </Link>
                    <div className="text-sm text-gray-600">
                      Appointment {appointmentData._id.slice(-4)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
                <p className="text-gray-600 mt-1">Booking ID: #{appointmentData._id.slice(-8).toUpperCase()}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Badge
                  className={`px-4 py-2 text-sm font-medium border ${getStatusColor(appointmentData.appointmentStatus)}`}
                >
                  {appointmentData.appointmentStatus}
                </Badge>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 bg-transparent"
                      disabled={
                        appointmentData.appointmentStatus === "Cancelled" ||
                        appointmentData.appointmentStatus === "Completed"
                      }
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Cancel Appointment</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel this appointment? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isCancelling}
                        className="w-full sm:w-auto"
                      >
                        Keep Appointment
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleCancelAppointment}
                        disabled={isCancelling}
                        className="w-full sm:w-auto"
                      >
                        {isCancelling ? "Cancelling..." : "Yes, Cancel"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Appointment Overview */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Calendar className="w-5 h-5" />
                      Appointment Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium">{formatDate(appointmentData.slotIds[0].date)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p className="font-medium">
                            {formatTime(appointmentData.slotIds[0].startTime)} -{" "}
                            {formatTime(appointmentData.slotIds[0].endTime)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{appointmentData.shopId.name}</p>
                        <p className="text-sm text-gray-600">{appointmentData.shopId.address}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Details */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Service Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{appointmentData.serviceId.name}</h3>
                        <p className="text-gray-600 mt-1">{appointmentData.serviceId.description}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Duration: {appointmentData.serviceId.duration} minutes
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">${appointmentData.serviceId.price}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pet Information */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Heart className="w-5 h-5" />
                      Pet Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <img
                        src={appointmentData.petId.image || "/placeholder.svg"}
                        alt={appointmentData.petId.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{appointmentData.petId.name}</h3>
                        <p className="text-gray-600">{appointmentData.petId.breed}</p>
                        <p className="text-sm text-gray-500">{appointmentData.petId.age} years old</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Special Notes */}
                {appointmentData.notes && (
                  <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <FileText className="w-5 h-5" />
                        Special Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{appointmentData.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Staff & Payment Info */}
              <div className="space-y-6">
                {/* Staff Information */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <User className="w-5 h-5" />
                      Your Groomer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <img
                        src={appointmentData.staffId.image || "/placeholder.svg"}
                        alt={appointmentData.staffId.name}
                        className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-gray-200"
                      />
                      <h3 className="font-semibold text-lg">{appointmentData.staffId.name}</h3>
                      <p className="text-gray-600 text-sm">{appointmentData.staffId.specialization}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <CreditCard className="w-5 h-5" />
                      Payment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-medium">{appointmentData.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Status</span>
                      <Badge className={`px-2 py-1 text-xs ${getStatusColor(appointmentData.paymentStatus)}`}>
                        {appointmentData.paymentStatus}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total Amount</span>
                      <span>${appointmentData.serviceId.price}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{appointmentData.shopId.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{appointmentData.shopId.email}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Status Timeline */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Request Status</span>
                      <Badge className={`px-2 py-1 text-xs ${getStatusColor(appointmentData.requestStatus)}`}>
                        {appointmentData.requestStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Appointment Status</span>
                      <Badge className={`px-2 py-1 text-xs ${getStatusColor(appointmentData.appointmentStatus)}`}>
                        {appointmentData.appointmentStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Status</span>
                      <Badge className={`px-2 py-1 text-xs ${getStatusColor(appointmentData.paymentStatus)}`}>
                        {appointmentData.paymentStatus}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}