import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { Search, Bell, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/Badge"
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary";
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { removeShop } from "@/redux/slices/shop.slice"
import { logoutShop } from "@/services/shop/auth.service"

interface NavbarProps {
  className?: string
  logoText?: string
  logoIcon?: React.ReactNode
  searchPlaceholder?: string
  userAvatar?: string
  userRole?: string
  notificationCount?: number
  onSearch?: (query: string) => void
  onProfileClick?: () => void
  onNotificationClick?: () => void
  onMenuToggle?: () => void
}

export function Navbar({
  className = "",
  searchPlaceholder = "Search anything...",
  userAvatar,
  userRole = "Pet Care Specialist",
  notificationCount = 3,
  onSearch,
  onNotificationClick,
}: NavbarProps) {
  const [searchFocused, setSearchFocused] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const { shopData: shop } = useSelector((state: RootState) => state.shop)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const displayName = shop?.name || "Shop Owner"
  const displayRole = shop ? "Shop Owner" : userRole

  const onProfileClick = () => {
    navigate("/shop/profile")
  }

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    try {
      await logoutShop()
      dispatch(removeShop())
      navigate("/shop/login")
    } catch (error) {
      console.error("Logout failed:", error)
      dispatch(removeShop())
      navigate("/shop/login")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header
      className={`w-full h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Search Bar */}
        <div className={`relative flex-1 max-w-md transition-all duration-300 ${searchFocused ? "scale-105" : ""}`}>
          <Search
            className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
              searchFocused ? "text-blue-500" : "text-gray-400 dark:text-gray-500"
            }`}
          />
          <Input
            placeholder={searchPlaceholder}
            className={`pl-10 pr-4 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-800 focus:border-blue-300 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
              searchFocused ? "shadow-md" : ""
            }`}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 ml-6">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group text-gray-600 dark:text-gray-300"
            onClick={onNotificationClick}
          >
            <Bell className="h-5 w-5 group-hover:animate-pulse" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 p-0 text-xs animate-pulse border-0">
                {notificationCount > 9 ? "9+" : notificationCount}
              </Badge>
            )}
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:shadow-md text-gray-900 dark:text-gray-100"
              >
                <div className="relative">
                  <Avatar className="h-9 w-9 ring-2 ring-blue-100 dark:ring-blue-900">
                    <AvatarImage src={cloudinaryUtils.getFullUrl(shop?.logo || userAvatar || "/placeholder.svg?height=40&width=40")} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900"></div>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{displayRole}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 p-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg z-50 mt-2"
            >
              <div className="flex items-center gap-3 p-2 mb-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={cloudinaryUtils.getFullUrl(shop?.logo || userAvatar || "/placeholder.svg?height=40&width=40")} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{displayRole}</p>
                  {shop?.email && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{shop.email}</p>}
                </div>
              </div>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
              <DropdownMenuItem
                onClick={onProfileClick}
                className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                👤 View Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                ⚙️ Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                💳 Billing & Plans
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? "🔄 Signing Out..." : "🚪 Sign Out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export type { NavbarProps }
export default Navbar
