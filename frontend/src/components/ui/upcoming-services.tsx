import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Phone, Star, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const upcomingAppointments = [
  {
    id: 1,
    petName: "Buddy",
    ownerName: "Sarah Johnson",
    service: "Full Grooming",
    time: "9:00 AM",
    duration: "2h",
    status: "confirmed",
    priority: "high",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "+1 (555) 123-4567",
    notes: "Nervous around clippers",
    rating: 4.9
  },
  {
    id: 2,
    petName: "Luna",
    ownerName: "Mike Chen",
    service: "Basic Training",
    time: "11:30 AM",
    duration: "1h",
    status: "pending",
    priority: "medium",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "+1 (555) 987-6543",
    notes: "First time client",
    rating: 5.0
  },
  {
    id: 3,
    petName: "Max",
    ownerName: "Emily Davis",
    service: "Nail Trimming",
    time: "2:15 PM",
    duration: "30m",
    status: "confirmed",
    priority: "low",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "+1 (555) 456-7890",
    notes: "Regular customer",
    rating: 4.8
  },
  {
    id: 4,
    petName: "Bella",
    ownerName: "James Wilson",
    service: "Health Checkup",
    time: "4:00 PM",
    duration: "45m",
    status: "confirmed",
    priority: "high",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "+1 (555) 321-0987",
    notes: "Senior pet care",
    rating: 4.7
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700"
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700"
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700"
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "border-l-red-500"
    case "medium":
      return "border-l-yellow-500"
    case "low":
      return "border-l-green-500"
    default:
      return "border-l-gray-500"
  }
}

export function UpcomingServices() {
  return (
    <Card className="bg-gradient-to-br from-card to-muted/20 border-border shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Upcoming Services
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Today's appointments and services</p>
          </div>
          <Button variant="outline" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingAppointments.map((appointment, index) => (
          <div
            key={appointment.id}
            className={`p-4 rounded-xl border-l-4 bg-gradient-to-r from-background to-muted/30 hover:from-muted/20 hover:to-muted/40 transition-all duration-300 hover:shadow-md group ${getPriorityColor(appointment.priority)}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
                  <AvatarImage src={appointment.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-700 dark:text-blue-300 font-semibold">
                    {appointment.petName.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{appointment.petName}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-muted-foreground">{appointment.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{appointment.ownerName}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{appointment.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span className="truncate">{appointment.phone}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">{appointment.service}</span>
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Note: {appointment.notes}
                    </p>
                  )}
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Reschedule</DropdownMenuItem>
                  <DropdownMenuItem>Contact Owner</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">4 appointments today</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">On time</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}