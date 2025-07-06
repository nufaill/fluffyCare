import { useState, useEffect } from "react"
import { PawPrint, Search, Edit2, Shield, ShieldCheck } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/Badge"
import { Switch } from "@/components/ui/switch"
import { Table } from "@/components/ui/Table"
import AdminSidebar from "@/components/admin/Sidebar"
import AdminNavbar from "@/components/admin/Navbar"
import { AddItemForm } from "@/components/admin/add-item-form"
import { StatsCards } from "@/components/admin/stats-cards"
import { createPetType, getAllPetTypes, updatePetType, updatePetTypeStatus } from "@/services/admin/admin.service"
import toast from 'react-hot-toast'

interface PetType {
  _id: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}



export default function PetCategoryPage() {
  const [petTypes, setPetTypes] = useState<PetType[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [sortBy, setSortBy] = useState<string | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string>("")

  // Fetch pet types on component mount
  useEffect(() => {
    fetchPetTypes()
  }, [])

  const fetchPetTypes = async () => {
    try {
      setLoading(true)
      const response = await getAllPetTypes()
      if (response.success) {
        setPetTypes(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch pet types:', error)
      toast.error('Failed to fetch pet types')
    } finally {
      setLoading(false)
    }
  }

  const filteredPetTypes = petTypes.filter((petType) =>
    petType.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activePetTypes = petTypes.filter((pet) => pet.isActive).length
  const blockedPetTypes = petTypes.filter((pet) => !pet.isActive).length

  const handleAddPetType = async (name: string) => {
    try {
      const response = await createPetType({ name })
      if (response.success) {
        setPetTypes((prev) => [response.data, ...prev])
      }
    } catch (error: any) {
      console.error('Failed to create pet type:', error)
      // Toast is already handled in service
    }
  }

  const handleToggleStatus = async (petTypeId: string, currentStatus: boolean) => {
    try {
      const response = await updatePetTypeStatus(petTypeId, !currentStatus)
      if (response.success) {
        setPetTypes((prev) =>
          prev.map((pet) =>
            pet._id === petTypeId ? { ...pet, isActive: !currentStatus } : pet,
          ),
        )
      }
    } catch (error: any) {
      console.error('Failed to update pet type status:', error)
      // Toast is already handled in service
    }
  }

  const handleStartEdit = (petType: PetType) => {
    setEditingId(petType._id)
    setEditingName(petType.name)
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) return

    try {
      const response = await updatePetType(editingId, { name: editingName.trim() })
      if (response.success) {
        setPetTypes((prev) =>
          prev.map((pet) =>
            pet._id === editingId ? { ...pet, name: editingName.trim() } : pet,
          ),
        )
        setEditingId(null)
        setEditingName("")
      }
    } catch (error: any) {
      console.error('Failed to update pet type:', error)
      // Toast is already handled in service
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName("")
  }

  const handleSort = (key: string, order: "asc" | "desc") => {
    setSortBy(key)
    setSortOrder(order)
  }

  const statsData = [
    { label: "Active Categories", value: activePetTypes, color: "text-green-600 dark:text-green-400" },
    { label: "Blocked Categories", value: blockedPetTypes, color: "text-red-600 dark:text-red-400" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading pet types...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar activeItem="PetCategory" />
      <AdminNavbar userName="NUFAIL" onSearch={setSearchTerm} />

      <main className="ml-64 pt-16 p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-black dark:bg-white rounded-lg">
              <PawPrint className="h-6 w-6 text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Pet Categories</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage pet categories for your services</p>
            </div>
          </div>
        </div>
        {/* Add Category Section */}
        <AddItemForm
          title="Add New Pet Category"
          placeholder="Enter category name (e.g., Dogs, Cats, Birds)"
          onAdd={handleAddPetType}
          icon={<PawPrint className="h-4 w-4 text-white dark:text-black" />}
        />

        {/* Search and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </div>
            </CardContent>
          </Card>

          <StatsCards stats={statsData} />
        </div>

        {/* Categories Table */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
              <span>Categories List</span>
              <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {filteredPetTypes.length} categories
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table<PetType>
              columns={[
                {
                  key: "name",
                  title: "Category Name",
                  dataIndex: "name",
                  sortable: true,
                  align: "left",
                  render: (value: string, record: PetType) => (
                    editingId === record._id ? (
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSaveEdit()
                          if (e.key === 'Escape') handleCancelEdit()
                        }}
                        className="w-full"
                      />
                    ) : (
                      <span>{value}</span>
                    )
                  ),
                },
                {
                  key: "isActive",
                  title: "Status",
                  dataIndex: "isActive",
                  sortable: true,
                  align: "left",
                  render: (value: boolean) => (
                    <Badge
                      className={
                        value
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                      }
                    >
                      {value ? (
                        <>
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          Blocked
                        </>
                      )}
                    </Badge>
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
                  render: (_, record: PetType) => (
                    <div className="flex items-center justify-center space-x-3">
                      {editingId === record._id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveEdit}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(record)}
                          className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={record.isActive}
                          onCheckedChange={() => handleToggleStatus(record._id, record.isActive)}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {record.isActive ? "Block" : "Unblock"}
                        </span>
                      </div>
                    </div>
                  ),
                },
              ]}
              data={filteredPetTypes}
              rowKey="_id"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              emptyText={searchTerm ? "No categories found matching your search." : "No categories available."}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}