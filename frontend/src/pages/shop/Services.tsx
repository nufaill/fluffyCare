"use client"

import type React from "react"

import { useState } from "react"
import { PawPrint, Search, Edit2, Save, X } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/Badge"
import { Table } from "@/components/ui/Table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatsCards } from "@/components/admin/stats-cards"
import { Layout } from "@/components/shop/Layout"

interface Service {
  id: string
  name: string
  description: string
  category: string
  petType: "Dog" | "Cat" | "All"
  charge: number
  duration: number // in minutes
  image?: string
  createdAt: string
  status: "active" | "inactive" | "blocked"
}

const SERVICE_CATEGORIES = [
  "Grooming",
  "Training",
  "Boarding",
  "Medical",
  "Daycare",
  "Walking",
  "Sitting",
  "Veterinary",
  "Emergency",
  "Nutrition",
  "Behavioral",
  "Other",
]

function AddServiceForm({
  title,
  placeholder,
  onAdd,
  icon,
}: {
  title: string
  placeholder: string
  onAdd: (data: {
    name: string
    description: string
    category: string
    petType: "Dog" | "Cat" | "All"
    charge: number
    duration: number
    image?: string
  }) => void
  icon: React.ReactNode
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [petType, setPetType] = useState<"Dog" | "Cat" | "All" | "">("")
  const [charge, setCharge] = useState("")
  const [duration, setDuration] = useState("")
  const [image, setImage] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && category.trim() && petType && charge && duration) {
      const imageUrl = image ? URL.createObjectURL(image) : undefined
      onAdd({
        name,
        description,
        category,
        petType: petType as "Dog" | "Cat" | "All",
        charge: Number.parseFloat(charge),
        duration: Number.parseInt(duration),
        image: imageUrl,
      })
      setName("")
      setDescription("")
      setCategory("")
      setPetType("")
      setCharge("")
      setDuration("")
      setImage(null)
    }
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-gray-100">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder={placeholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            required
          />

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
              <SelectValue placeholder="Select service category" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
              {SERVICE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={petType} onValueChange={(value) => setPetType(value as "Dog" | "Cat" | "All")}>
            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
              <SelectValue placeholder="Select pet type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
              <SelectItem value="Dog">Dog</SelectItem>
              <SelectItem value="Cat">Cat</SelectItem>
              <SelectItem value="All">All Pets</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Enter service charge ($)"
              value={charge}
              onChange={(e) => setCharge(e.target.value)}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              min="0"
              step="0.01"
              required
            />
            <Input
              type="number"
              placeholder="Enter service duration (minutes)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              min="0"
              required
            />
          </div>

          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          />

          <Button
            type="submit"
            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            {icon}
            <span className="ml-2">Add Service</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      name: "Pet Grooming",
      description: "Complete grooming services including bathing, brushing, nail trimming, and styling",
      category: "Grooming",
      petType: "All",
      charge: 50.0,
      duration: 60,
      image: "/images/grooming.jpg",
      createdAt: new Date("2024-01-15T10:30:00Z").toISOString(),
      status: "active",
    },
    {
      id: "2",
      name: "Puppy Training",
      description: "Basic obedience training for puppies including house training and socialization",
      category: "Training",
      petType: "Dog",
      charge: 75.0,
      duration: 45,
      image: "/images/training.jpg",
      createdAt: new Date("2024-01-10T14:45:00Z").toISOString(),
      status: "active",
    },
    {
      id: "3",
      name: "Pet Boarding",
      description: "Safe and comfortable overnight care for pets when owners are away",
      category: "Boarding",
      petType: "All",
      charge: 40.0,
      duration: 1440, // 24 hours
      image: "/images/boarding.jpg",
      createdAt: new Date("2024-01-08T09:15:00Z").toISOString(),
      status: "inactive",
    },
    {
      id: "4",
      name: "Veterinary Checkup",
      description: "Professional medical care including checkups, vaccinations, and treatments",
      category: "Medical",
      petType: "All",
      charge: 100.0,
      duration: 30,
      image: "/images/vet.jpg",
      createdAt: new Date("2024-01-05T11:20:00Z").toISOString(),
      status: "active",
    },
  ])

  const [searchTerm, setSearchTerm] = useState<string>("")
  const [sortBy, setSortBy] = useState<string | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined)
  const [editingService, setEditingService] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Service>>({})

  const filteredServices = services.filter((service) => service.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleAddService = (data: {
    name: string
    description: string
    category: string
    petType: "Dog" | "Cat" | "All"
    charge: number
    duration: number
    image?: string
  }) => {
    const isDuplicate = services.some((srv) => srv.name.toLowerCase() === data.name.toLowerCase())
    if (isDuplicate) {
      alert("Service already exists")
      return
    }

    const newService: Service = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      category: data.category,
      petType: data.petType,
      charge: data.charge,
      duration: data.duration,
      image: data.image,
      createdAt: new Date().toISOString(),
      status: "active",
    }
    setServices((prev) => [...prev, newService])
  }

  const handleSort = (key: string, order: "asc" | "desc") => {
    setSortBy(key)
    setSortOrder(order)
    const sorted = [...services].sort((a, b) => {
      if (key === "name" || key === "category" || key === "petType" || key === "createdAt") {
        return order === "asc" ? a[key].localeCompare(b[key]) : b[key].localeCompare(a[key])
      } else if (key === "charge" || key === "duration") {
        return order === "asc" ? a[key] - b[key] : b[key] - a[key]
      }
      return 0
    })
    setServices(sorted)
  }

  const handleEditService = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    if (service) {
      setEditingService(serviceId)
      setEditForm(service)
    }
  }

  const handleSaveEdit = () => {
    if (editingService && editForm) {
      setServices((prev) =>
        prev.map((service) => (service.id === editingService ? { ...service, ...editForm } : service)),
      )
      setEditingService(null)
      setEditForm({})
    }
  }

  const handleCancelEdit = () => {
    setEditingService(null)
    setEditForm({})
  }

  const handleStatusChange = (serviceId: string, newStatus: "active" | "inactive" | "blocked") => {
    setServices((prev) =>
      prev.map((service) => (service.id === serviceId ? { ...service, status: newStatus } : service)),
    )
  }

  const activeServices = services.filter((service) => service.status === "active").length
  const inactiveServices = services.filter((service) => service.status === "inactive").length
  const blockedServices = services.filter((service) => service.status === "blocked").length

  const statsData = [
    { label: "Active Services", value: activeServices, color: "text-green-600 dark:text-green-400" },
    { label: "Inactive Services", value: inactiveServices, color: "text-yellow-600 dark:text-yellow-400" },
    { label: "Blocked Services", value: blockedServices, color: "text-red-600 dark:text-red-400" },
  ]

  const sidebarItems = [
    { title: "Dashboard", icon: PawPrint, url: "/shop/dashboard" },
    { title: "Services", icon: PawPrint, url: "/shop/services" },
    { title: "Appointments", icon: PawPrint, url: "/shop/appointments" },
    { title: "Settings", icon: PawPrint, url: "/shop/settings" },
  ]

  return (
    <Layout sidebarItems={sidebarItems}>
      <div className="p-6 space-y-6 max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-black dark:bg-white rounded-lg">
              <PawPrint className="h-6 w-6 text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Shop Services</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage services for your pet care shop</p>
            </div>
          </div>
        </div>

        <AddServiceForm
          title="Add New Shop Service"
          placeholder="Enter service name (e.g., Grooming, Training)"
          onAdd={handleAddService}
          icon={<PawPrint className="h-4 w-4 text-white dark:text-black" />}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Search Services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-3">
            <StatsCards stats={statsData} />
          </div>
        </div>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
              <span>Services List</span>
              <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {filteredServices.length} services
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <div className="min-w-full">
              <Table<Service>
                columns={[
                  {
                    key: "name",
                    title: "Service Name",
                    dataIndex: "name",
                    sortable: true,
                    align: "left",
                  },
                  {
                    key: "category",
                    title: "Category",
                    dataIndex: "category",
                    sortable: true,
                    align: "left",
                  },
                  {
                    key: "petType",
                    title: "Pet Type",
                    dataIndex: "petType",
                    sortable: true,
                    align: "left",
                  },
                  {
                    key: "description",
                    title: "Description",
                    dataIndex: "description",
                    sortable: false,
                    align: "left",
                    render: (value: string) => (
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate" title={value}>
                          {value}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "charge",
                    title: "Charge ($)",
                    dataIndex: "charge",
                    sortable: true,
                    align: "right",
                    render: (value: number) => `$${value.toFixed(2)}`,
                  },
                  {
                    key: "duration",
                    title: "Duration (min)",
                    dataIndex: "duration",
                    sortable: true,
                    align: "right",
                  },
                  {
                    key: "image",
                    title: "Image",
                    dataIndex: "image",
                    sortable: false,
                    align: "center",
                    render: (value: string | undefined) =>
                      value ? (
                        <img
                          src={value || "/placeholder.svg"}
                          alt="Service"
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      ),
                  },
                  {
                    key: "status",
                    title: "Status",
                    dataIndex: "status",
                    sortable: true,
                    align: "left",
                    render: (value: "active" | "inactive" | "blocked", record: Service) => (
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            value === "active"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                              : value === "inactive"
                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                          }
                        >
                          {value.charAt(0).toUpperCase() + value.slice(1)}
                        </Badge>
                        <Select
                          value={value}
                          onValueChange={(newStatus) =>
                            handleStatusChange(record.id, newStatus as "active" | "inactive" | "blocked")
                          }
                        >
                          <SelectTrigger className="w-20 h-6 text-xs border-0 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ),
                  },
                  {
                    key: "createdAt",
                    title: "Created Date",
                    dataIndex: "createdAt",
                    sortable: true,
                    align: "left",
                    render: (value: string) => new Date(value).toLocaleDateString(),
                  },
                  {
                    key: "actions",
                    title: "Actions",
                    dataIndex: "actions",
                    align: "center",
                    render: (_, record: Service) => (
                      <div className="flex items-center justify-center space-x-2">
                        {editingService === record.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleSaveEdit}
                              className="hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                              className="hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditService(record.id)}
                            className="hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ),
                  },
                ]}
                data={filteredServices}
                rowKey="id"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                emptyText={searchTerm ? "No services found matching your search." : "No services available."}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
