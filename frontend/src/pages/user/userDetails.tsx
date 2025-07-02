import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/Badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/usersidebar"
import { Sidebar } from "@/components/user/user-sidebar"
import type { UserDocument } from "@/types/user.type"
import { Edit, Mail, Phone, MapPin, Calendar, Activity, Globe, Clock, Shield } from "lucide-react"

const mockUser: UserDocument = {
  _id: "1",
  fullName: "Sarah Johnson",
  email: "sarah.johnson@example.com",
  profileImage: "/placeholder.svg?height=120&width=120",
  phone: "+1 (555) 123-4567",
  location: {
    type: "Point",
    coordinates: [-74.006, 40.7128], // NYC coordinates
  },
  isActive: true,
  googleId: "google_123456789",
  createdAt: new Date("2023-01-15"),
  updatedAt: new Date("2024-01-02"),
}

export default function ProfilePage() {
//   const [activeItem, setActiveItem] = React.useState("profile")

  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset className="bg-gray-50 dark:bg-gray-950">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-800 px-4 lg:px-6 bg-white dark:bg-black">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">User Profile</h1>
            <Badge
              variant={mockUser.isActive ? "default" : "secondary"}
              className={`${
                mockUser.isActive
                  ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              } font-medium`}
            >
              {mockUser.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          {/* Profile Header */}
          <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <Avatar className="h-24 w-24 lg:h-32 lg:w-32 border-4 border-gray-900 dark:border-white">
                    <AvatarImage src={mockUser.profileImage || "/placeholder.svg"} alt={mockUser.fullName} />
                    <AvatarFallback className="bg-gray-900 text-white dark:bg-white dark:text-black text-2xl lg:text-3xl font-bold">
                      {mockUser.fullName
                        .split(" ")
                        .map((name: string) => name[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      {mockUser.fullName}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      Member since{" "}
                      {mockUser.createdAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Last updated {mockUser.updatedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Button className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold px-6">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Contact Information */}
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white font-bold flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Email
                      </p>
                      <p className="text-gray-900 dark:text-white font-medium break-all">{mockUser.email}</p>
                    </div>
                  </div>
                </div>

                {mockUser.phone && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                        <Phone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Phone
                        </p>
                        <p className="text-gray-900 dark:text-white font-medium">{mockUser.phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                      <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Location
                      </p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {mockUser.location.coordinates[1].toFixed(4)}, {mockUser.location.coordinates[0].toFixed(4)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">New York, NY (Approximate)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white font-bold flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                      <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Status
                      </p>
                      <Badge
                        variant={mockUser.isActive ? "default" : "secondary"}
                        className={`${
                          mockUser.isActive
                            ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                            : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        } font-semibold`}
                      >
                        {mockUser.isActive ? "Active Account" : "Inactive Account"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                      <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Created
                      </p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {mockUser.createdAt.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                      <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Last Updated
                      </p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {mockUser.updatedAt.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Authentication Details */}
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm lg:col-span-2 xl:col-span-1">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white font-bold flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                      <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Account ID
                      </p>
                      <p className="text-gray-900 dark:text-white font-mono text-sm">{mockUser._id}</p>
                    </div>
                  </div>
                </div>

                {mockUser.googleId && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                        <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Google Account
                        </p>
                        <p className="text-gray-900 dark:text-white font-medium">Connected</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{mockUser.googleId}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 font-medium bg-transparent"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white font-bold">Profile Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.floor((new Date().getTime() - mockUser.createdAt.getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Days Active</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockUser.isActive ? "✓" : "✗"}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Account Status</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockUser.googleId ? "✓" : "✗"}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Google Connected</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{mockUser.phone ? "✓" : "✗"}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Phone Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
