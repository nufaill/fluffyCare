"use client"

import type React from "react"
import { LayoutDashboard, Calendar, Settings, Store, Star, Shield, Users, LogOut } from "lucide-react"

interface SidebarProps {
  activeItem?: string
  onItemClick?: (item: string) => void
  onLogout?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem = "Dashboard", onItemClick, onLogout }) => {
  const menuItems = [
    { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "BookingList", label: "Booking List", icon: Calendar },
    { id: "ServicesDetail", label: "Services Detail", icon: Settings },
    { id: "Shops", label: "Shops", icon: Store },
    { id: "Reviews", label: "Reviews", icon: Star },
    { id: "Verification", label: "Verification", icon: Shield },
    { id: "CustomerPetsDetail", label: "Customer&Pets Detail", icon: Users },
  ]

  const handleItemClick = (itemId: string) => {
    if (onItemClick) {
      onItemClick(itemId)
    }
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-40">
      {/* Logo Section */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">🐾</span>
          </div>
          <span className="text-xl font-bold text-black">fluffyCare</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-gray-100 text-black border-r-2 border-black"
                      : "text-gray-600 hover:bg-gray-50 hover:text-black"
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-black" : "text-gray-400"}`} />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-3 right-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  )
}

export default Sidebar
