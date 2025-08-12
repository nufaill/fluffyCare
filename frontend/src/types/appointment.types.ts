// src/types/appointment.types.ts
export type PaymentMethod = "CreditCard" | "Cash" | "OnlinePayment";
export type PaymentStatus = "Pending" | "Completed" | "Failed" | "Refunded";
export type AppointmentStatus = "Pending" | "Booked" | "Completed" | "Canceled";
export type RequestStatus = "Pending" | "Completed" | "Rejected";