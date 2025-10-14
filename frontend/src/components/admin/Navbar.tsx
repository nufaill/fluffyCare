"use client"

import type React from "react"
import { useState } from "react"
import { Search, Bell, MessageSquare, ShoppingCart, ChevronDown, Menu, X } from "lucide-react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logoutAdmin as logoutAdminAction } from "@/redux/slices/admin.slice"
import { logoutAdmin } from "@/services/admin/admin.service"

interface NavbarProps {
  userName?: string
  userAvatar?: string
  onSearch?: (query: string) => void
  onToggleSidebar?: () => void
  isSidebarOpen?: boolean
}

const Navbar: React.FC<NavbarProps> = ({
  userName = "NUFAIL",
  userAvatar,
  onSearch,
  onToggleSidebar,
  isSidebarOpen = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  const handleLogout = async () => {
    try {
      await logoutAdmin()
      dispatch(logoutAdminAction())
      navigate("/admin/login")
    } catch {
      dispatch(logoutAdminAction())
      navigate("/admin/login")
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 md:left-64 h-16 bg-white border-b border-gray-200 shadow-sm z-40">
      <div className="flex items-center justify-between h-full px-3 md:px-6">
        {/* Sidebar Toggle Button (Menu / Close) */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-gray-600 hover:text-black rounded-lg hover:bg-gray-100 transition"
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Search */}
        <div className="flex-1 max-w-xs md:max-w-md mx-2 md:mx-0">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search here"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </form>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Icons */}
          <div className="hidden sm:flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Bell className="h-5 w-5" />
            </button>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1 md:p-2 rounded-lg hover:bg-gray-50"
            >
              <div className="hidden md:block text-sm font-medium text-gray-900">
               {userName}
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-medium text-gray-700">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar