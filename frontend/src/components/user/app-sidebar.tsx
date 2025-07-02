import {
  Calendar,
  Heart,
  Search,
  Settings,
  User,
  MessageCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/Badge"
import { useNavigate, useLocation } from "react-router-dom"

interface SidebarProps {
  className?: string
  isCollapsed?: boolean
}

const menuItems = [
  { title: "Profile", icon: User, href: "/profile", badge: null },
  { title: "My Pets", icon: Heart, href: "/pets", badge: "3" },
  { title: "Bookings", icon: Calendar, href: "/bookings", badge: "2" },
  { title: "Messages", icon: MessageCircle, href: "/messages", badge: "5" },
  { title: "Search", icon: Search, href: "/search", badge: null },
  { title: "Settings", icon: Settings, href: "/settings", badge: null },
]

export function ModernSidebar({ className, isCollapsed = false }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col bg-white dark:bg-black border-r border-gray-300 dark:border-gray-700",
        isCollapsed && "w-16",
        className
      )}
    >
      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Button
                key={item.title}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11 font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white text-white dark:text-black shadow-lg"
                    : "hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300",
                  isCollapsed && "justify-center px-2"
                )}
                onClick={() => navigate(item.href)}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive && "text-white dark:text-black"
                  )}
                />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.title}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "ml-auto h-5 px-2 text-xs",
                          isActive
                            ? "bg-white/20 dark:bg-black/20 text-white dark:text-black"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            )
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-300 dark:border-gray-700">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white flex items-center justify-center">
                <Heart className="h-4 w-4 text-white dark:text-black" />
              </div>
              <div>
                <p className="text-sm font-medium">Premium Plan</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Unlimited pets</p>
              </div>
            </div>
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white hover:from-gray-700 hover:to-gray-900 dark:hover:from-gray-300 dark:hover:to-gray-100 text-white dark:text-black"
            >
              Upgrade
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
