import { useState, useEffect, useCallback } from "react"
import { PawPrint, Search, Edit2, Shield, ShieldCheck } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/Badge"
import { Switch } from "@/components/ui/switch"
import { Table } from "@/components/ui/Table"
import { Pagination } from "@/components/ui/Pagination"
import AdminSidebar from "@/components/admin/sidebar"
import AdminNavbar from "@/components/admin/Navbar"
import { AddItemForm } from "@/components/admin/add-item-form"
import { StatsCards } from "@/components/admin/stats-cards"
import { createServiceType, getAllServiceTypes, updateServiceType, updateServiceTypeStatus } from "@/services/admin/admin.service"
import toast from 'react-hot-toast'
import { debounce } from 'lodash'

interface ServiceType {
  _id: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ServiceCategoryPage() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined)
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const debouncedFetchServiceTypes = useCallback(
    debounce(async (search: string, isActive: boolean | undefined, sortBy: string, sortOrder: 'asc' | 'desc') => {
      try {
        setLoading(true)
        const response = await getAllServiceTypes({
          search,
          isActive,
          sortBy,
          sortOrder
        })
        if (response.success) {
          setServiceTypes(response.data)
        } else {
          toast.error(response.message || 'Failed to fetch service types')
        }
      } catch (error) {
        console.error('Failed to fetch service types:', error)
        toast.error('Failed to fetch service types')
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  useEffect(() => {
    debouncedFetchServiceTypes(searchTerm, isActiveFilter, sortBy, sortOrder)
  }, [searchTerm, isActiveFilter, sortBy, sortOrder, debouncedFetchServiceTypes])

  const validateName = (name: string): { isValid: boolean; message: string } => {
    if (!name || name.trim().length === 0) {
      return { isValid: false, message: "Service type name is required" }
    }
    if (name.includes(' ')) {
      return { isValid: false, message: "Service type name cannot contain spaces" }
    }
    if (name.length < 3 || name.length > 20) {
      return { isValid: false, message: "Service type name must be between 3 and 20 characters" }
    }
    if (!/^[a-zA-Z0-9]+$/.test(name)) {
      return { isValid: false, message: "Service type name can only contain alphanumeric characters" }
    }
    return { isValid: true, message: "" }
  }

  const activeServiceTypes = serviceTypes.filter((service) => service.isActive).length
  const blockedServiceTypes = serviceTypes.filter((service) => !service.isActive).length

  const handleAddServiceType = async (name: string) => {
    const validation = validateName(name)
    if (!validation.isValid) {
      toast.error(validation.message)
      return
    }

    try {
      const response = await createServiceType({ name })
      if (response.success) {
        setServiceTypes((prev) => [response.data, ...prev])
        setCurrentPage(1)
        toast.success('Service type created successfully')
      } else {
        toast.error(response.message || 'Failed to create service type')
      }
    } catch (error) {
      console.error('Failed to create service type:', error)
      toast.error('Failed to create service type')
    }
  }

  const handleToggleStatus = async (serviceTypeId: string, currentStatus: boolean) => {
    try {
      const response = await updateServiceTypeStatus(serviceTypeId, !currentStatus)
      if (response.success) {
        setServiceTypes((prev) =>
          prev.map((service) =>
            service._id === serviceTypeId ? { ...service, isActive: !currentStatus } : service,
          ),
        )
        toast.success(`Service type ${currentStatus ? 'blocked' : 'unblocked'} successfully`)
      } else {
        toast.error(response.message || 'Failed to update service type status')
      }
    } catch (error) {
      console.error('Failed to update service type status:', error)
      toast.error('Failed to update service type status')
    }
  }

  const handleStartEdit = (serviceType: ServiceType) => {
    setEditingId(serviceType._id)
    setEditingName(serviceType.name)
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) {
      toast.error('Service type name is required')
      return
    }

    const validation = validateName(editingName)
    if (!validation.isValid) {
      toast.error(validation.message)
      return
    }

    try {
      const response = await updateServiceType(editingId, { name: editingName.trim() })
      if (response.success) {
        setServiceTypes((prev) =>
          prev.map((service) =>
            service._id === editingId ? { ...service, name: editingName.trim() } : service,
          ),
        )
        setEditingId(null)
        setEditingName("")
        toast.success('Service type updated successfully')
      } else {
        toast.error(response.message || 'Failed to update service type')
      }
    } catch (error) {
      console.error('Failed to update service type:', error)
      toast.error('Failed to update service type')
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

  const handlePageChange = (page: number, newPageSize?: number) => {
    setCurrentPage(page)
    if (newPageSize) {
      setPageSize(newPageSize)
    }
  }

  const statsData = [
    {
      label: "Active Service Types",
      value: activeServiceTypes,
      color: "text-green-600 dark:text-green-400",
      onClick: () => setIsActiveFilter(true)
    },
    {
      label: "Blocked Service Types",
      value: blockedServiceTypes,
      color: "text-red-600 dark:text-red-400",
      onClick: () => setIsActiveFilter(false)
    }
  ]

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedServiceTypes = serviceTypes.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading service types...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar activeItem="ServiceCategory" />
      <AdminNavbar userName="NUFAIL" onSearch={setSearchTerm} />

      <main className="ml-64 pt-16 p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-md">
              <PawPrint className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Service Types</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage and organize your service categories easily</p>
            </div>
          </div>
        </div>

        {/* Add New */}
        <AddItemForm
          title="Add New Service Type"
          placeholder="Enter service type name (e.g., Grooming, Training, Massage)"
          onAdd={handleAddServiceType}
          icon={<PawPrint className="h-4 w-4 text-white dark:text-black" />}
        />

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 w-full">
          {/* Search Bar */}
          <div className="md:w-1/3 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search service types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.trimStart())}
                className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>


          {/* Stats Cards */}
          <div className="flex flex-1 justify-end gap-4">
            <StatsCards stats={statsData} />
          </div>
        </div>
        {/* Table */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
              <span className="font-semibold">Service Types List</span>
              <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {serviceTypes.length} service types
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table<ServiceType>
              columns={[
                {
                  key: "name",
                  title: "Service Type Name",
                  dataIndex: "name",
                  sortable: true,
                  align: "left",
                  render: (value: string, record: ServiceType) => (
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
                      <span className="font-medium text-gray-800 dark:text-gray-200">{value}</span>
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
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                      }
                    >
                      {value ? (
                        <>
                          <ShieldCheck className="h-3 w-3 mr-1" /> Active
                        </>
                      ) : (
                        <>
                          <Shield className="h-3 w-3 mr-1" /> Blocked
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
                  render: (value: string) => (
                    <span className="text-gray-600 dark:text-gray-400">{new Date(value).toLocaleDateString()}</span>
                  ),
                },
                {
                  key: "actions",
                  title: "Actions",
                  dataIndex: "actions",
                  align: "center",
                  render: (_, record: ServiceType) => (
                    <div className="flex items-center justify-center space-x-3">
                      {editingId === record._id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveEdit}
                            className="text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400"
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(record)}
                          className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
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
              data={paginatedServiceTypes}
              rowKey="_id"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              emptyText={searchTerm ? "No service types found matching your search." : "No service types available."}
            />
          </CardContent>
        </Card>

        {/* Pagination */}
        <Pagination
          current={currentPage}
          total={serviceTypes.length}
          pageSize={pageSize}
          onChange={handlePageChange}
          showSizeChanger={true}
          showQuickJumper={true}
          showTotal={(total, range) => (
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Showing {range[0]} to {range[1]} of {total} entries
            </span>
          )}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </main>
    </div>
  )
}
