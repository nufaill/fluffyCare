import React from "react";
import { useState, useEffect } from "react";
import {
  Settings,
  Zap,
  Users,
  Coffee,
  Sun,
  Moon,
  AlertCircle,
  CalendarDays,
  Timer,
  Building2,
  Eye,
  UserMinus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/Badge";
import { Clock } from "lucide-react";
import { SlotApiService } from "@/services/shop/Islot.service";
import type { Slot } from "@/types/slot.type";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { Calendar } from "../../components/shop/SlotCalendar";
import { SlotManagement } from "../../components/shop/SlotManager";
import { PetCareLayout } from "@/components/layout/PetCareLayout";
import Navbar from "@/components/shop/Navbar";

// Define TimeSlot and DaySchedule to match SlotManager.tsx
interface TimeSlot extends Slot {
  staffName?: string;
}

interface DaySchedule {
  date: string;
  timeSlots: TimeSlot[];
  isHoliday?: boolean;
}

interface Holiday {
  name: string;
  description: string;
  date: {
    iso: string;
    datetime: {
      year: number;
      month: number;
      day: number;
    };
  };
  type: string;
  primary_type: string;
  url: string;
}

interface FormData {
  shopOpenTime: string;
  shopCloseTime: string;
  lunchStartTime: string;
  lunchEndTime: string;
  staffCount: number;
  slotDuration: number;
}

interface Staff {
  id: string;
  name: string;
  phone: string;
}

export const SlotCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [customHolidays, setCustomHolidays] = useState<string[]>([]); // Store custom holiday dates
  const [isHolidaySettingsOpen, setIsHolidaySettingsOpen] = useState(false);
  const [isSlotGeneratorOpen, setIsSlotGeneratorOpen] = useState(false);
  const [autoScheduleEnabled, setAutoScheduleEnabled] = useState(true);
  const [sundayWorkingEnabled, setSundayWorkingEnabled] = useState(false);
  const [mondayWorkingEnabled, setMondayWorkingEnabled] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    shopOpenTime: "09:00",
    shopCloseTime: "17:00",
    lunchStartTime: "13:00",
    lunchEndTime: "14:00",
    staffCount: 2,
    slotDuration: 30,
  });
  const [previewSlots, setPreviewSlots] = useState<TimeSlot[]>([]);
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [lastGeneratedDate, setLastGeneratedDate] = useState<string | null>(null); // Track last generated batch
  const { shopData: shop } = useSelector((state: RootState) => state.shop);
  const shopId = shop?.id || "";

  useEffect(() => {
    const fetchStaff = async () => {
      if (!shopId) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await SlotApiService.getStaffByShop(shopId);
        if (response.success) {
          const staffList = response.data.staff.map((staff) => ({
            id: staff._id,
            name: staff.name,
            phone: staff.phone,
          }));
          setAllStaff(staffList);
          setFormData((prev) => ({ ...prev, staffCount: response.data.count }));
        }
      } catch (error: any) {
        setError(error.message || "Failed to fetch staff. Using default staff count.");
        setAllStaff([
          { id: "staff-1", name: "Staff 1", phone: "" },
          { id: "staff-2", name: "Staff 2", phone: "" },
        ]);
        setFormData((prev) => ({ ...prev, staffCount: 2 }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, [shopId]);

  useEffect(() => {
    const fetchHolidays = async () => {
      const year = currentDate.getFullYear();
      const country = "IN";
      const apiKey = "dIKMT6izOh7ItHgFAJjdiw0Y7Usum1Lx";
      const apiUrl = `https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=${country}&year=${year}&type=national`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.response && data.response.holidays) {
          setHolidays(data.response.holidays);
        }
      } catch (error) {
        console.error("Error fetching holidays:", error);
        setError("Failed to fetch holidays. Please try again later.");
      }
    };

    fetchHolidays();
  }, [currentDate]);

  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const startDate = new Date(year, month, 1).toISOString().split("T")[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

        const response = await SlotApiService.getSlotsByShopAndDateRange(shopId, { startDate, endDate });
        if (response.success) {
          const newSchedules = response.data.reduce((acc: DaySchedule[], slot: Slot) => {
            const date = slot.slotDate;
            const existingSchedule = acc.find((s) => s.date === date);
            const staff = allStaff.find((s) => s.id === slot.staffId?.toString()) || {
              id: slot.staffId?.toString() || `staff-unknown`,
              name: slot.staffId?.name || `Unknown Staff`,
              phone: "",
            };
            const timeSlot: TimeSlot = {
              ...slot,
              staffName: staff.name,
            };

            if (existingSchedule) {
              existingSchedule.timeSlots.push(timeSlot);
            } else {
              acc.push({
                date,
                timeSlots: [timeSlot],
                isHoliday: customHolidays.includes(date),
              });
            }
            return acc;
          }, []);
          setSchedules(newSchedules);
        }
      } catch (error: any) {
        setError(error.message || "Failed to fetch slots. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (allStaff.length > 0) {
      fetchSlots();
    }
  }, [currentDate, shopId, allStaff, customHolidays]);

  useEffect(() => {
    const generatePreviewSlots = () => {
      const slots: TimeSlot[] = [];
      const { shopOpenTime, shopCloseTime, lunchStartTime, lunchEndTime, slotDuration } = formData;

      const openTime = new Date(`2023-01-01T${shopOpenTime}`);
      const closeTime = new Date(`2023-01-01T${shopCloseTime}`);
      const lunchStart = new Date(`2023-01-01T${lunchStartTime}`);
      const lunchEnd = new Date(`2023-01-01T${lunchEndTime}`);

      let currentTime = new Date(openTime);
      while (currentTime < closeTime) {
        if (currentTime < lunchStart || currentTime >= lunchEnd) {
          for (const staff of allStaff) {
            const startTime = currentTime.toTimeString().slice(0, 5);
            const endTime = new Date(currentTime.getTime() + slotDuration * 60000).toTimeString().slice(0, 5);
            slots.push({
              shopId,
              staffId: staff.id,
              slotDate: "",
              startTime,
              endTime,
              durationInMinutes: slotDuration,
              isBooked: false,
              isActive: true,
              staffName: staff.name,
            });
          }
        }
        currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
      }
      setPreviewSlots(slots);
    };

    generatePreviewSlots();
  }, [formData, shopId, allStaff]);

  const isSunday = (date: Date) => date.getDay() === 0;
  const isMonday = (date: Date) => date.getDay() === 1;
  const isDefaultHoliday = (date: Date) => {
    const isSundayHoliday = isSunday(date) && !sundayWorkingEnabled;
    const isMondayHoliday = isMonday(date) && !mondayWorkingEnabled;
    return isSundayHoliday || isMondayHoliday;
  };

  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const isWithinAutoGenerationWindow = (date: Date) => {
    if (!lastGeneratedDate) return false;
    const lastDate = new Date(lastGeneratedDate);
    const threeDaysFromLast = new Date(lastDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    return date >= lastDate && date <= threeDaysFromLast;
  };

  const getDateKey = (date: Date) => date.toISOString().split("T")[0];

  const selectedDateSchedule = schedules.find((s) => s.date === getDateKey(selectedDate));

  const groupSlotsByTime = (slots: TimeSlot[]) => {
    const grouped: { startTime: string; endTime: string; totalCount: number; availableCount: number; staffSlots: TimeSlot[] }[] = [];
    const timeMap = new Map<string, TimeSlot[]>();

    slots.forEach((slot) => {
      const key = `${slot.startTime}-${slot.endTime}`;
      if (!timeMap.has(key)) {
        timeMap.set(key, []);
      }
      timeMap.get(key)!.push(slot);
    });

    timeMap.forEach((staffSlots, key) => {
      const [startTime, endTime] = key.split("-");
      grouped.push({
        startTime,
        endTime,
        totalCount: staffSlots.length,
        availableCount: staffSlots.filter((slot) => !slot.isBooked && slot.isActive).length,
        staffSlots,
      });
    });

    return grouped.sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const toggleHoliday = async (date: Date) => {
    const dateKey = getDateKey(date);
    setCustomHolidays((prev) => {
      if (prev.includes(dateKey)) {
        return prev.filter((d) => d !== dateKey);
      }
      return [...prev, dateKey];
    });
    setSchedules((prev) => {
      const existing = prev.find((s) => s.date === dateKey);
      if (existing) {
        return prev.map((s) => (s.date === dateKey ? { ...s, isHoliday: !s.isHoliday } : s));
      }
      return [...prev, { date: dateKey, timeSlots: [], isHoliday: true }];
    });
  };

  const toggleHideTimeSlot = async (slotId: string) => {
    try {
      const slot = schedules.flatMap((s) => s.timeSlots).find((s) => s._id === slotId);
      if (slot) {
        const response = await SlotApiService.updateSlot(slotId, { isActive: !slot.isActive });
        if (response.success) {
          setSchedules((prev) =>
            prev.map((schedule) => ({
              ...schedule,
              timeSlots: schedule.timeSlots.map((s) =>
                s._id === slotId ? { ...s, isActive: response.data.isActive } : s
              ),
            }))
          );
        }
      }
    } catch (error: any) {
      setError(error.message || "Failed to update slot. Please try again.");
    }
  };

  const deleteTimeSlot = async (slotId: string) => {
    try {
      const response = await SlotApiService.deleteSlot(slotId);
      if (response.success) {
        setSchedules((prev) =>
          prev.map((schedule) => ({
            ...schedule,
            timeSlots: schedule.timeSlots.filter((slot) => slot._id !== slotId),
          }))
        );
      }
    } catch (error: any) {
      setError(error.message || "Failed to delete slot. Please try again.");
    }
  };

  const toggleHideAllSlots = async () => {
    const dateKey = getDateKey(selectedDate);
    try {
      const schedule = schedules.find((s) => s.date === dateKey);
      if (!schedule) return;

      const allActive = schedule.timeSlots.every((slot) => slot.isActive);
      const updates = schedule.timeSlots.map((slot) =>
        SlotApiService.updateSlot(slot._id!, { isActive: !allActive })
      );
      await Promise.all(updates);

      setSchedules((prev) =>
        prev.map((schedule) => {
          if (schedule.date !== dateKey) return schedule;
          return {
            ...schedule,
            timeSlots: schedule.timeSlots.map((slot) => ({
              ...slot,
              isActive: !allActive,
            })),
          };
        })
      );
    } catch (error: any) {
      setError(error.message || "Failed to update slots. Please try again.");
    }
  };

  const toggleHideAllSlotsForStaff = async (staffId: string) => {
    const dateKey = getDateKey(selectedDate);
    try {
      const schedule = schedules.find((s) => s.date === dateKey);
      if (!schedule) return;

      const staffSlots = schedule.timeSlots.filter((slot) => slot.staffId === staffId);
      const allActive = staffSlots.every((slot) => slot.isActive);
      const updates = staffSlots.map((slot) =>
        SlotApiService.updateSlot(slot._id!, { isActive: !allActive })
      );
      await Promise.all(updates);

      setSchedules((prev) =>
        prev.map((schedule) => {
          if (schedule.date !== dateKey) return schedule;
          return {
            ...schedule,
            timeSlots: schedule.timeSlots.map((slot) =>
              slot.staffId === staffId ? { ...slot, isActive: !allActive } : slot
            ),
          };
        })
      );
    } catch (error: any) {
      setError(error.message || "Failed to update slots. Please try again.");
    }
  };

  const toggleHideStaffForAllDays = async (staffId: string) => {
    try {
      const staffSlots = schedules.flatMap((s) => s.timeSlots).filter(
        (slot) => slot.staffId === staffId
      );
      const allActive = staffSlots.every((slot) => slot.isActive);
      const updates = staffSlots.map((slot) =>
        SlotApiService.updateSlot(slot._id!, { isActive: !allActive })
      );
      await Promise.all(updates);

      setSchedules((prev) =>
        prev.map((schedule) => ({
          ...schedule,
          timeSlots: schedule.timeSlots.map((slot) =>
            slot.staffId === staffId ? { ...slot, isActive: !allActive } : slot
          ),
        }))
      );
    } catch (error: any) {
      setError(error.message || "Failed to update slots. Please try again.");
    }
  };

  const generateSlotsForDays = async () => {
    setIsAutoGenerating(true);
    setError(null);
    try {
      const newSchedules: DaySchedule[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateKey = getDateKey(selectedDate);

      // Check if selected date already has slots
      if (schedules.some((s) => s.date === selectedDateKey && s.timeSlots.length > 0)) {
        setError("Slots already exist for the selected date.");
        setIsAutoGenerating(false);
        return;
      }

      // Check if within existing batch window
      if (lastGeneratedDate && isWithinAutoGenerationWindow(selectedDate)) {
        setError("Cannot generate new slots until the current 3-day batch is complete.");
        setIsAutoGenerating(false);
        return;
      }

      // Find next 3 working days
      const workingDays: Date[] = [];
      let currentDate = new Date(selectedDate);
      while (workingDays.length < 3) {
        const dateKey = getDateKey(currentDate);
        if (
          isDateSelectable(currentDate) &&
          !isDefaultHoliday(currentDate) &&
          !holidays.some((h) => h.date.iso === dateKey) &&
          !customHolidays.includes(dateKey) &&
          !schedules.some((s) => s.date === dateKey && s.timeSlots.length > 0)
        ) {
          workingDays.push(new Date(currentDate));
        }
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      }

      // Generate slots for each working day
      for (const date of workingDays) {
        const dateKey = getDateKey(date);
        const createdSlots: TimeSlot[] = [];
        for (const slot of previewSlots) {
          const response = await SlotApiService.createSlot({
            ...slot,
            slotDate: dateKey,
          });
          if (response.success) {
            const staff = allStaff.find((s) => s.id === response.data.staffId?.toString()) || {
              id: response.data.staffId?.toString() || `staff-unknown`,
              name: response.data.staffId?.name || `Unknown Staff`,
              phone: "",
            };
            createdSlots.push({
              ...response.data,
              staffName: staff.name,
            });
          }
        }

        newSchedules.push({
          date: dateKey,
          timeSlots: createdSlots,
          isHoliday: false,
        });
      }

      setSchedules((prev) => {
        const updated = [...prev];
        newSchedules.forEach((newSchedule) => {
          const existingIndex = updated.findIndex((s) => s.date === newSchedule.date);
          if (existingIndex >= 0) {
            updated[existingIndex] = newSchedule;
          } else {
            updated.push(newSchedule);
          }
        });
        return updated;
      });

      // Update last generated date to the last working day
      setLastGeneratedDate(getDateKey(workingDays[workingDays.length - 1]));
    } catch (error: any) {
      setError(error.message || "Failed to generate slots. Please try again.");
    } finally {
      setIsAutoGenerating(false);
    }
  };

  return (
    <PetCareLayout>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="bg-red-50 p-4 rounded-lg mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="space-y-6">
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
                          <Sun className="w-4 h-4 text-gray-600" />
                          <Label>Monday Working</Label>
                        </div>
                        <Switch checked={mondayWorkingEnabled} onCheckedChange={setMondayWorkingEnabled} />
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
                        variant={selectedDateSchedule?.isHoliday || customHolidays.includes(getDateKey(selectedDate)) ? "destructive" : "default"}
                        className="w-full"
                        disabled={!isDateSelectable(selectedDate)}
                      >
                        {selectedDateSchedule?.isHoliday || customHolidays.includes(getDateKey(selectedDate)) ? "Remove Holiday" : "Mark as Holiday"}
                      </Button>

                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Staff Management
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {allStaff.map((staff) => (
                            <div key={staff.id} className="flex items-center justify-between p-2 bg-white rounded border">
                              <span className="text-sm font-medium">{staff.name}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleHideStaffForAllDays(staff.id)}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              >
                                <UserMinus className="w-3 h-3 mr-1" />
                                Toggle Hide All
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
                      disabled={isAutoGenerating || isLoading || (lastGeneratedDate && isWithinAutoGenerationWindow(selectedDate)) || schedules.some((s) => s.date === getDateKey(selectedDate) && s.timeSlots.length > 0)}
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
                            onValueChange={(value) => setFormData({ ...formData, staffCount: parseInt(value) })}
                            disabled
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {allStaff.map((_, index) => (
                                <SelectItem key={index + 1} value={(index + 1).toString()}>
                                  {index + 1} Staff Member{index + 1 > 1 ? "s" : ""}
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
                            onValueChange={(value) => setFormData({ ...formData, slotDuration: parseInt(value) })}
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
                        <p className="text-sm text-blue-800 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Auto-generating slots for next 3 working days starting from {selectedDate.toLocaleDateString()}
                        </p>
                      </div>

                      <Button
                        type="button"
                        onClick={generateSlotsForDays}
                        className="w-full bg-black hover:bg-gray-800"
                        disabled={previewSlots.length === 0 || isAutoGenerating || isLoading}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        {isAutoGenerating ? "Generating..." : "Auto Generate Slots"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Calendar
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                schedules={schedules}
                holidays={holidays}
                customHolidays={customHolidays}
                isLoading={isLoading}
                error={error}
              />

              <SlotManagement
                selectedDate={selectedDate}
                selectedDateSchedule={selectedDateSchedule}
                compactView={compactView}
                formData={formData}
                isLoading={isLoading}
                sundayWorkingEnabled={sundayWorkingEnabled}
                mondayWorkingEnabled={mondayWorkingEnabled}
                isWithinAutoGenerationWindow={isWithinAutoGenerationWindow}
                toggleHoliday={toggleHoliday}
                toggleHideTimeSlot={toggleHideTimeSlot}
                deleteTimeSlot={deleteTimeSlot}
                toggleHideAllSlots={toggleHideAllSlots}
                toggleHideAllSlotsForStaff={toggleHideAllSlotsForStaff}
              />
            </div>
          </div>
        </div>
      </div>
    </PetCareLayout>
  );
};