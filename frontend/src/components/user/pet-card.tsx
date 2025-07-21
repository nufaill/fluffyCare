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
    <Card className="bg-white dark:bg-black border-2 border-black dark:border-white hover:shadow-2xl hover:shadow-gray-400/20 transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 ring-2 ring-black dark:ring-white transition-all duration-300 hover:ring-4 hover:ring-gray-600 dark:hover:ring-gray-400">
            <AvatarImage src={pet.profileImage || "/placeholder.svg"} alt={pet.name} />
            <AvatarFallback className="bg-black dark:bg-white text-white dark:text-black text-lg font-bold">
              {pet.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl text-black dark:text-white font-mono font-bold">{pet.name}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono tracking-wide">
              {pet.breed} • {pet.age} years
            </p>
          </div>
          <Badge
            variant={pet.gender === "Male" ? "default" : "secondary"}
            className={`font-mono font-semibold ${
              pet.gender === "Male"
                ? "bg-blue-500 text-white border-blue-600 hover:bg-blue-600"
                : "bg-pink-500 text-white border-pink-600 hover:bg-pink-600"
            } transition-colors duration-200`}
          >
            {pet.gender}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
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
            <span className="text-gray-600 dark:text-gray-400 text-sm font-mono">Notes:</span>
            <p className="text-sm text-black dark:text-white mt-1 font-mono tracking-tight">{pet.additionalNotes}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {pet.friendlyWithPets && (
            <Badge
              variant="outline"
              className="text-xs border-black dark:border-white text-black dark:text-white hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors duration-200"
            >
              <Heart className="h-3 w-3 mr-1 text-red-500" />
              Pet Friendly
            </Badge>
          )}

          {pet.friendlyWithOthers && (
            <Badge
              variant="outline"
              className="text-xs border-black dark:border-white text-black dark:text-white hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors duration-200"
            >
              <Users className="h-3 w-3 mr-1 text-blue-500" />
              People Friendly
            </Badge>
          )}

          {pet.trainedBefore && (
            <Badge
              variant="outline"
              className="text-xs border-black dark:border-white text-black dark:text-white hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-colors duration-200"
            >
              <GraduationCap className="h-3 w-3 mr-1 text-purple-500" />
              Trained
            </Badge>
          )}

          {pet.vaccinationStatus && (
            <Badge
              variant="outline"
              className="text-xs border-black dark:border-white text-black dark:text-white hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors duration-200"
            >
              <Shield className="h-3 w-3 mr-1 text-green-500" />
              Vaccinated
            </Badge>
          )}

          {pet.medication && (
            <Badge
              variant="outline"
              className="text-xs border-black dark:border-white text-black dark:text-white hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors duration-200"
            >
              <Pill className="h-3 w-3 mr-1 text-orange-500" />
              On Medication
            </Badge>
          )}
        </div>

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
          className="w-full border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 font-mono font-semibold"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Pet
        </Button>
      </CardContent>
    </Card>
  )
}
