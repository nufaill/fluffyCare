import { useState, useEffect, useMemo, useCallback } from "react"
import { Clock, User, Coffee, Sun, Moon, Calendar, Filter, Users, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/Badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSocket } from "@/hooks/useSocket"
import Useraxios from "@/api/user.axios"
import { toast } from "react-hot-toast"

interface TimeSlot {
  _id?: string;
  shopId: string;
  staffId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  durationInMinutes: number;
  status: "available" | "booked" | "break" | "lunch" | "unavailable";
  staffName: string;
  slotIndex: number;
  isBooked: boolean;
  isActive: boolean;
}

interface BookedSlot {
  shopId: string
  staffId: string
  slotDate: string
  startTime: string
  endTime: string
  status: "booked"
}

interface ShopAvailability {
  workingDays: string[]
  openingTime: string
  closingTime: string
  lunchBreak: { start: string; end: string }
  teaBreak: { start: string; end: string }
  customHolidays: string[]
}

interface Staff {
  id: string
  name: string
  isActive: boolean
  role?: string
  avatar?: string
}

interface Service {
  id: string
  duration?: number
  durationHour?: number
  name: string
}

interface TimeSlotGeneratorProps {
  shopAvailability: ShopAvailability
  staff: Staff[]
  service: Service
  selectedDate: Date
  onSlotSelect: (slot: TimeSlot) => void
  selectedSlots: TimeSlot[]
  shopId: string
  activeCategory?: string
}

interface SlotGenerationConfig {
  defaultSlotDuration: number
  bufferTime: number
  allowBookingDuringBreaks: boolean
}

const TIME_CATEGORIES = [
  {
    label: "Morning",
    startHour: 6,
    endHour: 12,
    icon: Sun,
    gradient: "from-yellow-50 to-orange-50",
    borderColor: "border-yellow-200",
    iconColor: "text-yellow-600",
    bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50",
  },
  {
    label: "Afternoon",
    startHour: 12,
    endHour: 17,
    icon: Coffee,
    gradient: "from-blue-50 to-indigo-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
  },
  {
    label: "Evening",
    startHour: 17,
    endHour: 22,
    icon: Moon,
    gradient: "from-purple-50 to-pink-50",
    borderColor: "border-purple-200",
    iconColor: "text-purple-600",
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
  },
]

const DEFAULT_CONFIG: SlotGenerationConfig = {
  defaultSlotDuration: 60,
  bufferTime: 0,
  allowBookingDuringBreaks: false,
}

