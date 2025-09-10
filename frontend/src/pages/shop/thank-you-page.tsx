import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, CheckCircle, Clock, Bell, ArrowRight, Star } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary";
import { ErrorHandler, type Shop, type ShopUpdatePayload } from "@/types/shop.type";
import type { RootState } from "@/redux/store";
import { shopService } from "@/services/shop/shop.service";

// Validation schema
const shopSchema = z.object({
  name: z.string().min(3, "Shop name must be at least 3 characters").max(100),
  city: z.string().min(2, "City must be at least 2 characters").max(100),
  streetAddress: z.string().min(5, "Street address must be at least 5 characters").max(200),
  description: z.string().optional(),
  logo: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, "Logo must be less than 5MB")
    .refine((file) => !file || ["image/jpeg", "image/png"].includes(file.type), "Logo must be JPEG or PNG"),
  certificateUrl: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, "Certificate must be less than 5MB")
    .refine((file) => !file || ["image/jpeg", "image/png"].includes(file.type), "Certificate must be JPEG or PNG"),
});

type ShopFormData = z.infer<typeof shopSchema>;

const Index = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [shopData, setShopData] = useState<Shop | null>(null);
  const [fetchingShop, setFetchingShop] = useState(false);

  const { shopData: reduxShop } = useSelector((state: RootState) => state.shop);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      name: "",
      city: "",
      streetAddress: "",
      description: "",
    },
  });

  // Fetch shop details
  const fetchShopDetails = async (shopId: string) => {
    if (!shopId) return;
    
    setFetchingShop(true);
    try {
      const shop = await shopService.getShop(shopId);
      setShopData(shop);
      
      // Reset form with fetched data
      reset({
        name: shop.name || "",
        city: shop.city || "",
        streetAddress: shop.streetAddress || "",
        description: shop.description || "",
      });

      // Get location address if coordinates exist
      if (shop.location?.coordinates) {
        const [lng, lat] = shop.location.coordinates;
        if (isFinite(lat) && isFinite(lng)) {
          getAddressFromCoordinates(lat, lng).then(setLocationAddress);
        } else {
          setLocationAddress("Invalid coordinates");
          toast({
            title: "Warning",
            description: "Invalid shop coordinates provided",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      const errorMessage = ErrorHandler.extractMessage(error);
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to fetch shop details: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setFetchingShop(false);
    }
  };

  const getAddressFromCoordinates = async (lat: number, lng: number, retries = 3): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.display_name || `${lat}, ${lng}`;
    } catch (error) {
      if (retries > 0) {
        console.warn(`Retrying address fetch... (${retries} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s before retry
        return getAddressFromCoordinates(lat, lng, retries - 1);
      }
      const errorMessage = ErrorHandler.extractMessage(error);
      console.error("Error getting address:", errorMessage);
      toast({
        title: "Error",
        description: `Failed to fetch address: ${errorMessage}`,
        variant: "destructive"
      });
      return `${lat}, ${lng}`;
    }
  };

  // Initialize component
  useEffect(() => {
    const shop = shopData || reduxShop;
    if (shop?._id) {
      fetchShopDetails(shop._id);
    }
  }, [reduxShop]);

  const onSubmit = async (data: ShopFormData) => {
    const currentShop = shopData || reduxShop;
    if (!currentShop?._id) {
      toast({
        title: "Error",
        description: "Shop ID not found",
        variant: "destructive"
      });
      setError("Shop ID not found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData: ShopUpdatePayload = {
        name: data.name,
        city: data.city,
        streetAddress: data.streetAddress,
        description: data.description,
        certificateUrl: "" // Default empty string as required by type
      };

      // Upload logo if provided
      if (data.logo) {
        try {
          updateData.logo = await cloudinaryUtils.uploadImage(data.logo);
        } catch (uploadError) {
          throw new Error("Failed to upload logo image");
        }
      }

      // Upload certificate if provided
      if (data.certificateUrl) {
        try {
          updateData.certificateUrl = await cloudinaryUtils.uploadImage(data.certificateUrl);
        } catch (uploadError) {
          throw new Error("Failed to upload certificate image");
        }
      }

      const updatedShop = await shopService.editShop(updateData);
      setShopData(updatedShop);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Shop profile updated successfully",
      });

      // Optionally update Redux store here if needed
      // dispatch(updateShopData(updatedShop));

    } catch (error) {
      const errorMessage = ErrorHandler.extractMessage(error);
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to update profile: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    const shop = shopData || reduxShop;
    if (shop) {
      reset({
        name: shop.name || "",
        city: shop.city || "",
        streetAddress: shop.streetAddress || "",
        description: shop.description || "",
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const fullText = "WELCOME TO FLUFFYCARE SHOP PORTAL";

  useEffect(() => {
    // Generate particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);

    // Initial reveal
    const revealTimer = setTimeout(() => setIsVisible(true), 400);

    // Typewriter effect
    let index = 0;
    const typewriterTimer = setInterval(() => {
      if (index < fullText.length) {
        setTypewriterText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typewriterTimer);
        setShowCelebration(true);
      }
    }, 100);

    // Progressive steps
    const stepTimers = [
      setTimeout(() => setCurrentStep(1), 2500),
      setTimeout(() => setCurrentStep(2), 4000),
      setTimeout(() => setCurrentStep(3), 5500),
    ];

    return () => {
      clearTimeout(revealTimer);
      clearInterval(typewriterTimer);
      stepTimers.forEach(clearTimeout);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: "easeInOut", staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } },
  };

  const stepVariants = {
    hidden: { opacity: 0, x: -50, scale: 0.9 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.7, ease: "easeInOut" } },
  };

  const currentShop = shopData || reduxShop;

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05)_0%,transparent_70%)]" />
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-gray-300 rounded-full"
          style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
          transition={{ duration: 3 + particle.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Celebration Effect */}
      <AnimatePresence>
        {showCelebration && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-gray-600 rounded-full"
                initial={{ x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800), y: -10, scale: 0 }}
                animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 600) + 10, scale: [0, 1, 0] }}
                transition={{ duration: 3, delay: i * 0.1, ease: "easeOut" }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="max-w-7xl w-full"
        >
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Section */}
            <motion.div variants={itemVariants} className="space-y-8">
              {/* Loading State */}
              {fetchingShop && (
                <motion.div
                  variants={itemVariants}
                  className="p-6 rounded-xl shadow-md bg-blue-50"
                >
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="text-blue-800 font-medium">Loading shop details...</span>
                  </div>
                </motion.div>
              )}

              {/* Verification Status */}
              <motion.div
                variants={itemVariants}
                className={`p-6 rounded-xl shadow-md ${
                  currentShop?.isVerified.status === "approved" ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <h3 className="text-2xl font-bold">
                  Verification Status: {currentShop?.isVerified.status === "approved" ? "Verified" : "Not Verified"}
                </h3>
                {currentShop?.isVerified.status !== "approved" && currentShop?.isVerified.reason && (
                  <p className="text-red-600 mt-2 text-sm">{currentShop.isVerified.reason}</p>
                )}
              </motion.div>

              {/* Brand Header */}
              <motion.div variants={itemVariants} className="flex items-center gap-4">
                <motion.div
                  className="relative"
                  animate={{ rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center shadow-lg">
                    <Heart className="w-6 h-6 text-white" fill="currentColor" />
                  </div>
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-white border-2 border-gray-800 rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-2 h-2 text-gray-800" />
                  </motion.div>
                </motion.div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                    Fluffy<span className="text-gray-500">Care</span>
                  </h1>
                  <p className="text-base text-gray-600">Shop Partner Portal</p>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.div variants={itemVariants} className="space-y-4">
                <motion.h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                  {typewriterText}
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-gray-400"
                  >
                    |
                  </motion.span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.5, duration: 0.6 }}
                  className="text-xl text-gray-600"
                >
                  Your shop registration is under review 🏪
                </motion.p>
              </motion.div>

              {/* Shop Details */}
              <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Shop Details</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    disabled={fetchingShop}
                  >
                    {isEditing ? "Cancel" : "Edit Details"}
                  </motion.button>
                </div>
                
                {isEditing ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Shop Name</label>
                      <input
                        {...register("name")}
                        className="mt-1 p-2 w-full border rounded-lg focus:ring-2 focus:ring-gray-800"
                        placeholder="Enter shop name"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        {...register("city")}
                        className="mt-1 p-2 w-full border rounded-lg focus:ring-2 focus:ring-gray-800"
                        placeholder="Enter city"
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Street Address</label>
                      <input
                        {...register("streetAddress")}
                        className="mt-1 p-2 w-full border rounded-lg focus:ring-2 focus:ring-gray-800"
                        placeholder="Enter street address"
                      />
                      {errors.streetAddress && (
                        <p className="text-red-500 text-xs mt-1">{errors.streetAddress.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        {...register("description")}
                        className="mt-1 p-2 w-full border rounded-lg focus:ring-2 focus:ring-gray-800"
                        placeholder="Enter shop description"
                        rows={3}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Logo</label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setValue("logo", file);
                        }}
                        className="mt-1 p-2 w-full border rounded-lg"
                      />
                      {errors.logo && <p className="text-red-500 text-xs mt-1">{errors.logo.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Certificate</label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setValue("certificateUrl", file);
                        }}
                        className="mt-1 p-2 w-full border rounded-lg"
                      />
                      {errors.certificateUrl && (
                        <p className="text-red-500 text-xs mt-1">{errors.certificateUrl.message}</p>
                      )}
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex gap-3">
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gray-800 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={handleCancel}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <p>
                      <strong className="text-gray-700">Name:</strong> {currentShop?.name || "N/A"}
                    </p>
                    <p>
                      <strong className="text-gray-700">Email:</strong> {currentShop?.email || "N/A"}
                    </p>
                    <p>
                      <strong className="text-gray-700">Phone:</strong> {currentShop?.phone || "N/A"}
                    </p>
                    <p>
                      <strong className="text-gray-700">City:</strong> {currentShop?.city || "N/A"}
                    </p>
                    <p>
                      <strong className="text-gray-700">Street Address:</strong> {currentShop?.streetAddress || "N/A"}
                    </p>
                    <p>
                      <strong className="text-gray-700">Description:</strong> {currentShop?.description || "N/A"}
                    </p>
                    <p>
                      <strong className="text-gray-700">Location:</strong> {locationAddress || "N/A"}
                    </p>
                    {currentShop?.logo && (
                      <div>
                        <strong className="text-gray-700">Logo:</strong>
                        <img src={currentShop.logo} alt="Shop Logo" className="w-24 h-24 object-cover rounded-lg mt-2" />
                      </div>
                    )}
                    {currentShop?.certificateUrl && (
                      <div>
                        <strong className="text-gray-700">Certificate:</strong>
                        <img
                          src={currentShop.certificateUrl}
                          alt="Certificate"
                          className="w-24 h-24 object-cover rounded-lg mt-2"
                        />
                      </div>
                    )}
                    <p>
                      <strong className="text-gray-700">Created At:</strong> {formatDate(currentShop?.createdAt)}
                    </p>
                    <p>
                      <strong className="text-gray-700">Updated At:</strong> {formatDate(currentShop?.updatedAt)}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Verification Status Cards */}
              <div className="space-y-6">
                {[
                  {
                    icon: CheckCircle,
                    title: "Shop Application Under Review",
                    description: "Our AI-powered system is analyzing your pet care profile for optimal matching.",
                    status: "In Review",
                    progress: 95,
                    bgColor: "bg-white",
                    iconBg: "bg-gray-800",
                  },
                  {
                    icon: Clock,
                    title: "Processing Timeline: 24 Hours",
                    description: "Quality assurance protocols ensure perfect pet-owner compatibility.",
                    status: "Processing",
                    progress: 100,
                    bgColor: "bg-white",
                    iconBg: "bg-gray-700",
                  },
                  {
                    icon: Bell,
                    title: "Admin Verification Required",
                    description: "Once approved by our admin team, you'll gain access to your complete shop dashboard.",
                    status: "Pending",
                    progress: 70,
                    bgColor: "bg-white",
                    iconBg: "bg-gray-600",
                  },
                ].map((service, index) => (
                  <motion.div
                    key={index}
                    initial="hidden"
                    animate={currentStep > index ? "visible" : "hidden"}
                    variants={stepVariants}
                    className="group cursor-pointer"
                  >
                    <div className={`relative rounded-xl p-6 shadow-md ${service.bgColor} hover:shadow-lg transition-all duration-300`}>
                      <div className="flex items-start gap-4">
                        <motion.div
                          className={`flex-shrink-0 w-12 h-12 ${service.iconBg} rounded-lg flex items-center justify-center shadow-sm`}
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <service.icon className="w-6 h-6 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">{service.title}</h3>
                            <motion.span
                              className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-white"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {service.status}
                            </motion.span>
                          </div>
                          <p className="text-gray-600 text-sm">{service.description}</p>
                          <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                className="h-full bg-gray-800 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${service.progress}%` }}
                                transition={{ duration: 1.5, delay: index * 0.2, ease: "easeOut" }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 mt-1 block">{service.progress}% Complete</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: currentStep >= 3 ? 1 : 0, y: currentStep >= 3 ? 0 : 20 }}
                transition={{ duration: 0.8 }}
                className="bg-gray-800 p-6 rounded-xl shadow-md"
              >
                <h3 className="text-xl font-semibold text-white mb-3">What Happens Next?</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Our admin team will review your shop credentials and verify your business details. Once approved, you'll
                  receive full access to your shop dashboard with all management tools.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-gray-800 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                    onClick={async () => {
                      const shop = currentShop;
                      if (!shop?._id) {
                        toast({
                          title: "Error",
                          description: "Shop ID not found",
                          variant: "destructive"
                        });
                        return;
                      }
                      try {
                        await fetchShopDetails(shop._id);
                        toast({
                          title: "Success",
                          description: "Shop status refreshed successfully",
                        });
                      } catch (error) {
                        const errorMessage = ErrorHandler.extractMessage(error);
                        toast({
                          title: "Error",
                          description: `Failed to fetch shop status: ${errorMessage}`,
                          variant: "destructive"
                        });
                      }
                    }}
                    disabled={fetchingShop}
                  >
                    {fetchingShop ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Checking...
                      </>
                    ) : (
                      <>
                        Check Status
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="border border-white text-white hover:bg-white hover:text-gray-800 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    Contact Support
                    <Star className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Visual Section */}
            <motion.div variants={itemVariants} className="relative hidden lg:flex items-center justify-center">
              <motion.div
                className="relative bg-white rounded-2xl p-4 shadow-lg"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
              >
                <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border border-gray-200">
                  <motion.div
                    className="text-center px-6"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                      <Heart className="w-12 h-12 text-white" fill="currentColor" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Shop Verification</h3>
                    <p className="text-gray-600 text-sm">Pending Admin Approval</p>
                    <div className="flex justify-center gap-4 mt-6">
                      {["🏪", "✅", "⏰", "🔒"].map((emoji, index) => (
                        <motion.div
                          key={index}
                          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg shadow-sm border border-gray-200"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 1.5, delay: index * 0.2, repeat: Infinity }}
                        >
                          {emoji}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;