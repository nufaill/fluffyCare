"use client"

import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus, Trash2, Settings, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface TimeSlot {
  id: string
  time: string
  duration: number
  service: string
  status: "available" | "booked" | "blocked"
  period: "morning" | "afternoon" | "evening"
}

interface DaySchedule {
  date: string
  slots: TimeSlot[]
  isHoliday: boolean
}

export function ScheduleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [schedules, setSchedules] = useState<Record<string, DaySchedule>>({})
  const [isCreateSlotOpen, setIsCreateSlotOpen] = useState(false)
  const [isHolidaySettingsOpen, setIsHolidaySettingsOpen] = useState(false)
  const [autoScheduleEnabled, setAutoScheduleEnabled] = useState(false)

  const services = ["Grooming", "Puppy Training", "Bath & Brush", "Nail Trimming"]
  const durations = [
    { value: 1, label: "1 Hour" },
    { value: 1.5, label: "1.5 Hours" },
    { value: 2, label: "2 Hours" },
  ]

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

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "booked":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "blocked":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPeriodSlots = (slots: TimeSlot[], period: string) => {
    return slots.filter((slot) => slot.period === period)
  }

  const createTimeSlot = (slotData: any) => {
    const dateKey = getDateKey(selectedDate)
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      time: slotData.time,
      duration: Number.parseFloat(slotData.duration),
      service: slotData.service,
      status: "available",
      period: slotData.period,
    }

    setSchedules((prev) => ({
      ...prev,
      [dateKey]: {
        date: dateKey,
        slots: [...(prev[dateKey]?.slots || []), newSlot],
        isHoliday: prev[dateKey]?.isHoliday || false,
      },
    }))
    setIsCreateSlotOpen(false)
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
    setSchedules((prev) => ({
      ...prev,
      [dateKey]: {
        date: dateKey,
        slots: prev[dateKey]?.slots || [],
        isHoliday: !prev[dateKey]?.isHoliday,
      },
    }))
  }

  const autoScheduleDay = () => {
    const dateKey = getDateKey(selectedDate)
    const defaultSlots: TimeSlot[] = [
      // Morning slots
      {
        id: `${Date.now()}-1`,
        time: "09:00",
        duration: 1,
        service: "Grooming",
        status: "available",
        period: "morning",
      },
      {
        id: `${Date.now()}-2`,
        time: "10:30",
        duration: 1.5,
        service: "Puppy Training",
        status: "available",
        period: "morning",
      },
      // Afternoon slots
      {
        id: `${Date.now()}-3`,
        time: "13:00",
        duration: 1,
        service: "Bath & Brush",
        status: "available",
        period: "afternoon",
      },
      {
        id: `${Date.now()}-4`,
        time: "14:30",
        duration: 2,
        service: "Grooming",
        status: "available",
        period: "afternoon",
      },
      // Evening slots
      {
        id: `${Date.now()}-5`,
        time: "17:00",
        duration: 1,
        service: "Nail Trimming",
        status: "available",
        period: "evening",
      },
      {
        id: `${Date.now()}-6`,
        time: "18:30",
        duration: 1.5,
        service: "Puppy Training",
        status: "available",
        period: "evening",
      },
    ]

    setSchedules((prev) => ({
      ...prev,
      [dateKey]: {
        date: dateKey,
        slots: defaultSlots,
        isHoliday: false,
      },
    }))
  }

  const selectedDateSchedule = schedules[getDateKey(selectedDate)]
  const days = getDaysInMonth(currentDate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black">Schedule Management</h1>
          <p className="text-gray-600">Manage your service appointments and availability</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isHolidaySettingsOpen} onOpenChange={setIsHolidaySettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Holidays
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Holiday Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Auto-Schedule</Label>
                  <Switch checked={autoScheduleEnabled} onCheckedChange={setAutoScheduleEnabled} />
                </div>
                <Button
                  onClick={() => toggleHoliday(selectedDate)}
                  variant={selectedDateSchedule?.isHoliday ? "destructive" : "default"}
                  className="w-full"
                >
                  {selectedDateSchedule?.isHoliday ? "Remove Holiday" : "Mark as Holiday"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={autoScheduleDay} variant="outline" size="sm">
            <Zap className="w-4 h-4 mr-2" />
            Auto Schedule
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      isSelected
                        ? "bg-black text-white border-black"
                        : isToday
                          ? "bg-gray-100 border-gray-300"
                          : "hover:bg-gray-50 border-transparent"
                    } ${daySchedule?.isHoliday ? "bg-red-50 text-red-600" : ""}`}
                  >
                    <div className="font-medium">{day.getDate()}</div>
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

        {/* Day Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </CardTitle>
              <Dialog open={isCreateSlotOpen} onOpenChange={setIsCreateSlotOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Slot
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Time Slot</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      createTimeSlot({
                        time: formData.get("time"),
                        duration: formData.get("duration"),
                        service: formData.get("service"),
                        period: formData.get("period"),
                      })
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input type="time" name="time" required />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Select name="duration" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map((duration) => (
                            <SelectItem key={duration.value} value={duration.value.toString()}>
                              {duration.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="service">Service</Label>
                      <Select name="service" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="period">Period</Label>
                      <Select name="period" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">
                      Create Slot
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDateSchedule?.isHoliday ? (
              <div className="text-center py-8">
                <div className="text-red-600 font-medium">Holiday</div>
                <div className="text-sm text-gray-600">No appointments scheduled</div>
              </div>
            ) : (
              <>
                {["morning", "afternoon", "evening"].map((period) => {
                  const periodSlots = getPeriodSlots(selectedDateSchedule?.slots || [], period)

                  return (
                    <div key={period}>
                      <h4 className="font-medium text-gray-900 capitalize mb-2">{period}</h4>
                      {periodSlots.length === 0 ? (
                        <div className="text-sm text-gray-500 italic">No slots scheduled</div>
                      ) : (
                        <div className="space-y-2">
                          {periodSlots.map((slot) => (
                            <div key={slot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{slot.time}</span>
                                  <Badge  className={getStatusColor(slot.status)}>
                                    {slot.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {slot.service} • {slot.duration}h
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTimeSlot(slot.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
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
  )
}
