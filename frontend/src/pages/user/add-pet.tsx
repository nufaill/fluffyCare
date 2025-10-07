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
import { ModernSidebar } from "@/components/user/App-sidebar"
import Header from "@/components/user/Header"
import Footer from "@/components/user/Footer"
import { Upload, Save, X, Heart, Camera, Menu } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { userService } from "@/services/user/user.service"
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary"
import type { CreatePetData, PetType } from "@/types/pet.type"
import { useMobile } from "@/hooks/chat/use-mobile"

interface FormErrors {
    petTypeId?: string
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
    const [formData, setFormData] = React.useState<CreatePetData>({
        petTypeId: "",
        profileImage: "",
        name: "",
        breed: "",
        age: 0,
        gender: "" as "Male" | "Female",
        weight: 0,
        additionalNotes: "",
        friendlyWithPets: false,
        friendlyWithOthers: false,
        trainedBefore: false,
        vaccinationStatus: false,
        medication: "",
        userId: ""
    })

    const [errors, setErrors] = React.useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [petTypes, setPetTypes] = React.useState<PetType[]>([])
    const [sidebarOpen, setSidebarOpen] = React.useState(false)
    const navigate = useNavigate()
    const isMobile = useMobile()

    React.useEffect(() => {
        const fetchPetTypes = async () => {
            try {
                const types: PetType[] = await userService.getAllPetTypes()
                setPetTypes(types)
            } catch (error) {
                console.error('Error fetching pet types:', error)
            }
        }
        fetchPetTypes()
    }, [])

    React.useEffect(() => {
        if (!isMobile) {
            setSidebarOpen(false)
        }
    }, [isMobile])

