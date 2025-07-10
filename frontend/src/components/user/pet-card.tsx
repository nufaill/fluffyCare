import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/petbadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Heart, Users, GraduationCap, Shield, Pill, Edit } from "lucide-react"
import type { Pet } from "@/types/pet.type"
import { Button } from "../ui/button"
import { useNavigate } from "react-router-dom"

interface PetCardProps {
  pet: Pet
}

export function PetCard({ pet }: PetCardProps) {
  const navigate = useNavigate()
  return (
    <Card className="bg-white dark:bg-gray-950 border-black dark:border-gray-800 hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 ring-2 ring-teal-400 transition-all duration-300 hover:ring-4 hover:ring-teal-300">
            <AvatarImage src={pet.profileImage || "/placeholder.svg"} alt={pet.name} />
            <AvatarFallback className="bg-teal-600 text-white text-lg font-bold">{pet.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl text-gray-900 dark:text-gray-900 font-mono">{pet.name}</CardTitle>
            <p className="text-sm text-gray-700 dark:text-gray-700 font-mono tracking-wide">
              {pet.breed} • {pet.age} years
            </p>
          </div>
          <Badge
            variant={pet.gender === "Male" ? "default" : "secondary"}
            className="bg-teal-900/50 text-gray-800 dark:bg-teal-950/50 dark:text-gray-800 border-teal-700 hover:bg-teal-800/70 transition-colors duration-200"
          >
            {pet.gender}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-700 dark:text-gray-700 font-mono">Weight:</span>
            <p className="font-medium text-gray-900 dark:text-gray-900 font-mono">{pet.weight} kg</p>
          </div>
          <div>
            <span className="text-gray-700 dark:text-gray-700 font-mono">Age:</span>
            <p className="font-medium text-gray-900 dark:text-gray-900 font-mono">{pet.age} years</p>
          </div>
        </div>

        {pet.additionalNotes && (
          <div>
            <span className="text-gray-700 dark:text-gray-700 text-sm font-mono">Notes:</span>
            <p className="text-sm text-gray-800 dark:text-gray-800 mt-1 font-mono tracking-tight">{pet.additionalNotes}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {pet.friendlyWithPets && (
            <Badge
              variant="outline"
              className="text-xs border-teal-700 text-gray-800 dark:border-teal-800 dark:text-gray-800 hover:bg-teal-900/50 hover:text-gray-900 transition-colors duration-200"
            >
              <Heart className="h-3 w-3 mr-1 text-teal-400" />
              Pet Friendly
            </Badge>
          )}
          {pet.friendlyWithOthers && (
            <Badge
              variant="outline"
              className="text-xs border-teal-700 text-gray-800 dark:border-teal-800 dark:text-gray-800 hover:bg-teal-900/50 hover:text-gray-900 transition-colors duration-200"
            >
              <Users className="h-3 w-3 mr-1 text-blue-400" />
              People Friendly
            </Badge>
          )}
          {pet.trainedBefore && (
            <Badge
              variant="outline"
              className="text-xs border-teal-700 text-gray-800 dark:border-teal-800 dark:text-gray-800 hover:bg-teal-900/50 hover:text-gray-900 transition-colors duration-200"
            >
              <GraduationCap className="h-3 w-3 mr-1 text-purple-400" />
              Trained
            </Badge>
          )}
          {pet.vaccinationStatus && (
            <Badge
              variant="outline"
              className="text-xs border-teal-700 text-gray-800 dark:border-teal-800 dark:text-gray-800 hover:bg-teal-900/50 hover:text-gray-900 transition-colors duration-200"
            >
              <Shield className="h-3 w-3 mr-1 text-green-400" />
              Vaccinated
            </Badge>
          )}
          {pet.medication && (
            <Badge
              variant="outline"
              className="text-xs border-orange-700 text-gray-800 dark:border-orange-800 dark:text-gray-800 hover:bg-orange-900/50 hover:text-gray-900 transition-colors duration-200"
            >
              <Pill className="h-3 w-3 mr-1 text-orange-400" />
              On Medication
            </Badge>
          )}
        </div>
        <Button
          onClick={() => {
            if (!pet._id) {
              console.error('Pet ID is undefined for pet:', pet);
              alert('Cannot edit pet: Invalid pet ID');
              return;
            }
            navigate(`/edit-pet/${pet._id}`);
          }}
          variant="outline"
          size="sm"
          className="flex-1 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </CardContent>
    </Card>
  )
}