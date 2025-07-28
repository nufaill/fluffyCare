export interface Slot {
  _id?: string;
  shopId: string 
  staffId: string 
  slotDate: string;
  startTime: string;
  endTime: string;
  durationInMinutes: number;
  isBooked: boolean;
  isActive: boolean;
  isCancelled?: boolean;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}