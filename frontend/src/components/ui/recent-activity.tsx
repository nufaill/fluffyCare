import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  MessageCircle, 
  DollarSign, 
  Star, 
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  MoreHorizontal
} from "lucide-react"

const recentActivities = [
  {
    id: 1,
    type: "appointment",
    title: "Grooming session completed",
    description: "Buddy (Sarah Johnson) - Full grooming service",
    time: "2 hours ago",
    status: "completed",
    avatar: "/placeholder.svg?height=32&width=32",
    icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    amount: "$85.00"
  },
  {
    id: 2,
    type: "message",
    title: "New message received",
    description: "Mike Chen asked about Luna's training progress",
    time: "3 hours ago",
    status: "unread",
    avatar: "/placeholder.svg?height=32&width=32",
    icon: <MessageCircle className="h-4 w-4 text-blue-500" />,
    amount: null
  },
  {
    id: 3,
    type: "payment",
    title: "Payment received",
    description: "Emily Davis paid for nail trimming service",
    time: "4 hours ago",
    status: "completed",
    avatar: "/placeholder.svg?height=32&width=32",
    icon: <DollarSign className="h-4 w-4 text-green-500" />,
    amount: "$25.00"
  },
  {
    id: 4,
    type: "review",
    title: "New 5-star review",
    description: "James Wilson left a review for Bella's checkup",
    time: "6 hours ago",
    status: "new",
    avatar: "/placeholder.svg?height=32&width=32",
    icon: <Star className="h-4 w-4 text-yellow-500" />,
    amount: null
  },
  {
    id: 5,
    type: "appointment",
    title: "Appointment rescheduled",
    description: "Alex Thompson moved Max's training to tomorrow",
    time: "8 hours ago",
    status: "rescheduled",
    avatar: "/placeholder.svg?height=32&width=32",
    icon: <Calendar className="h-4 w-4 text-orange-500" />,
    amount: null
  },
  {
    id: 6,
    type: "alert",
    title: "Low inventory alert",
    description: "Pet shampoo stock is running low (3 bottles left)",
    time: "1 day ago",
    status: "warning",
    avatar: null,
    icon: <AlertCircle className="h-4 w-4 text-red-500" />,
    amount: null
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
    case "unread":
    case "new":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400"
    case "warning":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400"
    case "rescheduled":
      return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400"
  }
}

export function RecentActivity() {
  return (
    <Card className="bg-gradient-to-br from-card to-muted/20 border-border shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              Recent Activity
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Latest updates and notifications</p>
          </div>
          <Button variant="outline" size="sm" className="hover:bg-muted/50">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentActivities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-all duration-300 group cursor-pointer"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex-shrink-0">
              {activity.avatar ? (
                <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                  <AvatarImage src={activity.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                    {activity.title.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50 flex items-center justify-center">
                  {activity.icon}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {activity.icon}
                    <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                      {activity.title}
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{activity.time}</span>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </Badge>
                    {activity.amount && (
                      <Badge className="text-xs bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400">
                        {activity.amount}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">6 activities in the last 24 hours</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">New</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Alerts</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}