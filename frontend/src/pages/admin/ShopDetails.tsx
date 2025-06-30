"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import Navbar from "@/components/admin/Navbar"
import Sidebar from "@/components/admin/sidebar"
import Footer from "@/components/user/Footer"
import { Table, type TableColumn } from "@/components/ui/Table"
import { Pagination } from "@/components/ui/Pagination"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/Badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import {
  Search,
  Filter,
  Download,
  Mail,
  Store,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Star,
  Users,
  Settings,
  Phone,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getAllShops } from "@/services/admin/adminService"
import toast from 'react-hot-toast'

type VerificationStatus = "approved" | "rejected" | "pending"

interface Shop {
  id: string
  name: string
  logo?: string
  email: string
  isVerified: VerificationStatus
  isActive: boolean
  address: string
  phone: string
  rating: number
  totalServices: number
  city: string
  streetAddress: string
  buildingNumber: string
  certificateUrl: string
  joinDate: string
  lastActive: string
  totalRevenue: number
  description: string
}

const ShopDetails: React.FC = () => {
  const navigate = useNavigate()
  const [shops, setShops] = useState<Shop[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [loading, setLoading] = useState(false)
  const [activeMenuItem, setActiveMenuItem] = useState("Shops")
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch shops from API
  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true)
      try {
        const response = await getAllShops()
        setShops(response.data || []) 
      } catch (error) {
        console.error('Error fetching shops:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchShops()
  }, [])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = shops.filter(
      (shop) =>
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.address.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[sortBy as keyof Shop]
        const bValue = b[sortBy as keyof Shop]

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue
        }

        return 0
      })
    }

    return filtered
  }, [shops, searchTerm, sortBy, sortOrder])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize)
  }, [filteredAndSortedData, currentPage, pageSize])

  const handleMenuItemClick = (item: string) => {
    setActiveMenuItem(item)
  }

  const handleLogout = async () => {
    try {
      localStorage.removeItem("adminToken")
      sessionStorage.clear()
      navigate("/admin/login")
    } catch (error) {
      console.error("Logout failed:", error)
      navigate("/admin/login")
    }
  }

  const handleSearch = (query: string) => {
    setSearchTerm(query)
  }

  const handleToggleActive = async (shopId: string, isActive: boolean): Promise<void> => {
    setLoading(true)
    try {
      console.log(`Shop ${shopId} set to ${isActive ? "active" : "inactive"}`)
      toast.success(`Shop status updated successfully!`, {
        position: 'top-right',
        duration: 3000,
      })
    } catch (error) {
      toast.error('Failed to update shop status', {
        position: 'top-right',
        duration: 4000,
      })
      console.error('Error updating shop status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (shop: Shop): void => {
    setSelectedShop(shop)
    setIsModalOpen(true)
  }


  const handleGoToVerification = (): void => {
    navigate("/admin/shop-verification")
  }

  const handleSort = (key: string, order: "asc" | "desc"): void => {
    setSortBy(key)
    setSortOrder(order)
  }

  const handlePageChange = (page: number, newPageSize?: number): void => {
    setCurrentPage(page)
    if (newPageSize) {
      setPageSize(newPageSize)
    }
  }

  const getVerificationBadge = (status: VerificationStatus): React.ReactNode => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return null
    }
  }

  const columns: TableColumn<Shop>[] = [
    {
      key: "shop",
      title: "Shop",
      dataIndex: "name",
      sortable: true,
      render: (_value: string, record: Shop) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-gray-200 dark:ring-gray-600">
            <AvatarImage src={record.logo || "/placeholder.svg?height=48&width=48"} />
            <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300">
              {record.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{record.name}</p>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="h-3 w-3" />
              <span>{record.city},{record.streetAddress}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span>{record.rating}</span>
              <span>({record.totalServices} services)</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      title: "Contact Info",
      dataIndex: "email",
      render: (_value: string, record: Shop) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 dark:text-gray-100">{record.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 dark:text-gray-100">{record.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "isVerified",
      sortable: true,
      align: "center",
      render: (_value: VerificationStatus, record: Shop) => (
        <div className="space-y-2">{getVerificationBadge(record.isVerified)}</div>
      ),
    },
    {
      key: "isActive",
      title: "Active",
      dataIndex: "isActive",
      align: "center",
      render: (_value: boolean, record: Shop) => (
        <Switch
          checked={record.isActive}
          onCheckedChange={(checked: boolean) => handleToggleActive(record.id, checked)}
          disabled={loading}
          className="data-[state=checked]:bg-gray-900 dark:data-[state=checked]:bg-gray-100"
        />
      ),
    },
    {
      key: "performance",
      title: "Performance",
      dataIndex: "totalRevenue",
      sortable: true,
      align: "right",
      render: (_value: number, record: Shop) => (
        <div className="text-right space-y-1">
          <div className="font-medium text-gray-900 dark:text-gray-100">₹{record.totalRevenue ||0}</div>
          <div className="flex items-center justify-end gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Users className="h-3 w-3" />
            <span>{record.totalServices} services</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last active: {new Date(record.lastActive).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      key: "joinDate",
      title: "Join Date",
      dataIndex: "createdAt",
      sortable: true,
      render: (value: string) => (
        <span className="text-gray-900 dark:text-gray-100">{typeof value === 'string' ? new Date(value).toLocaleDateString() : 'N/A'}</span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      dataIndex: "actions",
      align: "center",
      render: (_value: undefined, record: Shop) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetails(record)}
            className="text-xs border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Eye className="h-3 w-3 mr-1" />
            Details
          </Button>
        </div>
      ),
    },
  ]

  const approvedShops = shops.filter((shop) => shop.isVerified === "approved")
  const pendingShops = shops.filter((shop) => shop.isVerified === "pending")
  const totalRevenue = shops.reduce((sum, shop) => sum + shop.totalRevenue, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeItem={activeMenuItem} onItemClick={handleMenuItemClick} onLogout={handleLogout} />

      {/* Navbar */}
      <Navbar userName="NUFAIL" onSearch={handleSearch} />

      {/* Main Content */}
      <main className="ml-64 pt-16 p-6">
        <div className="space-y-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Shop Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage shop information and status</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleGoToVerification} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                <Settings className="h-4 w-4 mr-2" />
                Manage Verification ({pendingShops.length})
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Shops</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{shops.length}</p>
                  </div>
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Store className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified Shops</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{approvedShops.length}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Verification</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pendingShops.length}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      ₹{totalRevenue||0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search shops by name, email, or address..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent"
                  />
                </div>
                <Button
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Table
            columns={columns}
            data={paginatedData}
            loading={loading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            className="shadow-sm"
          />

          {/* Pagination */}
          <Pagination
            current={currentPage}
            total={filteredAndSortedData.length}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total: number, range: [number, number]) => (
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Showing {range[0]} to {range[1]} of {total} shops
              </span>
            )}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          />

          {/* Shop Details Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-black dark:text-white">
                  {selectedShop?.name} Details
                </DialogTitle>
                <DialogClose className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" />
              </DialogHeader>
              {selectedShop && (
                <div className="space-y-6 p-6 text-black dark:text-white">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 ring-2 ring-gray-300 dark:ring-gray-700">
                      <AvatarImage src={selectedShop.logo || "/placeholder.svg?height=64&width=64"} />
                      <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {selectedShop.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{selectedShop.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedShop.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-base">{selectedShop.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-base">{selectedShop.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                      <p className="text-base">
                        {selectedShop.buildingNumber}, {selectedShop.streetAddress}, {selectedShop.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Verification Status</p>
                      <div className="mt-1">{getVerificationBadge(selectedShop.isVerified)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{selectedShop.rating} ({selectedShop.totalServices} services)</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Join Date</p>
                      <p className="text-base">{new Date(selectedShop.joinDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Active</p>
                      <p className="text-base">{new Date(selectedShop.lastActive).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Certificate</p>
                      <a
                        href={selectedShop.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Certificate
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>

      {/* Footer */}
      <div className="ml-64">
        <Footer />
      </div>
    </div>
  )
}

export default ShopDetails