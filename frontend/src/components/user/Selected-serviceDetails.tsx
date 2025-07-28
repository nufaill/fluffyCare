import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Calendar, Clock, DollarSign, Heart, PawPrint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import Useraxios from "@/api/user.axios"
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary"

interface PetDetails {
  id?: string
  name: string
  type: string
  breed: string
  age: string
  weight: string
  specialNotes: string
  profileImage?: string 
  petTypeId?: {
    _id: string
    name: string
  }
}

interface SelectedServiceDetailsProps {
  onBookNow: () => void
}

export default function SelectedServiceDetails({ onBookNow }: SelectedServiceDetailsProps) {
  const { serviceId } = useParams<{ serviceId: string }>()
  const [service, setService] = useState<any>(null)
  const [pets, setPets] = useState<PetDetails[]>([])
  const [selectedPetId, setSelectedPetId] = useState<string>("")
  const [showPetDetails, setShowPetDetails] = useState(false)
  const [petDetails, setPetDetails] = useState<PetDetails>({
    name: "",
    type: "",
    breed: "",
    age: "",
    weight: "",
    specialNotes: "",
    profileImage: "",
  })
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!serviceId) return
      try {
        const response = await Useraxios.get(`/services/${serviceId}`)
        setService(response.data.data || response.data)
      } catch (err) {
        console.error("Error fetching service details", err)
      }
    }

    const fetchUserPets = async () => {
      try {
        const response = await Useraxios.get("/pets/1")
        setPets(response.data.data || response.data)
      } catch (err) {
        console.error("Error fetching user pets", err)
      }
    }

    fetchServiceDetails()
    fetchUserPets()
  }, [serviceId])

  const formatPetTypes = (petTypes: any[]) => {
    if (!petTypes || petTypes.length === 0) return []
    return petTypes.map((pet) => (typeof pet === "string" ? pet.charAt(0).toUpperCase() + pet.slice(1) : pet.name))
  }

  // Filter pets based on service pet types
  const getCompatiblePets = () => {
    if (!service || !service.petTypeIds || !pets) return []
    
    const servicePetTypes = formatPetTypes(service.petTypeIds).map(type => type.toLowerCase())
    
    return pets.filter(pet => {
      const petTypeName = pet.petTypeId?.name?.toLowerCase() || pet.type?.toLowerCase()
      return servicePetTypes.includes(petTypeName)
    })
  }

  const handlePetSelection = (pet: PetDetails) => {
    setSelectedPetId(pet.id || "new")
    setPetDetails(pet)
    setShowPetDetails(true)
    setIsModalOpen(false)
  }

  const openPetModal = () => {
    setIsModalOpen(true)
  }

  const petTypes = service ? formatPetTypes(service.petTypeIds) : []
  const compatiblePets = getCompatiblePets()
  
  const duration = service
    ? `${String(Math.floor(service.durationHour || 0)).padStart(2, "0")}:${String(
        Math.round(((service.durationHour || 0) % 1) * 60),
      ).padStart(2, "0")}`
    : "00:00"

  if (!service) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent mx-auto mb-4"></div>
          <p className="text-black font-medium">Loading service details...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-2 border-black shadow-xl">
          {/* Hero Section */}
          <div className="bg-black text-white p-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4">
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">{service.name}</h1>
            </div>
          </div>

          <CardHeader className="bg-black text-white">
            <CardTitle className="flex items-center gap-3">
              <PawPrint className="w-6 h-6" />
              Service Details
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Pet Types */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-black" />
                <h3 className="font-semibold text-lg">Suitable for</h3>
              </div>
              <div className="flex flex-wrap gap-2 ">
                {petTypes.map((type, index) => (
                  <Badge key={index} className="!bg-black !text-white hover:!bg-gray-800 px-3 py-1">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator className="bg-gray-200" />

            {/* Duration & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-black" />
                  <h3 className="font-semibold">Duration</h3>
                </div>
                <p className="text-2xl font-bold text-black">{duration}</p>
                <p className="text-gray-600 text-sm">Estimated service time</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-black" />
                  <h3 className="font-semibold">Price</h3>
                </div>
                <p className="text-3xl font-bold text-black">₹{service.price}</p>
                <p className="text-gray-600 text-sm">All inclusive</p>
              </div>
            </div>

            <Separator className="bg-gray-200" />

            {/* Book Now Button */}
            <div className="space-y-3">
              <Button
                onClick={onBookNow}
                className="w-full bg-black text-white hover:bg-gray-800 font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Now
              </Button>
            </div>

            <Separator className="bg-gray-200" />

            {/* Pet Details Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PawPrint className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Pet Details</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openPetModal}
                  className="border-black text-black hover:bg-black hover:text-white"
                >
                  Select Pet
                </Button>
              </div>
              {showPetDetails && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Selected Pet</Label>
                    <p className="text-lg font-semibold">{petDetails.name || "No pet selected"}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pet Selection Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Select Your Pet</DialogTitle>
              <DialogClose asChild>
              </DialogClose>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
              {compatiblePets.length === 0 ? (
                <div className="col-span-2 text-center p-4">
                  <p className="text-gray-600 mb-2">No compatible pets found for this service.</p>
                  <p className="text-sm text-gray-500">
                    This service is only available for: {petTypes.join(', ')}
                  </p>
                </div>
              ) : (
                compatiblePets.map((pet) => (
                  <Button
                    key={pet.id}
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto border-2 border-gray-300 hover:border-black"
                    onClick={() => handlePetSelection(pet)}
                  >
                    <img
                      src={pet.profileImage ? cloudinaryUtils.getFullUrl(pet.profileImage) : "https://via.placeholder.com/100"}
                      alt={pet.name}
                      className="w-24 h-24 object-cover rounded-full mb-2"
                      onError={(e) => {
                        console.error('Image failed to load:', pet.profileImage);
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/100";
                      }}
                    />
                    <span className="font-semibold">{pet.name}</span>
                    <span className="text-xs text-gray-500">{pet.petTypeId?.name || pet.type}</span>
                  </Button>
                ))
              )}
              
              {/* Only show "Add New Pet" if service accepts at least one pet type */}
              {petTypes.length > 0 && (
                <Button
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto border-2 border-gray-300 hover:border-black"
                  onClick={() =>
                    handlePetSelection({
                      id: "new",
                      name: "",
                      type: "",
                      breed: "",
                      age: "",
                      weight: "",
                      specialNotes: "",
                      profileImage: "",
                    })
                  }
                >
                  <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-full mb-2">
                    <PawPrint className="w-12 h-12 text-gray-400" />
                  </div>
                  <span className="font-semibold">Add New Pet</span>
                  <span className="text-xs text-gray-500">For: {petTypes.join(', ')}</span>
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}