import { useState } from "react"
import { Clock, Sun, Sunset, Moon, Users, AlertCircle, Calendar, ChevronDown, ChevronUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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

interface SlotDisplayProps {
  selectedDate: Date
  schedules: DaySchedule[]
  holidays: Holiday[]
  onSlotSelect: (slot: TimeSlot) => void
  selectedSlots: TimeSlot[]
  onCancelSelection: () => void
  isLoading: boolean
}

export function SlotDisplay({
  selectedDate,
  schedules,
  holidays,
  onSlotSelect,
  selectedSlots,
  onCancelSelection,
  isLoading,
}: SlotDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    morning: true,
    afternoon: true,
    evening: true,
  })

  const selectedDateKey = selectedDate.toISOString().split("T")[0]
  const selectedDateSchedule = schedules.find((s) => s.date === selectedDateKey)
  console.log("Selected Date:", selectedDateKey)
  console.log("Selected Schedule:", selectedDateSchedule)
  console.log("All Schedules:", schedules)
  const holidayInfo = holidays.find((h) => h.date.iso === selectedDateKey)
  const hasNoSlots = !selectedDateSchedule || selectedDateSchedule.timeSlots.length === 0
  const showHolidayClosure = holidayInfo && hasNoSlots

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case "morning":
        return Sun
      case "afternoon":
        return Sunset
      case "evening":
        return Moon
      default:
        return Clock
    }
  }

  const getPeriodColor = (period: string) => {
    switch (period) {
      case "morning":
        return "bg-yellow-500"
      case "afternoon":
        return "bg-orange-500"
      case "evening":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPeriodSlots = (slots: TimeSlot[], period: string) => {
    return slots.filter((slot) => {
      const hour = parseInt(slot.startTime.split(":")[0], 10)
      console.log("Slot startTime:", slot.startTime, "Hour:", hour, "Period:", period)
      if (period === "morning") return hour < 12
      if (period === "afternoon") return hour >= 12 && hour < 17
      return hour >= 17
    })
  }

  const groupSlotsByTime = (slots: TimeSlot[]) => {
    const grouped = new Map<string, TimeSlot[]>()
    slots.forEach((slot) => {
      const key = `${slot.startTime}-${slot.endTime}`
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(slot)
    })

    return Array.from(grouped.entries())
      .map(([timeRange, staffSlots]) => {
        const [startTime, endTime] = timeRange.split("-")
        const availableSlots = staffSlots.filter((slot) => !slot.isBooked && slot.isActive)
        return {
          startTime,
          endTime,
          totalSlots: staffSlots.length,
          availableSlots,
          allSlots: staffSlots,
        }
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  return (
    <Card className="border-2 border-black shadow-xl">
      <CardHeader className="bg-black text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Calendar className="w-7 h-7" />
            <div>
              <div className="text-2xl font-bold">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="text-gray-300 text-sm">
                {showHolidayClosure ? "No appointments available" : "Select your preferred time slot"}
              </div>
            </div>
          </div>
          {showHolidayClosure && (
            <Badge className="text-sm px-3 py-1 bg-yellow-500 text-yellow-900">
              {holidayInfo?.name.toUpperCase()}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {showHolidayClosure ? (
          <div className="text-center py-20 bg-gray-50">
            <AlertCircle className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <div className="text-2xl font-bold text-gray-700 mb-3">{`${holidayInfo?.name} Holiday`}</div>
            <div className="text-gray-500 text-lg">
              {holidayInfo?.description || "Please select another date"}
            </div>
            <div className="text-sm text-gray-400">We'll be back with regular hours soon!</div>
          </div>
        ) : !selectedDateSchedule || selectedDateSchedule.timeSlots.length === 0 ? (
          <div className="text-center py-20 bg-gray-50">
            <Clock className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <div className="text-2xl font-bold text-gray-700 mb-3">No Slots Available</div>
            <div className="text-gray-500 text-lg">
              Looks like the shop’s taking a little break today, try picking another day that’s ready to roll!
            </div>
          </div>
        ) : (
          <div className="divide-y-2 divide-gray-100">
            {["morning", "afternoon", "evening"].map((period) => {
              const periodSlots = getPeriodSlots(selectedDateSchedule.timeSlots, period)
              console.log(`Period ${period} slots for ${selectedDateKey}:`, periodSlots)
              const PeriodIcon = getPeriodIcon(period)
              const periodColor = getPeriodColor(period)

              if (periodSlots.length === 0) return null

              const groupedSlots = groupSlotsByTime(periodSlots)
              const availableCount = groupedSlots.reduce((acc, group) => acc + group.availableSlots.length, 0)
              const isExpanded = expandedSections[period]

              return (
                <Collapsible key={period} open={isExpanded} onOpenChange={() => toggleSection(period)}>
                  <CollapsibleTrigger asChild>
                    <div className="p-6 hover:bg-gray-50 cursor-pointer transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 ${periodColor} rounded-xl shadow-lg`}>
                            <PeriodIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-black capitalize">{period}</h3>
                            <p className="text-gray-600">
                              {availableCount} of {groupedSlots.reduce((acc, group) => acc + group.totalSlots, 0)}{" "}
                              slots available
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`${availableCount > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} px-3 py-1`}
                          >
                            {availableCount > 0 ? "Available" : "Full"}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="w-6 h-6 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {groupedSlots.map((group, index) => (
                          <div key={index} className="space-y-4">
                            <div className="text-center p-4 bg-black text-white rounded-xl">
                              <div className="text-xl font-bold">
                                {group.startTime} - {group.endTime}
                              </div>
                              <div className="text-gray-300 text-sm mt-1">
                                {group.availableSlots.length} of {group.totalSlots} available
                              </div>
                            </div>
                            {group.availableSlots.length > 0 ? (
                              <div className="space-y-3">
                                {group.allSlots.map((slot) => {
                                  const isSelected = selectedSlots.some((s) => s._id === slot._id)
                                  return (
                                    <Button
                                      key={slot._id}
                                      variant="outline"
                                      className={`w-full h-14 border-2 border-black font-semibold shadow-md hover:shadow-lg transition-all duration-300 ${
                                        isSelected
                                          ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                                          : slot.isBooked || !slot.isActive
                                            ? "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
                                            : "bg-white text-black hover:bg-black hover:text-white"
                                      }`}
                                      onClick={() => !isSelected && !slot.isBooked && slot.isActive && onSlotSelect(slot)}
                                      disabled={isLoading || slot.isBooked || !slot.isActive}
                                    >
                                      <Users className="w-5 h-5 mr-3" />
                                      <div className="text-left">
                                        <div>{slot.staffName || "Professional Staff"}</div>
                                        <div className="text-xs opacity-70">{slot.durationInMinutes} minutes</div>
                                      </div>
                                      {isSelected && (
                                        <span className="ml-auto text-xs font-bold">Selected</span>
                                      )}
                                    </Button>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-6">
                                <div className="text-gray-500 bg-gray-100 rounded-xl p-4 border-2 border-dashed border-gray-300">
                                  <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                  <div className="font-medium">All slots booked</div>
                                  <div className="text-sm">Try another time</div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
        )}
        {selectedSlots.length > 0 && (
          <div className="p-4 flex justify-end">
            <Button
              variant="outline"
              className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold h-10"
              onClick={onCancelSelection}
            >
              <X className="w-5 h-5 mr-2" />
              Cancel Selection
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}