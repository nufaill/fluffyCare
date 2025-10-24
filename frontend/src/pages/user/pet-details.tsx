"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/Badge"
import { ModernSidebar } from "@/components/user/AppSidebar"
import { PetCard } from "../../components/user/petCard"
import type { Pet } from "@/types/pet.type"
import { Plus, Search, Heart, Loader2, Menu,  } from "lucide-react"
import { Input } from "@/components/ui/input"
import Header from "@/components/user/Header"
import Footer from "@/components/user/Footer"
import { useNavigate } from "react-router-dom"
import { userService } from "@/services/user/user.service"
import type { PetType } from "@/types/pet.type"
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary"
import { useMobile } from "@/hooks/chat/use-mobile"
import { Pagination } from "@/components/ui/Pagination"

export default function PetsPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedFilter, setSelectedFilter] = React.useState<"all" | "dogs" | "cats">("all")
  const [pets, setPets] = React.useState<Pet[]>([])
  const [petTypes, setPetTypes] = React.useState<PetType[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(6)
  const navigate = useNavigate()
  const isMobile = useMobile()

  const userId = localStorage.getItem('userId') || '1'

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [petsResponse, petTypesResponse] = await Promise.all([
          userService.getPetsByUserId(userId),
          userService.getAllPetTypes()
        ])
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

  React.useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false)
    }
  }, [isMobile])

  const filteredPets = React.useMemo(() => {
    return pets.filter((pet) => {
      const matchesSearch =
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter = (() => {
        if (selectedFilter === "all") return true
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

  const paginatedPets = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return filteredPets.slice(start, end)
  }, [filteredPets, currentPage, pageSize])

  const petStats = React.useMemo(() => {
    const total = pets.length
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
    setSidebarOpen(false)
  }


  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-black">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          {!isMobile && <ModernSidebar />}
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-gray-900 dark:text-white" />
              <p className="text-gray-600 dark:text-gray-400">Loading your pets...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-black">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          {!isMobile && <ModernSidebar />}
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm max-w-md w-full">
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
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <Header />
      
      <div className="flex flex-1 overflow-hidden relative">
        {!isMobile && <ModernSidebar />}
        
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

        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 sm:gap-4 border-b border-gray-200 dark:border-gray-800 px-3 sm:px-4 lg:px-6 bg-white dark:bg-black w-full">
            <div className="flex items-center justify-between w-full gap-2">
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
                  My Pets
                </h1>
                <Badge className="bg-gray-900 text-white dark:bg-white dark:text-black font-medium shrink-0">
                  {pets.length}
                </Badge>
              </div>
              <Button
                onClick={handleAddPet}
                size={isMobile ? "sm" : "default"}
                className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold shrink-0"
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Pet</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
            <div className="flex flex-col gap-4 sm:gap-6 p-3 sm:p-4 lg:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
                {[
                  { label: "Total Pets", value: petStats.total },
                  { label: "Dogs", value: petStats.dogs },
                  { label: "Cats", value: petStats.cats },
                  { label: "Vaccinated", value: petStats.vaccinated },
                  { label: "Trained", value: petStats.trained },
                  { label: "Friendly", value: petStats.friendly }
                ].map((stat, index) => (
                  <Card 
                    key={index}
                    className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm"
                  >
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name or breed..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-white text-sm sm:text-base"
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {["all", "dogs", "cats"].map((filter) => (
                        <Button
                          key={filter}
                          variant={selectedFilter === filter ? "default" : "outline"}
                          onClick={() => setSelectedFilter(filter as typeof selectedFilter)}
                          size={isMobile ? "sm" : "default"}
                          className={
                            selectedFilter === filter
                              ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                              : "border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900"
                          }
                        >
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {paginatedPets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {paginatedPets.map((pet) => (
                    <PetCard 
                      key={pet._id} 
                      pet={{ 
                        ...pet, 
                        profileImage: cloudinaryUtils.getFullUrl(pet.profileImage) 
                      }} 
                    />
                  ))}
                </div>
              ) : (
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardContent className="p-6 sm:p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-full">
                        <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {searchTerm || selectedFilter !== "all" ? "No pets found" : "No pets yet"}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                          {searchTerm || selectedFilter !== "all"
                            ? "Try adjusting your search or filter criteria."
                            : "Add your first pet to get started!"}
                        </p>
                        {!searchTerm && selectedFilter === "all" && (
                          <Button
                            onClick={handleAddPet}
                            size={isMobile ? "sm" : "default"}
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

                <Pagination
                  current={currentPage}
                  total={filteredPets.length}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger
                  pageSizeOptions={[6, 12, 18, 24]}
                  onPageSizeChange={handlePageSizeChange}></Pagination>
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}