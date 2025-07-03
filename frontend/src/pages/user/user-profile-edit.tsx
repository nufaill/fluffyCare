"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/Badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Header from "@/components/user/Header"
import Footer from "@/components/user/Footer"
import { ModernSidebar } from "@/components/user/app-sidebar"
import { Globe, Shield, Camera, Save, X, User, Upload } from "lucide-react"

interface UserFormData {
  fullName: string
  email: string
  phone: string
  bio: string
  location: string
  dateOfBirth: string
  gender: string
  profileImage: string
}

export default function ProfileEditPage() {
  const [sidebarCollapsed] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [imagePreview, setImagePreview] = React.useState<string>("/placeholder.svg")

  const [formData, setFormData] = React.useState<UserFormData>({
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    bio: "Pet lover and enthusiast. I have been caring for pets for over 5 years.",
    location: "New York, NY",
    dateOfBirth: "1990-01-15",
    gender: "male",
    profileImage: "/placeholder.svg",
  })

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setFormData((prev) => ({
          ...prev,
          profileImage: result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log("Updated profile data:", formData)
      // Handle success (redirect, show message, etc.)
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col h-screen bg-white dark:bg-black">
        {/* Header spans full width at top */}
        <Header />

        {/* Sidebar and main content below header */}
        <div className="flex flex-1 overflow-hidden">
          <ModernSidebar isCollapsed={sidebarCollapsed} />

          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6 space-y-6">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Update your personal information and preferences
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
                  onClick={() => window.history.back()}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Image Section */}
                <Card className="overflow-hidden bg-white dark:bg-black border-0 shadow-xl">
                  <CardContent className="p-0">
                    <div className="relative h-32 bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white">
                      <div className="absolute inset-0 bg-black/20 dark:bg-white/20" />
                      <div className="absolute bottom-4 left-6 right-6">
                        <div className="flex items-end gap-4">
                          <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-white dark:border-black shadow-xl">
                              <AvatarImage src={imagePreview || "/placeholder.svg"} alt="Profile" />
                              <AvatarFallback className="bg-white dark:bg-black text-gray-900 dark:text-white text-2xl font-bold">
                                {formData.fullName
                                  .split(" ")
                                  .map((name) => name[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <label
                              htmlFor="profile-image"
                              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 shadow-lg cursor-pointer flex items-center justify-center border border-gray-200 dark:border-gray-800"
                            >
                              <Camera className="h-4 w-4" />
                            </label>
                            <input
                              id="profile-image"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                          </div>
                          <div className="pb-2">
                            <h2 className="text-2xl font-bold text-white dark:text-black mb-1">{formData.fullName}</h2>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-white/20 dark:bg-black/20 text-white dark:text-black border-white/30 dark:border-black/30">
                                Premium Member
                              </Badge>
                              <Badge className="bg-gray-600 hover:bg-gray-700 text-white">Active</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 pt-8">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Upload className="h-4 w-4" />
                        Click the camera icon to upload a new profile picture
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <Card className="shadow-lg border-0 bg-white dark:bg-black">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                          <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Full Name
                          </Label>
                          <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange("fullName", e.target.value)}
                            className="border-gray-300 dark:border-gray-700 focus:border-gray-500 dark:focus:border-gray-400"
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="border-gray-300 dark:border-gray-700 focus:border-gray-500 dark:focus:border-gray-400"
                            placeholder="Enter your email address"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className="border-gray-300 dark:border-gray-700 focus:border-gray-500 dark:focus:border-gray-400"
                            placeholder="Enter your phone number"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Location
                          </Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => handleInputChange("location", e.target.value)}
                            className="border-gray-300 dark:border-gray-700 focus:border-gray-500 dark:focus:border-gray-400"
                            placeholder="Enter your location"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Security Settings */}
                <Card className="shadow-lg border-0 bg-white dark:bg-black">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                        <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      Security & Privacy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Privacy Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white hover:from-gray-700 hover:to-gray-900 dark:hover:from-gray-300 dark:hover:to-gray-100 text-white dark:text-black min-w-[120px]"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  )
}
