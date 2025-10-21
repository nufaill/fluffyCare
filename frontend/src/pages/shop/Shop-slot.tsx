import React, { useState, useEffect } from "react";
import {
    Settings,
    AlertCircle,
    CalendarDays,
    Building2,
    Clock,
    Info,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSelector } from "react-redux";
import { Calendar } from "../../components/shop/SlotCalendar";
import { PetCareLayout } from "@/components/layout/PetCareLayout";
import Navbar from "@/components/shop/Navbar";
import { SlotApiService } from "@/services/shop/Islot.service";
import type { Slot } from "@/types/slot.type";
import type { RootState } from "@/redux/store";
import type { ShopAvailability } from "@/types/shop.type";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";

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

const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const defaultAvailability: ShopAvailability = {
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    openingTime: '09:00',
    closingTime: '18:00',
    lunchBreak: { start: '13:00', end: '14:00' },
    teaBreak: { start: '', end: '' },
    customHolidays: [],
};

export const SlotCalendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedules] = useState<DaySchedule[]>([]);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [customHolidays, setCustomHolidays] = useState<NonNullable<ShopAvailability['customHolidays']>>([]);
    const [isHolidaySettingsOpen, setIsHolidaySettingsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availability, setAvailability] = useState<ShopAvailability>(defaultAvailability);
    const [newHolidayDate, setNewHolidayDate] = useState("");
    const [newHolidayStartTime, setNewHolidayStartTime] = useState("");
    const [newHolidayEndTime, setNewHolidayEndTime] = useState("");
    const { shopData: shop } = useSelector((state: RootState) => state.shop);

    useEffect(() => {
        const year = currentDate.getFullYear();
        const fetchHolidays = async () => {
            try {
                const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/IN`);
                if (response.ok) {
                    const data = await response.json();
                    setHolidays(data);
                }
            } catch (err) {
                console.error('Failed to fetch holidays:', err);
            }
        };
        fetchHolidays();
    }, [currentDate.getFullYear()]);

    useEffect(() => {
        if (shop?.id) {
            const fetchAvailability = async () => {
                setIsLoading(true);
                try {
                    const response = await SlotApiService.getShopAvailability(shop.id);
                    setAvailability(response.data);
                    setCustomHolidays(response.data?.customHolidays || []);
                    setError(null);
                } catch (error: any) {
                    console.error('Failed to fetch availability:', error.message);
                    // Set default availability for any error
                    setAvailability(defaultAvailability);
                    setCustomHolidays([]);
                    setError('Failed to load shop availability. Using default settings. Please save to configure.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchAvailability();
        } else {
            // Set default availability if shop.id is missing
            setAvailability(defaultAvailability);
            setCustomHolidays([]);
            setError('Shop ID not found. Using default availability settings.');
        }
    }, [shop?.id]);

    const handleAvailabilityUpdate = async () => {
        if (!shop?.id) {
            setError("Shop ID not found");
            return;
        }
        if (!availability) {
            setError("Availability data not loaded");
            return;
        }

        // Validation
        const timeFormat = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!availability.workingDays?.length) {
            setError("At least one working day must be selected");
            return;
        }
        if (!timeFormat.test(availability.openingTime)) {
            setError("Invalid opening time format (HH:MM required)");
            return;
        }
        if (!timeFormat.test(availability.closingTime)) {
            setError("Invalid closing time format (HH:MM required)");
            return;
        }
        if (availability.lunchBreak && (!timeFormat.test(availability.lunchBreak.start ?? '') || !timeFormat.test(availability.lunchBreak.end ?? ''))) {
            setError("Invalid lunch break time format (HH:MM required)");
            return;
        }
        if (availability.customHolidays?.some(holiday => !/^\d{4}-\d{2}-\d{2}$/.test(holiday.date))) {
            setError("Invalid custom holiday date format (YYYY-MM-DD required)");
            return;
        }
        if (availability.customHolidays?.some(holiday => {
            if (holiday.startTime && !timeFormat.test(holiday.startTime)) return true;
            if (holiday.endTime && !timeFormat.test(holiday.endTime)) return true;
            return false;
        })) {
            setError("Invalid custom holiday time format (HH:MM required)");
            return;
        }

        try {
            setIsLoading(true);
            const response = await SlotApiService.updateShopAvailability(shop.id, availability);
            setAvailability(response.data);
            setCustomHolidays(response.data.customHolidays || []);
            setIsHolidaySettingsOpen(false);
            setError(null);
        } catch (error: any) {
            setError(error.message || "Failed to update shop availability");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCustomHoliday = () => {
        const timeFormat = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!newHolidayDate) {
            setError("Date is required");
            return;
        }
        if (!newHolidayDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            setError("Date must be in YYYY-MM-DD format");
            return;
        }
        if (newHolidayStartTime && !timeFormat.test(newHolidayStartTime)) {
            setError("Invalid start time format (HH:MM required)");
            return;
        }
        if (newHolidayEndTime && !timeFormat.test(newHolidayEndTime)) {
            setError("Invalid end time format (HH:MM required)");
            return;
        }
        if (availability) {
            const startTime = newHolidayStartTime || availability.openingTime;
            const endTime = newHolidayEndTime || availability.closingTime;
            setAvailability({
                ...availability,
                customHolidays: [...(availability.customHolidays || []), { date: newHolidayDate, startTime, endTime }],
            });
            setNewHolidayDate("");
            setNewHolidayStartTime("");
            setNewHolidayEndTime("");
            setError(null);
        }
    };

    const handleRemoveCustomHoliday = (index: number) => {
        if (availability) {
            setAvailability({
                ...availability,
                customHolidays: (availability.customHolidays || []).filter((_, i) => i !== index),
            });
        }
    };

    const handleDayToggle = (day: string) => {
        if (availability) {
            // Ensure workingDays is an array
            const workingDays = Array.isArray(availability.workingDays) ? availability.workingDays : [];
            setAvailability({
                ...availability,
                workingDays: workingDays.includes(day)
                    ? workingDays.filter(d => d !== day)
                    : [...workingDays, day],
            });
        }
    };

    const handleTimeChange = (field: keyof ShopAvailability, value: string) => {
        setAvailability(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleBreakTimeChange = (breakType: 'lunchBreak' | 'teaBreak', field: 'start' | 'end', value: string) => {
        setAvailability(prev => ({
            ...prev,
            [breakType]: {
                ...(prev[breakType] || { start: '', end: '' }),
                [field]: value,
            },
        }));
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
                                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Shop Availability Settings</DialogTitle>
                                        </DialogHeader>
                                        <TooltipProvider>
                                            <div className="space-y-6">
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4" />
                                                            Working Hours
                                                        </CardTitle>
                                                        <CardDescription>Set your shop's daily operating hours.</CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div>
                                                                <Label htmlFor="openingTime" className="flex items-center gap-1">
                                                                    Opening Time
                                                                    <Tooltip>
                                                                        <TooltipTrigger><Info className="w-3 h-3" /></TooltipTrigger>
                                                                        <TooltipContent>Shop opens at this time daily</TooltipContent>
                                                                    </Tooltip>
                                                                </Label>
                                                                <Input
                                                                    id="openingTime"
                                                                    type="time"
                                                                    value={availability.openingTime}
                                                                    onChange={e => handleTimeChange('openingTime', e.target.value)}
                                                                    placeholder="09:00"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="closingTime" className="flex items-center gap-1">
                                                                    Closing Time
                                                                    <Tooltip>
                                                                        <TooltipTrigger><Info className="w-3 h-3" /></TooltipTrigger>
                                                                        <TooltipContent>Shop closes at this time daily</TooltipContent>
                                                                    </Tooltip>
                                                                </Label>
                                                                <Input
                                                                    id="closingTime"
                                                                    type="time"
                                                                    value={availability.closingTime}
                                                                    onChange={e => handleTimeChange('closingTime', e.target.value)}
                                                                    placeholder="18:00"
                                                                />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <CalendarDays className="w-4 h-4" />
                                                            Working Days
                                                        </CardTitle>
                                                        <CardDescription>Select the days your shop is open.</CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {daysOfWeek.map(day => (
                                                                <div key={day} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={day}
                                                                        checked={availability.workingDays?.includes(day) || false}
                                                                        onCheckedChange={() => handleDayToggle(day)}
                                                                    />
                                                                    <Label htmlFor={day} className="cursor-pointer">{day}</Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4" />
                                                            Break Times
                                                        </CardTitle>
                                                        <CardDescription>Define break periods during working hours.</CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div>
                                                            <Label className="text-sm font-medium">Lunch Break</Label>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                                                <div>
                                                                    <Label htmlFor="lunchBreakStart" className="text-xs text-gray-500">Start</Label>
                                                                    <Input
                                                                        id="lunchBreakStart"
                                                                        type="time"
                                                                        value={availability.lunchBreak?.start || ''}
                                                                        onChange={e => handleBreakTimeChange('lunchBreak', 'start', e.target.value)}
                                                                        placeholder="13:00"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label htmlFor="lunchBreakEnd" className="text-xs text-gray-500">End</Label>
                                                                    <Input
                                                                        id="lunchBreakEnd"
                                                                        type="time"
                                                                        value={availability.lunchBreak?.end || ''}
                                                                        onChange={e => handleBreakTimeChange('lunchBreak', 'end', e.target.value)}
                                                                        placeholder="14:00"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <Label className="text-sm font-medium">Tea Break (Optional)</Label>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                                                <div>
                                                                    <Label htmlFor="teaBreakStart" className="text-xs text-gray-500">Start</Label>
                                                                    <Input
                                                                        id="teaBreakStart"
                                                                        type="time"
                                                                        value={availability.teaBreak?.start || ''}
                                                                        onChange={e => handleBreakTimeChange('teaBreak', 'start', e.target.value)}
                                                                        placeholder="16:00"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label htmlFor="teaBreakEnd" className="text-xs text-gray-500">End</Label>
                                                                    <Input
                                                                        id="teaBreakEnd"
                                                                        type="time"
                                                                        value={availability.teaBreak?.end || ''}
                                                                        onChange={e => handleBreakTimeChange('teaBreak', 'end', e.target.value)}
                                                                        placeholder="16:15"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <CalendarDays className="w-4 h-4" />
                                                            Custom Holidays
                                                        </CardTitle>
                                                        <CardDescription>Add specific dates that are closed, with optional time ranges. Defaults to full day (opening to closing).</CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            <div className="flex-1">
                                                                <Label htmlFor="holidayDate" className="flex items-center gap-1">
                                                                    Date
                                                                    <Tooltip>
                                                                        <TooltipTrigger><Info className="w-3 h-3" /></TooltipTrigger>
                                                                        <TooltipContent>Click to open calendar picker</TooltipContent>
                                                                    </Tooltip>
                                                                </Label>
                                                                <Input
                                                                    id="holidayDate"
                                                                    type="date"
                                                                    value={newHolidayDate}
                                                                    onChange={e => setNewHolidayDate(e.target.value)}
                                                                    placeholder="Select Date"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label htmlFor="holidayStartTime">Start Time (Optional)</Label>
                                                                <Input
                                                                    id="holidayStartTime"
                                                                    type="time"
                                                                    value={newHolidayStartTime}
                                                                    onChange={e => setNewHolidayStartTime(e.target.value)}
                                                                    placeholder="09:00"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label htmlFor="holidayEndTime">End Time (Optional)</Label>
                                                                <Input
                                                                    id="holidayEndTime"
                                                                    type="time"
                                                                    value={newHolidayEndTime}
                                                                    onChange={e => setNewHolidayEndTime(e.target.value)}
                                                                    placeholder="18:00"
                                                                />
                                                            </div>
                                                            <div className="flex items-end">
                                                                <Button type="button" onClick={handleAddCustomHoliday} variant="secondary" className="h-10">Add</Button>
                                                            </div>
                                                        </div>
                                                        <div className="max-h-40 overflow-y-auto space-y-2">
                                                            {availability.customHolidays?.map((holiday, index) => (
                                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                    <div className="flex items-center gap-2">
                                                                        <CalendarDays className="w-4 h-4 text-gray-500" />
                                                                        <span className="text-sm font-medium">{holiday.date}</span>
                                                                        {holiday.startTime && (
                                                                            <span className="text-xs text-gray-600">({holiday.startTime} - {holiday.endTime})</span>
                                                                        )}
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleRemoveCustomHoliday(index)}
                                                                        className="text-red-500 hover:text-red-700 p-1"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            )) || null}
                                                        </div>
                                                        {availability.customHolidays?.length === 0 && (
                                                            <p className="text-sm text-gray-500 text-center py-4">No custom holidays added yet.</p>
                                                        )}
                                                    </CardContent>
                                                </Card>

                                                <Button
                                                    onClick={handleAvailabilityUpdate}
                                                    disabled={isLoading}
                                                    className="w-full"
                                                >
                                                    {isLoading ? "Saving..." : "Save Changes"}
                                                </Button>
                                            </div>
                                        </TooltipProvider>
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
                                customHolidays={customHolidays.map(h => h.date)}
                                isLoading={isLoading}
                                error={error}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </PetCareLayout>
    );
};