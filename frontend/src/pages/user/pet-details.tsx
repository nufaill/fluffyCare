"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/Badge"
import { ModernSidebar } from "@/components/user/app-sidebar"
import { PetCard } from "@/components/user/pet-card"
import type { Pet } from "@/types/pet.type"
import { Plus, Search, Filter, Heart, Users, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import Header from "@/components/user/Header"
import Footer from "@/components/user/Footer"
import { useNavigate } from "react-router-dom"
import { userService,  } from "@/services/user/user.service"
import type { PetType } from "@/types/pet.type"
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary"

export default function PetsPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedFilter, setSelectedFilter] = React.useState<"all" | "dogs" | "cats">("all")
  const [pets, setPets] = React.useState<Pet[]>([])
  const [petTypes, setPetTypes] = React.useState<PetType[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const navigate = useNavigate()

  // Get user ID from localStorage or context (adjust based on your auth implementation)
  const userId = localStorage.getItem('userId') || '1' // Fallback to '1' if not found

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch pets and pet types concurrently
        const [petsResponse, petTypesResponse] = await Promise.all([
          userService.getPetsByUserId(userId),
          userService.getAllPetTypes()
        ])

        // Transform API data to match Pet interface
        const transformedPets: Pet[] = petsResponse.map(pet => ({
          ...pet,
          id: pet._id,
          profileImage: pet.profileImage ? cloudinaryUtils.getRelativePath(pet.profileImage) : "",
          createdAt: new Date(pet.createdAt),
          updatedAt: new Date(pet.updatedAt)
        }))

        setPets(transformedPets)
        setPetTypes(petTypesResponse)
      } catch (err) {
        console.error('Error fetching pets:', err)
        setError('Failed to load pets. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  const filteredPets = React.useMemo(() => {
    return pets.filter((pet) => {
      const matchesSearch =
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilter = (() => {
        if (selectedFilter === "all") return true
        
        // Find the pet type name from petTypes array
        const petType = petTypes.find(type => type._id === pet.petTypeId)
        const petTypeName = petType?.name.toLowerCase() || ''
        
        return (
          (selectedFilter === "dogs" && petTypeName.includes("dog")) ||
          (selectedFilter === "cats" && petTypeName.includes("cat"))
        )
      })()
      
      return matchesSearch && matchesFilter
    })
  }, [searchTerm, selectedFilter, pets, petTypes])

  const petStats = React.useMemo(() => {
    const total = pets.length
    
    // Count pets by type
    const dogs = pets.filter(pet => {
      const petType = petTypes.find(type => type._id === pet.petTypeId)
      return petType?.name.toLowerCase().includes("dog")
    }).length
    
    const cats = pets.filter(pet => {
      const petType = petTypes.find(type => type._id === pet.petTypeId)
      return petType?.name.toLowerCase().includes("cat")
    }).length
    
    const vaccinated = pets.filter((pet) => pet.vaccinationStatus).length
    const trained = pets.filter((pet) => pet.trainedBefore).length
    const friendly = pets.filter((pet) => pet.friendlyWithOthers).length

    return { total, dogs, cats, vaccinated, trained, friendly }
  }, [pets, petTypes])

  const handleAddPet = () => {
    navigate("/add-pets")
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add':
        navigate("/add-pets")
        break
      case 'health':
        // Navigate to health records page
        navigate("/health-records")
        break
      case 'training':
        // Navigate to training sessions page
        navigate("/training-sessions")
        break
      case 'export':
        // Handle export functionality
        console.log('Export data functionality to be implemented')
        break
      default:
        break
    }
  }

  if (loading) {
    return (
      <>
        <div className="flex flex-col h-screen bg-white dark:bg-black">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <ModernSidebar />
            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-900 dark:text-white" />
                  <p className="text-gray-600 dark:text-gray-400">Loading your pets...</p>
                </div>
              </div>
            </main>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="flex flex-col h-screen bg-white dark:bg-black">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <ModernSidebar />
            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
              <div className="flex items-center justify-center h-full">
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm max-w-md">
                  <CardContent className="p-6 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-red-100 dark:bg-red-900 rounded-full">
                        <Heart className="h-8 w-8 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Error Loading Pets
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {error}
                        </p>
                        <Button 
                          onClick={() => window.location.reload()}
                          className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold"
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
        <Footer />
      </>
    )
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
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Pets</h1>
                  <Badge className="bg-gray-900 text-white dark:bg-white dark:text-black font-medium">
                    {pets.length} {pets.length === 1 ? "Pet" : "Pets"}
                  </Badge>
                </div>
                <Button 
                  onClick={handleAddPet}
                  className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pet
                </Button>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{petStats.total}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Pets</p>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{petStats.dogs}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Dogs</p>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{petStats.cats}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Cats</p>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{petStats.vaccinated}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Vaccinated</p>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{petStats.trained}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Trained</p>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{petStats.friendly}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">People Friendly</p>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filter */}
              <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search pets by name or breed..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={selectedFilter === "all" ? "default" : "outline"}
                        onClick={() => setSelectedFilter("all")}
                        className={
                          selectedFilter === "all"
                            ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                            : "border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900"
                        }
                      >
                        All
                      </Button>
                      <Button
                        variant={selectedFilter === "dogs" ? "default" : "outline"}
                        onClick={() => setSelectedFilter("dogs")}
                        className={
                          selectedFilter === "dogs"
                            ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                            : "border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900"
                        }
                      >
                        Dogs
                      </Button>
                      <Button
                        variant={selectedFilter === "cats" ? "default" : "outline"}
                        onClick={() => setSelectedFilter("cats")}
                        className={
                          selectedFilter === "cats"
                            ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                            : "border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900"
                        }
                      >
                        Cats
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pets Grid */}
              {filteredPets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPets.map((pet) => (
                    <PetCard key={pet._id} pet={{ ...pet, profileImage: cloudinaryUtils.getFullUrl(pet.profileImage) }} />
                  ))}
                </div>
              ) : (
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-full">
                        <Heart className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {searchTerm || selectedFilter !== "all" ? "No pets found" : "No pets yet"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {searchTerm || selectedFilter !== "all"
                            ? "Try adjusting your search or filter criteria."
                            : "Add your first pet to get started!"}
                        </p>
                        {!searchTerm && selectedFilter === "all" && (
                          <Button 
                            onClick={handleAddPet}
                            className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Pet
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              {filteredPets.length > 0 && (
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white font-bold">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => handleQuickAction('add')}
                        className="justify-start border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 bg-transparent"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Pet
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleQuickAction('health')}
                        className="justify-start border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 bg-transparent"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Health Records
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleQuickAction('training')}
                        className="justify-start border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 bg-transparent"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Training Sessions
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleQuickAction('export')}
                        className="justify-start border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 bg-transparent"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  )
}