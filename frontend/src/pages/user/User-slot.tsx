import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { SlotCalendar } from "@/components/user/slot-calendar"
import { SlotDisplay } from "@/components/user/slot-display"
import SelectedServiceDetails from "@/components/user/Selected-serviceDetails"
import Header from "@/components/user/Header"
import Footer from "@/components/user/Footer"
import { useParams } from "react-router-dom"
import Useraxios from "@/api/user.axios"
import { toast } from "react-hot-toast"

interface TimeSlot {
  _id: string
  shopId: string
  staffId: { _id: string; name: string; phone: string } | string
  slotDate: string
  startTime: string
  endTime: string
  durationInMinutes: number
  isBooked: boolean
  isActive: boolean
  staffName?: string
  deletedAt?: Date | null
}

interface DaySchedule {
  date: string
  timeSlots: TimeSlot[]
  isHoliday?: boolean
}

interface Holiday {
  name: string
  description: string
  date: {
    iso: string
    datetime: {
      year: number
      month: number
      day: number
    }
  }
  type: string
  primary_type: string
}

// --- New Interface for Service ---
interface Service {
  durationHour: number
  name: string
  price: number
  petTypeIds: string[]
}

export default function SlotsPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [schedules, setSchedules] = useState<DaySchedule[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([])
  const { shopId, serviceId } = useParams<{ shopId: string; serviceId: string }>()
  // --- New State for Service ---
  const [service, setService] = useState<Service | null>(null)

  // --- Fetch Service Details ---
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!serviceId) {
        setError("Service ID is missing")
        return
      }
      try {
        const response = await Useraxios.get(`/services/${serviceId}`)
        setService(response.data.data || response.data)
        console.log("Service Details:", response.data.data)
      } catch (err: any) {
        console.error("Error fetching service details", err)
        setError("Failed to fetch service details")
      }
    }

    fetchServiceDetails()
  }, [serviceId])

  useEffect(() => {
    console.log("SlotsPage: shopId =", shopId, "serviceId =", serviceId) // Debug log

    const fetchSlots = async () => {
      if (!shopId) {
        setError("Shop ID is missing")
        console.error("SlotsPage: Missing shopId")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await Useraxios.get(`/slot/shop/${shopId}/range`, {
          params: {
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
          },
        })
        console.log("SlotsPage API Response:", response.data)
        const slots: TimeSlot[] = response.data.data
        console.log("Slots for July 27:", slots.filter(slot => slot.slotDate.startsWith("2025-07-27")))

        const slotMap = new Map<string, TimeSlot[]>()
        slots.forEach((slot) => {
          if (slot.deletedAt || !slot.isActive) {
            console.log(`Skipping slot for ${slot.slotDate}: deletedAt=${slot.deletedAt}, isActive=${slot.isActive}`)
            return
          }
          const date = slot.slotDate.split("T")[0]
          if (!slotMap.has(date)) {
            slotMap.set(date, [])
          }
          slotMap.get(date)!.push({
            ...slot,
            staffName: typeof slot.staffId === "object" ? slot.staffId.name : undefined,
          })
        })
        console.log("Slot Map for July 27:", slotMap.get("2025-07-27"))

        const today = new Date()
        const mockSchedules: DaySchedule[] = []
        for (let i = 0; i < 30; i++) {
          const date = new Date(today)
          date.setDate(today.getDate() + i)
          const dateKey = date.toISOString().split("T")[0]
          const hasSlots = slotMap.has(dateKey) && slotMap.get(dateKey)!.length > 0
          mockSchedules.push({
            date: dateKey,
            timeSlots: slotMap.get(dateKey) || [],
            isHoliday: !hasSlots && holidays.some((h) => h.date.iso === dateKey),
          })
        }
        console.log("Schedule for July 27:", mockSchedules.find(s => s.date === "2025-07-27"))
        setSchedules(mockSchedules)

        const mockHolidays: Holiday[] = []
        setHolidays(mockHolidays)
      } catch (err: any) {
        console.error("Fetch Error:", err)
        setError(err.response?.data?.message || "Failed to fetch slots")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSlots()
  }, [shopId])

  const getTimeBlock = (startTime: string): string => {
    const hour = parseInt(startTime.split(":")[0], 10)
    if (hour < 12) return "morning"
    if (hour < 17) return "afternoon"
    return "evening"
  }

  const handleSlotSelect = (slot?: TimeSlot) => {
    if (!slot || slot.isBooked || !slot.isActive) return
    if (!service) {
      toast.error("Service details not loaded yet.")
      return
    }

    // --- Calculate Service Duration in Minutes ---
    const serviceDuration = service.durationHour * 60 

    // --- Calculate Total Duration of Selected Slots ---
    const currentTotalDuration = selectedSlots.reduce((sum, s) => sum + s.durationInMinutes, 0)
    const newTotalDuration = currentTotalDuration + slot.durationInMinutes

    // --- Check if Adding Slot Exceeds Limit or Duration ---
    if (selectedSlots.length >= 2) {
      toast("You can only select up to two slots.", {
        icon: "⚠️",
        style: {
          background: "#fef3c7",
          color: "#92400e",
        },
      })
      return
    }

    // --- Check for Overlapping Slots ---
    const slotStart = new Date(`${slot.slotDate}T${slot.startTime}`)
    const slotEnd = new Date(`${slot.slotDate}T${slot.endTime}`)
    const hasOverlap = selectedSlots.some((selected) => {
      const selectedStart = new Date(`${selected.slotDate}T${selected.startTime}`)
      const selectedEnd = new Date(`${selected.slotDate}T${selected.endTime}`)
      return slotStart < selectedEnd && slotEnd > selectedStart
    })

    if (hasOverlap) {
      toast("You cannot select overlapping time slots.", {
        icon: "⚠️",
        style: {
          background: "#fef3c7",
          color: "#92400e",
        },
      })
      return
    }

    // --- Check if New Total Duration Matches or Exceeds Service Duration ---
    if (newTotalDuration > serviceDuration) {
      toast("Not possible to add extra slot: Total duration exceeds service duration.", {
        icon: "⚠️",
        style: {
          background: "#fef3c7",
          color: "#92400e",
        },
      })
      return
    }

    setSelectedSlots([...selectedSlots, slot])

    // --- Warn if Duration is Still Less Than Service Duration ---
    if (newTotalDuration < serviceDuration) {
      toast(`Select one more slot to match the service duration of ${serviceDuration} minutes.`, {
        icon: "⚠️",
        style: {
          background: "#fef3c7",
          color: "#92400e",
        },
      })
    }
  }

  const handleCancelSelection = () => {
    setSelectedSlots([])
    setError(null)
  }

  // --- New Function to Validate Before Booking ---
  const handleBookNow = () => {
    if (!service) {
      toast.error("Service details not loaded yet.")
      return
    }

    const serviceDuration = service.durationHour * 60
    const totalSlotDuration = selectedSlots.reduce((sum, s) => sum + s.durationInMinutes, 0)

    if (selectedSlots.length === 0) {
      toast("Please select at least one slot.", {
        icon: "⚠️",
        style: {
          background: "#fef3c7",
          color: "#92400e",
        },
      })
      return
    }

    if (totalSlotDuration !== serviceDuration) {
      toast(`Selected slots duration (${totalSlotDuration} minutes) does not match service duration (${serviceDuration} minutes).`, {
        icon: "⚠️",
        style: {
          background: "#fef3c7",
          color: "#92400e",
        },
      })
      return
    }

    // Proceed with booking logic
    console.log("Proceeding with booking:", { selectedSlots, service })
    // Add actual booking API call here
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 tracking-tight">Select Your Appointment</h1>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto">
              Choose your preferred time slots (up to two from different time periods)
            </p>
            <div className="mt-6 flex justify-center">
              <div className="h-1 w-24 bg-white"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg mb-8 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}
        {!serviceId && (
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg mb-8 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-medium">Service ID is missing. Please select a service.</p>
          </div>
        )}
        {selectedSlots.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg mb-8">
            <h3 className="font-bold text-lg mb-2">Selected Slots:</h3>
            <ul className="list-disc pl-5">
              {selectedSlots.map((slot) => (
                <li key={slot._id}>
                  {slot.slotDate} {slot.startTime} - {slot.endTime} ({slot.staffName || "Professional Staff"})
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-8">
            <SlotCalendar
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              schedules={schedules}
              holidays={holidays}
              isLoading={isLoading}
            />
            <SelectedServiceDetails onBookNow={handleBookNow} /> 
          </div>
          <div>
            <SlotDisplay
              selectedDate={selectedDate}
              schedules={schedules}
              holidays={holidays}
              onSlotSelect={handleSlotSelect}
              selectedSlots={selectedSlots}
              onCancelSelection={handleCancelSelection}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}