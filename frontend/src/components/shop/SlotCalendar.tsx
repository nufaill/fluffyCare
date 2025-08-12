// shop side calendar

import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";

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

interface DaySchedule {
  date: string;
  timeSlots: any[];
  isHoliday?: boolean;
}

interface CalendarProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  schedules: DaySchedule[];
  holidays: Holiday[];
  customHolidays: string[]; // Add custom holidays prop
  isLoading: boolean;
  error: string | null;
}

export function Calendar({
  currentDate,
  setCurrentDate,
  setSelectedDate,
  schedules,
  holidays,
  customHolidays,
  isLoading,
  error,
}: CalendarProps) {
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const days = [];
    
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-full h-24"></div>);
    }

    for (let i = 1; i <= numDays; i++) {
      const date = new Date(year, month, i);
      const formattedDate = date.toLocaleDateString("en-CA"); // yyyy-mm-dd
      const daySchedule = schedules.find((s) => s.date === formattedDate);
      const isToday = date.toDateString() === new Date().toDateString();
      const isPast = isPastDate(date);
      
      const nationalHolidays = holidays.filter(
        (holiday) => holiday.date.iso === formattedDate && holiday.primary_type === "national"
      );
      const otherHolidays = holidays.filter(
        (holiday) => holiday.date.iso === formattedDate && holiday.primary_type !== "national"
      );
      const isCustomHoliday = customHolidays.includes(formattedDate);

      days.push(
        <div
          key={formattedDate}
          className={`w-full h-24 p-2 border rounded-md ${
            isToday ? "bg-blue-100" : ""
          } ${isPast ? "bg-gray-200 cursor-not-allowed" : "cursor-pointer hover:bg-gray-100"} transition-colors`}
          onClick={() => !isPast && setSelectedDate(date)}
        >
          <div className="font-bold text-lg flex justify-between items-center">
            {i}
            {nationalHolidays.length > 0 && <Badge className="ml-2">Holiday</Badge>}
            {otherHolidays.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                Event
              </Badge>
            )}
            {isCustomHoliday && <Badge  className="ml-2">Custom Holiday</Badge>}
          </div>
          {nationalHolidays.map((holiday, idx) => (
            <p key={`national-holiday-${idx}`} className="text-sm text-red-600 truncate">
              {holiday.name}
            </p>
          ))}
          {otherHolidays.map((holiday, idx) => (
            <p key={`other-holiday-${idx}`} className="text-sm text-gray-600 truncate">
              {holiday.name}
            </p>
          ))}
          {daySchedule && (
            <div className="text-sm text-gray-600">
              {daySchedule.timeSlots.length} slot{daySchedule.timeSlots.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <Card className="lg:col-span-2 shadow-sm border-gray-200">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-black" />
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
              className="border-gray-300 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
              className="border-gray-300 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {error && (
          <div className="bg-red-50 p-4 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <CalendarIcon className="w-4 h-4 animate-spin" />
              Loading slots...
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
          </>
        )}
      </CardContent>
    </Card>
  );
}