"use client"

import Useraxios from "@/api/user.axios"
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Header from "@/components/user/Header"
import Footer from "@/components/user/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Star,
  Loader2,
  AlertCircle,
  Clock,
  Dog,
  Cat,
  Rabbit,
  Bird,
  Fish,
  Heart,
  Shield,
  Award,
  Calendar,
  CheckCircle,
  XCircle,
  Zap,
  Users,
  MessageCircle,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { PetService } from "@/types/service"
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary"
import type { RootState } from "@/redux/store"
import { useSelector } from "react-redux"
import { chatService } from "@/services/chat/chatService"

// Pet type icon mapping (same as ServiceCard)
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
      return Rabbit
    default:
      return Heart
  }
}

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

export const ServiceDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [service, setService] = useState<PetService | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const user = useSelector((state: RootState) => state.user.userDatas);
  const userId = user?._id || user?.id || "";

  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!id) {
        console.log("No ID provided")
        setError("No service ID provided")
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        console.log("Fetching service with ID:", id)
        const response = await Useraxios.get(`/services/${id}`)
        console.log("API Response Status:", response.status)
        console.log("API Response Headers:", response.headers)
        console.log("API Response Body:", response.data)
        if (response.status !== 200) {
          throw new Error(`Failed to fetch service details: ${response.statusText}`)
        }
        setService(response.data.data || response.data)
      } catch (err: any) {
        console.error("Fetch Error:", err)
        setError(err.response?.data?.message || err.message || "An error occurred")
      } finally {
        setLoading(false)
        console.log("Final State - Loading:", loading, "Error:", error, "Service:", service)
      }
    }

    fetchServiceDetails()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-black dark:text-white mx-auto mb-4" />
              <span className="text-black dark:text-white font-mono text-lg">Loading service details...</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Alert className="mb-6 border-2 border-red-500 bg-red-50 dark:bg-red-950/20">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-600 font-mono font-semibold">
              {error || "Service not found"}
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <Button
              onClick={() => navigate("/services")}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-mono font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }


  const handleChatWithShop = async () => {
    if (!userId) {
      navigate("/login");
      return;
    }

    if (!service?.shopId?._id) {
      return;
    }

    try {
      const chat = await chatService.createChat(userId, service.shopId._id);
      const chatId = chat._id || `${chat.userId}-${chat.shopId}`;
      navigate(`/messages?chatId=${chatId}`);
    } catch (err: any) {
      console.error("Failed to create chat:", err);
    }
  };


  const formatPetTypes = (petTypes: any[]) => {
    if (!petTypes || petTypes.length === 0) return []
    return petTypes.map((pet) => (typeof pet === "string" ? pet.charAt(0).toUpperCase() + pet.slice(1) : pet.name))
  }

  const renderStars = (rating: number) => {
    const validRating = rating || 0
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < Math.floor(validRating) ? "fill-current text-yellow-400" : "text-gray-300 dark:text-gray-600"
          }`}
      />
    ))
  }

  const petTypes = formatPetTypes(service.petTypeIds)

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/services")}
          className="mb-8 flex items-center gap-2 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-mono font-bold transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Services
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Image */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-black dark:border-white shadow-2xl">
              <img
                src={service.image || "/placeholder.svg"}
                alt={service.name}
                className="w-full h-64 md:h-96 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/api/placeholder/600/400"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-6 right-6">
                <Badge className="bg-black dark:bg-white text-white dark:text-black font-mono font-bold text-xl px-4 py-2 shadow-lg">
                  ₹{service.price}
                </Badge>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-4xl font-bold text-white font-mono mb-2">{service.name}</h1>
                <p className="text-xl text-white/90 font-mono">{service.shopId?.name || "Unknown Shop"}</p>
              </div>
            </div>

            {/* Service Info */}
            <Card className="border-2 border-black dark:border-white bg-white dark:bg-black shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-start gap-6 mb-8">
                  <div className="relative">
                    <img
                      src={cloudinaryUtils.getFullUrl(service.shopId.logo ?? "") || "/placeholder.svg"}
                      alt={`${service.shopId?.name || "Shop"} logo`}
                      className="w-20 h-20 rounded-full object-cover border-2 border-black dark:border-white shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/api/placeholder/64/64"
                      }}
                    />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-black" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        {renderStars(service.rating || 0)}
                        <span className="text-lg font-mono font-bold text-black dark:text-white">
                          {service.rating || 0}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 font-mono">
                          ({service.reviewCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-4 border-2 border-black dark:border-white rounded-xl">
                    <Award className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">Service Type</p>
                    <p className="font-bold text-black dark:text-white font-mono">
                      {typeof service.serviceTypeId === "string"
                        ? service.serviceTypeId
                        : service.serviceTypeId?.name || "N/A"}
                    </p>
                  </div>

                  <div className="text-center p-4 border-2 border-black dark:border-white rounded-xl">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">Duration</p>
                    <p className="font-bold text-black dark:text-white font-mono">
                      {(() => {
                        const totalSeconds = Math.round((service.durationHour || 0) * 3600);
                        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
                        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
                        const s = String(totalSeconds % 60).padStart(2, '0');
                        return `${h}:${m}:${s}`;
                      })()}
                    </p>
                  </div>


                  <div className="text-center p-4 border-2 border-black dark:border-white rounded-xl">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">Pet Types</p>
                    <p className="font-bold text-black dark:text-white font-mono">{petTypes.length || "All"}</p>
                  </div>

                  <div className="text-center p-4 border-2 border-black dark:border-white rounded-xl">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">Price</p>
                    <p className="font-bold text-black dark:text-white font-mono">₹{service.price}</p>
                  </div>
                </div>

                {/* Pet Types with Icons */}
                {petTypes.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-bold text-xl text-black dark:text-white font-mono mb-4 flex items-center gap-2">
                      <Shield className="w-6 h-6" />
                      Available for:
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {petTypes.map((petType, index) => {
                        const IconComponent = getPetIcon(petType)
                        const colorClass = getPetColor(petType)

                        return (
                          <Badge
                            key={index}
                            className="border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 font-mono font-semibold text-lg px-4 py-2"
                          >
                            <IconComponent className={`w-5 h-5 mr-2 ${colorClass}`} />
                            {petType}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}

                <Separator className="my-8 bg-black dark:bg-white h-0.5" />

                <div className="mb-8">
                  <h3 className="font-bold text-xl text-black dark:text-white font-mono mb-4">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 font-mono leading-relaxed text-lg">
                    {service.description || "No description available."}
                  </p>
                </div>

                <Separator className="my-8 bg-black dark:bg-white h-0.5" />

                <div>
                  <h3 className="font-bold text-xl text-black dark:text-white font-mono mb-4">Status</h3>
                  <Badge
                    className={`font-mono font-bold text-lg px-4 py-2 ${service.isActive
                      ? "bg-green-500 text-white border-green-600"
                      : "bg-red-500 text-white border-red-600"
                      }`}
                  >
                    {service.isActive ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 mr-2" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="border-2 border-black dark:border-white bg-white dark:bg-black shadow-xl">
              <CardContent className="p-8">
                <h3 className="font-bold text-2xl text-black dark:text-white font-mono mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Reviews ({service.reviewCount || 0})
                </h3>

                {service.reviewCount && service.reviewCount > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                      <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 font-mono text-lg">
                        Review details will be loaded here from the API
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 font-mono text-lg">
                      No reviews yet. Be the first to leave a review!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Shop Details */}
            <Card className="border-2 border-black dark:border-white bg-white dark:bg-black shadow-xl">
              <CardContent className="p-6">
                <h3 className="font-bold text-xl text-black dark:text-white font-mono mb-6">Shop Details</h3>

                <div className="space-y-4">
                  {service.shopId?.streetAddress && (
                    <div className="flex items-start gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                      <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white dark:text-black" />
                      </div>
                      <div>
                        <p className="text-black dark:text-white font-mono font-semibold">
                          {service.shopId.streetAddress}
                        </p>
                        {service.shopId.city && (
                          <p className="text-gray-600 dark:text-gray-400 font-mono">{service.shopId.city}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {service.shopId?.phone && (
                    <div className="flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                      <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white dark:text-black" />
                      </div>
                      <a
                        href={`tel:${service.shopId.phone}`}
                        className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-mono font-semibold"
                      >
                        {service.shopId.phone}
                      </a>
                    </div>
                  )}

                  {service.shopId?.email && (
                    <div className="flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                      <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white dark:text-black" />
                      </div>
                      <a
                        href={`mailto:${service.shopId.email}`}
                        className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-mono font-semibold"
                      >
                        {service.shopId.email}
                      </a>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleChatWithShop}
                  className="w-full font-mono font-bold text-lg py-4 transition-all duration-200 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                  size="lg"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat with Shop
                </Button>
              </CardContent>
            </Card>

            {/* Book Service Button */}
            <Card className="border-2 border-black dark:border-white bg-white dark:bg-black shadow-xl">
              <CardContent className="p-6">
                <Button
                  onClick={() => navigate(`/available-slot/${service.shopId._id}/${id}`)}
                  className={`w-full font-mono font-bold text-lg py-4 transition-all duration-200 ${service.isActive
                    ? "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                    : "bg-gray-400 text-gray-600 cursor-not-allowed"
                    }`}
                  size="lg"
                  disabled={!service.isActive}
                >
                  {service.isActive ? (
                    <>
                      <Calendar className="w-5 h-5 mr-2" />
                      View Available Slots
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 mr-2" />
                      Service Unavailable
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center font-mono">
                  Duration: {(() => {
                    const totalSeconds = Math.round((service.durationHour || 0) * 3600);
                    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
                    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
                    const s = String(totalSeconds % 60).padStart(2, '0');
                    return `${h}:${m}:${s}`;
                  })()}
                </p>
              </CardContent>
            </Card>

            {/* Location Map Placeholder */}
            <Card className="border-2 border-black dark:border-white bg-white dark:bg-black shadow-xl">
              <CardContent className="p-6">
                <h3 className="font-bold text-xl text-black dark:text-white font-mono mb-4">Location</h3>
                <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl h-48 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 font-mono font-semibold">
                      Interactive map would show here
                    </p>
                    {service.shopId?.city && (
                      <p className="text-gray-500 dark:text-gray-500 font-mono mt-2">{service.shopId.city}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
