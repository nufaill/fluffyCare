import { useState, useEffect } from "react"
import { PawPrint, Search, Edit2, Shield, ShieldCheck } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/Badge"
import { Switch } from "@/components/ui/switch"
import { Table } from "@/components/ui/Table"
import { Pagination } from "@/components/ui/Pagination"
import AdminSidebar from "@/components/admin/Sidebar"
import AdminNavbar from "@/components/admin/Navbar"
import { AddItemForm } from "@/components/admin/add-item-form"
import { StatsCards } from "@/components/admin/stats-cards"
import { createServiceType, getAllServiceTypes, updateServiceType, updateServiceTypeStatus } from "@/services/admin/admin.service"
import toast from 'react-hot-toast'

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
  const [sortBy, setSortBy] = useState<string | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  
  useEffect(() => {
    fetchServiceTypes()
  }, [])

  const fetchServiceTypes = async () => {
    try {
      setLoading(true)
      const response = await getAllServiceTypes()
      if (response.success) {
        setServiceTypes(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch service types:', error)
      toast.error('Failed to fetch service types')
    } finally {
      setLoading(false)
    }
  }

  const filteredServiceTypes = serviceTypes.filter((serviceType) =>
    serviceType.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeServiceTypes = serviceTypes.filter((service) => service.isActive).length
  const blockedServiceTypes = serviceTypes.filter((service) => !service.isActive).length

  const handleAddServiceType = async (name: string) => {
    try {
      const response = await createServiceType({ name })
      if (response.success) {
        setServiceTypes((prev) => [response.data, ...prev])
        setCurrentPage(1) 
      }
    } catch (error: any) {
      console.error('Failed to create service type:', error)
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
      }
    } catch (error: any) {
      console.error('Failed to update service type status:', error)
    }
  }

  const handleStartEdit = (serviceType: ServiceType) => {
    setEditingId(serviceType._id)
    setEditingName(serviceType.name)
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) return

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
      }
    } catch (error: any) {
      console.error('Failed to update service type:', error)
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
    { label: "Active Service Types", value: activeServiceTypes, color: "text-green-600 dark:text-green-400" },
    { label: "Blocked Service Types", value: blockedServiceTypes, color: "text-red-600 dark:text-red-400" },
  ]

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedServiceTypes = filteredServiceTypes.slice(startIndex, endIndex)

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-black dark:bg-white rounded-lg">
              <PawPrint className="h-6 w-6 text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Service Types</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage service types for your services</p>
            </div>
          </div>
        </div>
        <AddItemForm
          title="Add New Service Type"
          placeholder="Enter service type name (e.g., Grooming, Training, Massage)"
          onAdd={handleAddServiceType}
          icon={<PawPrint className="h-4 w-4 text-white dark:text-black" />}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Search service types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </div>
            </CardContent>
          </Card>

          <StatsCards stats={statsData} />
        </div>

        {/* Service Types Table */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
              <span>Service Types List</span>
              <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {filteredServiceTypes.length} service types
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
                  render: (_, record: ServiceType) => (
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
              data={paginatedServiceTypes}
              rowKey="_id"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              emptyText={searchTerm ? "No service types found matching your search." : "No service types available."}
            />
          </CardContent>
        </Card>
            <Pagination
              current={currentPage}
              total={filteredServiceTypes.length}
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