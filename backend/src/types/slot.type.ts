import { Types } from 'mongoose'

export interface Slot {
  _id?: Types.ObjectId

  shopId: Types.ObjectId
  slotDate: string // YYYY-MM-DD

  shopOpenTime: string
  shopCloseTime: string

  lunchStartTime?: string
  lunchEndTime?: string

  staffId: string
  staffName?: string
  staffCount: number

  startTime: string
  endTime: string
  durationInMinutes: number

  isBooked: boolean
  isCancelled?: boolean
  isHoliday?: boolean
  holidayReason?: string
  isWeekendHoliday?: boolean

  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}
