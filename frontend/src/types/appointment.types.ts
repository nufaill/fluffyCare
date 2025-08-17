export const AppointmentStatus = {
  Pending: 'pending',
  Confirmed: 'confirmed',
  Ongoing: 'ongoing',
  Cancelled: 'cancelled',
  Completed: 'completed',
} as const;

export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];

export const RequestStatus = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
} as const;

export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus];

export const PaymentStatus = {
  Pending: 'pending',
  Completed: 'completed',
  Failed: 'failed',
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];


export const PaymentMethod = {
  PayPal: 'PayPal',
  Cash: 'Cash',
  Card: 'card',
  Wallet: 'Wallet',
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];