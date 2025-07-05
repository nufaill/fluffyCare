"use client"

import type React from "react"
import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageCircle,
  DollarSign,
  Clock,
  Settings,
  LogOut,
  Dog,
  ChevronRight,
  Award,
  BarChart3,
  PieChart,
  TrendingUp,
} from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate, useLocation } from "react-router-dom"

export interface SidebarItem {
  title: string
  icon: React.ElementType
  url?: string
  badge?: string | number
  isNew?: boolean
  subItems?: Omit<SidebarItem, "subItems">[]
}

interface PetCareSidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggle?: () => void
  menuItems?: SidebarItem[]
  footerItems?: SidebarItem[]
  onItemClick?: (item: SidebarItem) => void
}

const defaultMenuItems: SidebarItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/shop/dashboard",
  },
  {
    title: "Pet Owners",
    icon: Users,
    url: "/owners",
    badge: "24",
    subItems: [
      { title: "All Owners", icon: Users, url: "/owners/all", badge: "156" },
      { title: "New Owners", icon: Users, url: "/owners/new", badge: "12" },
      { title: "VIP Owners", icon: Award, url: "/owners/vip", badge: "8" },
    ],
  },
  {
    title: "Appointments",
    icon: Calendar,
    url: "/appointments",
    badge: "12",
    subItems: [
      { title: "Today", icon: Calendar, url: "/appointments/today", badge: "5" },
      { title: "This Week", icon: Calendar, url: "/appointments/week", badge: "12" },
      { title: "Pending", icon: Clock, url: "/appointments/pending", badge: "3" },
    ],
  },
  {
    title: "Messages",
    icon: MessageCircle,
    url: "/messages",
    badge: "5",
    isNew: true,
  },
  {
    title: "Analytics",
    icon: BarChart3,
    url: "/analytics",
    subItems: [
      { title: "Revenue", icon: DollarSign, url: "/analytics/revenue" },
      { title: "Performance", icon: TrendingUp, url: "/analytics/performance" },
      { title: "Reports", icon: PieChart, url: "/analytics/reports" },
    ],
  },
  {
    title: "Pet Services",
    icon: Dog,
    url: "/shop/services",
  },
  {
    title: "Earnings",
    icon: DollarSign,
    url: "/earnings",
  },
  {
    title: "Schedule",
    icon: Clock,
    url: "/schedule",
  },
]

const defaultFooterItems: SidebarItem[] = [
  { title: "Settings", icon: Settings, url: "/settings" },
  { title: "Logout", icon: LogOut, url: "/logout" },
]

export function PetCareSidebar({
  className = "",
  menuItems: customMenuItems,
  footerItems: customFooterItems,
  onItemClick,
}: PetCareSidebarProps) {
  const menuItems = customMenuItems || defaultMenuItems
  const footerItems = customFooterItems || defaultFooterItems

  const [expandedItems, setExpandedItems] = useState<string[]>(["Pet Owners"])
  const navigate = useNavigate()
  const location = useLocation()

  const handleItemClick = (item: SidebarItem, event?: React.MouseEvent) => {
    if (item.subItems) {
      event?.preventDefault()
      setExpandedItems((prev) =>
        prev.includes(item.title) ? prev.filter((title) => title !== item.title) : [...prev, item.title],
      )
    } else if (item.url) {
      navigate(item.url)
      onItemClick?.(item)
    }
  }

  const handleSubItemClick = (subItem: SidebarItem) => {
    if (subItem.url) {
      navigate(subItem.url)
      onItemClick?.(subItem)
    }
  }

  const isActiveRoute = (url?: string) => url && location.pathname === url

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen w-72 bg-sidebar border-r border-sidebar-border transition-all duration-300 ${className}`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
              <Dog className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">PetCare Pro</h2>
              <p className="text-sm text-sidebar-foreground/60">Management Hub</p>
            </div>
          </div>
        </div>

        {/* Stats Card - Fixed */}
        <div className="flex-shrink-0 p-4">
          <Card className="bg-gradient-to-r from-black to-gray-800 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span className="text-sm font-medium">Today's Stats</span>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  Live
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-xs opacity-80">Appointments</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">18</p>
                  <p className="text-xs opacity-80">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <nav className="space-y-1 py-2">
            {menuItems.map((item) => (
              <div key={item.title}>
                <Button
                  variant={isActiveRoute(item.url) ? "default" : "ghost"}
                  className={`w-full justify-between h-12 px-4 ${
                    isActiveRoute(item.url)
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
                  }`}
                  onClick={(e) => handleItemClick(item, e)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg flex-shrink-0 ${
                        isActiveRoute(item.url) ? "bg-white/20" : "bg-sidebar-accent group-hover:bg-sidebar-primary/10"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium truncate">{item.title}</span>
                    {item.isNew && (
                      <Badge className="bg-destructive text-white border-0 text-xs px-2 py-0.5 flex-shrink-0">
                        New
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.badge && (
                      <Badge variant="secondary" className="bg-sidebar-accent text-sidebar-accent-foreground border-0">
                        {item.badge}
                      </Badge>
                    )}
                    {item.subItems && (
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          expandedItems.includes(item.title) ? "rotate-90" : ""
                        }`}
                      />
                    )}
                  </div>
                </Button>

                {item.subItems && expandedItems.includes(item.title) && (
                  <div className="ml-6 mt-2 space-y-1 border-l-2 border-sidebar-border pl-4">
                    {item.subItems.map((subItem) => (
                      <Button
                        key={subItem.title}
                        variant="ghost"
                        className={`w-full justify-between h-10 px-3 text-sm ${
                          isActiveRoute(subItem.url)
                            ? "text-sidebar-foreground font-semibold bg-sidebar-accent"
                            : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                        }`}
                        onClick={() => handleSubItemClick(subItem)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <subItem.icon className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{subItem.title}</span>
                        </div>
                        {subItem.badge && <Badge className="text-xs flex-shrink-0">{subItem.badge}</Badge>}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 p-4 border-t border-sidebar-border">
          <div className="space-y-1">
            {footerItems.map((item) => (
              <Button
                key={item.title}
                variant="ghost"
                className={`w-full justify-start h-10 px-4 ${
                  isActiveRoute(item.url)
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
