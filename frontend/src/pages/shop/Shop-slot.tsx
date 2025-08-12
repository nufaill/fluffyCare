import React, { useState, useEffect } from "react";
import {
    Settings,
    AlertCircle,
    CalendarDays,
    Building2,
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

interface Staff {
    id: string;
    name: string;
    phone: string;
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
    const [customHolidays, setCustomHolidays] = useState<string[]>([]);
    const [isHolidaySettingsOpen, setIsHolidaySettingsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availability, setAvailability] = useState<ShopAvailability>(defaultAvailability);
    const [newCustomHoliday, setNewCustomHoliday] = useState("");
    const { shopData: shop } = useSelector((state: RootState) => state.shop);

    useEffect(() => {
        console.log('Shop data from Redux:', shop);
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
        if (availability.lunchBreak && (!timeFormat.test(availability.lunchBreak.start || "") || !timeFormat.test(availability.lunchBreak.end || ""))) {
            setError("Invalid lunch break time format (HH:MM required)");
            return;
        }
        // if (availability.teaBreak && (!timeFormat.test(availability.teaBreak.start || "") || !timeFormat.test(availability.teaBreak.end || ""))) {
        //     setError("Invalid tea break time format (HH:MM required)");
        //     return;
        // }
        if (availability.customHolidays?.some(date => !/^\d{4}-\d{2}-\d{2}$/.test(date))) {
            setError("Invalid custom holiday format (YYYY-MM-DD required)");
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
        if (!newCustomHoliday.match(/^\d{4}-\d{2}-\d{2}$/)) {
            setError("Custom holiday must be in YYYY-MM-DD format");
            return;
        }
        if (availability) {
            setAvailability({
                ...availability,
                customHolidays: [...(availability.customHolidays || []), newCustomHoliday],
            });
            setNewCustomHoliday("");
        }
    };

    const handleRemoveCustomHoliday = (date: string) => {
        if (availability) {
            setAvailability({
                ...availability,
                customHolidays: (availability.customHolidays || []).filter(h => h !== date),
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
                                    <DialogContent className="sm:max-w-[600px]">
                                        <DialogHeader>
                                            <DialogTitle>Shop Availability Settings</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-6">
                                            <div>
                                                <Label>Working Days</Label>
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    {daysOfWeek.map(day => (
                                                        <div key={day} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={day}
                                                                checked={availability.workingDays?.includes(day) || false}
                                                                onCheckedChange={() => handleDayToggle(day)}
                                                            />
                                                            <Label htmlFor={day}>{day}</Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="openingTime">Opening Time</Label>
                                                    <Input
                                                        id="openingTime"
                                                        type="time"
                                                        value={availability.openingTime || '10'}
                                                        onChange={e => handleTimeChange('openingTime', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="closingTime">Closing Time</Label>
                                                    <Input
                                                        id="closingTime"
                                                        type="time"
                                                        value={availability.closingTime || ''}
                                                        onChange={e => handleTimeChange('closingTime', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="lunchBreakStart">Lunch Break Start</Label>
                                                    <Input
                                                        id="lunchBreakStart"
                                                        type="time"
                                                        value={availability.lunchBreak?.start || ''}
                                                        onChange={e => handleBreakTimeChange('lunchBreak', 'start', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="lunchBreakEnd">Lunch Break End</Label>
                                                    <Input
                                                        id="lunchBreakEnd"
                                                        type="time"
                                                        value={availability.lunchBreak?.end || ''}
                                                        onChange={e => handleBreakTimeChange('lunchBreak', 'end', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="teaBreakStart">Tea Break Start</Label>
                                                    <Input
                                                        id="teaBreakStart"
                                                        type="time"
                                                        value={availability.teaBreak?.start || ''}
                                                        onChange={e => handleBreakTimeChange('teaBreak', 'start', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="teaBreakEnd">Tea Break End</Label>
                                                    <Input
                                                        id="teaBreakEnd"
                                                        type="time"
                                                        value={availability.teaBreak?.end || ''}
                                                        onChange={e => handleBreakTimeChange('teaBreak', 'end', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label>Custom Holidays (YYYY-MM-DD)</Label>
                                                <div className="flex gap-2 mt-2">
                                                    <Input
                                                        value={newCustomHoliday}
                                                        onChange={e => setNewCustomHoliday(e.target.value)}
                                                        placeholder="YYYY-MM-DD"
                                                    />
                                                    <Button onClick={handleAddCustomHoliday}>Add</Button>
                                                </div>
                                                <div className="mt-2 space-y-2">
                                                    {availability.customHolidays?.map(date => (
                                                        <div key={date} className="flex items-center justify-between">
                                                            <span>{date}</span>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleRemoveCustomHoliday(date)}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <Button
                                                onClick={handleAvailabilityUpdate}
                                                disabled={isLoading}
                                                className="w-full"
                                            >
                                                {isLoading ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </div>
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
                        </div>
                    </div>
                </div>
            </div>
        </PetCareLayout>
    );
};