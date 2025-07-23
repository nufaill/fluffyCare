import { Schema, model } from 'mongoose'
import { Staff } from '../types/staff.types'

const StaffSchema = new Schema<Staff>(
  {
    shopId: { type: Schema.Types.ObjectId, required: true, ref: 'Shop' },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default model<Staff>('Staff', StaffSchema)