import type { PetService } from "@/types/service"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/Badge"
import { MapPin, Clock, Star, Dog, Cat, Rabbit, Bird, Fish, Heart, Shield, Award, Zap } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary"

interface ServiceCardProps {
  service: PetService
}

// Pet type icon mapping
const getPetIcon = (petType: string) => {
  const type = petType.toLowerCase()
  switch (type) {
    case "dog":
    case "dogs":
      return Dog
    case "cat":
    case "cats":
      return Cat
    case "rabbit":
    case "rabbits":
    case "bunny":
      return Rabbit
    case "bird":
    case "birds":
      return Bird
    case "fish":
    case "fishes":
      return Fish
    case "rat":
    case "rats":
    case "hamster":
    case "guinea pig":
      return Rabbit // Using rabbit as closest match for small mammals
    default:
      return Heart // Default icon for unknown pet types
  }
}

// Pet type color mapping
const getPetColor = (petType: string) => {
  const type = petType.toLowerCase()
  switch (type) {
    case "dog":
    case "dogs":
      return "text-amber-600"
    case "cat":
    case "cats":
      return "text-purple-600"
    case "rabbit":
    case "rabbits":
    case "bunny":
      return "text-pink-600"
    case "bird":
    case "birds":
      return "text-blue-600"
    case "fish":
    case "fishes":
      return "text-cyan-600"
    case "rat":
    case "rats":
    case "hamster":
    case "guinea pig":
      return "text-gray-600"
    default:
      return "text-red-600"
  }
}

export const ServiceCard = ({ service }: ServiceCardProps) => {
  const navigate = useNavigate()

  const handleViewDetails = () => {
    navigate(`/services/${service._id}`)
  }

  const formatPetTypes = (petTypes: any) => {
    if (!petTypes) return []

    if (Array.isArray(petTypes)) {
      return petTypes.map((type) => {
        if (typeof type === "object" && type.name) {
          return type.name
        }
        return typeof type === "string" ? type : "Unknown"
      })
    }

    if (typeof petTypes === "object" && petTypes.name) {
      return [petTypes.name]
    }
    if (typeof petTypes === "string") {
      return [petTypes]
    }

    return []
  }

  const formatServiceType = (serviceType: any) => {
    if (!serviceType) return "Service"

    if (typeof serviceType === "object" && serviceType.name) {
      return serviceType.name
    }

    if (typeof serviceType === "string") {
      return serviceType
    }

    return "Service"
  }

  const getServiceImage = () => {
    return service.image || "/placeholder-service.jpg"
  }

  const getShopName = () => {
    if (service.shopId && typeof service.shopId === "object" && service.shopId.name) {
      return service.shopId.name
    }
    return service.name || "Shop Name"
  }

  const getServiceName = () => {
    return service.name || "Service Name"
  }

  const getLocation = () => {
    return service.shopId.city
      ? `${service.shopId.city}, ${service.shopId.streetAddress || ""}`
      : "Location not specified"
  }

  const getDuration = () => {
    const totalSeconds = Math.round((service.durationHour || 0) * 3600)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }



  const getRating = () => {
    return service.rating || 0
  }

  const getReviewCount = () => {
    return service.reviewCount || service.reviews || 0
  }

  const getPrice = () => {
    return service.price || 0
  }

  const petTypes = formatPetTypes(service.petTypeIds)
  const rating = getRating()

  return (
    <Card className="group overflow-hidden bg-white dark:bg-black border-2 border-black dark:border-white hover:shadow-2xl hover:shadow-gray-400/30 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]">
      {/* Image Section with Overlay */}
      <div className="relative overflow-hidden">
        <img
          src={getServiceImage() || "/placeholder.svg"}
          alt={getServiceName()}
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            ; (e.target as HTMLImageElement).src = "/placeholder-service.jpg"
          }}
        />

        {/* Price Badge */}
        <div className="absolute top-4 right-4">
          <div className="bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white font-mono font-semibold text-base md:text-lg px-2 py-0.5 shadow-sm rounded-full">
            ₹{getPrice()}
          </div>
        </div>

        {/* Service Type Badge */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white font-mono font-semibold text-sm px-3 py-1 shadow-sm rounded-full flex items-center">
            <Award className="w-3 h-3 mr-1" />
            {formatServiceType(service.serviceTypeId)}
          </Badge>
        </div>


        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Shop Info Section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={cloudinaryUtils.getFullUrl(service.shopId.logo) || "/placeholder.svg"}
              alt={`${getShopName()} logo`}
              className="w-12 h-12 rounded-full object-cover border-2 border-black dark:border-white shadow-lg"
              onError={(e) => {
                ; (e.target as HTMLImageElement).src = "/placeholder-logo.jpg"
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-black" />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-black dark:text-white font-mono text-lg">{getShopName()}</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                {rating} ({getReviewCount()})
              </span>
            </div>
          </div>
        </div>

        {/* Service Name */}
        <h4 className="font-bold text-2xl text-black dark:text-white font-mono leading-tight">{getServiceName()}</h4>

        {/* Location and Duration */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white dark:text-black" />
            </div>
            <span className="font-mono text-sm">{getLocation()}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-white dark:text-black" />
            </div>
            <span className="font-mono text-sm">{getDuration()}</span>
          </div>
        </div>

        {/* Pet Types with Icons */}
        {petTypes.length > 0 && (
          <div>
            <h5 className="text-sm font-semibold text-black dark:text-white font-mono mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Available for:
            </h5>
            <div className="flex flex-wrap gap-2">
              {petTypes.map((petType, index) => {
                const IconComponent = getPetIcon(petType)
                const colorClass = getPetColor(petType)

                return (
                  <Badge
                    key={index}
                    className="border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 font-mono font-semibold"
                  >
                    <IconComponent className={`w-4 h-4 mr-2 ${colorClass}`} />
                    {petType}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button
          onClick={handleViewDetails}
          className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-mono font-bold text-lg py-3 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <Zap className="w-5 h-5 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
