import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/petbadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import type { Pet } from "@/types/pet.type"
import { Heart, Users, GraduationCap, Shield, Pill } from "lucide-react"

interface PetCardProps {
  pet: Pet
}

export function PetCard({ pet }: PetCardProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-teal-500">
            <AvatarImage src={pet.profileImage || "/placeholder.svg"} alt={pet.name} />
            <AvatarFallback className="bg-teal-500 text-white">{pet.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg text-gray-900 dark:text-white">{pet.name}</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pet.breed} • {pet.age} years old
            </p>
          </div>
          <Badge
            variant={pet.gender === "Male" ? "default" : "secondary"}
            className="bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400"
          >
            {pet.gender}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Weight:</span>
            <p className="font-medium text-gray-900 dark:text-white">{pet.weight} kg</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Age:</span>
            <p className="font-medium text-gray-900 dark:text-white">{pet.age} years</p>
          </div>
        </div>

        {pet.additionalNotes && (
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">Notes:</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{pet.additionalNotes}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {pet.friendlyWithPets && (
            <Badge
              variant="outline"
              className="text-xs border-teal-200 text-teal-700 dark:border-teal-800 dark:text-teal-400"
            >
              <Heart className="h-3 w-3 mr-1" />
              Pet Friendly
            </Badge>
          )}
          {pet.friendlyWithOthers && (
            <Badge
              variant="outline"
              className="text-xs border-teal-200 text-teal-700 dark:border-teal-800 dark:text-teal-400"
            >
              <Users className="h-3 w-3 mr-1" />
              People Friendly
            </Badge>
          )}
          {pet.trainedBefore && (
            <Badge
              variant="outline"
              className="text-xs border-teal-200 text-teal-700 dark:border-teal-800 dark:text-teal-400"
            >
              <GraduationCap className="h-3 w-3 mr-1" />
              Trained
            </Badge>
          )}
          {pet.vaccinationStatus && (
            <Badge
              variant="outline"
              className="text-xs border-teal-200 text-teal-700 dark:border-teal-800 dark:text-teal-400"
            >
              <Shield className="h-3 w-3 mr-1" />
              Vaccinated
            </Badge>
          )}
          {pet.medication && (
            <Badge
              variant="outline"
              className="text-xs border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-400"
            >
              <Pill className="h-3 w-3 mr-1" />
              On Medication
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
