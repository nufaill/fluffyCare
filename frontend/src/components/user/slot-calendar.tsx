import { CalendarIcon, ChevronLeft, ChevronRight, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";

interface TimeSlot {
  _id: string;
  shopId: string;
  staffId: { _id: string; name: string; phone: string } | string;
  slotDate: string;
  startTime: string;
  endTime: string;
  durationInMinutes: number;
}

interface Holiday {
  name: string;
  description: string;
  date: { iso: string; datetime: { year: number; month: number; day: number } };
  type: string;
  primary_type: string;
}

interface ShopAvailability {
  workingDays: string[]
  openingTime: string
  closingTime: string
  lunchBreak: { start: string; end: string }
  teaBreak: { start: string; end: string }
  customHolidays: string[] 
}

interface SlotCalendarProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  holidays: Holiday[];
  isLoading: boolean;
  shopAvailability?: ShopAvailability; 
}

export function SlotCalendar({
  currentDate,
  setCurrentDate,
  selectedDate,
  setSelectedDate,
  holidays,
  isLoading,
  shopAvailability,
}: SlotCalendarProps) {
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    
    if (dateToCheck < today) {
      return false;
    }
    
    const dateStr = dateToCheck.toISOString().split('T')[0]; 
    if (shopAvailability?.customHolidays?.includes(dateStr)) {
      return false; 
    }
    
    if (shopAvailability?.workingDays) {
      const dayName = dateToCheck.toLocaleDateString("en-US", { weekday: "long" });
      if (!shopAvailability.workingDays.includes(dayName)) {
        return false; 
      }
    }
    
    return true;
  };

  const getHolidayInfo = (date: string) => {
    const nationalHoliday = holidays.find((holiday) => holiday.date.iso === date);
    if (nationalHoliday) {
      return {
        ...nationalHoliday,
        isCustom: false
      };
    }
    
    if (shopAvailability?.customHolidays?.includes(date)) {
      return {
        name: "Shop Closed",
        description: "This shop is closed on this day",
        date: { iso: date, datetime: { year: 0, month: 0, day: 0 } },
        type: "custom",
        primary_type: "custom",
        isCustom: true
      };
    }
    
    return null;
  };

  const isWorkingDay = (date: Date) => {
    if (!shopAvailability?.workingDays) return true;
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    return shopAvailability.workingDays.includes(dayName);
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-full aspect-square"></div>);
    }

    // Calendar day cells
    for (let i = 1; i <= numDays; i++) {
      const date = new Date(year, month, i);
      const formattedDate = date.toISOString().split('T')[0]; 
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const selectable = isDateSelectable(date);
      const holidayInfo = getHolidayInfo(formattedDate);
      const isNationalHoliday = holidayInfo && holidayInfo.primary_type === "national";
      const isCustomHoliday = holidayInfo && holidayInfo.primary_type === "custom";
      const isWorkDay = isWorkingDay(date);
      const isPastDate = date < new Date(new Date().toDateString());

      // Determine the display state
      let dayClasses = "relative w-full aspect-square p-2 rounded-xl transition-all duration-300";
      let textClasses = "font-semibold text-xs sm:text-sm md:text-base";
      let showHolidayBadge = false;
      let badgeText = "";
      let badgeClasses = "";

      if (isSelected) {
        dayClasses += " bg-gradient-to-br from-blue-600 to-blue-800 text-white border-2 border-blue-700 shadow-lg transform hover:scale-105 cursor-pointer";
        textClasses += " text-white";
      } else if (!selectable) {
        if (isPastDate) {
          dayClasses += " bg-gray-100 border border-gray-200 cursor-not-allowed opacity-50";
          textClasses += " text-gray-400";
        } else if (isCustomHoliday) {
          dayClasses += " bg-red-50 border-2 border-red-200 cursor-not-allowed";
          textClasses += " text-red-600";
          showHolidayBadge = true;
          badgeText = "Closed";
          badgeClasses = "bg-red-100 text-red-800";
        } else if (isNationalHoliday) {
          dayClasses += " bg-yellow-50 border-2 border-yellow-200 cursor-not-allowed";
          textClasses += " text-yellow-700";
          showHolidayBadge = true;
          badgeText = "Holiday";
          badgeClasses = "bg-yellow-100 text-yellow-800";
        } else if (!isWorkDay) {
          dayClasses += " bg-gray-100 border border-gray-300 cursor-not-allowed opacity-60";
          textClasses += " text-gray-500";
          showHolidayBadge = true;
          badgeText = "Closed";
          badgeClasses = "bg-gray-100 text-gray-600";
        }
      } else if (isToday) {
        dayClasses += " bg-blue-50 border-2 border-blue-200 shadow-sm cursor-pointer hover:bg-blue-100";
        textClasses += " text-blue-800";
      } else {
        dayClasses += " bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md cursor-pointer";
        textClasses += " text-gray-800";
      }

      days.push(
        <div
          key={formattedDate}
          className={dayClasses}
          onClick={() => selectable && setSelectedDate(date)}
          title={holidayInfo ? `${holidayInfo.name} - ${holidayInfo.description}` : undefined}
        >
          <div className="flex justify-between items-start">
            <span className={textClasses}>{i}</span>
            {isNationalHoliday && (
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-500" />
            )}
            {isCustomHoliday && (
              <X className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
            )}
          </div>
          {showHolidayBadge && (
            <Badge className={`absolute bottom-1 left-1 right-1 text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 font-medium rounded ${badgeClasses}`}>
              {badgeText}
            </Badge>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <Card className="border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            <div>
              <div className="text-lg sm:text-xl font-bold tracking-tight">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
              <div className="text-blue-100 text-xs sm:text-sm">Select your preferred date</div>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
              className="border-blue-100 text-white hover:bg-blue-700 hover:text-white bg-transparent transition-all duration-200 p-2 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
              className="border-blue-100 text-white hover:bg-blue-700 hover:text-white bg-transparent transition-all duration-200 p-2 rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {isLoading ? (
          <div className="text-center py-8 sm:py-12">
            <CalendarIcon className="w-10 h-10 sm:w-12 sm:h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 font-medium text-sm sm:text-base">Loading calendar...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-xs sm:text-sm text-gray-600">National Holiday</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-500" />
                <span className="text-xs sm:text-sm text-gray-600">Shop Closed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-50 rounded border-2 border-blue-200"></div>
                <span className="text-xs sm:text-sm text-gray-600">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white rounded border border-gray-200"></div>
                <span className="text-xs sm:text-sm text-gray-600">Available</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-xs sm:text-sm font-semibold text-gray-800 bg-gray-100 rounded-lg"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">{renderCalendarDays()}</div>
          </>
        )}
      </CardContent>
    </Card>
  );
}