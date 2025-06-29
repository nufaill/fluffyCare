"use client"

import { Layout } from "@/components/shop/Layout"
import { StatsCard } from "@/components/ui/stats-card"
import { UpcomingServices } from "@/components/ui/upcoming-services"
import { QuickActions } from "@/components/ui/quick-actions"
import { RecentActivity } from "@/components/ui/recent-activity"
import { WeatherWidget } from "@/components/ui/weather-widget"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/Progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageCircle,
  DollarSign,
  Clock,
  Settings,
  LogOut,
  Star,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  TrendingUp,
  Award,
  Target,
  Zap,
  BarChart3,
  PieChart,
} from "lucide-react"
import type { SidebarItem } from "../../components/shop/sidebar"

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "#",
    isActive: true,
  },
  {
    title: "Pet Owners",
    icon: Users,
    url: "#",
    badge: "24",
    subItems: [
      { title: "All Owners", icon: Users, url: "#", badge: "156" },
      { title: "New Owners", icon: Users, url: "#", badge: "12" },
      { title: "VIP Owners", icon: Award, url: "#", badge: "8" },
    ],
  },
  {
    title: "Appointments",
    icon: Calendar,
    url: "#",
    badge: "12",
    subItems: [
      { title: "Today", icon: Calendar, url: "#", badge: "5" },
      { title: "This Week", icon: Calendar, url: "#", badge: "12" },
      { title: "Pending", icon: Clock, url: "#", badge: "3" },
    ],
  },
  {
    title: "Messages",
    icon: MessageCircle,
    url: "#",
    badge: "5",
    isNew: true,
  },
  {
    title: "Analytics",
    icon: BarChart3,
    url: "#",
    subItems: [
      { title: "Revenue", icon: DollarSign, url: "#" },
      { title: "Performance", icon: TrendingUp, url: "#" },
      { title: "Reports", icon: PieChart, url: "#" },
    ],
  },
  {
    title: "Shop Earnings",
    icon: DollarSign,
    url: "#",
  },
  {
    title: "Available Time Slots",
    icon: Clock,
    url: "#",
  },
]

const sidebarFooterItems: SidebarItem[] = [
  {
    title: "Settings",
    icon: Settings,
    url: "#",
  },
  {
    title: "Logout",
    icon: LogOut,
    url: "#",
  },
]

const footerSections = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Gift cards", href: "#" },
      { label: "Careers", href: "#", isNew: true },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Pet Grooming", href: "#" },
      { label: "Pet Training", href: "#" },
      { label: "Pet Sitting", href: "#" },
      { label: "Veterinary Care", href: "#", isNew: true },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Live Chat", href: "#" },
      { label: "Community", href: "#" },
    ],
  },
]

const socialLinks = [
  {
    icon: <Facebook className="h-4 w-4" />,
    href: "#",
    label: "Facebook",
    color: "hover:from-blue-600 hover:to-blue-700",
  },
  {
    icon: <Instagram className="h-4 w-4" />,
    href: "#",
    label: "Instagram",
    color: "hover:from-pink-500 hover:to-purple-600",
  },
  {
    icon: <Twitter className="h-4 w-4" />,
    href: "#",
    label: "Twitter",
    color: "hover:from-blue-400 hover:to-blue-500",
  },
  { icon: <Youtube className="h-4 w-4" />, href: "#", label: "YouTube", color: "hover:from-red-500 hover:to-red-600" },
]

