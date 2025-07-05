
import { PetCareLayout } from '@/components/layout/PetCareLayout';
import { PetStatsCard } from '@/components/ui/PetStatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/Progress';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  DollarSign,
  Calendar,
  Dog,
  Cat,
  Star,
  Award,
  MessageCircle,
  Plus,
  Activity
} from 'lucide-react';

import {Navbar} from '@/components/shop/Navbar';
import type { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';



export default function PetCareDashboard() {
   const { shopData: shop } = useSelector((state: RootState) => state.shop)
  return (
    <PetCareLayout>
      <Navbar/>
      <div className="p-8 space-y-8 bg-gradient-to-br from-background via-background to-muted/20">
        {/* Welcome Header */}
        <div className="fade-slide-in">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Welcome back, {shop?.name ||'shop owner'}! 👋
              </h1>
              <p className="text-muted-foreground text-lg">
                Here's what's happening with your pet care practice today.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-2xl font-bold text-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="fade-slide-in" style={{ animationDelay: '0.1s' }}>
            <PetStatsCard
              title="Total Pet Owners"
              value="1,247"
              change="12% increase"
              trend="up"
              icon={<Users className="h-5 w-5 text-black" />}
            />
          </div>
          
          <div className="fade-slide-in" style={{ animationDelay: '0.2s' }}>
            <PetStatsCard
              title="Monthly Revenue"
              value="$24,680"
              change="8.5% increase"
              trend="up"
              icon={<DollarSign className="h-5 w-5 text-black" />}
            />
          </div>
          
          <div className="fade-slide-in" style={{ animationDelay: '0.3s' }}>
            <PetStatsCard
              title="Today's Appointments"
              value="18"
              change="2 pending"
              trend="neutral"
              icon={<Calendar className="h-5 w-5 text-black" />}
            />
          </div>
          
          <div className="fade-slide-in" style={{ animationDelay: '0.4s' }}>
            <PetStatsCard
              title="Client Satisfaction"
              value="4.9/5"
              change="128 reviews"
              trend="up"
              icon={<Star className="h-5 w-5 text-black" />}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 fade-slide-in" style={{ animationDelay: '0.5s' }}>
            <Card className="h-full bg-white border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-foreground">
                    Today's Schedule
                  </CardTitle>
                  <Badge className="bg-black text-white">
                    18 appointments
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { time: '9:00 AM', pet: 'Bella (Golden Retriever)', owner: 'Mike Johnson', type: 'Grooming', status: 'completed' },
                  { time: '9:30 AM', pet: 'Max (British Shorthair)', owner: 'Sarah Davis', type: 'Checkup', status: 'in-progress' },
                  { time: '10:00 AM', pet: 'Luna (Husky)', owner: 'James Wilson', type: 'Training', status: 'upcoming' },
                  { time: '10:30 AM', pet: 'Charlie (Beagle)', owner: 'Emma Brown', type: 'Vaccination', status: 'upcoming' },
                  { time: '11:00 AM', pet: 'Milo (Persian Cat)', owner: 'David Lee', type: 'Grooming', status: 'upcoming' },
                ].map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-foreground">{appointment.time}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {appointment.pet.includes('Cat') ? (
                          <Cat className="h-5 w-5 text-gray-600" />
                        ) : (
                          <Dog className="h-5 w-5 text-gray-600" />
                        )}
                        <div>
                          <p className="font-medium text-foreground">{appointment.pet}</p>
                          <p className="text-sm text-muted-foreground">{appointment.owner}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge >{appointment.type}</Badge>
                      <Badge 
                        className={
                          appointment.status === 'completed' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : appointment.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Performance */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="fade-slide-in" style={{ animationDelay: '0.6s' }}>
              <Card className="bg-black text-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-white text-black hover:bg-gray-100 justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                  <Button className="w-full bg-white/10 text-white hover:bg-white/20 justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Reminder
                  </Button>
                  <Button className="w-full bg-white/10 text-white hover:bg-white/20 justify-start">
                    <Dog className="h-4 w-4 mr-2" />
                    Add New Pet
                  </Button>
                  <Button className="w-full bg-white/10 text-white hover:bg-white/20 justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Client Management
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Performance Stats */}
            <div className="fade-slide-in" style={{ animationDelay: '0.7s' }}>
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Weekly Goals</span>
                        <span className="font-medium text-foreground">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Client Satisfaction</span>
                        <span className="font-medium text-foreground">94%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Schedule Efficiency</span>
                        <span className="font-medium text-foreground">86%</span>
                      </div>
                      <Progress value={86} className="h-2" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-foreground">Top Performer</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      This Week
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="fade-slide-in" style={{ animationDelay: '0.8s' }}>
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Completed grooming session', pet: 'Bella', time: '10 minutes ago', icon: Dog },
                  { action: 'New appointment scheduled', pet: 'Max', time: '25 minutes ago', icon: Calendar },
                  { action: 'Vaccination reminder sent', pet: 'Luna', time: '1 hour ago', icon: MessageCircle },
                  { action: 'Training session completed', pet: 'Charlie', time: '2 hours ago', icon: Award },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <activity.icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">Pet: {activity.pet}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PetCareLayout>
  );
}
