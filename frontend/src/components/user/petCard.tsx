import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/petbadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Heart, Users, GraduationCap, Shield, Pill, Edit, Calendar } from "lucide-react"
import type { Pet } from "@/types/pet.type"
import { Button } from "../ui/button"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Useraxios from "@/api/user.axios"

interface PetCardProps {
  pet: Pet
}

interface Booking {
  _id: string
  serviceId: { name: string }
  shopId: { name: string }
  slotDetails: {
    date: string
    startTime: string
    endTime: string
  }
  appointmentStatus: string
}

export function PetCard({ pet }: PetCardProps) {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      const res = await Useraxios.get(`/pet/${pet._id}/with-bookings`)
      setBookings(res.data.data.bookings)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-white dark:bg-black border-2 border-black dark:border-white hover:shadow-2xl hover:shadow-gray-400/20 transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <Avatar className="h-12 sm:h-14 w-12 sm:w-14 ring-2 ring-black dark:ring-white transition-all duration-300 hover:ring-4 hover:ring-gray-600 dark:hover:ring-gray-400">
            <AvatarImage src={pet.profileImage || "/placeholder.svg"} alt={pet.name} />
            <AvatarFallback className="bg-black dark:bg-white text-white dark:text-black text-lg font-bold">
              {pet.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <CardTitle className="text-lg sm:text-xl text-black dark:text-white font-mono font-bold">{pet.name}</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-mono tracking-wide">
              {pet.breed} • {pet.age} years
            </p>
          </div>
          <Badge
            variant={pet.gender === "Male" ? "default" : "secondary"}
            className={`font-mono font-semibold ${pet.gender === "Male"
              ? "bg-blue-500 text-white border-blue-600 hover:bg-blue-600"
              : "bg-pink-500 text-white border-pink-600 hover:bg-pink-600"
            } transition-colors duration-200 text-xs sm:text-sm`}
          >
            {pet.gender}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400 font-mono">Weight:</span>
            <p className="font-medium text-black dark:text-white font-mono">{pet.weight} kg</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400 font-mono">Age:</span>
            <p className="text-black dark:text-white font-mono font-bold">{pet.age} years</p>
          </div>
        </div>

        {pet.additionalNotes && (
          <div>
            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-mono">Notes:</span>
            <p className="text-xs sm:text-sm text-black dark:text-white mt-1 font-mono tracking-tight">{pet.additionalNotes}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-1 sm:gap-2 justify-center sm:justify-start">
          {pet.friendlyWithPets && (
            <Badge
              variant="outline"
              className="text-xs border-black dark:border-white text-black dark:text-white hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors duration-200"
            >
              <Heart className="h-2 sm:h-3 w-2 sm:w-3 mr-1 text-red-500" />
              Pet Friendly
            </Badge>
          )}

          {pet.friendlyWithOthers && (
            <Badge
              variant="outline"
              className="text-xs border-black dark:border-white text-black dark:text-white hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors duration-200"
            >
              <Users className="h-2 sm:h-3 w-2 sm:w-3 mr-1 text-blue-500" />
              People Friendly
            </Badge>
          )}

          {pet.trainedBefore && (
            <Badge
              variant="outline"
              className="text-xs border-black dark:border-white text-black dark:text-white hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-colors duration-200"
            >
              <GraduationCap className="h-2 sm:h-3 w-2 sm:w-3 mr-1 text-purple-500" />
              Trained
            </Badge>
          )}

          {pet.vaccinationStatus && (
            <Badge
              variant="outline"
              className="text-xs border-black dark:border-white text-black dark:text-white hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors duration-200"
            >
              <Shield className="h-2 sm:h-3 w-2 sm:w-3 mr-1 text-green-500" />
              Vaccinated
            </Badge>
          )}

          {pet.medication && (
            <Badge
              variant="outline"
              className="text-xs border-black dark:border-white text-black dark:text-white hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors duration-200"
            >
              <Pill className="h-2 sm:h-3 w-2 sm:w-3 mr-1 text-orange-500" />
              On Medication
            </Badge>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => {
              if (!pet._id || typeof pet._id !== "string" || !/^[0-9a-fA-F]{24}$/.test(pet._id)) {
                console.error("Invalid pet ID:", pet._id)
                return
              }
              navigate(`/edit-pet/${pet._id}`)
            }}
            variant="outline"
            size="sm"
            className="flex-1 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 font-mono font-semibold text-xs sm:text-sm"
          >
            <Edit />
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 font-mono font-semibold text-xs sm:text-sm"
                onClick={fetchBookings}
              >
                <Calendar className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                Booking History
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 border-2 border-black dark:border-white rounded-lg p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl text-black dark:text-white font-mono font-bold">{pet.name}'s Booking History</DialogTitle>
              </DialogHeader>
              <div className="mt-2 sm:mt-4 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto space-y-2 sm:space-y-4 pr-1 sm:pr-2">
                {isLoading ? (
                  <p className="text-gray-600 dark:text-gray-400 font-mono text-center text-xs sm:text-sm">Loading...</p>
                ) : bookings.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 font-mono text-center text-xs sm:text-sm">No bookings found</p>
                ) : (
                  <div className="space-y-2 sm:space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-md p-2 sm:p-4 transition-all duration-200 hover:shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <p className="text-xs sm:text-sm font-mono font-semibold text-blue-600 dark:text-blue-400">
                          {booking.serviceId.name}
                        </p>
                        <p className="text-xs sm:text-sm font-mono text-gray-700 dark:text-gray-300">
                          Shop: <span className="text-green-600 dark:text-green-400">{booking.shopId.name}</span>
                        </p>
                        <p className="text-xs sm:text-xs font-mono text-gray-600 dark:text-gray-400">
                          Date: {new Date(booking.slotDetails.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs sm:text-xs font-mono text-gray-600 dark:text-gray-400">
                          Time: {booking.slotDetails.startTime} - {booking.slotDetails.endTime}
                        </p>
                        <p className="text-xs sm:text-xs font-mono">
                          Status:{' '}
                          <span
                            className={`
                              font-semibold ${
                                booking.appointmentStatus === 'Confirmed'
                                  ? 'text-green-500 dark:text-green-400'
                                  : booking.appointmentStatus === 'Pending'
                                  ? 'text-yellow-500 dark:text-yellow-400'
                                  : booking.appointmentStatus === 'Cancelled'
                                  ? 'text-red-500 dark:text-red-400'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`
                            }
                          >
                            {booking.appointmentStatus}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}