export default function Dashboard() {
  const handleSidebarItemClick = (item: SidebarItem) => {
    console.log("Sidebar item clicked:", item.title)
  }

  const handleSearch = (query: string) => {
    console.log("Search query:", query)
  }

  const handleNotificationClick = () => {
    console.log("Notifications clicked")
  }

  const handleProfileClick = () => {
    console.log("Profile clicked")
  }

  return (
    <Layout
      sidebarItems={sidebarItems}
      sidebarFooterItems={sidebarFooterItems}
      onSidebarItemClick={handleSidebarItemClick}
      navbarProps={{
        onSearch: handleSearch,
        onNotificationClick: handleNotificationClick,
        onProfileClick: handleProfileClick,
        notificationCount: 8,
        userRole: "Senior Pet Care Specialist",
      }}
      footerProps={{
        sections: footerSections,
        socialLinks: socialLinks,
        contactInfo: {
          address: ["8592 Fairground St.", "Tallahassee, FL 32303"],
          phone: "+775 378-6348",
          email: "rgarton@outlook.com",
        },
      }}
    >
      <div className="p-6 space-y-8 bg-gradient-to-br from-background to-muted/20 min-h-screen transition-all duration-300 animate-fade-in">
        {/* Welcome Header with Animation */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="animate-slide-up">
              <h1 className="text-3xl font-bold gradient-text">Welcome back, FluffyCare Partner! 🎉</h1>
              <p className="text-muted-foreground mt-2">Here's what's happening with your pet care business today.</p>
            </div>
            <div className="animate-scale-in">
              <WeatherWidget />
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <StatsCard
              title="Total Pet Owners"
              value="40,689"
              change="8.5% Up from yesterday"
              trend="up"
              icon={<Users className="h-6 w-6 text-blue-600" />}
              iconBg="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <StatsCard
              title="Monthly Earning"
              value="$10,293"
              change="1.3% Up from past week"
              trend="up"
              icon={<DollarSign className="h-6 w-6 text-green-600" />}
              iconBg="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <StatsCard
              title="Pet Care Sessions"
              value="90"
              change="4.3% Down from yesterday"
              trend="down"
              icon={<Calendar className="h-6 w-6 text-purple-600" />}
              iconBg="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <StatsCard
              title="Client Retention"
              value="94.2%"
              change="1.8% Up from yesterday"
              trend="up"
              icon={<Target className="h-6 w-6 text-orange-600" />}
              iconBg="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <QuickActions />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Upcoming Services */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "0.6s" }}>
            <UpcomingServices />
          </div>

          {/* Enhanced Performance Stats */}
          <div className="animate-slide-up" style={{ animationDelay: "0.7s" }}>
            <Card className="bg-gradient-to-br from-card to-muted/20 border-border shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Performance Stats
                </CardTitle>
                <p className="text-sm text-muted-foreground">This week's analytics</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Schedule Utilization</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">46%</span>
                  </div>
                  <Progress value={46} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-2">22 hours scheduled out of 48 available</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <p className="text-sm font-medium text-foreground mb-2">Satisfaction</p>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">4.9</span>
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                    <p className="text-xs text-muted-foreground">28 reviews</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                    <p className="text-sm font-medium text-foreground mb-2">Retention</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">94%</p>
                    <p className="text-xs text-muted-foreground">+2.5% growth</p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
                  <p className="text-sm font-medium text-foreground mb-3">Achievement</p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Top Performer
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Top 3% of all specialists</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity and Client Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-slide-up" style={{ animationDelay: "0.8s" }}>
            <RecentActivity />
          </div>

          <div className="space-y-6">
            {/* Active Today */}
            <div className="animate-slide-up" style={{ animationDelay: "0.9s" }}>
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700 shadow-sm hover:shadow-md transition-all duration-300 card-hover">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    Active Today
                  </CardTitle>
                  <p className="text-sm text-green-600 dark:text-green-400">Clients who trained today</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <Avatar
                          key={i}
                          className="h-10 w-10 border-2 border-background ring-2 ring-green-200 dark:ring-green-700"
                        >
                          <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                          <AvatarFallback className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300">
                            U{i}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-green-100 dark:bg-green-800 text-sm font-medium text-green-700 dark:text-green-300 ring-2 ring-green-200 dark:ring-green-700">
                        +1
                      </div>
                    </div>
                    <Badge className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 border-green-200 dark:border-green-600">
                      5 clients
                    </Badge>
                  </div>
                  <Progress value={75} className="h-3" />
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">75% of daily target reached</p>
                </CardContent>
              </Card>
            </div>

            {/* Inactive Clients */}
            <div className="animate-slide-up" style={{ animationDelay: "1s" }}>
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700 shadow-sm hover:shadow-md transition-all duration-300 card-hover">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-orange-800 dark:text-orange-300 flex items-center gap-2">
                    <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                    Needs Attention
                  </CardTitle>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Inactive for 3+ days</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex -space-x-2">
                      {["DL", "LG"].map((initials, i) => (
                        <Avatar
                          key={i}
                          className="h-10 w-10 border-2 border-background ring-2 ring-orange-200 dark:ring-orange-700"
                        >
                          <AvatarFallback className="bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <Badge className="bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-600">
                      3 clients
                    </Badge>
                  </div>
                  <Progress value={25} className="h-3" />
                  <Button
                    size="sm"
                    className="mt-3 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white"
                  >
                    Send Follow-up
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
