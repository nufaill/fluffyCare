import type React from "react"
import { LayoutDashboard, Calendar, Repeat, Store, Star, Shield, Users, LogOut, PawPrint, Scissors, Wallet } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

interface SidebarProps {
  activeItem?: string
  onItemClick?: (item: string) => void
  onLogout?: () => void
  isOpen?: boolean
  onClose?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick, onLogout, isOpen = false, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin/" },
    { id: "BookingList", label: "Booking List", icon: Calendar, path: "/admin/appointments" },
    { id: "subscription ", label: "Subscription", icon: Repeat, path: "/admin/subscription" },
    { id: "Shops", label: "Shops", icon: Store, path: "/admin/shops" },
    { id: "Reviews", label: "Reviews", icon: Star, path: "/admin/reviews" },
    { id: "Wallet", label: "Wallet", icon: Wallet, path: "/admin/wallet" },
    { id: "Verification", label: "Verification", icon: Shield, path: "/admin/unverified" },
    { id: "CustomerPetsDetail", label: "Customer Detail", icon: Users, path: "/admin/users" },
    { id: "PetCategory", label: "Pet Category", icon: PawPrint, path: "/admin/pet-types" },
    { id: "PetServices", label: "Pet Services", icon: Scissors, path: "/admin/service-types" },
  ]

  const handleItemClick = (itemId: string, path: string) => {
    if (onItemClick) {
      onItemClick(itemId)
    }
    onClose?.()
    navigate(path)
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
    onClose?.()
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <div 
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:fixed md:translate-x-0 md:w-64`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">🐾</span>
            </div>
            <span className="text-xl font-semibold text-gray-900 tracking-tight">FluffyCare</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 mt-4 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeItem === item.id || location.pathname === item.path

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id, item.path)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-500' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-3 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar;