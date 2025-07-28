import { Types } from 'mongoose'

export interface Slot {
  _id?: Types.ObjectId
  shopId: Types.ObjectId
  staffId:Types.ObjectId
  slotDate: string // YYYY-MM-DD
  startTime: string
  endTime: string
  durationInMinutes: number
  isBooked: boolean
  isActive: boolean
  isCancelled?: boolean
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}
