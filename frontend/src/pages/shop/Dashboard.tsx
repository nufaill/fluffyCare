"use client"

import { PetCareLayout } from "@/components/layout/PetCareLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/Progress"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  DollarSign,
  Award,
  Activity,
  Star,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
} from "lucide-react"

import { Navbar } from "@/components/shop/Navbar"
import type { RootState } from "@/redux/store"
import { useSelector } from "react-redux"
import { useState } from "react"

export default function PetCareDashboard() {
  const { shopData: shop } = useSelector((state: RootState) => state.shop)
  const [selectedTimeframe, setSelectedTimeframe] = useState("monthly")
  const [selectedVisualization, setSelectedVisualization] = useState("bar")

  return (
    <PetCareLayout>
      <Navbar />
      <div className="p-8 space-y-8 bg-gradient-to-br from-background via-background to-muted/20">
        {/* Welcome Header with Quick Stats */}
        <div className="fade-slide-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Welcome back, {shop?.name || "shop owner"}! 👋
              </h1>
              <p className="text-muted-foreground text-lg">Here's your comprehensive business overview for today.</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-2xl font-bold text-foreground">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Revenue & Earnings Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="fade-slide-in" style={{ animationDelay: "0.1s" }}>
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Total Earnings (Lifetime)</p>
                    <p className="text-3xl font-bold">$127,450</p>
                    <p className="text-emerald-100 text-sm mt-1">+15.2% from last year</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-emerald-100" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="fade-slide-in" style={{ animationDelay: "0.2s" }}>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Monthly Revenue</p>
                    <p className="text-3xl font-bold">$24,680</p>
                    <p className="text-blue-100 text-sm mt-1">+8.5% from last month</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-100" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="fade-slide-in" style={{ animationDelay: "0.3s" }}>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Pending Payouts</p>
                    <p className="text-3xl font-bold">$3,240</p>
                    <p className="text-purple-100 text-sm mt-1">Processing in 2 days</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-100" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="fade-slide-in" style={{ animationDelay: "0.4s" }}>
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Commission Deducted</p>
                    <p className="text-3xl font-bold">$1,234</p>
                    <p className="text-orange-100 text-sm mt-1">5% platform fee</p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-100" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Earnings by Service Type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="fade-slide-in" style={{ animationDelay: "0.5s" }}>
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-foreground">Earnings by Service Type</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedVisualization === "bar" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedVisualization("bar")}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={selectedVisualization === "pie" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedVisualization("pie")}
                    >
                      <PieChart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { service: "Grooming", amount: "$12,450", percentage: 45, color: "bg-emerald-500" },
                    { service: "Daycare", amount: "$8,230", percentage: 30, color: "bg-blue-500" },
                    { service: "Training", amount: "$4,120", percentage: 15, color: "bg-purple-500" },
                    { service: "Boarding", amount: "$2,750", percentage: 10, color: "bg-orange-500" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${item.color}`}></div>
                        <span className="font-medium text-foreground">{item.service}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-foreground w-20 text-right">{item.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Insights */}
          <div className="fade-slide-in" style={{ animationDelay: "0.6s" }}>
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">Booking Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Completed</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">156</p>
                    <p className="text-sm text-green-700">$18,450 earned</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Cancelled</span>
                    </div>
                    <p className="text-2xl font-bold text-red-900">12</p>
                    <p className="text-sm text-red-700">$1,240 lost</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-foreground mb-3">Peak Booking Hours</h4>
                  <div className="space-y-2">
                    {[
                      { time: "9:00 AM - 11:00 AM", bookings: 45, color: "bg-emerald-500" },
                      { time: "2:00 PM - 4:00 PM", bookings: 38, color: "bg-blue-500" },
                      { time: "10:00 AM - 12:00 PM", bookings: 32, color: "bg-purple-500" },
                    ].map((slot, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{slot.time}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${slot.color}`}
                              style={{ width: `${(slot.bookings / 45) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8">{slot.bookings}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Customer Insights & Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="fade-slide-in" style={{ animationDelay: "0.7s" }}>
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customer Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-900">1,247</p>
                    <p className="text-sm text-blue-700">Total Customers</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-900">892</p>
                    <p className="text-sm text-green-700">Repeat Customers</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">New This Month</span>
                    <span className="font-bold text-foreground">47</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Retention Rate</span>
                    <span className="font-bold text-green-600">71.5%</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Top Customers</h4>
                  <div className="space-y-2">
                    {[
                      { name: "Sarah Johnson", bookings: 12, spent: "$1,450" },
                      { name: "Mike Davis", bookings: 9, spent: "$1,120" },
                      { name: "Emma Wilson", bookings: 8, spent: "$980" },
                    ].map((customer, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium text-foreground">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.bookings} bookings</p>
                        </div>
                        <span className="text-sm font-bold text-foreground">{customer.spent}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reviews & Ratings */}
          <div className="fade-slide-in" style={{ animationDelay: "0.8s" }}>
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Reviews & Ratings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-3xl font-bold text-yellow-900">4.9</p>
                  <p className="text-sm text-yellow-700">Average Rating (128 reviews)</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Recent Positive</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-sm text-foreground">"Excellent grooming service! My dog looks amazing."</p>
                    <p className="text-xs text-muted-foreground">- Sarah M. (2 days ago)</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Needs Attention</span>
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </div>
                    <p className="text-sm text-foreground">
                      "Service was good but waiting time was longer than expected."
                    </p>
                    <p className="text-xs text-muted-foreground">- Mike D. (1 week ago)</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Flagged Reviews</span>
                  </div>
                  <Badge className="bg-red-100 text-red-800 border-red-200">2 pending</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile & Availability */}
          <div className="fade-slide-in" style={{ animationDelay: "0.9s" }}>
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Profile & Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Verification Status</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">Profile Completeness</span>
                    <span className="text-sm font-bold text-foreground">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Add business hours to reach 100%</p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Next Available Slots</h4>
                  <div className="space-y-2">
                    {[
                      { service: "Grooming", time: "Today 2:30 PM", available: true },
                      { service: "Training", time: "Tomorrow 10:00 AM", available: true },
                      { service: "Daycare", time: "Tomorrow 8:00 AM", available: false },
                    ].map((slot, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium text-foreground">{slot.service}</p>
                          <p className="text-xs text-muted-foreground">{slot.time}</p>
                        </div>
                        <Badge className={slot.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {slot.available ? "Available" : "Booked"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Comparison & Advanced Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="fade-slide-in" style={{ animationDelay: "1.2s" }}>
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Performance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 mb-1">This Month</p>
                    <p className="text-2xl font-bold text-blue-900">$24,680</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">+8.5%</span>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-1">Last Month</p>
                    <p className="text-2xl font-bold text-gray-900">$22,750</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">-2.1%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3">Most Popular Service</h4>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-emerald-900">Pet Grooming</p>
                        <p className="text-sm text-emerald-700">156 bookings this month</p>
                      </div>
                      <Award className="h-8 w-8 text-emerald-600" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3">Customer Feedback Trend</h4>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-800">Rating Improvement</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-bold text-green-900">+0.3 this month</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="fade-slide-in" style={{ animationDelay: "1.3s" }}>
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Service Availability Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Peak Days & Times</span>
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <div key={day} className="text-xs font-medium text-muted-foreground p-2">
                        {day}
                      </div>
                    ))}

                    {[
                      [85, 90, 95, 88, 92, 78, 65],
                      [78, 85, 88, 90, 85, 82, 70],
                      [82, 88, 92, 85, 88, 75, 68],
                    ].map((week, weekIndex) =>
                      week.map((intensity, dayIndex) => (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className={`h-8 rounded text-xs flex items-center justify-center font-medium ${
                            intensity >= 90
                              ? "bg-emerald-500 text-white"
                              : intensity >= 80
                                ? "bg-emerald-400 text-white"
                                : intensity >= 70
                                  ? "bg-emerald-300 text-emerald-900"
                                  : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {intensity}%
                        </div>
                      )),
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Less busy</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-emerald-100 rounded"></div>
                      <div className="w-3 h-3 bg-emerald-300 rounded"></div>
                      <div className="w-3 h-3 bg-emerald-400 rounded"></div>
                      <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                    </div>
                    <span>More busy</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PetCareLayout>
  )
}
