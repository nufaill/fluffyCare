export type ReceiverType = "User" | "Shop"

export type NotificationType =
  | "Booking Update"
  | "Payment"
  | "Chat"
  | "System Alert"

export interface INotification extends Document {
  id: string
  userId: string
  shopId: string
  receiverType: ReceiverType
  type: NotificationType
  message: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}