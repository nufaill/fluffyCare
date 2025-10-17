import { useState, useEffect } from "react"
import { X, Trash2 } from "lucide-react"
import Shopaxios from "@/api/shop.axios"
import type { INotification } from "@/types/notifications.type"

interface NotificationToastProps {
  shopId: string
  onClose: () => void
}

interface ApiNotification {
  id: string
  userId: string
  shopId: string
  receiverType: string
  type: string
  message: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

const NotificationToast = ({ shopId, onClose }: NotificationToastProps) => {
  const [notifications, setNotifications] = useState<INotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const res = await Shopaxios.get(`/notifications/${shopId}`)
        if (!res.data?.data) throw new Error("Invalid response structure")
        setNotifications(
          res.data.data.map((notif: ApiNotification) => ({
            ...notif,
            id: notif.id.toString(),
            createdAt: new Date(notif.createdAt),
            updatedAt: new Date(notif.updatedAt),
          }))
        )
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || "Failed to load notifications"
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    if (shopId) fetchNotifications()
  }, [shopId])

  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation() 
    try {
      await Shopaxios.delete(`/notifications/${notificationId}`)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    } catch (err: any) {
      console.error("Delete notification error:", err.message)
    }
  }

  return (
    <div
      className="fixed top-20 right-4 z-50 w-80 sm:w-96"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-2xl px-4 py-3 shadow-lg">
        <h3 className="text-sm font-semibold">Notifications</h3>
        <button onClick={onClose} className="text-white hover:text-gray-200 transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-b-2xl shadow-xl max-h-[60vh] overflow-y-auto p-3 space-y-3">
        {loading ? (
          <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm text-center">
            Loading notifications...
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-gray-50 text-gray-600 p-3 rounded-lg text-sm text-center">
            No new notifications
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl shadow-md border transition-all duration-300 flex flex-col gap-2 hover:scale-[1.02] ${
                n.isRead
                  ? "bg-gray-50 border-gray-200"
                  : "bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border-indigo-300"
              }`}
            >
              <p
                className={`text-sm ${
                  n.isRead ? "text-gray-700" : "text-gray-900 font-semibold"
                }`}
              >
                {n.message}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(n.createdAt).toLocaleString()}
              </p>
              <div className="flex justify-end gap-4 mt-1">
                <button
                  onClick={(e) => handleDeleteNotification(n.id, e)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800 transition"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotificationToast