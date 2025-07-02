"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ModernSidebar } from "@/components/user/app-sidebar"
import Header from "@/components/user/Header"
import Footer from "@/components/user/Footer"
import { Upload, Save, X, Heart, Camera } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface PetCategory {
    id: string
    name: string
    icon: string
}

const petCategories: PetCategory[] = [
    { id: "dog", name: "Dog", icon: "🐕" },
    { id: "cat", name: "Cat", icon: "🐱" },
    { id: "bird", name: "Bird", icon: "🐦" },
    { id: "rabbit", name: "Rabbit", icon: "🐰" },
    { id: "hamster", name: "Hamster", icon: "🐹" },
    { id: "fish", name: "Fish", icon: "🐠" },
    { id: "reptile", name: "Reptile", icon: "🦎" },
    { id: "other", name: "Other", icon: "🐾" },
]

interface AddPetFormData {
    petCategoryId: string
    profileImage: string
    name: string
    breed: string
    age: number | ""
    gender: "Male" | "Female" | ""
    weight: number | ""
    additionalNotes: string
    friendlyWithPets: boolean
    friendlyWithOthers: boolean
    trainedBefore: boolean
    vaccinationStatus: boolean
    medication: string
}

interface FormErrors {
    petCategoryId?: string
    profileImage?: string
    name?: string
    breed?: string
    age?: string
    gender?: string
    weight?: string
    additionalNotes?: string
    friendlyWithPets?: string
    friendlyWithOthers?: string
    trainedBefore?: string
    vaccinationStatus?: string
    medication?: string
}

