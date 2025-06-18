import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  profileImage: { type: String, default: '' },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String,required: true},
    password: { type: String, required: true },
    location: {
      type: Object,
      default: {},
    },
    isActive: { type: Boolean, default: true }
},
{
    timestamps: true,
  });

export const User = model('User', userSchema);
