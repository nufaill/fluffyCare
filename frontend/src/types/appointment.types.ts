export const AppointmentStatus = {
  Pending: 'pending',
  Confirmed: 'confirmed',
  Ongoing: 'ongoing',
  Cancelled: 'cancelled',
  Completed: 'completed',
} as const;

export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];

export const PaymentStatus = {
  Pending: 'pending',
  Completed: 'completed',
  Failed: 'failed',
  Refunded: 'refunded',
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export const PaymentMethod = {
  PayPal: 'PayPal',
  Cash: 'Cash',
  Card: 'card',
  Wallet: 'Wallet',
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export interface PaymentDetails {
  paymentIntentId?: string;
  amount?: number;
  currency?: string;
  status: PaymentStatus;
  method: PaymentMethod;
  paidAt?: Date | string;
}

export interface SlotDetails {
  startTime: string;
  endTime: string;
  date: string;
}

export interface Pet {
  _id: string;
  name: string;
  breed: string;
}
export interface Shop {
  _id: string;
  name: string;
}
export interface Service {
  _id: string;
  name: string;
}
export interface User {
  _id: string;
  fullName: string;
}
export interface Staff {
  _id: string;
  name: string;
}

export interface Appointment {
  _id: string;
  userId: User;
  petId: Pet;
  shopId: Shop;
  staffId: Staff;
  serviceId: Service;
  slotDetails: SlotDetails;
  appointmentStatus: AppointmentStatus;
  paymentDetails: PaymentDetails;
  notes?: string;
  bookingNumber: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}