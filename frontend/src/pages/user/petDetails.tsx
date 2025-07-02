"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/Badge"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/usersidebar"
import { Sidebar } from "@/components/user/user-sidebar"
import { PetCard } from "@/components/user/pet-card"
import type {  Pet } from "@/types/pet.type"
import { Plus, Search, Filter, Heart, Users } from "lucide-react"
import { Input } from "@/components/ui/input"



const mockPets: Pet[] = [
  {
    id: "1",
    userId: "1",
    petCategoryId: "cat",
    profileImage: "/placeholder.svg?height=200&width=200",
    name: "Luna",
    breed: "Persian Cat",
    age: 3,
    gender: "Female",
    weight: 4.5,
    additionalNotes: "Very friendly and loves to play with toys. Enjoys sunny spots by the window.",
    friendlyWithPets: true,
    friendlyWithOthers: true,
    trainedBefore: true,
    vaccinationStatus: true,
    medication: "",
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    userId: "1",
    petCategoryId: "dog",
    profileImage: "/placeholder.svg?height=200&width=200",
    name: "Max",
    breed: "Golden Retriever",
    age: 5,
    gender: "Male",
    weight: 28.5,
    additionalNotes: "Energetic and loves long walks. Great with children and other dogs.",
    friendlyWithPets: true,
    friendlyWithOthers: true,
    trainedBefore: true,
    vaccinationStatus: true,
    medication: "Joint supplements",
    createdAt: new Date("2023-01-20"),
    updatedAt: new Date("2023-12-15"),
  },
  {
    id: "3",
    userId: "1",
    petCategoryId: "cat",
    profileImage: "/placeholder.svg?height=200&width=200",
    name: "Whiskers",
    breed: "Maine Coon",
    age: 2,
    gender: "Male",
    weight: 6.2,
    additionalNotes: "Independent but affectionate. Loves climbing and exploring high places.",
    friendlyWithPets: false,
    friendlyWithOthers: true,
    trainedBefore: false,
    vaccinationStatus: true,
    medication: "",
    createdAt: new Date("2023-06-15"),
    updatedAt: new Date("2023-12-20"),
  },
]

export default function PetsPage() {
//   const [activeItem, setActiveItem] = React.useState("pets")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedFilter, setSelectedFilter] = React.useState<"all" | "dogs" | "cats">("all")

  const filteredPets = React.useMemo(() => {
    return mockPets.filter((pet) => {
      const matchesSearch =
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "dogs" && pet.petCategoryId === "dog") ||
        (selectedFilter === "cats" && pet.petCategoryId === "cat")
      return matchesSearch && matchesFilter
    })
  }, [searchTerm, selectedFilter])

  const petStats = React.useMemo(() => {
    const total = mockPets.length
    const dogs = mockPets.filter((pet) => pet.petCategoryId === "dog").length
    const cats = mockPets.filter((pet) => pet.petCategoryId === "cat").length
    const vaccinated = mockPets.filter((pet) => pet.vaccinationStatus).length
    const trained = mockPets.filter((pet) => pet.trainedBefore).length
    const friendly = mockPets.filter((pet) => pet.friendlyWithOthers).length

    return { total, dogs, cats, vaccinated, trained, friendly }
  }, [])

  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset className="bg-gray-50 dark:bg-gray-950">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-800 px-4 lg:px-6 bg-white dark:bg-black">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Pets</h1>
              <Badge className="bg-gray-900 text-white dark:bg-white dark:text-black font-medium">
                {mockPets.length} {mockPets.length === 1 ? "Pet" : "Pets"}
              </Badge>
            </div>
            <Button className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold">
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
                <PetCard key={pet.id} pet={pet} />
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
                      <Button className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold">
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
                    className="justify-start border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 bg-transparent"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Pet
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 bg-transparent"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Health Records
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 bg-transparent"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Training Sessions
                  </Button>
                  <Button
                    variant="outline"
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
      </SidebarInset>
    </SidebarProvider>
  )
}
