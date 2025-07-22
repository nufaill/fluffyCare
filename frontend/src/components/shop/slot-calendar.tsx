"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Trash2,
  Settings,
  Zap,
  Users,
  Coffee,
  Sun,
  Moon,
  Sunset,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarDays,
  Timer,
  Building2,
  X,
  UserX,
  Trash,
  Eye,
  UserMinus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  isBooked: boolean
  staffId: string
  isCancelled?: boolean
  staffName?: string
}

interface DaySchedule {
  slotDate: string
  slots: TimeSlot[]
  isHoliday: boolean
  isSundayOverride?: boolean
}

interface SlotGenerationForm {
  shopOpenTime: string
  shopCloseTime: string
  lunchStartTime: string
  lunchEndTime: string
  staffCount: number
  slotDuration: number
}

interface GroupedSlot {
  timeRange: string
  startTime: string
  endTime: string
  staffSlots: TimeSlot[]
  availableCount: number
  totalCount: number
}

export function ScheduleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [schedules, setSchedules] = useState<Record<string, DaySchedule>>({})
  const [isHolidaySettingsOpen, setIsHolidaySettingsOpen] = useState(false)
  const [isSlotGeneratorOpen, setIsSlotGeneratorOpen] = useState(false)
  const [autoScheduleEnabled, setAutoScheduleEnabled] = useState(true)
  const [sundayWorkingEnabled, setSundayWorkingEnabled] = useState(false)
  const [compactView, setCompactView] = useState(true)
  const [isAutoGenerating, setIsAutoGenerating] = useState(false)
  const [formData, setFormData] = useState<SlotGenerationForm>({
    shopOpenTime: "09:00",
    shopCloseTime: "18:00",
    lunchStartTime: "13:00",
    lunchEndTime: "14:00",
    staffCount: 5,
    slotDuration: 30,
  })
  const [previewSlots, setPreviewSlots] = useState<TimeSlot[]>([])

  const getDateKey = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    const days = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getStatusColor = (isBooked: boolean, isCancelled?: boolean) => {
    if (isCancelled) return "bg-gray-100 text-gray-600 border-gray-200"
    return isBooked ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-green-100 text-green-800 border-green-200"
  }

  const getStatusIcon = (isBooked: boolean, isCancelled?: boolean) => {
    if (isCancelled) return X
    return isBooked ? CheckCircle : XCircle
  }

  const getPeriod = (startTime: string) => {
    const hour = Number.parseInt(startTime.split(":")[0], 10)
    if (hour < 12) return "morning"
    if (hour < 17) return "afternoon"
    return "evening"
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

  const getPeriodSlots = (slots: TimeSlot[], period: string) => {
    return slots.filter((slot) => getPeriod(slot.startTime) === period)
  }

  // Group slots by time range for better display when multiple staff
  const groupSlotsByTime = (slots: TimeSlot[]): GroupedSlot[] => {
    const grouped = new Map<string, GroupedSlot>()

    slots.forEach((slot) => {
      const timeRange = `${slot.startTime}-${slot.endTime}`
      if (!grouped.has(timeRange)) {
        grouped.set(timeRange, {
          timeRange,
          startTime: slot.startTime,
          endTime: slot.endTime,
          staffSlots: [],
          availableCount: 0,
          totalCount: 0,
        })
      }

      const group = grouped.get(timeRange)!
      group.staffSlots.push(slot)
      group.totalCount++
      if (!slot.isBooked && !slot.isCancelled) {
        group.availableCount++
      }
    })

    return Array.from(grouped.values()).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const isSunday = (date: Date) => {
    return date.getDay() === 0
  }

  const isDefaultHoliday = (date: Date) => {
    return isSunday(date) && !sundayWorkingEnabled
  }

  const generateTimeSlots = (form: SlotGenerationForm, date: Date) => {
    const slots: TimeSlot[] = []
    const start = new Date(`2000-01-01T${form.shopOpenTime}`)
    const end = new Date(`2000-01-01T${form.shopCloseTime}`)
    const lunchStart = new Date(`2000-01-01T${form.lunchStartTime}`)
    const lunchEnd = new Date(`2000-01-01T${form.lunchEndTime}`)

    for (let i = 1; i <= form.staffCount; i++) {
      let currentTime = new Date(start)
      const staffId = `staff-${i}`
      const staffName = `Staff Member ${i}`

      while (currentTime < end) {
        if (currentTime < lunchStart || currentTime >= lunchEnd) {
          const slotEnd = new Date(currentTime.getTime() + form.slotDuration * 60000)
          if (slotEnd <= end && (slotEnd <= lunchStart || currentTime >= lunchEnd)) {
            slots.push({
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              startTime: currentTime.toTimeString().slice(0, 5),
              endTime: slotEnd.toTimeString().slice(0, 5),
              isBooked: false,
              staffId,
              staffName,
              isCancelled: false,
            })
          }
        }
        currentTime = new Date(currentTime.getTime() + form.slotDuration * 60000)
      }
    }

    return slots
  }

  // Get next available working days (skip holidays)
  const getNextWorkingDays = (startDate: Date, count: number) => {
    const workingDays = []
    const currentDate = new Date(startDate)

    while (workingDays.length < count) {
      const dateKey = getDateKey(currentDate)
      const daySchedule = schedules[dateKey]

      // Check if it's not a holiday and not a Sunday (unless Sunday working is enabled)
      if (!daySchedule?.isHoliday && !isDefaultHoliday(currentDate)) {
        workingDays.push(new Date(currentDate))
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return workingDays
  }

  useEffect(() => {
    if (isSlotGeneratorOpen) {
      const slots = generateTimeSlots(formData, selectedDate)
      setPreviewSlots(slots)
    }
  }, [formData, selectedDate, isSlotGeneratorOpen])

  // Auto-generate slots for the next 3 working days
  useEffect(() => {
    if (autoScheduleEnabled) {
      autoGenerateSlots()
    }
  }, [autoScheduleEnabled, sundayWorkingEnabled])

  // Initialize Sunday holidays
  useEffect(() => {
    const initializeSundayHolidays = () => {
      const today = new Date()
      const newSchedules: Record<string, DaySchedule> = {}

      // Check next 30 days for Sundays
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
        if (isSunday(checkDate)) {
          const dateKey = getDateKey(checkDate)
          newSchedules[dateKey] = {
            slotDate: dateKey,
            slots: [],
            isHoliday: !sundayWorkingEnabled,
            isSundayOverride: false,
          }
        }
      }

      setSchedules((prev) => ({ ...prev, ...newSchedules }))
    }

    initializeSundayHolidays()
  }, [sundayWorkingEnabled])

  const autoGenerateSlots = async () => {
    setIsAutoGenerating(true)

    // Today is 22, generate for 23, 24, 25
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1) // 23rd

    const workingDays = getNextWorkingDays(tomorrow, 3)

    setSchedules((prev) => {
      const newSchedules = { ...prev }
      workingDays.forEach((date) => {
        const dateKey = getDateKey(date)
        // Skip if it's a holiday
        if (!isDefaultHoliday(date) && !prev[dateKey]?.isHoliday) {
          newSchedules[dateKey] = {
            slotDate: dateKey,
            slots: generateTimeSlots(formData, date),
            isHoliday: false,
            isSundayOverride: isSunday(date) ? true : false,
          }
        }
      })
      return newSchedules
    })

    setIsAutoGenerating(false)
  }

  const generateSlotsForDays = () => {
    autoGenerateSlots()
    setIsSlotGeneratorOpen(false)
  }

  const cancelTimeSlot = (slotId: string) => {
    const dateKey = getDateKey(selectedDate)
    setSchedules((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        slots: prev[dateKey]?.slots.map((slot) => (slot.id === slotId ? { ...slot, isCancelled: true } : slot)) || [],
      },
    }))
  }

  const cancelAllSlotsForStaff = (staffId: string) => {
    const dateKey = getDateKey(selectedDate)
    setSchedules((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        slots:
          prev[dateKey]?.slots.map((slot) => (slot.staffId === staffId ? { ...slot, isCancelled: true } : slot)) || [],
      },
    }))
  }

  const cancelStaffForAllDays = (staffId: string) => {
    setSchedules((prev) => {
      const newSchedules = { ...prev }
      Object.keys(newSchedules).forEach((dateKey) => {
        newSchedules[dateKey] = {
          ...newSchedules[dateKey],
          slots: newSchedules[dateKey].slots.map((slot) =>
            slot.staffId === staffId ? { ...slot, isCancelled: true } : slot,
          ),
        }
      })
      return newSchedules
    })
  }

  const cancelAllSlots = () => {
    const dateKey = getDateKey(selectedDate)
    setSchedules((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        slots: prev[dateKey]?.slots.map((slot) => ({ ...slot, isCancelled: true })) || [],
      },
    }))
  }

  const deleteTimeSlot = (slotId: string) => {
    const dateKey = getDateKey(selectedDate)
    setSchedules((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        slots: prev[dateKey]?.slots.filter((slot) => slot.id !== slotId) || [],
      },
    }))
  }

  const toggleHoliday = (date: Date) => {
    const dateKey = getDateKey(date)
    const isSundayDate = isSunday(date)

    setSchedules((prev) => ({
      ...prev,
      [dateKey]: {
        slotDate: dateKey,
        slots: prev[dateKey]?.slots || [],
        isHoliday: !prev[dateKey]?.isHoliday,
        isSundayOverride: isSundayDate ? !prev[dateKey]?.isHoliday : prev[dateKey]?.isSundayOverride,
      },
    }))
  }

  const isDateSelectable = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const maxDate = new Date(tomorrow.getTime() + 30 * 24 * 60 * 60 * 1000)
    return date >= tomorrow && date <= maxDate
  }

  // Get unique staff members from all schedules
  const getAllStaffMembers = () => {
    const staffSet = new Set<string>()
    Object.values(schedules).forEach((schedule) => {
      schedule.slots.forEach((slot) => {
        staffSet.add(slot.staffId)
      })
    })
    return Array.from(staffSet).sort()
  }

  const selectedDateSchedule = schedules[getDateKey(selectedDate)]
  const days = getDaysInMonth(currentDate)
  const allStaff = getAllStaffMembers()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black rounded-lg">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">Schedule Management</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Auto-generated schedule system
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={isHolidaySettingsOpen} onOpenChange={setIsHolidaySettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50 bg-transparent">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Schedule Settings
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-gray-600" />
                        <Label>Auto-Schedule</Label>
                      </div>
                      <Switch checked={autoScheduleEnabled} onCheckedChange={setAutoScheduleEnabled} />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-gray-600" />
                        <Label>Sunday Working</Label>
                      </div>
                      <Switch checked={sundayWorkingEnabled} onCheckedChange={setSundayWorkingEnabled} />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-600" />
                        <Label>Compact View</Label>
                      </div>
                      <Switch checked={compactView} onCheckedChange={setCompactView} />
                    </div>

                    <Button
                      onClick={() => toggleHoliday(selectedDate)}
                      variant={selectedDateSchedule?.isHoliday ? "destructive" : "default"}
                      className="w-full"
                      disabled={!isDateSelectable(selectedDate)}
                    >
                      {selectedDateSchedule?.isHoliday ? "Remove Holiday" : "Mark as Holiday"}
                    </Button>

                    {/* Staff Management Section */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Staff Management
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {allStaff.map((staffId) => (
                          <div key={staffId} className="flex items-center justify-between p-2 bg-white rounded border">
                            <span className="text-sm font-medium">Staff Member {staffId.split("-")[1]}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelStaffForAllDays(staffId)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <UserMinus className="w-3 h-3 mr-1" />
                              Cancel All
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isSlotGeneratorOpen} onOpenChange={setIsSlotGeneratorOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:bg-gray-50 bg-transparent"
                    disabled={isAutoGenerating}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {isAutoGenerating ? "Generating..." : "Generate Slots"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Timer className="w-5 h-5" />
                      Auto Generate Time Slots
                    </DialogTitle>
                  </DialogHeader>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shopOpenTime" className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          Shop Open Time
                        </Label>
                        <Input
                          type="time"
                          id="shopOpenTime"
                          value={formData.shopOpenTime}
                          onChange={(e) => setFormData({ ...formData, shopOpenTime: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shopCloseTime" className="flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          Shop Close Time
                        </Label>
                        <Input
                          type="time"
                          id="shopCloseTime"
                          value={formData.shopCloseTime}
                          onChange={(e) => setFormData({ ...formData, shopCloseTime: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lunchStartTime" className="flex items-center gap-2">
                          <Coffee className="w-4 h-4" />
                          Lunch Start
                        </Label>
                        <Input
                          type="time"
                          id="lunchStartTime"
                          value={formData.lunchStartTime}
                          onChange={(e) => setFormData({ ...formData, lunchStartTime: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lunchEndTime" className="flex items-center gap-2">
                          <Coffee className="w-4 h-4" />
                          Lunch End
                        </Label>
                        <Input
                          type="time"
                          id="lunchEndTime"
                          value={formData.lunchEndTime}
                          onChange={(e) => setFormData({ ...formData, lunchEndTime: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="staffCount" className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Number of Staff
                        </Label>
                        <Select
                          value={formData.staffCount.toString()}
                          onValueChange={(value) => setFormData({ ...formData, staffCount: Number.parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} Staff Member{num > 1 ? "s" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="slotDuration" className="flex items-center gap-2">
                          <Timer className="w-4 h-4" />
                          Slot Duration
                        </Label>
                        <Select
                          value={formData.slotDuration.toString()}
                          onValueChange={(value) => setFormData({ ...formData, slotDuration: Number.parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[15, 30, 45, 60].map((duration) => (
                              <SelectItem key={duration} value={duration.toString()}>
                                {duration} minutes
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Slot Preview ({previewSlots.length} slots)
                      </h4>
                      <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-gray-50 rounded-lg">
                        {previewSlots.length === 0 ? (
                          <p className="text-sm text-gray-500 italic text-center py-4">No slots generated</p>
                        ) : (
                          groupSlotsByTime(previewSlots).map((group, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-sm font-medium">
                                  {group.startTime} - {group.endTime}
                                </span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                <Users className="w-3 h-3 mr-1" />
                                {group.totalCount} staff
                              </Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Auto-generating slots for next 3 working days (skipping holidays)
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={generateSlotsForDays}
                      className="w-full bg-black hover:bg-gray-800"
                      disabled={previewSlots.length === 0 || isAutoGenerating}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {isAutoGenerating ? "Generating..." : "Auto Generate Slots"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Card */}
            <Card className="lg:col-span-2 shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-black" />
                    {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    if (!day) {
                      return <div key={index} className="p-2"></div>
                    }
                    const dateKey = getDateKey(day)
                    const daySchedule = schedules[dateKey]
                    const isSelected = getDateKey(day) === getDateKey(selectedDate)
                    const isToday = getDateKey(day) === getDateKey(new Date())
                    const isSelectable = isDateSelectable(day)
                    const isSundayDate = isSunday(day)
                    const isAutoHoliday = isSundayDate && !sundayWorkingEnabled

                    return (
                      <button
                        key={index}
                        onClick={() => isSelectable && setSelectedDate(day)}
                        className={`p-2 text-sm rounded-lg border transition-all duration-200 relative ${
                          isSelected
                            ? "bg-black text-white border-black shadow-md"
                            : isToday
                              ? "bg-gray-100 border-gray-300 font-medium"
                              : isSelectable
                                ? "hover:bg-gray-50 border-transparent hover:border-gray-200"
                                : "text-gray-400 cursor-not-allowed"
                        } ${daySchedule?.isHoliday || isAutoHoliday ? "bg-red-50 text-red-600 border-red-200" : ""}`}
                        disabled={!isSelectable}
                      >
                        <div className="font-medium">{day.getDate()}</div>
                        {isSundayDate && (
                          <div className="absolute top-0 right-0 w-2 h-2 bg-orange-400 rounded-full"></div>
                        )}
                        {daySchedule?.slots.length > 0 && (
                          <div className="flex justify-center mt-1">
                            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Time Slots Card */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-black" />
                    <div>
                      <div className="text-base">
                        {selectedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      {isSunday(selectedDate) && (
                        <Badge  className="text-xs mt-1">
                          <Sun className="w-3 h-3 mr-1" />
                          Sunday
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {selectedDateSchedule?.slots.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelAllSlots}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                      >
                        <Trash className="w-4 h-4 mr-1" />
                        Cancel All
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                {selectedDateSchedule?.isHoliday || isDefaultHoliday(selectedDate) ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <div className="text-red-600 font-medium">
                      {isSunday(selectedDate) ? "Sunday Holiday" : "Holiday"}
                    </div>
                    <div className="text-sm text-gray-600">No appointments scheduled</div>
                    {isSunday(selectedDate) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSundayWorkingEnabled(true)}
                        className="mt-2"
                      >
                        Enable Sunday Working
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    {["morning", "afternoon", "evening"].map((period) => {
                      const periodSlots = getPeriodSlots(selectedDateSchedule?.slots || [], period)
                      const PeriodIcon = getPeriodIcon(period)

                      if (periodSlots.length === 0) {
                        return (
                          <div key={period}>
                            <h4 className="font-medium text-gray-900 capitalize mb-3 flex items-center gap-2">
                              <PeriodIcon className="w-4 h-4" />
                              {period}
                            </h4>
                            <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg text-center">
                              No slots scheduled
                            </div>
                          </div>
                        )
                      }

                      const groupedSlots = groupSlotsByTime(periodSlots)

                      return (
                        <div key={period}>
                          <h4 className="font-medium text-gray-900 capitalize mb-3 flex items-center gap-2">
                            <PeriodIcon className="w-4 h-4" />
                            {period}
                          </h4>

                          {compactView && formData.staffCount > 2 ? (
                            // Compact view for multiple staff
                            <div className="space-y-2">
                              {groupedSlots.map((group, index) => (
                                <Collapsible key={index}>
                                  <CollapsibleTrigger asChild>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium">
                                          {group.startTime} - {group.endTime}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge className="bg-green-100 text-green-800">
                                          {group.availableCount}/{group.totalCount} available
                                        </Badge>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                      </div>
                                    </div>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="mt-2 ml-4 space-y-1">
                                    {group.staffSlots.map((slot) => {
                                      const StatusIcon = getStatusIcon(slot.isBooked, slot.isCancelled)
                                      return (
                                        <div
                                          key={slot.id}
                                          className="flex items-center justify-between p-2 bg-white rounded border border-gray-100"
                                        >
                                          <div className="flex items-center gap-2">
                                            <Badge  className="text-xs">
                                              <Users className="w-3 h-3 mr-1" />
                                              {slot.staffName || slot.staffId}
                                            </Badge>
                                            <Badge
                                              className={`text-xs ${getStatusColor(slot.isBooked, slot.isCancelled)} flex items-center gap-1`}
                                            >
                                              <StatusIcon className="w-3 h-3" />
                                              {slot.isCancelled ? "Cancelled" : slot.isBooked ? "Booked" : "Available"}
                                            </Badge>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            {!slot.isCancelled && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => cancelTimeSlot(slot.id)}
                                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-6 w-6 p-0"
                                              >
                                                <X className="w-3 h-3" />
                                              </Button>
                                            )}
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => deleteTimeSlot(slot.id)}
                                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      )
                                    })}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => cancelAllSlotsForStaff(group.staffSlots[0]?.staffId)}
                                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 w-full mt-2"
                                    >
                                      <UserX className="w-3 h-3 mr-1" />
                                      Cancel All Staff for This Time
                                    </Button>
                                  </CollapsibleContent>
                                </Collapsible>
                              ))}
                            </div>
                          ) : (
                            // Detailed view for fewer staff or when compact view is disabled
                            <div className="space-y-2">
                              {periodSlots.map((slot) => {
                                const StatusIcon = getStatusIcon(slot.isBooked, slot.isCancelled)
                                return (
                                  <div
                                    key={slot.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium">
                                          {slot.startTime} - {slot.endTime}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          className={`${getStatusColor(slot.isBooked, slot.isCancelled)} flex items-center gap-1`}
                                        >
                                          <StatusIcon className="w-3 h-3" />
                                          {slot.isCancelled ? "Cancelled" : slot.isBooked ? "Booked" : "Available"}
                                        </Badge>
                                        <Badge  className="flex items-center gap-1">
                                          <Users className="w-3 h-3" />
                                          {slot.staffName || slot.staffId}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {!slot.isCancelled && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => cancelTimeSlot(slot.id)}
                                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteTimeSlot(slot.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