export function EnhancedTimeSlotGenerator({
  shopAvailability,
  staff,
  service,
  selectedDate,
  onSlotSelect,
  selectedSlots,
  shopId,
  activeCategory = "Morning",
}: TimeSlotGeneratorProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([])
  const [config, setConfig] = useState<SlotGenerationConfig>(DEFAULT_CONFIG)
  const [viewMode, setViewMode] = useState<"grid" | "staff">("staff")
  const [selectedStaff, setSelectedStaff] = useState<string | "all">("all")
  const [currentCategory, setCurrentCategory] = useState(activeCategory)

  // Add function to mark a slot as booked immediately
  const markSlotAsBooked = useCallback((slot: TimeSlot) => {
    console.log('Marking slot as booked:', {
      staffId: slot.staffId,
      date: slot.slotDate,
      startTime: slot.startTime
    });

    // Update timeSlots to mark this slot as booked
    setTimeSlots(prev => 
      prev.map(existingSlot => {
        if (existingSlot.staffId === slot.staffId && 
            existingSlot.slotDate === slot.slotDate && 
            existingSlot.startTime === slot.startTime) {
          return {
            ...existingSlot,
            status: "booked" as const,
            isBooked: true
          };
        }
        return existingSlot;
      })
    );

    // Also add to bookedSlots state
    const newBookedSlot: BookedSlot = {
      shopId: slot.shopId,
      staffId: slot.staffId,
      slotDate: slot.slotDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: "booked"
    };

    setBookedSlots(prev => {
      // Check if slot already exists
      const exists = prev.some(bookedSlot =>
        bookedSlot.shopId === slot.shopId &&
        bookedSlot.staffId === slot.staffId &&
        bookedSlot.slotDate === slot.slotDate &&
        bookedSlot.startTime === slot.startTime
      );

      if (!exists) {
        return [...prev, newBookedSlot];
      }
      return prev;
    });
  }, []);

  // Socket.IO integration for real-time updates
  const { socket, isConnected } = useSocket({
    shopId,
    onSlotBooked: (data) => {
      console.log('Slot booked event received:', data);

      // Add the booked slot to our bookedSlots state
      const newBookedSlot: BookedSlot = {
        shopId: data.shopId,
        staffId: data.staffId,
        slotDate: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        status: "booked"
      };

      setBookedSlots(prev => {
        // Check if slot already exists
        const exists = prev.some(slot =>
          slot.shopId === data.shopId &&
          slot.staffId === data.staffId &&
          slot.slotDate === data.date &&
          slot.startTime === data.startTime
        );

        if (!exists) {
          return [...prev, newBookedSlot];
        }
        return prev;
      });

      // Update the timeSlots state to mark this slot as booked
      setTimeSlots(prev => 
        prev.map(slot => {
          if (slot.staffId === data.staffId && 
              slot.slotDate === data.date && 
              slot.startTime === data.startTime) {
            return {
              ...slot,
              status: "booked" as const,
              isBooked: true
            };
          }
          return slot;
        })
      );

      // Show toast notification
      if (data.shopId === shopId) {
        toast.success('A slot was just booked!', { duration: 2000 });
      }
    },
    onSlotCanceled: (data) => {
      console.log('Slot canceled event received:', data);

      // Remove the canceled slot from bookedSlots state
      setBookedSlots(prev =>
        prev.filter(slot =>
          !(slot.shopId === data.shopId &&
            slot.staffId === data.staffId &&
            slot.slotDate === data.date &&
            slot.startTime === data.startTime)
        )
      );

      // Update the timeSlots state to mark this slot as available
      setTimeSlots(prev => 
        prev.map(slot => {
          if (slot.staffId === data.staffId && 
              slot.slotDate === data.date && 
              slot.startTime === data.startTime) {
            return {
              ...slot,
              status: "available" as const,
              isBooked: false
            };
          }
          return slot;
        })
      );

      const toastInfo = (msg: string) => toast(msg, { style: { background: '#2196f3', color: '#fff' } });

      // Show toast notification
      if (data.shopId === shopId) {
        toastInfo('A slot became available!');
      }
    },
    enabled: true
  });

  // Expose the markSlotAsBooked function so parent can call it
  useEffect(() => {
    // Store the function reference so parent component can access it
    (window as any).markSlotAsBooked = markSlotAsBooked;
    
    return () => {
      if ((window as any).markSlotAsBooked) {
        delete (window as any).markSlotAsBooked;
      }
    };
  }, [markSlotAsBooked]);

  // Fetch booked slots from API on component mount and date change
  useEffect(() => {
    const fetchBookedSlots = async () => {
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const response = await Useraxios.get(`/appointments/booked-slots/${shopId}?date=${dateStr}`);

        if (response.data.success) {
          setBookedSlots(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch booked slots:', error);
        // Don't show error toast as this is background functionality
      }
    };

    if (shopId) {
      fetchBookedSlots();
    }
  }, [shopId, selectedDate]);

  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(":").map(Number)
    return h * 60 + m
  }

  const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
  }

  const getServiceDurationInMinutes = (): number => {
    if (service.duration) {
      return service.duration
    } else if (service.durationHour) {
      return Math.round(service.durationHour * 60)
    } else {
      console.warn("Service duration not found, using default duration")
      return config.defaultSlotDuration
    }
  }

  const overlapsWithBreak = (start: number, end: number) => {
    const lunchStart = timeToMinutes(shopAvailability.lunchBreak.start)
    const lunchEnd = timeToMinutes(shopAvailability.lunchBreak.end)
    const teaStart = timeToMinutes(shopAvailability.teaBreak.start)
    const teaEnd = timeToMinutes(shopAvailability.teaBreak.end)

    if (start < lunchEnd && end > lunchStart) {
      return { overlaps: true, breakType: "lunch" }
    }
    if (start < teaEnd && end > teaStart) {
      return { overlaps: true, breakType: "break" }
    }
    return { overlaps: false }
  }

  // Check if a slot is booked by comparing with bookedSlots state
  const isSlotBooked = (staffId: string, date: string, startTime: string): boolean => {
    return bookedSlots.some(bookedSlot =>
      bookedSlot.staffId === staffId &&
      bookedSlot.slotDate === date &&
      bookedSlot.startTime === startTime
    );
  };

  const generateStaffSlots = (staffMember: Staff): TimeSlot[] => {
    const dateStr = selectedDate.toISOString().split("T")[0]
    const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" })
    const isWorkingDay = shopAvailability.workingDays.includes(dayName)

    console.log(`Generating slots for ${staffMember.name} (ID: ${staffMember.id})`)

    if (!isWorkingDay || shopAvailability.customHolidays.includes(dateStr) || !staffMember.isActive) {
      console.log(`Skipping ${staffMember.name}: not working day, holiday, or inactive`)
      return []
    }

    const opening = timeToMinutes(shopAvailability.openingTime)
    const closing = timeToMinutes(shopAvailability.closingTime)
    const duration = getServiceDurationInMinutes()
    const buffer = config.bufferTime

    console.log(`Service duration for slot generation: ${duration} minutes`)

    if (duration <= 0) {
      console.error(`Invalid service duration: ${duration} minutes for service ${service.name}`)
      return []
    }

    const slots: TimeSlot[] = []
    let current = opening
    let index = 0

    while (current + duration <= closing) {
      const end = current + duration
      let status: TimeSlot["status"] = "available"

      // Check if slot is already booked
      if (isSlotBooked(staffMember.id, dateStr, minutesToTime(current))) {
        status = "booked";
      } else {
        // Check for breaks only if not booked
        const breakCheck = overlapsWithBreak(current, end)
        if (breakCheck.overlaps && !config.allowBookingDuringBreaks) {
          status = breakCheck.breakType === "lunch" ? "lunch" : "break"
        }

        // Check if time has passed (only for today)
        if (selectedDate.toDateString() === new Date().toDateString()) {
          const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
          if (current <= nowMin) status = "unavailable"
        }
      }

      slots.push({
        _id: `${staffMember.id}-${dateStr}-${minutesToTime(current)}`, 
        shopId,
        staffId: staffMember.id,
        slotDate: dateStr,
        startTime: minutesToTime(current),
        endTime: minutesToTime(end),
        durationInMinutes: duration,
        status,
        staffName: staffMember.name,
        slotIndex: index,
        isBooked: status === "booked",
        isActive: staffMember.isActive,
      });

      current += duration + buffer
      index++
    }

    console.log(`Generated ${slots.length} slots for ${staffMember.name} with ${duration} minute duration`)
    return slots
  }

  const generateAllTimeSlots = (): TimeSlot[] => {
    if (!staff.length) {
      console.log("No staff available")
      return []
    }
    let all: TimeSlot[] = []
    staff.forEach((s) => {
      const staffSlots = generateStaffSlots(s)
      all = [...all, ...staffSlots]
    })
    console.log(`Total slots generated: ${all.length}`)
    return all
  }

  const filterSlotsByCategory = (slots: TimeSlot[], category: string) => {
    const cat = TIME_CATEGORIES.find((c) => c.label === category)
    if (!cat) return slots
    return slots.filter((slot) => {
      const hour = Number.parseInt(slot.startTime.split(":")[0])
      return hour >= cat.startHour && hour < cat.endHour
    })
  }

  // Filter slots to show only available ones (hide booked slots)
  const availableSlots = useMemo(() => {
    return timeSlots.filter(slot => slot.status !== "booked");
  }, [timeSlots]);

  const filteredSlots = useMemo(() => {
    console.log("Filtering slots:", {
      totalSlots: availableSlots.length,
      selectedStaff,
      currentCategory,
      staffIds: availableSlots.map((s) => ({ id: s.staffId, name: s.staffName })),
    })

    let s = availableSlots

    if (currentCategory) {
      s = filterSlotsByCategory(s, currentCategory)
      console.log(`After category filter (${currentCategory}):`, s.length)
    }

    if (selectedStaff !== "all") {
      console.log(`Filtering by staff ID: ${selectedStaff}`)
      s = s.filter((slot) => slot.staffId === selectedStaff)
      console.log(`After staff filter (${selectedStaff}):`, s.length)
    }

    return s
  }, [availableSlots, currentCategory, selectedStaff])

  useEffect(() => {
    const slots = generateAllTimeSlots()
    setTimeSlots(slots)
  }, [staff, selectedDate, shopAvailability, service, bookedSlots])

  useEffect(() => {
    setCurrentCategory(activeCategory)
  }, [activeCategory])

  const renderSlotButton = (slot: TimeSlot) => {
    const isSelected = selectedSlots.some(
      (s) => s.slotDate === slot.slotDate && s.startTime === slot.startTime && s.staffId === slot.staffId,
    )

    let buttonStyles = "border-2 rounded-xl font-semibold transition-all duration-200 "
    let buttonContent = ""
    let disabled = false

    if (slot.status === "available") {
      // Show staff name only in grid view
      buttonContent = viewMode === "grid"
        ? `${slot.startTime} - ${slot.endTime} (${slot.staffName})`
        : `${slot.startTime} - ${slot.endTime}`
      buttonStyles += isSelected
        ? "bg-black text-white border-black hover:bg-gray-800"
        : "bg-white text-black border-gray-300 hover:border-black hover:bg-gray-50"
    } else if (slot.status === "lunch" || slot.status === "break") {
      buttonStyles += "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
      buttonContent = slot.status === "lunch" ? "Lunch Break" : "Tea Break"
      disabled = true
    } else {
      buttonStyles += "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
      buttonContent = "Unavailable"
      disabled = true
    }

    return (
      <Button
        key={`${slot.staffId}-${slot.slotDate}-${slot.startTime}`}
        className={buttonStyles}
        onClick={() => onSlotSelect(slot)}
        disabled={disabled}
      >
        {isSelected && <CheckCircle2 className="w-4 h-4 mr-2" />}
        {buttonContent}
      </Button>
    )
  }

  const slotsByStaff = new Map<string, TimeSlot[]>()
  filteredSlots.forEach((slot) => {
    const staffSlots = slotsByStaff.get(slot.staffId) || []
    slotsByStaff.set(slot.staffId, [...staffSlots, slot])
  })

  const slotsByCategory = new Map<string, TimeSlot[]>()
  TIME_CATEGORIES.forEach((cat) => {
    slotsByCategory.set(cat.label, filterSlotsByCategory(availableSlots, cat.label))
  })

  const renderStaffView = () => (
    <div className="space-y-8">
      {Array.from(slotsByStaff.entries()).map(([staffId, slots]) => {
        const member = staff.find((s) => s.id === staffId)
        if (!member || slots.length === 0) return null

        const availableCount = slots.filter((s) => s.status === "available").length

        return (
          <Card
            key={`staff-card-${staffId}`}
            className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden"
          >
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.role || "Staff Member"}</p>
                  </div>
                </div>
                <Badge className="bg-white border-green-200 text-green-700 font-semibold px-3 py-1">
                  {availableCount} available
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {slots.map(renderSlotButton)}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  const renderGridView = () => (
    <div className="space-y-8">
      {TIME_CATEGORIES.map((category) => {
        const categorySlots = slotsByCategory.get(category.label) || []
        if (categorySlots.length === 0) return null

        const IconComponent = category.icon
        const availableCount = categorySlots.filter((s) => s.status === "available").length

        return (
          <Card
            key={category.label}
            className={`border-2 ${category.borderColor} shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden`}
          >
            <CardHeader className={`${category.bgColor} border-b ${category.borderColor}`}>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 ${category.iconColor} bg-white rounded-full flex items-center justify-center shadow-md`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{category.label}</h3>
                    <p className="text-sm text-gray-600">
                      {category.startHour}:00 - {category.endHour}:00
                    </p>
                  </div>
                </div>
                <Badge className="bg-white border-green-200 text-green-700 font-semibold px-4 py-2 text-sm">
                  {availableCount} slots available
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categorySlots.map(renderSlotButton)}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  const activeStaff = staff.filter((s) => s.isActive)
  const totalSlots = filteredSlots.length
  const availableSlotsCount = filteredSlots.filter((s) => s.status === "available").length
  const serviceDuration = getServiceDurationInMinutes()

  return (
    <div className="space-y-6">
      <Card className="border-2 border-black shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-black text-white">
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Available Time Slots</h2>
                <p className="text-gray-300 text-sm">
                  Choose your preferred appointment time ({serviceDuration} min sessions)
                  {isConnected && (
                    <span className="ml-2 inline-flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                      Live updates
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Badge variant="secondary" className="bg-green-500 text-white font-semibold px-4 py-2">
                {availableSlotsCount} of {totalSlots} available
              </Badge>
              <Badge variant="secondary" className="bg-green-500 text-white font-semibold px-4 py-2">
                {selectedSlots.length} selected
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="flex-1">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
                  <TabsTrigger
                    value="staff"
                    className="rounded-lg font-semibold data-[state=active]:bg-black data-[state=active]:text-white"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    By Staff
                  </TabsTrigger>
                  <TabsTrigger
                    value="grid"
                    className="rounded-lg font-semibold data-[state=active]:bg-black data-[state=active]:text-white"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    By Time
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="lg:w-64">
              <Select
                value={selectedStaff}
                onValueChange={(v) => {
                  console.log("Staff selection changed to:", v, "Type:", typeof v)
                  setSelectedStaff(v)
                }}
              >
                <SelectTrigger className="w-full border-2 border-gray-200 rounded-xl font-semibold">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="Filter by staff" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="font-semibold">
                    All Staff ({activeStaff.length})
                  </SelectItem>
                  {activeStaff.map((member) => (
                    <SelectItem key={`staff-select-${member.id}`} value={member.id} className="font-medium">
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {totalSlots === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No slots available</h3>
              <p className="text-gray-600 text-lg">Please select a different date or check back later.</p>
            </div>
          ) : (
            <>{viewMode === "staff" ? renderStaffView() : renderGridView()}</>
          )}
        </CardContent>
      </Card>
    </div>
  )
}