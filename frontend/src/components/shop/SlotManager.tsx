import {
  Clock,
  Trash2,
  Sun,
  Moon,
  Sunset,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  UserMinus,
  ChevronRight,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TimeSlot {
  _id?: string;
  shopId: string;
  staffId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  durationInMinutes: number;
  isBooked: boolean;
  isActive: boolean;
  staffName?: string;
}

interface DaySchedule {
  date: string;
  timeSlots: TimeSlot[];
  isHoliday?: boolean;
}

interface SlotManagementProps {
  selectedDate: Date;
  selectedDateSchedule: DaySchedule | undefined;
  compactView: boolean;
  formData: {
    staffCount: number;
  };
  isLoading: boolean;
  sundayWorkingEnabled: boolean;
  mondayWorkingEnabled: boolean;
  isWithinAutoGenerationWindow: (date: Date) => boolean;
  toggleHoliday: (date: Date) => Promise<void>;
  toggleHideTimeSlot: (slotId: string) => Promise<void>;
  deleteTimeSlot: (slotId: string) => Promise<void>;
  toggleHideAllSlots: () => Promise<void>;
  toggleHideAllSlotsForStaff: (staffId: string) => Promise<void>;
}

export function SlotManagement({
  selectedDate,
  selectedDateSchedule,
  compactView,
  formData,
  isLoading,
  sundayWorkingEnabled,
  mondayWorkingEnabled,
  isWithinAutoGenerationWindow,
  toggleHoliday,
  toggleHideTimeSlot,
  deleteTimeSlot,
  toggleHideAllSlots,
  toggleHideAllSlotsForStaff,
}: SlotManagementProps) {
  const isSunday = (date: Date) => date.getDay() === 0;
  const isMonday = (date: Date) => date.getDay() === 1;
  const isDefaultHoliday = (date: Date) => {
    const isSundayHoliday = isSunday(date) && !sundayWorkingEnabled;
    const isMondayHoliday = isMonday(date) && !mondayWorkingEnabled;
    return isSundayHoliday || isMondayHoliday;
  };

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case "morning":
        return Sun;
      case "afternoon":
        return Sunset;
      case "evening":
        return Moon;
      default:
        return Clock;
    }
  };

  const getPeriodSlots = (slots: TimeSlot[], period: string) => {
    return slots.filter((slot) => {
      const hour = parseInt(slot.startTime.split(":")[0]);
      if (period === "morning") return hour < 12;
      if (period === "afternoon") return hour >= 12 && hour < 17;
      return hour >= 17;
    });
  };

  const getStatusIcon = (isBooked: boolean, isActive?: boolean) => {
    if (!isActive) return XCircle;
    return isBooked ? CheckCircle : Clock;
  };

  const getStatusColor = (isBooked: boolean, isActive?: boolean) => {
    if (!isActive) return "bg-orange-100 text-orange-800";
    return isBooked ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800";
  };

  const groupSlotsByTime = (slots: TimeSlot[]) => {
    const grouped: {
      startTime: string;
      endTime: string;
      totalCount: number;
      availableCount: number;
      staffSlots: TimeSlot[];
    }[] = [];
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

  return (
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
              {(isSunday(selectedDate) || isMonday(selectedDate)) && (
                <Badge className="text-xs mt-1">
                  <Sun className="w-3 h-3 mr-1" />
                  {isSunday(selectedDate) ? "Sunday" : "Monday"}
                </Badge>
              )}
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            {selectedDateSchedule && selectedDateSchedule.timeSlots.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleHideAllSlots}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 bg-transparent"
                disabled={isLoading}
              >
                <Eye className="w-4 h-4 mr-1" />
                Toggle Hide All
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
              {isSunday(selectedDate) ? "Sunday Holiday" : isMonday(selectedDate) ? "Monday Holiday" : "Holiday"}
            </div>
            <div className="text-sm text-gray-600">No appointments scheduled</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleHoliday(selectedDate)}
              className="mt-2"
              disabled={isWithinAutoGenerationWindow(selectedDate) || isLoading}
            >
              {selectedDateSchedule?.isHoliday ? "Remove Holiday" : "Mark as Holiday"}
            </Button>
          </div>
        ) : (
          <>
            {["morning", "afternoon", "evening"].map((period) => {
              const periodSlots = getPeriodSlots(selectedDateSchedule?.timeSlots || [], period);
              const PeriodIcon = getPeriodIcon(period);

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
                );
              }

              const groupedSlots = groupSlotsByTime(periodSlots);

              return (
                <div key={period}>
                  <h4 className="font-medium text-gray-900 capitalize mb-3 flex items-center gap-2">
                    <PeriodIcon className="w-4 h-4" />
                    {period}
                  </h4>

                  {compactView && formData.staffCount > 2 ? (
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
                              const StatusIcon = getStatusIcon(slot.isBooked, slot.isActive);
                              return (
                                <div
                                  key={slot._id}
                                  className="flex items-center justify-between p-2 bg-white rounded border border-gray-100"
                                >
                                  <div className="flex items-center gap-2">
                                    <Badge className="text-xs">
                                      <Users className="w-3 h-3 mr-1" />
                                      {slot.staffName || "Unknown Staff"}
                                    </Badge>
                                    <Badge
                                      className={`text-xs ${getStatusColor(slot.isBooked, slot.isActive)} flex items-center gap-1`}
                                    >
                                      <StatusIcon className="w-3 h-3" />
                                      {!slot.isActive ? "Hidden" : slot.isBooked ? "Booked" : "Available"}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleHideTimeSlot(slot._id!)}
                                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-6 w-6 p-0"
                                      disabled={isLoading}
                                    >
                                      {slot.isActive ? (
                                        <EyeOff className="w-3 h-3" />
                                      ) : (
                                        <Eye className="w-3 h-3" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteTimeSlot(slot._id!)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                                      disabled={isLoading}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleHideAllSlotsForStaff(group.staffSlots[0]?.staffId)}
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 w-full mt-2"
                              disabled={isLoading}
                            >
                              <UserMinus className="w-3 h-3 mr-1" />
                              Toggle Hide All Staff for This Time
                            </Button>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {periodSlots.map((slot) => {
                        const StatusIcon = getStatusIcon(slot.isBooked, slot.isActive);
                        return (
                          <div
                            key={slot._id}
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
                                  className={`${getStatusColor(slot.isBooked, slot.isActive)} flex items-center gap-1`}
                                >
                                  <StatusIcon className="w-3 h-3" />
                                  {!slot.isActive ? "Hidden" : slot.isBooked ? "Booked" : "Available"}
                                </Badge>
                                <Badge className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {slot.staffName || "Unknown Staff"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleHideTimeSlot(slot._id!)}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                disabled={isLoading}
                              >
                                {slot.isActive ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTimeSlot(slot._id!)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={isLoading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </CardContent>
    </Card>
  );
}