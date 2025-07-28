"use client"

import { CalendarIcon, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"

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

interface SlotCalendarProps {
  currentDate: Date
  setCurrentDate: (date: Date) => void
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  schedules: DaySchedule[]
  holidays: Holiday[]
  isLoading: boolean
}

export function SlotCalendar({
  currentDate,
  setCurrentDate,
  selectedDate,
  setSelectedDate,
  schedules,
  holidays,
  isLoading,
}: SlotCalendarProps) {
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const isDateSelectable = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  }

  const getAvailableSlots = (date: string) => {
    const schedule = schedules.find((s) => s.date === date)
    if (!schedule || schedule.isHoliday) return 0
    const available = schedule.timeSlots.filter((slot) => !slot.isBooked && slot.isActive).length
    if (date === "2025-07-27") {
      console.log(`Available slots for ${date}:`, available, "Schedule:", schedule)
    }
    return available
  }

  const getHolidayInfo = (date: string) => {
    return holidays.find((holiday) => holiday.date.iso === date)
  }

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const numDays = daysInMonth(year, month)
    const startDay = firstDayOfMonth(year, month)

    const days = []

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-full h-20"></div>)
    }

    for (let i = 1; i <= numDays; i++) {
      const date = new Date(year, month, i)
      const formattedDate = date.toISOString().split("T")[0]
      const isToday = date.toDateString() === new Date().toDateString()
      const isSelected = date.toDateString() === selectedDate.toDateString()
      const selectable = isDateSelectable(date)
      const schedule = schedules.find((s) => s.date === formattedDate)
      const availableSlots = getAvailableSlots(formattedDate)
      const hasSlots = schedule && schedule.timeSlots.length > 0
      const holidayInfo = getHolidayInfo(formattedDate)
      const isNationalHoliday = holidayInfo && holidayInfo.primary_type === "national"
      const showHolidayBadge = isNationalHoliday && !hasSlots

      days.push(
        <div
          key={formattedDate}
          className={`w-full h-16 sm:h-24 p-1 sm:p-2 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 relative flex flex-col ${
            isSelected
              ? "bg-black text-white border-black shadow-lg transform scale-105"
              : isToday
                ? "bg-gray-100 border-black shadow-md"
                : selectable
                  ? "hover:bg-gray-50 border-gray-300 hover:border-black hover:shadow-md"
                  : "bg-gray-50 border-gray-200 cursor-not-allowed opacity-50"
          }`}
          onClick={() => selectable && setSelectedDate(date)}
          title={holidayInfo ? `${holidayInfo.name} - ${holidayInfo.description}` : undefined}
        >
          <div className="flex justify-between items-start mb-auto">
            <span
              className={`font-bold text-sm sm:text-lg leading-none ${
                isSelected
                  ? "text-white"
                  : isToday
                    ? "text-black"
                    : isNationalHoliday
                      ? "text-yellow-600"
                      : "text-gray-900"
              }`}
            >
              {i}
            </span>
            {isNationalHoliday && (
              <div className="flex-shrink-0">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
              </div>
            )}
          </div>
          <div className="flex justify-center mb-1">
            {showHolidayBadge && (
              <Badge className="text-xs px-1 sm:px-2 py-0.5 font-medium bg-yellow-500 text-yellow-900">Holiday</Badge>
            )}
          </div>
          <div className="mt-auto">
            {hasSlots ? (
              <div className="text-center">
                <span
                  className={`text-xs font-semibold px-1 sm:px-2 py-1 rounded-full inline-block ${
                    isSelected
                      ? "bg-white text-black"
                      : availableSlots > 0
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {availableSlots > 0 ? `${availableSlots}` : "Full"}
                </span>
              </div>
            ) : null}
          </div>
        </div>,
      )
    }
    return days
  }

  return (
    <Card className="border-2 border-black shadow-xl">
      <CardHeader className="bg-black text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6" />
            <div>
              <div className="text-xl font-bold">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
              <div className="text-gray-300 text-sm">Select your preferred date</div>
            </div>
          </CardTitle>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
              className="border-white text-white hover:bg-white hover:text-black bg-transparent transition-all duration-200 p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
              className="border-white text-white hover:bg-white hover:text-black bg-transparent transition-all duration-200 p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 animate-spin mx-auto mb-4 text-black" />
            <p className="text-gray-600 font-medium">Loading calendar...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm text-gray-600">Holiday</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded border border-green-300"></div>
                <span className="text-sm text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 rounded border border-red-300"></div>
                <span className="text-sm text-gray-600">Fully Booked</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-3 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-bold text-black bg-gray-100 rounded-lg">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-3">{renderCalendarDays()}</div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
