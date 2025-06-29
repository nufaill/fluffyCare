"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Table, type TableColumn } from "@/components/ui/Table"
import { Pagination } from "@/components/ui/Pagination"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/Badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  Download,
  Plus,
  Mail,
  Store,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Star,
  Users,
  Settings,
} from "lucide-react"

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
  joinDate: string
  lastActive: string
  totalRevenue: number
  description: string
}

// Sample data generator
const generateSampleShops = (): Shop[] => {
  const shopNames: string[] = [
    "Paws & Claws Grooming",
    "Happy Tails Pet Spa",
    "Furry Friends Care",
    "Pet Paradise Salon",
    "Whiskers & Wags",
    "The Pet Boutique",
    "Canine Couture",
    "Feline Fine Grooming",
    "Pet Palace",
    "Tail Waggers Spa",
    "Precious Paws",
    "Pet Perfection",
    "Furry Angels Care",
    "Pet Luxury Lounge",
    "Paw-some Grooming",
    "Pet Bliss Spa",
    "Cuddle & Care",
    "Pet Elegance",
    "Furry Makeover",
    "Pet Wellness Center",
  ]

  const addresses: string[] = [
    "123 Main St, Downtown",
    "456 Oak Ave, Midtown",
    "789 Pine Rd, Uptown",
    "321 Elm St, Westside",
    "654 Maple Dr, Eastside",
    "987 Cedar Ln, Northside",
    "147 Birch St, Southside",
    "258 Willow Ave, Central",
    "369 Spruce Rd, Heights",
    "741 Ash Dr, Valley",
  ]

  const verificationStatuses: VerificationStatus[] = ["approved", "rejected", "pending"]

  return shopNames.map(
    (name, index): Shop => ({
      id: `shop-${index + 1}`,
      name,
      logo: Math.random() > 0.4 ? `/placeholder.svg?height=40&width=40` : undefined,
      email: name.toLowerCase().replace(/[^a-z0-9]/g, "") + "@petcare.com",
      isVerified: verificationStatuses[Math.floor(Math.random() * verificationStatuses.length)],
      isActive: Math.random() > 0.2,
      address: addresses[Math.floor(Math.random() * addresses.length)],
      phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
      totalServices: Math.floor(Math.random() * 50) + 5,
      joinDate: new Date(
        2020 + Math.floor(Math.random() * 4),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1,
      )
        .toISOString()
        .split("T")[0],
      lastActive: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      totalRevenue: Math.floor(Math.random() * 50000) + 5000,
      description: `Professional pet care services with experienced staff and modern facilities.`,
    }),
  )
}

const ShopDetails: React.FC = () => {
  const [shops] = useState<Shop[]>(generateSampleShops())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [loading, setLoading] = useState(false)

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

  const handleToggleActive = async (shopId: string, isActive: boolean): Promise<void> => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      console.log(`Shop ${shopId} set to ${isActive ? "active" : "inactive"}`)
      setLoading(false)
    }, 500)
  }

  const handleViewDetails = (shop: Shop): void => {
    console.log(`Viewing details for ${shop.name}`)
    // Navigate to shop details page or open modal
  }

  const handleEditShop = (shop: Shop): void => {
    console.log(`Editing shop ${shop.name}`)
    // Navigate to edit page or open modal
  }

  const handleDeleteShop = (shop: Shop): void => {
    console.log(`Deleting shop ${shop.name}`)
    // Show confirmation dialog and delete
  }

  const handleGoToVerification = (): void => {
    console.log("Navigate to shop verification page")
    // Navigate to ShopVerification page
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
      render: (value: string, record: Shop) => (
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
              <span>{record.address}</span>
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
      render: (value: string, record: Shop) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 dark:text-gray-100">{record.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
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
      render: (value: VerificationStatus, record: Shop) => (
        <div className="space-y-2">{getVerificationBadge(record.isVerified)}</div>
      ),
    },
    {
      key: "isActive",
      title: "Active",
      dataIndex: "isActive",
      align: "center",
      render: (value: boolean, record: Shop) => (
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
      render: (value: number, record: Shop) => (
        <div className="text-right space-y-1">
          <div className="font-medium text-gray-900 dark:text-gray-100">${record.totalRevenue.toLocaleString()}</div>
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
      dataIndex: "joinDate",
      sortable: true,
      render: (value: string) => (
        <span className="text-gray-900 dark:text-gray-100">{new Date(value).toLocaleDateString()}</span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      dataIndex: "actions",
      align: "center",
      render: (value: undefined, record: Shop) => (
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <DropdownMenuItem
                onClick={() => handleEditShop(record)}
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Shop
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleViewDetails(record)}
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteShop(record)}
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Shop
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  const approvedShops = shops.filter((shop) => shop.isVerified === "approved")
  const pendingShops = shops.filter((shop) => shop.isVerified === "pending")
  const activeShops = shops.filter((shop) => shop.isActive)
  const totalRevenue = shops.reduce((sum, shop) => sum + shop.totalRevenue, 0)

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
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
          <Button className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200">
            <Plus className="h-4 w-4 mr-2" />
            Add Shop
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
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${totalRevenue.toLocaleString()}</p>
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
    </div>
  )
}

export default ShopDetails
