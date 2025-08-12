import { useState, useEffect } from "react"
import { CalendarIcon, X, Sparkles, AlertCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { PaymentForm } from "@/components/user/PaymentForm"
import SelectedServiceDetails from "@/components/user/Selected-serviceDetails"
import Header from "@/components/user/Header"
import Footer from "@/components/user/Footer"
import { useParams, useNavigate } from "react-router-dom"
import Useraxios from "@/api/user.axios"
import { toast } from "react-hot-toast"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { SlotCalendar } from "@/components/user/slot-calendar"
import { EnhancedTimeSlotGenerator } from "@/components/user/TimeSlotGenerator"
import { Badge } from "@/components/ui/Badge"

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

interface TimeSlotCategory {
  label: string
  startHour: number
  endHour: number
}

interface Staff {
  id: string
  name: string
  email?: string
  phone?: string
  isActive: boolean
  role?: string
  avatar?: string
}

interface ShopAvailability {
  workingDays: string[]
  openingTime: string
  closingTime: string
  lunchBreak: { start: string; end: string }
  teaBreak: { start: string; end: string }
  customHolidays: string[]
}

interface Service {
  id: string
  name: string
  duration: number
  price: number
  color: string
}

interface TimeSlot {
  shopId: string
  staffId: string
  slotDate: string
  startTime: string
  endTime: string
  durationInMinutes: number
  status: "available" | "booked" | "break" | "lunch" | "unavailable"
  staffName: string
  slotIndex: number
}

interface Holiday {
  name: string
  description: string
  date: { iso: string; datetime: { year: number; month: number; day: number } }
  type: string
  primary_type: string
}

interface UserState {
  id?: string
  _id?: string
  [key: string]: any
}

const TIME_CATEGORIES: TimeSlotCategory[] = [
  { label: "Morning", startHour: 6, endHour: 12 },
  { label: "Afternoon", startHour: 12, endHour: 17 },
  { label: "Evening", startHour: 17, endHour: 22 },
]

export default function UserSlot() {
  const { shopId, serviceId } = useParams<{ shopId: string | undefined; serviceId: string | undefined }>()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.user.userDatas as UserState)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false)
  const [selectedPetId, setSelectedPetId] = useState<string>("")
  const [activeCategory, setActiveCategory] = useState<string>("Morning")
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [staff, setStaff] = useState<Staff[]>([])
  const [shopAvailability, setShopAvailability] = useState<ShopAvailability | null>(null)
  const [service, setService] = useState<Service | null>(null)
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([])

  const getUserId = (): string => {
    const userId = user?._id || user?.id || ""
    return userId.trim()
  }

  const isUserLoggedIn = (): boolean => {
    const userId = getUserId()
    return userId !== "" && userId !== null && userId !== undefined
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!shopId) {
        toast.error("Shop ID is missing")
        return
      }

      setIsLoading(true)
      try {
        const availabilityResponse = await Useraxios.get(`/${shopId}/availability`)
        setShopAvailability(availabilityResponse.data.data)

        const staffResponse = await Useraxios.get(`/staff?shopId=${shopId}`)
        const staffData = staffResponse.data.data.staff

        const enhancedStaff = staffData.map((member: any, index: number) => {
          const staffId = member._id || member.id || `staff-${index + 1}`
          return {
            ...member,
            id: staffId,
            role: member.role || `Staff Member ${index + 1}`,
            avatar: member.avatar || null,
            isActive: member.isActive !== false,
          }
        })

        setStaff(enhancedStaff)

        try {
          const holidaysResponse = await Useraxios.get(`/holidays?shopId=${shopId}`)
          setHolidays(holidaysResponse.data.data || [])
        } catch {
          setHolidays([])
        }

        if (serviceId) {
          const serviceResponse = await Useraxios.get(`/services/${serviceId}`)
          const serviceData = serviceResponse.data.data
          setService({
            ...serviceData,
            id: serviceData._id || serviceData.id,
            color: serviceData.color || "bg-blue-500",
          })
        } else {
          toast.error("Service ID is missing")
        }
      } catch {
        toast.error("Failed to load shop data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [shopId, serviceId])

  const validateBookingData = (): { isValid: boolean; error?: string } => {
    if (!isUserLoggedIn()) {
      return { isValid: false, error: "Please log in to book an appointment" }
    }

    if (!selectedPetId || selectedPetId.trim() === "") {
      return { isValid: false, error: "Please select a pet" }
    }

    if (selectedSlots.length !== 1) {
      return { isValid: false, error: "Please select exactly one time slot" }
    }

    const slot = selectedSlots[0]
    if (!slot.slotDate || !slot.startTime || !slot.endTime || !slot.staffId) {
      return { isValid: false, error: "Selected time slot is incomplete" }
    }

    if (!serviceId || !shopId) {
      return { isValid: false, error: "Service or shop information is missing" }
    }

    return { isValid: true }
  }

  const handleBookNow = () => {
    const validation = validateBookingData()
    
    if (!validation.isValid) {
      if (validation.error?.includes("log in")) {
        setIsLoginPromptOpen(true)
      } else {
        toast.error(validation.error || "Please complete all required fields")
      }
      return
    }

    setIsPaymentModalOpen(true)
  }

  const handleLoginRedirect = () => {
    // Save current booking state to localStorage before redirecting
    const bookingState = {
      shopId,
      serviceId,
      selectedDate: selectedDate.toISOString(),
      selectedSlots,
      selectedPetId,
      returnUrl: window.location.pathname
    }
    localStorage.setItem('pendingBooking', JSON.stringify(bookingState))
    
    // Redirect to login page
    navigate('/login')
  }

  const handlePetSelect = (petId: string) => {
    setSelectedPetId(petId)
  }

  const handlePaymentSuccess = () => {
    toast.success("Payment successful!")
    setIsPaymentModalOpen(false)
    
    // Clear any pending booking state
    localStorage.removeItem('pendingBooking')
    
    navigate("/appointments")
  }

  const handlePaymentCancel = () => {
    setIsPaymentModalOpen(false)
    toast.error("Payment cancelled")
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedSlots([])
    setIsCalendarModalOpen(false)
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlots((prev) => {
      const exists = prev.find(
        (s) => s.slotDate === slot.slotDate && s.startTime === slot.startTime && s.staffId === slot.staffId,
      )

      if (exists) {
        return []
      }

      return [slot]
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading your booking experience...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we prepare everything for you</p>
        </div>
      </div>
    )
  }

  if (!shopAvailability || staff.length === 0 || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">
            We couldn't load the shop data, staff information, or service details. Please try again.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-black text-white hover:bg-gray-800 px-8 py-3 rounded-xl font-semibold"
          >
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <Card className="border-2 border-black shadow-2xl mb-8 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-black to-gray-800 text-white">
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-lg">
                    <CalendarIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Book Your Appointment</h1>
                    <p className="text-gray-300 text-lg font-medium">{formatDate(selectedDate)}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsCalendarModalOpen(true)}
                  className="border-2 border-white text-black bg-white hover:bg-gray-100 hover:text-black font-bold px-6 py-3 rounded-xl shadow-lg"
                >
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Change Date
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                {TIME_CATEGORIES.map((category) => (
                  <Button
                    key={category.label}
                    variant={activeCategory === category.label ? "default" : "outline"}
                    size="lg"
                    className={`${activeCategory === category.label
                      ? "bg-black text-white hover:bg-gray-800 shadow-lg"
                      : "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-black"} font-bold px-6 py-3 rounded-xl transition-all duration-200`}
                    onClick={() => setActiveCategory(category.label)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3">
              <EnhancedTimeSlotGenerator
                shopAvailability={shopAvailability}
                staff={staff}
                service={service}
                selectedDate={selectedDate}
                onSlotSelect={handleSlotSelect}
                selectedSlots={selectedSlots}
                shopId={shopId!}
                activeCategory={activeCategory}
              />
            </div>

            <div className="xl:col-span-1">
              <div className="sticky top-6">
                <SelectedServiceDetails
                  onBookNow={handleBookNow}
                  onSelectPetId={handlePetSelect}
                  selectedSlots={selectedSlots}
                  selectedPetId={selectedPetId}
                  userId={getUserId()}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Modal */}
        <Dialog open={isCalendarModalOpen} onOpenChange={setIsCalendarModalOpen}>
          <DialogContent className="w-[95vw] max-w-[500px] p-0 rounded-2xl overflow-hidden">
            <DialogHeader className="bg-black text-white p-6">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <CalendarIcon className="w-6 h-6" />
                Select Your Preferred Date
              </DialogTitle>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  className="absolute right-4 top-4 p-2 hover:bg-gray-800 text-white rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </DialogClose>
            </DialogHeader>
            <div className="p-6">
              <SlotCalendar
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                selectedDate={selectedDate}
                setSelectedDate={handleDateSelect}
                holidays={holidays}
                isLoading={isLoading}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Login Prompt Modal */}
        <Dialog open={isLoginPromptOpen} onOpenChange={setIsLoginPromptOpen}>
          <DialogContent className="w-[95vw] max-w-[400px] p-0 rounded-2xl overflow-hidden">
            <DialogHeader className="bg-black text-white p-6">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <User className="w-6 h-6" />
                Login Required
              </DialogTitle>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  className="absolute right-4 top-4 p-2 hover:bg-gray-800 text-white rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </DialogClose>
            </DialogHeader>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Please Log In</h3>
              <p className="text-gray-600 mb-6">
                You need to log in to your account to book an appointment. Don't worry, we'll save your selection!
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleLoginRedirect}
                  className="bg-black text-white hover:bg-gray-800 font-semibold px-6 py-2"
                >
                  Go to Login
                </Button>
                <Button
                  onClick={() => setIsLoginPromptOpen(false)}
                  variant="outline"
                  className="border-black text-black hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Modal */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="w-[95vw] max-w-[700px] p-0 rounded-2xl overflow-hidden">
            <DialogHeader className="bg-black text-white p-6">
              <DialogTitle className="text-2xl font-bold">Complete Your Payment</DialogTitle>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  className="absolute right-4 top-4 p-2 hover:bg-gray-800 text-white rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </DialogClose>
            </DialogHeader>
            <div className="p-6">
              <PaymentForm
                amount={service.price}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
                serviceId={serviceId || ""}
                shopId={shopId || ""}
                selectedPetId={selectedPetId}
                selectedSlots={selectedSlots}
                userId={getUserId()}
              />
            </div>
          </DialogContent>
        </Dialog>
        <Footer />
      </div>
    </Elements>
  )
}