"use client"

import type React from "react"

import AuthImageSection from "@/components/shared/AuthImageSection"
import type { SignupForm, SignupMode } from "@/types/auth.type"
import {
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Building,
  MapPin,
  FileText,
  Upload,
  Phone,
  Navigation,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import GoogleLoginButton from "../user/GoogleAuthButton"

interface AuthSignupProps {
  mode: SignupMode
  backgroundImage: string
  loginRoute: string
  onSubmit: (data: SignupForm) => Promise<void>
  title: string
  subtitle?: string
  logo?: string
}

export default function AuthSignup({
  mode,
  backgroundImage,
  loginRoute,
  onSubmit,
  title,
  subtitle,
  logo,
}: AuthSignupProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [form, setForm] = useState<SignupForm>(() =>
    mode === "user"
      ? {
          mode: "user",
          profileImage: null,
          fullName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          location: null,
        }
      : {
          mode: "shop",
          logo: null,
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          city: "",
          streetAddress: "",
          description: "",
          certificateUrl: null,
          location: null,
        },
  )
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const getLiveLocation = () => {
    if (!navigator.geolocation) {
      setErrors((prev) => ({ ...prev, location: "Geolocation not supported in your browser" }))
      return
    }

    setLocationLoading(true)
    setLocationStatus("loading")
    setErrors((prev) => ({ ...prev, location: "" }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setForm((prevForm) => ({
          ...prevForm,
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        }))
        setLocationLoading(false)
        setLocationStatus("success")
      },
      (error) => {
        console.error("Location error:", error)
        let errorMessage = "Unable to fetch location. Please allow location access."

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out."
            break
        }

        setErrors((prev) => ({ ...prev, location: errorMessage }))
        setLocationLoading(false)
        setLocationStatus("error")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[+]?[\d\s\-()]{10,}$/
    return phoneRegex.test(phone)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prevForm) => ({ ...prevForm, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null

    if (file) {
      const allowedImageTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
      if (!allowedImageTypes.includes(file.type)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [fieldName]: "Only JPG, PNG, or WEBP images are allowed",
        }))
        setForm((prevForm) => ({ ...prevForm, [fieldName]: null }))
        return
      }
    }

    setErrors((prevErrors) => ({ ...prevErrors, [fieldName]: "" }))
    setForm((prevForm) => ({ ...prevForm, [fieldName]: file }))
  }

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {}

    if (mode === "shop") {
      const shopForm = form as Extract<SignupForm, { mode: "shop" }>

      if (!shopForm.name) {
        newErrors.name = "Shop name is required"
      } else if (shopForm.name.length < 2) {
        newErrors.name = "Shop name must be at least 2 characters"
      } else if (shopForm.name.length > 50) {
        newErrors.name = "Shop name must be less than 50 characters"
      }

      if (!shopForm.city) {
        newErrors.city = "City is required"
      } else if (shopForm.city.length < 2) {
        newErrors.city = "City must be at least 2 characters"
      } else if (shopForm.city.length > 30) {
        newErrors.city = "City must be less than 30 characters"
      }

      if (!shopForm.streetAddress) {
        newErrors.streetAddress = "Street address is required"
      } else if (shopForm.streetAddress.length < 2) {
        newErrors.streetAddress = "Street address must be at least 2 characters"
      } else if (shopForm.streetAddress.length > 100) {
        newErrors.streetAddress = "Street address must be less than 100 characters"
      }

      if (!shopForm.logo) {
        newErrors.logo = "Shop logo is required"
      }

      if (!shopForm.certificateUrl) {
        newErrors.certificateUrl = "Certificate is required"
      }

      // Location validation for shop
      if (!shopForm.location) {
        newErrors.location = "Location is required for shop registration"
      }
    }

    return newErrors
  }

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {}

    // Email Validation
    if (!form.email) {
      newErrors.email = "Email is required"
    } else if (form.email.length < 5) {
      newErrors.email = "Email must be at least 5 characters"
    } else if (form.email.length > 100) {
      newErrors.email = "Email must be less than 100 characters"
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone Validation
    if (!form.phone) {
      newErrors.phone = "Phone number is required"
    } else if (!validatePhone(form.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    // Password Validation
    if (!form.password) {
      newErrors.password = "Password is required"
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    } else if (form.password.length > 100) {
      newErrors.password = "Password must be less than 100 characters"
    }

    // Confirm Password
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    return newErrors
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // -------------------
    // 🧑‍🦱 User Mode Validation
    // -------------------
    if (mode === "user") {
      const nameField = "fullName"
      const nameValue = form[nameField as keyof SignupForm] as string

      // Full Name
      if (!nameValue) {
        newErrors[nameField] = "Full name is required"
      } else if (nameValue.length < 2) {
        newErrors[nameField] = "Full name must be at least 2 characters"
      } else if (nameValue.length > 100) {
        newErrors[nameField] = "Full name must be less than 100 characters"
      }

      // Email
      if (!form.email) {
        newErrors.email = "Email is required"
      } else if (form.email.length < 5) {
        newErrors.email = "Email must be at least 5 characters"
      } else if (form.email.length > 100) {
        newErrors.email = "Email must be less than 100 characters"
      } else if (!validateEmail(form.email)) {
        newErrors.email = "Please enter a valid email address"
      }

      // Phone
      if (!form.phone) {
        newErrors.phone = "Phone number is required"
      } else if (!validatePhone(form.phone)) {
        newErrors.phone = "Please enter a valid phone number"
      } else if (!/^\d{10}$/.test(form.phone)) {
        newErrors.phone = "Phone number must be exactly 10 digits"
      }

      // Password
      if (!form.password) {
        newErrors.password = "Password is required"
      } else if (form.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters"
      } else if (form.password.length > 100) {
        newErrors.password = "Password must be less than 100 characters"
      }

      // Confirm Password
      if (!form.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }

      // Location validation for user
      if (!form.location) {
        newErrors.location = "Location is required for user registration"
      }
    } else {
      // -------------------
      // 🏬 Shop Mode: Validate Step 1 + 2
      // -------------------
      const step1Errors = validateStep1()
      const step2Errors = validateStep2()
      Object.assign(newErrors, step1Errors, step2Errors)
    }

    return newErrors
  }

  const handleNextStep = () => {
    if (mode === "shop" && currentStep === 1) {
      const step1Errors = validateStep1()
      if (Object.keys(step1Errors).length > 0) {
        setErrors(step1Errors)
        return
      }
      setErrors({})
      setCurrentStep(2)
    }
  }

  const handlePrevStep = () => {
    if (mode === "shop" && currentStep === 2) {
      setCurrentStep(1)
      setErrors({})
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let validationErrors: { [key: string]: string } = {}

    if (mode === "user") {
      validationErrors = validateForm()
    } else if (mode === "shop" && currentStep === 2) {
      validationErrors = validateStep2()
    } else if (mode === "shop" && currentStep === 1) {
      handleNextStep()
      return
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      await onSubmit(form)
    } catch (error) {
      console.error("Signup error:", error)
      setErrors({ submit: "Registration failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const renderLocationSection = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Location {mode === "shop" ? "(Required for shop visibility)" : "(Required for nearby services)"}
      </label>
      <div className="space-y-3">
        <button
          type="button"
          onClick={getLiveLocation}
          disabled={locationLoading}
          className={`w-full flex items-center justify-center px-4 py-3 border rounded-lg transition-all duration-200 ${
            form.location
              ? "border-green-500 bg-green-50 text-green-700"
              : locationLoading
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 hover:border-gray-400 text-gray-700"
          }`}
        >
          {locationLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Getting Location...
            </>
          ) : form.location ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Location Captured
            </>
          ) : (
            <>
              <Navigation className="w-5 h-5 mr-2" />
              Get Current Location
            </>
          )}
        </button>

        {form.location && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              Coordinates: {form.location.coordinates[1].toFixed(6)}, {form.location.coordinates[0].toFixed(6)}
            </div>
          </div>
        )}

        {errors.location && (
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.location}
          </p>
        )}
      </div>
    </div>
  )

  const renderUserFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="fullName"
            value={(form as Extract<SignupForm, { mode: "user" }>).fullName}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
              errors.fullName ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
            }`}
            placeholder="Enter your full name"
          />
          {errors.fullName && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          )}
        </div>
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.fullName}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image (Optional)</label>
        <div className="relative">
          <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="file"
            name="profileImage"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={(e) => handleFileChange(e, "profileImage")}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 hover:border-gray-400"
          />
          {errors.profileImage && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.profileImage}
            </p>
          )}
        </div>
      </div>

      {renderLocationSection()}
    </>
  )

  const renderShopStep1 = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="name"
            value={(form as Extract<SignupForm, { mode: "shop" }>).name}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
              errors.name ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
            }`}
            placeholder="Enter your shop name"
          />
          {errors.name && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          )}
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Shop Logo</label>
        <div className="relative">
          <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="file"
            name="logo"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={(e) => handleFileChange(e, "logo")}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
              errors.logo ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
            }`}
          />
          {errors.logo && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          )}
        </div>
        {errors.logo && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.logo}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State & City</label>
          <input
            type="text"
            name="city"
            value={(form as Extract<SignupForm, { mode: "shop" }>).city}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
              errors.city ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
            }`}
            placeholder="State & City"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.city}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="streetAddress"
            value={(form as Extract<SignupForm, { mode: "shop" }>).streetAddress}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
              errors.streetAddress ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
            }`}
            placeholder="Enter street address"
          />
        </div>
        {errors.streetAddress && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.streetAddress}
          </p>
        )}
      </div>

      {renderLocationSection()}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <textarea
            name="description"
            value={(form as Extract<SignupForm, { mode: "shop" }>).description}
            onChange={handleInputChange}
            rows={3}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 resize-none ${
              errors.description ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
            }`}
            placeholder="Describe your shop and services..."
          />
        </div>
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.description}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Certificate</label>
        <div className="relative">
          <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="file"
            name="certificateUrl"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={(e) => handleFileChange(e, "certificateUrl")}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
              errors.certificateUrl ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
            }`}
          />
          {errors.certificateUrl && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          )}
        </div>
        {errors.certificateUrl && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.certificateUrl}
          </p>
        )}
      </div>
    </>
  )

  const renderShopStep2 = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
              errors.email ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
            }`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          )}
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
              errors.phone ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
            }`}
            placeholder="Enter your phone number"
          />
          {errors.phone && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          )}
        </div>
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.phone}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
              errors.password ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
            }`}
            placeholder="Create a password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.password}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
              errors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
            }`}
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.confirmPassword}
          </p>
        )}
      </div>

      <div className="flex items-center">
        <input type="checkbox" className="mr-2 rounded border-gray-300 focus:ring-black" />
        <label className="text-sm text-gray-600">
          I agree to the{" "}
          <a href="#" className="text-black hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-black hover:underline">
            Privacy Policy
          </a>
        </label>
      </div>
    </>
  )

  const renderCommonFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
              errors.email ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
            }`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          )}
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
              errors.phone ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
            }`}
            placeholder="Enter your phone number"
          />
          {errors.phone && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          )}
        </div>
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.phone}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
              errors.password ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
            }`}
            placeholder="Create a password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.password}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
              errors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
            }`}
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.confirmPassword}
          </p>
        )}
      </div>
    </>
  )

  const getStepTitle = () => {
    if (mode === "user") return title
    if (currentStep === 1) return "Shop Information"
    return "Account Details"
  }

  const getStepSubtitle = () => {
    if (mode === "user") return subtitle
    if (currentStep === 1) return "Tell us about your shop and location"
    return "Create your account credentials"
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 flex items-center justify-center px-8 lg:px-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{getStepTitle()}</h1>
            {getStepSubtitle() && <p className="text-gray-600">{getStepSubtitle()}</p>}

            {/* Progress indicator for shop mode */}
            {mode === "shop" && (
              <div className="flex items-center justify-center mt-4 space-x-2">
                <div className={`w-3 h-3 rounded-full ${currentStep === 1 ? "bg-black" : "bg-gray-300"}`}></div>
                <div className={`w-8 h-0.5 ${currentStep === 2 ? "bg-black" : "bg-gray-300"}`}></div>
                <div className={`w-3 h-3 rounded-full ${currentStep === 2 ? "bg-black" : "bg-gray-300"}`}></div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "user" && (
              <>
                {renderUserFields()}
                {renderCommonFields()}
              </>
            )}

            {mode === "shop" && currentStep === 1 && renderShopStep1()}
            {mode === "shop" && currentStep === 2 && renderShopStep2()}

            {mode === "user" && (
              <div className="flex items-center">
                <input type="checkbox" className="mr-2 rounded border-gray-300 focus:ring-black" />
                <label className="text-sm text-gray-600">
                  I agree to the{" "}
                  <a href="#" className="text-black hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-black hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
            )}

            {errors.submit && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.submit}
              </p>
            )}

            <div className="flex gap-4">
              {mode === "shop" && currentStep === 2 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all duration-200"
                >
                  <ArrowLeft className="mr-2 w-5 h-5" />
                  Back
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-black text-white py-3 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : mode === "shop" && currentStep === 1 ? (
                  <>
                    Continue <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-gray-600">
            Already have an account?{" "}
            <Link to={loginRoute} className="text-black font-medium hover:underline transition-colors">
              Sign in
            </Link>
          </div>

          {/* Social login only on final step */}
          {mode === "user" && (
            <div className="mt-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <div className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <GoogleLoginButton />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthImageSection backgroundImage={backgroundImage} logo={logo} />
    </div>
  )
}
