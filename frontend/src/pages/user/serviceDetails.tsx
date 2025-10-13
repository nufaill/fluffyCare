import Useraxios from "@/api/user.axios"
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
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
  Pencil,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import type { PetService } from "@/types/service"
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary"
import type { RootState } from "@/redux/store"
import { useSelector } from "react-redux"
import { chatService } from "@/services/chat/chatService"
import { toast } from "@/hooks/use-toast"
import { AxiosError } from "axios"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Define the Review interface based on IReview
interface Review {
  _id: string;
  shopId: string;
  userId: {
    _id: string;
    fullName: string;
    profileImage?: string;
  } | string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

// Define the error response data type
interface ErrorResponse {
  message?: string;
}

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
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [ratingSummary, setRatingSummary] = useState<{ averageRating: number; reviewCount: number } | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [showEditReviewDialog, setShowEditReviewDialog] = useState<string | null>(null)
  const [editReviewRating, setEditReviewRating] = useState<number>(0)
  const [editReviewComment, setEditReviewComment] = useState<string>("")
  const user = useSelector((state: RootState) => state.user.userDatas)
  const userId = user?._id || user?.id || ""
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("No service ID provided")
        setLoading(false)
        setReviewsLoading(false)
        setSummaryLoading(false)
        return
      }

      try {
        setLoading(true)
        setReviewsLoading(true)
        setSummaryLoading(true)
        setError(null)
        setReviewsError(null)
        setSummaryError(null)

        const serviceResponse = await Useraxios.get(`/services/${id}`)
        const serviceData = serviceResponse.data.data || serviceResponse.data
        setService(serviceData)

        if (!serviceData?.shopId?._id) {
          throw new Error("Shop ID not found in service data")
        }

        const [reviewsResponse, summaryResponse] = await Promise.all([
          Useraxios.get(`/shops/${serviceData.shopId._id}/reviews?page=1&limit=10`).catch((err: AxiosError<ErrorResponse>) => ({
            error: err,
          })),
          Useraxios.get(`/shops/${serviceData.shopId._id}/reviews/summary`).catch((err: AxiosError<ErrorResponse>) => ({
            error: err,
          })),
        ])

        // Handle service details
        if (serviceResponse.status !== 200) {
          throw new Error(`Failed to fetch service details: ${serviceResponse.statusText}`)
        }
        setService(serviceData)

        // Handle reviews
        if ('error' in reviewsResponse) {
          setReviewsError(reviewsResponse.error.response?.data?.message || reviewsResponse.error.message || "Failed to load reviews")
        } else {
          if (reviewsResponse.status !== 200) {
            throw new Error(`Failed to fetch reviews: ${reviewsResponse.statusText}`)
          }
          const reviewsData = reviewsResponse.data.data?.reviews || reviewsResponse.data.data || []
          if (!Array.isArray(reviewsData)) {
            throw new Error("Invalid reviews data format")
          }
          const reviewsWithUserDetails = reviewsData.map((review: any) => ({
            ...review,
            _id: review._id || review.id,
            userId: typeof review.userId === 'object' && review.userId !== null
              ? {
                  _id: review.userId.id || review.userId._id,
                  fullName: review.userId.fullName || 'Anonymous User',
                  profileImage: review.userId.profileImage || null,
                }
              : { _id: '', fullName: 'Anonymous User', profileImage: null },
          }))
          setReviews(reviewsWithUserDetails)
        }

        // Handle rating summary
        if ('error' in summaryResponse) {
          setSummaryError(summaryResponse.error.response?.data?.message || summaryResponse.error.message || "Failed to load rating summary")
        } else {
          if (summaryResponse.status !== 200) {
            throw new Error(`Failed to fetch rating summary: ${summaryResponse.statusText}`)
          }
          setRatingSummary(summaryResponse.data.data)
        }

      } catch (err: any) {
        console.error("Data Fetch Error:", err)
        setError(err.message || "An error occurred")
      } finally {
        setLoading(false)
        setReviewsLoading(false)
        setSummaryLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Initialize Leaflet map
  useEffect(() => {
    if (!service?.shopId?.location?.coordinates || !mapContainerRef.current || loading) {
      return
    }

    // Prevent reinitializing the map if it already exists
    if (mapRef.current) {
      mapRef.current.remove()
    }

    const [lng, lat] = service.shopId.location.coordinates
    mapRef.current = L.map(mapContainerRef.current).setView([lat, lng], 15)

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current)

    // Add marker
    L.marker([lat, lng])
      .addTo(mapRef.current)
      .bindPopup(`<b>${service.shopId.name}</b><br>${service.shopId.streetAddress}, ${service.shopId.city}`)
      .openPopup()

    // Cleanup on component unmount or when coordinates change
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [service, loading])

  const handleChatWithShop = async () => {
    if (!userId) {
      navigate("/login")
      return
    }

    if (!service?.shopId?._id) {
      return
    }

    try {
      const chat = await chatService.createChat(userId, service.shopId._id)
      const chatId = chat._id || `${chat.userId}-${chat.shopId}`
      navigate(`/messages?chatId=${chatId}`)
    } catch (err: any) {
      console.error("Failed to create chat:", err)
    }
  }

  const formatPetTypes = (petTypes: any[]) => {
    if (!petTypes || petTypes.length === 0) return []
    return petTypes.map((pet) => (typeof pet === "string" ? pet.charAt(0).toUpperCase() + pet.slice(1) : pet.name))
  }

  const renderStars = (rating: number) => {
    const validRating = rating || 0
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < Math.floor(validRating) ? "fill-current text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
      />
    ))
  }

  const handleSubmitEditReview = async (reviewId: string) => {
    try {
      await Useraxios.put(`/reviews/${reviewId}`, {
        rating: editReviewRating,
        comment: editReviewComment,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setReviews((prevReviews) =>
        prevReviews.map((r) =>
          r._id === reviewId
            ? { ...r, rating: editReviewRating, comment: editReviewComment }
            : r
        )
      )
      setShowEditReviewDialog(null)
      setEditReviewRating(0)
      setEditReviewComment("")
      toast({ title: "Success", description: "Review updated successfully" })
    } catch (err: any) {
      console.error("Failed to update review:", err.response?.data?.message || err.message)
      setReviewsError(err.response?.data?.message || "Failed to update review")
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update review",
        variant: "destructive",
      })
    }
  }

  const renderReview = (review: Review) => {
    const userFullName =
      typeof review.userId === "object" && review.userId !== null
        ? review.userId.fullName || "Anonymous User"
        : "Anonymous User"
    const userProfileImage =
      typeof review.userId === "object" && review.userId !== null
        ? review.userId.profileImage
        : null
    const isOwnReview =
      typeof review.userId === "object" &&
      review.userId !== null &&
      review.userId._id === userId

    return (
      <div
        key={review._id}
        className="border-2 border-gray-300 dark:border-gray-600 rounded-xl p-4"
      >
        <div className="flex items-start justify-between">
          {/* Left: user info */}
          <div className="flex items-start gap-4">
            <img
              src={
                userProfileImage
                  ? cloudinaryUtils.getFullUrl(userProfileImage)
                  : "/api/placeholder/48/48"
              }
              alt={`${userFullName}'s profile`}
              className="w-12 h-12 rounded-full object-cover border-2 border-black dark:border-white"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/api/placeholder/48/48"
              }}
            />
            <div>
              <p className="text-lg font-bold text-black dark:text-white font-mono">
                {userFullName}
              </p>
              <div className="flex items-center gap-2 mb-2">
                {renderStars(review.rating)}
                <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="text-gray-700 dark:text-gray-300 font-mono">
                  {review.comment}
                </p>
              )}
            </div>
          </div>

          {/* Right: action buttons */}
          {isOwnReview && (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowEditReviewDialog(review._id)
                  setEditReviewRating(review.rating)
                  setEditReviewComment(review.comment || "")
                }}
                className="bg-white text-black border border-black hover:bg-gray-100 p-2"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const petTypes = formatPetTypes(service?.petTypeIds || [])

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
                        {summaryLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin text-black dark:text-white" />
                        ) : summaryError ? (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          renderStars(ratingSummary?.averageRating || 0)
                        )}
                        <span className="text-lg font-mono font-bold text-black dark:text-white">
                          {summaryLoading ? "..." : summaryError ? "N/A" : (ratingSummary?.averageRating || 0).toFixed(1)}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 font-mono">
                          ({reviews.length || 0} reviews)
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
                        const totalSeconds = Math.round((service.durationHour || 0) * 3600)
                        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0")
                        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0")
                        const s = String(totalSeconds % 60).padStart(2, "0")
                        return `${h}:${m}:${s}`
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
                  Reviews ({reviews.length || 0})
                </h3>

                {reviewsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-black dark:text-white mx-auto mb-4" />
                    <span className="text-black dark:text-white font-mono text-lg">Loading reviews...</span>
                  </div>
                ) : reviewsError ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <p className="text-red-600 font-mono text-lg">{reviewsError}</p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6 max-h-96 overflow-y-auto">
                    {reviews.map((review) => renderReview(review))}
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
                  Duration:{" "}
                  {(() => {
                    const totalSeconds = Math.round((service.durationHour || 0) * 3600)
                    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0")
                    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0")
                    const s = String(totalSeconds % 60).padStart(2, "0")
                    return `${h}:${m}:${s}`
                  })()}
                </p>
              </CardContent>
            </Card>

            {/* Location Map */}
            <Card className="border-2 border-black dark:border-white bg-white dark:bg-black shadow-xl">
              <CardContent className="p-6">
                <h3 className="font-bold text-xl text-black dark:text-white font-mono mb-4">Location</h3>
                {service.shopId?.location?.coordinates ? (
                  <div
                    ref={mapContainerRef}
                    id="shop-location-map"
                    className="w-full h-48 rounded-xl border-2 border-gray-300 dark:border-gray-600"
                  ></div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl h-48 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 font-mono font-semibold">
                        No location data available
                      </p>
                    </div>
                  </div>
                )}
                {service.shopId?.city && (
                  <p className="text-gray-600 dark:text-gray-400 font-mono mt-3 text-center">
                    {service.shopId.streetAddress}, {service.shopId.city}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Edit Review Dialog */}
      <Dialog
        open={!!showEditReviewDialog}
        onOpenChange={() => {
          setShowEditReviewDialog(null)
          setEditReviewRating(0)
          setEditReviewComment("")
        }}
      >
        <DialogContent className="sm:max-w-[500px] border-0 bg-white dark:bg-black shadow-2xl rounded-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white text-center font-mono">
              Edit Review
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
              <p className="text-blue-800 dark:text-blue-300 font-medium font-mono">
                Update your rating for this service:
              </p>
            </div>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer ${star <= editReviewRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                  onClick={() => setEditReviewRating(star)}
                />
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">Comment:</p>
              <Textarea
                placeholder="Update your review comment here..."
                value={editReviewComment}
                onChange={(e) => setEditReviewComment(e.target.value)}
                className="border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:bg-white dark:focus:bg-black transition-all duration-300 rounded-xl min-h-[100px] font-mono"
              />
            </div>
            <div className="flex gap-4">
              <Button
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 font-mono"
                onClick={() => showEditReviewDialog && handleSubmitEditReview(showEditReviewDialog)}
                disabled={editReviewRating === 0}
              >
                <Star className="w-4 h-4 mr-2" />
                Update Review
              </Button>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-black text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold py-3 rounded-xl transition-all duration-300 font-mono"
                >
                  Cancel
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  )
}