export default function AddPetPage() {
    const [formData, setFormData] = React.useState<AddPetFormData>({
        petCategoryId: "",
        profileImage: "",
        name: "",
        breed: "",
        age: "",
        gender: "",
        weight: "",
        additionalNotes: "",
        friendlyWithPets: false,
        friendlyWithOthers: false,
        trainedBefore: false,
        vaccinationStatus: false,
        medication: "",
    })

    const [errors, setErrors] = React.useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const navigate = useNavigate();

    const handleInputChange = (field: keyof AddPetFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.petCategoryId) newErrors.petCategoryId = "Pet category is required"
        if (!formData.name.trim()) newErrors.name = "Pet name is required"
        if (!formData.breed.trim()) newErrors.breed = "Breed is required"
        if (!formData.age || formData.age <= 0) newErrors.age = "Valid age is required"
        if (!formData.gender) newErrors.gender = "Gender is required"
        if (!formData.weight || formData.weight <= 0) newErrors.weight = "Valid weight is required"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000))
            console.log("Pet data to submit:", formData)
            // Handle success (redirect, show success message, etc.)
        } catch (error) {
            console.error("Error adding pet:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // In a real app, you'd upload to a server and get back a URL
            const imageUrl = URL.createObjectURL(file)
            handleInputChange("profileImage", imageUrl)
        }
    }

    return (
        <>
            <div className="flex flex-col h-screen bg-white dark:bg-black">
                {/* Header spans full width at top */}
                <Header />

                {/* Sidebar and main content below header */}
                <div className="flex flex-1 overflow-hidden">
                    <ModernSidebar />

                    <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
                        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-800 px-4 lg:px-6 bg-white dark:bg-black">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Add New Pet</h1>
                                    <Badge className="bg-gray-900 text-white dark:bg-white dark:text-black font-medium">
                                        New Pet Registration
                                    </Badge>
                                </div>
                                <Button
                                    onClick={() => navigate("/pets")}
                                    variant="outline"
                                    className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 bg-transparent"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        </header>

                        <div className="p-4 lg:p-6">
                            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                                {/* Basic Information */}
                                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-gray-900 dark:text-white font-bold flex items-center gap-2">
                                            <Heart className="h-5 w-5" />
                                            Basic Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Profile Image */}
                                            <div className="md:col-span-2">
                                                <Label className="text-gray-900 dark:text-white font-medium">Profile Image</Label>
                                                <div className="mt-2 flex items-center gap-4">
                                                    <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                                                        {formData.profileImage ? (
                                                            <img
                                                                src={formData.profileImage || "/placeholder.svg"}
                                                                alt="Pet preview"
                                                                className="h-full w-full object-cover rounded-full"
                                                            />
                                                        ) : (
                                                            <Camera className="h-8 w-8 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                            className="hidden"
                                                            id="profile-image"
                                                        />
                                                        <Label
                                                            htmlFor="profile-image"
                                                            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                                                        >
                                                            <Upload className="h-4 w-4" />
                                                            Upload Photo
                                                        </Label>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">JPG, PNG or GIF (max 5MB)</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Pet Category */}
                                            <div>
                                                <Label className="text-gray-900 dark:text-white font-medium">Pet Category *</Label>
                                                <Select
                                                    value={formData.petCategoryId}
                                                    onValueChange={(value: any) => handleInputChange("petCategoryId", value)}
                                                >
                                                    <SelectTrigger className="mt-2 border-gray-300 dark:border-gray-700">
                                                        <SelectValue placeholder="Select pet category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {petCategories.map((category) => (
                                                            <SelectItem key={category.id} value={category.id}>
                                                                <span className="flex items-center gap-2">
                                                                    <span>{category.icon}</span>
                                                                    {category.name}
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.petCategoryId && <p className="text-sm text-red-500 mt-1">{errors.petCategoryId}</p>}
                                            </div>

                                            {/* Pet Name */}
                                            <div>
                                                <Label htmlFor="name" className="text-gray-900 dark:text-white font-medium">
                                                    Pet Name *
                                                </Label>
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                                    placeholder="Enter pet name"
                                                    className="mt-2 border-gray-300 dark:border-gray-700"
                                                />
                                                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                                            </div>

                                            {/* Breed */}
                                            <div>
                                                <Label htmlFor="breed" className="text-gray-900 dark:text-white font-medium">
                                                    Breed *
                                                </Label>
                                                <Input
                                                    id="breed"
                                                    value={formData.breed}
                                                    onChange={(e) => handleInputChange("breed", e.target.value)}
                                                    placeholder="Enter breed"
                                                    className="mt-2 border-gray-300 dark:border-gray-700"
                                                />
                                                {errors.breed && <p className="text-sm text-red-500 mt-1">{errors.breed}</p>}
                                            </div>

                                            {/* Age */}
                                            <div>
                                                <Label htmlFor="age" className="text-gray-900 dark:text-white font-medium">
                                                    Age (years) *
                                                </Label>
                                                <Input
                                                    id="age"
                                                    type="number"
                                                    min="0"
                                                    max="50"
                                                    value={formData.age}
                                                    onChange={(e) =>
                                                        handleInputChange("age", e.target.value ? Number.parseInt(e.target.value) : "")
                                                    }
                                                    placeholder="Enter age"
                                                    className="mt-2 border-gray-300 dark:border-gray-700"
                                                />
                                                {errors.age && <p className="text-sm text-red-500 mt-1">{errors.age}</p>}
                                            </div>

                                            {/* Weight */}
                                            <div>
                                                <Label htmlFor="weight" className="text-gray-900 dark:text-white font-medium">
                                                    Weight (kg) *
                                                </Label>
                                                <Input
                                                    id="weight"
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={formData.weight}
                                                    onChange={(e) =>
                                                        handleInputChange("weight", e.target.value ? Number.parseFloat(e.target.value) : "")
                                                    }
                                                    placeholder="Enter weight"
                                                    className="mt-2 border-gray-300 dark:border-gray-700"
                                                />
                                                {errors.weight && <p className="text-sm text-red-500 mt-1">{errors.weight}</p>}
                                            </div>

                                            {/* Gender */}
                                            <div>
                                                <Label className="text-gray-900 dark:text-white font-medium">Gender *</Label>
                                                <RadioGroup
                                                    value={formData.gender}
                                                    onValueChange={(value: any) => handleInputChange("gender", value)}
                                                    className="mt-2"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="Male" id="male" />
                                                        <Label htmlFor="male" className="text-gray-700 dark:text-gray-300">
                                                            Male
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="Female" id="female" />
                                                        <Label htmlFor="female" className="text-gray-700 dark:text-gray-300">
                                                            Female
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                                {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Behavioral Information */}
                                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-gray-900 dark:text-white font-bold">Behavioral Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="friendlyWithPets"
                                                    checked={formData.friendlyWithPets}
                                                    onCheckedChange={(checked: any) => handleInputChange("friendlyWithPets", checked)}
                                                />
                                                <Label htmlFor="friendlyWithPets" className="text-gray-700 dark:text-gray-300">
                                                    Friendly with other pets
                                                </Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="friendlyWithOthers"
                                                    checked={formData.friendlyWithOthers}
                                                    onCheckedChange={(checked: any) => handleInputChange("friendlyWithOthers", checked)}
                                                />
                                                <Label htmlFor="friendlyWithOthers" className="text-gray-700 dark:text-gray-300">
                                                    Friendly with people
                                                </Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="trainedBefore"
                                                    checked={formData.trainedBefore}
                                                    onCheckedChange={(checked: any) => handleInputChange("trainedBefore", checked)}
                                                />
                                                <Label htmlFor="trainedBefore" className="text-gray-700 dark:text-gray-300">
                                                    Has been trained before
                                                </Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="vaccinationStatus"
                                                    checked={formData.vaccinationStatus}
                                                    onCheckedChange={(checked: any) => handleInputChange("vaccinationStatus", checked)}
                                                />
                                                <Label htmlFor="vaccinationStatus" className="text-gray-700 dark:text-gray-300">
                                                    Up to date with vaccinations
                                                </Label>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Additional Information */}
                                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-gray-900 dark:text-white font-bold">Additional Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="medication" className="text-gray-900 dark:text-white font-medium">
                                                Current Medication
                                            </Label>
                                            <Input
                                                id="medication"
                                                value={formData.medication}
                                                onChange={(e) => handleInputChange("medication", e.target.value)}
                                                placeholder="Enter current medications (if any)"
                                                className="mt-2 border-gray-300 dark:border-gray-700"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="additionalNotes" className="text-gray-900 dark:text-white font-medium">
                                                Additional Notes
                                            </Label>
                                            <Textarea
                                                id="additionalNotes"
                                                value={formData.additionalNotes}
                                                onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                                                placeholder="Any additional information about your pet..."
                                                rows={4}
                                                className="mt-2 border-gray-300 dark:border-gray-700"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Submit Buttons */}
                                <div className="flex justify-end gap-4 pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 bg-transparent"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-black mr-2"></div>
                                                Adding Pet...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Add Pet
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </main>
                </div>
            </div>
            <Footer />
        </>
    )
}