    const handleInputChange = <K extends keyof CreatePetData>(field: K, value: CreatePetData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (field in errors) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.petTypeId) newErrors.petTypeId = "Pet type is required"
        if (!formData.profileImage) newErrors.profileImage = "Profile image is required"
        if (!formData.name.trim()) newErrors.name = "Pet name is required"
        if (!formData.breed.trim()) newErrors.breed = "Breed is required"
        if (!formData.age || formData.age <= 0) newErrors.age = "Valid age is required"
        if (!formData.gender) newErrors.gender = "Gender is required"
        if (!formData.weight || formData.weight <= 0) newErrors.weight = "Valid weight is required"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif']
        if (!validImageTypes.includes(file.type)) {
            setErrors((prev) => ({ ...prev, profileImage: "Only JPG, PNG, or GIF files are allowed" }))
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, profileImage: "Image size must not exceed 5MB" }))
            return
        }

        try {
            const relativePath = await cloudinaryUtils.uploadImage(file)
            handleInputChange("profileImage", relativePath)
            setErrors((prev) => ({ ...prev, profileImage: undefined }))
        } catch (error) {
            console.error('Error uploading image:', error)
            setErrors((prev) => ({ ...prev, profileImage: "Error uploading image" }))
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)

        try {
            await userService.createPet(formData)
            navigate("/pets")
            setSidebarOpen(false)
        } catch (error: any) {
            console.error("Error adding pet:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-black">
            <Header />
            <div className="flex flex-1 overflow-hidden relative">
                {/* Desktop Sidebar */}
                {!isMobile && <ModernSidebar />}
                
                {/* Mobile Sidebar Overlay */}
                {isMobile && sidebarOpen && (
                    <>
                        <div 
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <div className="fixed inset-y-0 left-0 z-50 md:hidden">
                            <ModernSidebar />
                        </div>
                    </>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden w-full">
                    <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 sm:gap-4 border-b border-gray-200 dark:border-gray-800 px-3 sm:px-4 lg:px-6 bg-white dark:bg-black w-full">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                {isMobile && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={toggleSidebar}
                                        className="shrink-0"
                                    >
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                )}
                                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                                    Add New Pet
                                </h1>
                                <Badge className="bg-gray-900 text-white dark:bg-white dark:text-black font-medium shrink-0">
                                    New Pet Registration
                                </Badge>
                            </div>
                            <Button
                                onClick={() => navigate("/pets")}
                                size={isMobile ? "sm" : "default"}
                                variant="outline"
                                className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 bg-transparent shrink-0"
                            >
                                <X className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Cancel</span>
                            </Button>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
                        <div className="p-3 sm:p-4 lg:p-6">
                            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-gray-900 dark:text-white font-bold flex items-center gap-2">
                                            <Heart className="h-5 w-5" />
                                            Basic Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <Label className="text-gray-900 dark:text-white font-medium">Profile Image *</Label>
                                                <div className="mt-2 flex items-center gap-4">
                                                    <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                                                        {formData.profileImage ? (
                                                            <img
                                                                src={cloudinaryUtils.getFullUrl(formData.profileImage)}
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
                                                {errors.profileImage && <p className="text-sm text-red-500 mt-1">{errors.profileImage}</p>}
                                            </div>
                                            <div>
                                                <Label className="text-gray-900 dark:text-white font-medium">Pet Category *</Label>
                                                <Select
                                                    value={formData.petTypeId}
                                                    onValueChange={(value) => handleInputChange("petTypeId", value)}
                                                >
                                                    <SelectTrigger className="mt-2 border-gray-300 dark:border-gray-700">
                                                        <SelectValue placeholder="Select pet type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {petTypes.map((type) => (
                                                            <SelectItem key={type._id} value={type._id}>
                                                                {type.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.petTypeId && <p className="text-sm text-red-500 mt-1">{errors.petTypeId}</p>}
                                            </div>
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
                                            <div>
                                                <Label htmlFor="age" className="text-gray-900 dark:text-white font-medium">
                                                    Age (years) *
                                                </Label>
                                                <Input
                                                    id="age"
                                                    type="number"
                                                    min="0"
                                                    max="50"
                                                    value={formData.age || ""}
                                                    onChange={(e) =>
                                                        handleInputChange("age", e.target.value ? Number.parseInt(e.target.value) : 0)
                                                    }
                                                    placeholder="Enter age"
                                                    className="mt-2 border-gray-300 dark:border-gray-700"
                                                />
                                                {errors.age && <p className="text-sm text-red-500 mt-1">{errors.age}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="weight" className="text-gray-900 dark:text-white font-medium">
                                                    Weight (kg) *
                                                </Label>
                                                <Input
                                                    id="weight"
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={formData.weight || ""}
                                                    onChange={(e) =>
                                                        handleInputChange("weight", e.target.value ? Number.parseFloat(e.target.value) : 0)
                                                    }
                                                    placeholder="Enter weight"
                                                    className="mt-2 border-gray-300 dark:border-gray-700"
                                                />
                                                {errors.weight && <p className="text-sm text-red-500 mt-1">{errors.weight}</p>}
                                            </div>
                                            <div>
                                                <Label className="text-gray-900 dark:text-white font-medium">Gender *</Label>
                                                <RadioGroup
                                                    value={formData.gender}
                                                    onValueChange={(value) => handleInputChange("gender", value as "Male" | "Female")}
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
                                                    onCheckedChange={(checked) => handleInputChange("friendlyWithPets", checked as boolean)}
                                                />
                                                <Label htmlFor="friendlyWithPets" className="text-gray-700 dark:text-gray-300">
                                                    Friendly with other pets
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="friendlyWithOthers"
                                                    checked={formData.friendlyWithOthers}
                                                    onCheckedChange={(checked) => handleInputChange("friendlyWithOthers", checked as boolean)}
                                                />
                                                <Label htmlFor="friendlyWithOthers" className="text-gray-700 dark:text-gray-300">
                                                    Friendly with people
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="trainedBefore"
                                                    checked={formData.trainedBefore}
                                                    onCheckedChange={(checked) => handleInputChange("trainedBefore", checked as boolean)}
                                                />
                                                <Label htmlFor="trainedBefore" className="text-gray-700 dark:text-gray-300">
                                                    Has been trained before
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="vaccinationStatus"
                                                    checked={formData.vaccinationStatus}
                                                    onCheckedChange={(checked) => handleInputChange("vaccinationStatus", checked as boolean)}
                                                />
                                                <Label htmlFor="vaccinationStatus" className="text-gray-700 dark:text-gray-300">
                                                    Up to date with vaccinations
                                                </Label>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
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
                                <div className="flex justify-end gap-4 pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate("/pets")}
                                        size={isMobile ? "sm" : "default"}
                                        className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 bg-transparent"
                                    >
                                        <X className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Cancel</span>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        size={isMobile ? "sm" : "default"}
                                        className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-black mr-2"></div>
                                                Adding Pet...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 sm:mr-2" />
                                                <span className="hidden sm:inline">Add Pet</span>
                                                <span className="sm:hidden">Save</span>
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
        </div>
    )
}