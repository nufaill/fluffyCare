"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Table, type TableColumn } from "@/components/ui/Table"
import { Pagination } from "@/components/ui/Pagination"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/Badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Star,
  Users,
  Mail,
  Calendar,
  FileText,
  Eye,
  ArrowLeft,
} from "lucide-react"

type VerificationStatus = "approved" | "rejected" | "pending"

interface Shop {
  id: string
  name: string
  logo?: string
  email: string
  phone: string
  address: string
  isVerified: VerificationStatus
  rating: number
  totalServices: number
  joinDate: string
  lastActive: string
  totalRevenue: number
  description: string
  documents: string[]
  verificationNotes?: string
  submittedDate: string
}

// Sample data generator for verification page
const generateVerificationShops = (): Shop[] => {
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

  const documents = ["Business License", "Insurance Certificate", "Tax ID", "Health Permit"]

  return shopNames.map(
    (name, index): Shop => ({
      id: `shop-${index + 1}`,
      name,
      logo: Math.random() > 0.4 ? `/placeholder.svg?height=40&width=40` : undefined,
      email: name.toLowerCase().replace(/[^a-z0-9]/g, "") + "@petcare.com",
      phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      address: addresses[Math.floor(Math.random() * addresses.length)],
      isVerified: "pending", // Only pending shops for verification page
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
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
      description: `Professional pet care services with experienced staff and modern facilities. We provide comprehensive grooming, training, and wellness services for all types of pets.`,
      documents: documents.slice(0, Math.floor(Math.random() * 3) + 2),
      submittedDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    }),
  )
}

const ShopVerification: React.FC = () => {
  const [shops] = useState<Shop[]>(generateVerificationShops())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [loading, setLoading] = useState(false)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [verificationNotes, setVerificationNotes] = useState("")
  const [showDetailsModal, setShowDetailsModal] = useState(false)

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

  const handleVerificationAction = async (
    shopId: string,
    action: "approve" | "reject",
    notes: string,
  ): Promise<void> => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      console.log(`Shop ${shopId} ${action}d with notes: ${notes}`)
      setLoading(false)
      setVerificationNotes("")
      setSelectedShop(null)
    }, 1000)
  }

  const handleViewDetails = (shop: Shop): void => {
    setSelectedShop(shop)
    setShowDetailsModal(true)
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

  const handleGoBack = (): void => {
    // Navigate back to shop details
    console.log("Navigate back to shop details")
  }

  const columns: TableColumn<Shop>[] = [
    {
      key: "shop",
      title: "Shop Information",
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
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Mail className="h-3 w-3" />
              <span>{record.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "submitted",
      title: "Submission Details",
      dataIndex: "submittedDate",
      sortable: true,
      render: (value: string, record: Shop) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 dark:text-gray-100">
              Submitted: {new Date(record.submittedDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 dark:text-gray-100">{record.documents.length} documents</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 dark:text-gray-100">{record.totalServices} services</span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "isVerified",
      align: "center",
      render: (value: VerificationStatus) => (
        <Badge className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending Review
        </Badge>
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
            Review
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={() => setSelectedShop(record)}
                className="text-xs bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Approve
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">Approve Shop</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to approve "{record.name}"? This action will grant them access to the platform.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Approval Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Add any notes about the approval..."
                    value={verificationNotes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setVerificationNotes(e.target.value)}
                    className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setVerificationNotes("")
                    setSelectedShop(null)
                  }}
                  className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    selectedShop && handleVerificationAction(selectedShop.id, "approve", verificationNotes)
                  }
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? "Approving..." : "Approve Shop"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedShop(record)}
                className="text-xs border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Reject
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">Reject Shop</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Please provide a reason for rejecting "{record.name}". This will help them understand what needs to be
                  improved.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rejection Reason *</label>
                  <Textarea
                    placeholder="Please explain why this application is being rejected..."
                    value={verificationNotes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setVerificationNotes(e.target.value)}
                    className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setVerificationNotes("")
                    setSelectedShop(null)
                  }}
                  className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedShop && handleVerificationAction(selectedShop.id, "reject", verificationNotes)}
                  disabled={loading || !verificationNotes.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {loading ? "Rejecting..." : "Reject Shop"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shops
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Shop Verification
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Review and approve pending shop applications</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{shops.length}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Review Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">2.5 days</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Documents Submitted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {shops.reduce((sum, shop) => sum + shop.documents.length, 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
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
            Showing {range[0]} to {range[1]} of {total} pending shops
          </span>
        )}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      />

      {/* Shop Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Shop Review Details</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Review all shop information and documents before making a decision.
            </DialogDescription>
          </DialogHeader>
          {selectedShop && (
            <div className="space-y-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedShop.logo || "/placeholder.svg?height=64&width=64"} />
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                          {selectedShop.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{selectedShop.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedShop.email}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedShop.phone}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">{selectedShop.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedShop.rating} rating • {selectedShop.totalServices} services
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Submitted Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedShop.documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-gray-100">{doc}</span>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs bg-transparent">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Shop Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-900 dark:text-gray-100">{selectedShop.description}</p>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailsModal(false)}
              className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ShopVerification
