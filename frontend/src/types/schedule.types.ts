// types/schedule.types.ts
export interface TimeSlot {
  _id: string;
  shopId: string;
  staffId: { _id: string; name: string; phone: string } | string;
  slotDate: string;
  startTime: string;
  endTime: string;
  durationInMinutes: number;
  isBooked: boolean;
  isActive: boolean;
  staffName?: string;
  deletedAt?: string | null; 
}

export interface DaySchedule {
  date: string;
  timeSlots: TimeSlot[];
  isHoliday?: boolean;
}

export interface Holiday {
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
}