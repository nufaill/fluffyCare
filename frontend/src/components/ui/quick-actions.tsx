import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/Badge"
import { 
  Calendar, 
  Users, 
  MessageCircle, 
  FileText, 
  Clock, 
  DollarSign,
  Plus,
  Zap,
  Bell,
  Settings
} from "lucide-react"

const quickActions = [
  {
    title: "New Appointment",
    description: "Schedule a new service",
    icon: <Calendar className="h-5 w-5" />,
    color: "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    badge: null,
    urgent: false
  },
  {
    title: "Add Client",
    description: "Register new pet owner",
    icon: <Users className="h-5 w-5" />,
    color: "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    badge: null,
    urgent: false
  },
  {
    title: "Messages",
    description: "Check client messages",
    icon: <MessageCircle className="h-5 w-5" />,
    color: "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    badge: "5 new",
    urgent: true
  },
  {
    title: "Generate Report",
    description: "Create service report",
    icon: <FileText className="h-5 w-5" />,
    color: "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
    badge: null,
    urgent: false
  },
  {
    title: "Time Slots",
    description: "Manage availability",
    icon: <Clock className="h-5 w-5" />,
    color: "bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700",
    badge: "3 open",
    urgent: false
  },
  {
    title: "Payments",
    description: "Process payments",
    icon: <DollarSign className="h-5 w-5" />,
    color: "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
    badge: "2 pending",
    urgent: true
  }
]

export function QuickActions() {
  return (
    <Card className="bg-gradient-to-br from-card to-muted/20 border-border shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Actions
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Frequently used actions and shortcuts</p>
          </div>
          <Button variant="outline" size="sm" className="hover:bg-muted/50">
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={action.title}
              variant="outline"
              className={`h-auto p-4 flex flex-col items-start gap-3 border-2 hover:border-primary/20 transition-all duration-300 group hover:scale-[1.02] hover:shadow-md relative overflow-hidden`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-2 rounded-lg text-white shadow-sm transition-transform duration-300 group-hover:scale-110 ${action.color}`}>
                  {action.icon}
                </div>
                {action.badge && (
                  <Badge 
                    className={`text-xs ${action.urgent ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400'}`}
                  >
                    {action.urgent && <Bell className="h-3 w-3 mr-1" />}
                    {action.badge}
                  </Badge>
                )}
              </div>
              
              <div className="text-left w-full">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {action.description}
                </p>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </Button>
          ))}
        </div>
        
        {/* Add Custom Action */}
        <div className="mt-6 pt-4 border-t border-border">
          <Button 
            // variant="dashed" 
            className="w-full h-16 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
          >
            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
              <Plus className="h-5 w-5" />
              <span className="font-medium">Add Custom Action</span>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}