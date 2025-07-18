import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/Badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import Header from "@/components/user/Header"
import Footer from "@/components/user/Footer"
import { ModernSidebar } from "@/components/user/app-sidebar"
import { Edit, Mail, Phone, MapPin, Calendar, Activity, Globe, Clock, Shield, Camera } from 'lucide-react'
import { userService, } from "@/services/user/user.service"
import type { UserDocument } from "@/types/user.type"
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux"
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary";
import type { RootState } from "@/redux/store"
import axios from "axios"


export default function ProfilePage() {
  const [sidebarCollapsed] = React.useState(false);
  const [user, setUser] = React.useState<UserDocument | null>(null)
  const [locationName, setLocationName] = React.useState("")

  const userState = useSelector((state: RootState) => state.user.userDatas);
  const apiKey = import.meta.env.VITE_OPENCAGE_API_KEY
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/profile/update');
  };

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const data = await userService.getUser(userState?.id || "")
        setUser(data)

        const [lng, lat] = data.location.coordinates


        const geoResponse = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
          params: {
            key: apiKey,
            q: `${lat},${lng}`,
            pretty: 1
          }
        })

        const result = geoResponse.data.results?.[0]

        if (result && result.components) {
          const comp = result.components
          const suburb = comp.suburb || comp.village || ""
          const city = comp.city || comp.town || comp.county || ""
          const state = comp.state || ""
          const postcode = comp.postcode || ""
          const country = comp.country || ""

          const formatted = `${suburb}, ${city} – ${postcode}, ${state}, ${country}`
          setLocationName(formatted)
        } else {
          setLocationName("Unknown location")
        }
      } catch (err) {
        console.error("Failed to fetch user or location:", err)
        setLocationName("Unable to load location")
      }
    }

    fetchUser()
  }, [])

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 dark:text-gray-300">Loading profile...</p>
      </div>
    )
  }


  return (
    <><div className="flex flex-col h-screen bg-white dark:bg-black">
      {/* Header spans full width at top */}
      <Header />

      {/* Sidebar and main content below header */}
      <div className="flex flex-1 overflow-hidden">
        <ModernSidebar isCollapsed={sidebarCollapsed} />

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 space-y-6">
            {/* Profile Header */}
            <Card className="overflow-hidden bg-white dark:bg-black border-0 shadow-xl">
              <CardContent className="p-0">
                <div className="relative h-32 bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white">
                  <div className="absolute inset-0 bg-black/20 dark:bg-white/20" />
                  <div className="absolute bottom-4 left-6 right-6">
                    <div className="flex items-end justify-between">
                      <div className="flex items-end gap-4">
                        <div className="relative">
                          <Avatar className="h-24 w-24 border-4 border-white dark:border-black shadow-xl">
                            <AvatarImage src={cloudinaryUtils.getFullUrl(user.profileImage)} alt={user.fullName} />
                            <AvatarFallback className="bg-white dark:bg-black text-gray-900 dark:text-white text-2xl font-bold">
                              {user.fullName}
                            </AvatarFallback>
                          </Avatar>
                          <Button
                            size="icon"
                            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 shadow-lg"
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="pb-2">
                          <h1 className="text-2xl font-bold text-white dark:text-black mb-1">{user.fullName}</h1>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-white/20 dark:bg-black/20 text-white dark:text-black border-white/30 dark:border-black/30">Premium Member</Badge>
                            <Badge
                              variant={user.isActive ? "default" : "secondary"}
                              className={user.isActive ? "bg-gray-600 hover:bg-gray-700 text-white" : "bg-gray-400 text-white"}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={handleClick}
                        className="bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 font-semibold"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.floor((new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Days Active</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">3</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pets Registered</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Bookings Made</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Contact Information */}
              <Card className="shadow-lg border-0 bg-white dark:bg-black">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg mt-1">
                        <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Email Address
                        </p>
                        <p className="text-gray-900 dark:text-white font-medium break-all">{user.email}</p>
                      </div>
                    </div>

                    {user.phone && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg mt-1">
                          <Phone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Phone Number
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">{user.phone}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg mt-1">
                        <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Location
                        </p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {locationName || "Fetching location..."}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Status */}
              <Card className="shadow-lg border-0 bg-white dark:bg-black">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                      <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg mt-1">
                        <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Status
                        </p>
                        <Badge
                          className={user.isActive
                            ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-black"
                            : "bg-gray-400 text-white dark:bg-gray-600 dark:text-white"}
                        >
                          {user.isActive ? "Active Account" : "Inactive Account"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg mt-1">
                        <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Member Since
                        </p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {user.createdAt.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg mt-1">
                        <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Last Updated
                        </p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {user.updatedAt.toLocaleDateString("en-US", {
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

              {/* Authentication */}
              <Card className="shadow-lg border-0 bg-white dark:bg-black lg:col-span-2 xl:col-span-1">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                      <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg mt-1">
                        <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Account ID
                        </p>
                        <p className="text-gray-900 dark:text-white font-mono text-sm">{user._id}</p>
                      </div>
                    </div>

                    {user.googleId && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg mt-1">
                          <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Google Account
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-gray-800 text-white dark:bg-gray-200 dark:text-black">
                              Connected
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">{user.googleId}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Security Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div><Footer /></>
  )
}
