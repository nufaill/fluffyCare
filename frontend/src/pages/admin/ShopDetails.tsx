import type React from "react"
import { useState, useEffect, useMemo } from "react"
import Navbar from "@/components/admin/Navbar"
import Sidebar from "@/components/admin/sidebar"
import Footer from "@/components/user/Footer"
import { Table, type TableColumn } from "@/components/ui/Table"
import { Pagination } from "@/components/ui/Pagination"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Lock,
  Unlock,
  MapPin,
  Settings,
  Phone,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getAllShops, updateShopStatus } from "@/services/admin/admin.service"
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary";
import toast from 'react-hot-toast'

export type Verification = {
  status: "pending" | "approved" | "rejected";
  reason: string | null;
};

interface Shop {
  id: string
  name: string
  logo?: string
  email: string
  isVerified: Verification
  isActive: boolean
  address: string
  phone: string
  rating: number
  totalServices: number
  city: string
  streetAddress: string
  certificateUrl: string
  joinDate: string
  lastActive: string
  createdAt: Date
  updatedAt: Date
  totalRevenue: number
  description: string
}

interface ApiResponse {
  success: boolean
  data: Shop[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  message: string
}

const ShopDetails: React.FC = () => {
  const navigate = useNavigate()
  const [shops, setShops] = useState<Shop[]>([])
  const [totalShops, setTotalShops] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [loading, setLoading] = useState(false)
  const [activeMenuItem, setActiveMenuItem] = useState("Shops")
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        const response: ApiResponse = await getAllShops(currentPage, pageSize, true);
        const verifiedShops = (response.data || []).filter(shop => shop.isVerified.status === 'approved');
        setShops(verifiedShops);
        setTotalShops(response.pagination.total);
      } catch (error) {
        console.error('Error fetching shops:', error);
        toast.error('Failed to fetch shops', {
          position: 'top-right',
          duration: 4000,
          style: {
            background: '#FEE2E2',
            color: '#DC2626',
            border: '1px solid #F87171',
          },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, [currentPage, pageSize]);

  const filteredAndSortedData = useMemo(() => {
    const filtered = shops
      .filter(shop => shop.isVerified)
      .filter((shop) => {
        const name = shop.name || "";
        const email = shop.email || "";
        const address = shop.address || "";

        const lowerSearch = searchTerm.toLowerCase();

        return (
          name.toLowerCase().includes(lowerSearch) ||
          email.toLowerCase().includes(lowerSearch) ||
          address.toLowerCase().includes(lowerSearch)
        );
      });

    if (sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[sortBy as keyof Shop];
        const bValue = b[sortBy as keyof Shop];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortOrder === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }

    return filtered;
  }, [shops, searchTerm, sortBy, sortOrder]);

  const paginatedData = useMemo(() => {
    return filteredAndSortedData
  }, [filteredAndSortedData])

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
    setCurrentPage(1)
  }

  const handleToggleActive = async (shopId: string, isActive: boolean): Promise<void> => {
    setLoading(true)
    try {
      const response = await updateShopStatus(shopId, isActive)

      if (response.success) {
        setShops(prevShops =>
          prevShops.map(shop =>
            shop.id === shopId
              ? { ...shop, isActive }
              : shop
          )
        )

        toast.success(
          `Shop ${isActive ? 'Unblocked' : 'blocked'} successfully!`,
          {
            position: 'top-right',
            duration: 3000,
            style: {
              background: isActive ? '#DBEAFE' : '#FEE2E2',
              color: isActive ? '#1D4ED8' : '#DC2626',
              border: isActive ? '1px solid #93C5FD' : '1px solid #F87171'
            }
          }
        )
      } else {
        throw new Error(response.message || 'Failed to update shop status')
      }
    } catch (error: any) {
      console.error('Error updating shop status:', error)

      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Failed to update shop status. Please try again.'

      toast.error(errorMessage, {
        position: 'top-right',
        duration: 4000,
        style: {
          background: '#FEE2E2',
          color: '#DC2626',
          border: '1px solid #F87171'
        }
      })
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
    setCurrentPage(page);
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    }
  };

  const columns: TableColumn<Shop>[] = [
    {
      key: "shop",
      title: "Shop",
      dataIndex: "name",
      sortable: true,
      render: (_value: string, record: Shop) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-gray-200 dark:ring-gray-600">
            <AvatarImage src={cloudinaryUtils.getFullUrl(record?.logo || "/placeholder.svg?height=40&width=40")} />
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
            {/* <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span>{record.rating}</span>
              <span>({record.totalServices} services)</span>
            </div> */}
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
      dataIndex: "isActive",
      sortable: true,
      align: "center",
      render: (_value: boolean, record: Shop) => (
        <div className="flex items-center justify-center">
          {record.isActive ? (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <Unlock className="h-4 w-4" />
              <span>Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <Lock className="h-4 w-4" />
              <span>Blocked</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "isActive",
      title: "Toggle Status",
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
    // {
    //   key: "performance",
    //   title: "Performance",
    //   dataIndex: "totalRevenue",
    //   sortable: true,
    //   align: "right",
    //   render: (_value: number, record: Shop) => (
    //     <div className="text-right space-y-1">
    //       <div className="font-medium text-gray-900 dark:text-gray-100">₹{record.totalRevenue || 0}</div>
    //       <div className="flex items-center justify-end gap-1 text-sm text-gray-500 dark:text-gray-400">
    //         <Users className="h-3 w-3" />
    //         <span>{record.totalServices} services</span>
    //       </div>
    //       <div className="text-xs text-gray-500 dark:text-gray-400">
    //         Last active:{new Date(selectedShop.updatedAt).toLocaleDateString()}
    //       </div>
    //     </div>
    //   ),
    // },
    {
      key: "joinDate",
      title: "Join Date",
      dataIndex: "joinDate",
      sortable: true,
      render: (_value: string, record: Shop) => (
        <span className="text-gray-900 dark:text-gray-100">
          {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : "N/A"}
        </span>
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
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage verified shop information and status</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleGoToVerification} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                <Settings className="h-4 w-4 mr-2" />
                Manage Verification
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Verified Shops</p>
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Shops</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{shops.filter(shop => shop.isActive).length}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Unlock className="h-6 w-6 text-green-600 dark:text-green-400" />
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
                      ₹{totalRevenue || 0}
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
            total={totalShops}
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
                      <AvatarImage src={cloudinaryUtils.getFullUrl(selectedShop?.logo || "/placeholder.svg?height=40&width=40")} />
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
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                      <p className="text-base">
                        {selectedShop.isActive ? (
                          <span className="text-green-600 dark:text-green-400">Active</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400">Blocked</span>
                        )}
                      </p>
                    </div>
                    {/* <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{selectedShop.rating} ({selectedShop.totalServices} services)</span>
                      </div>
                    </div> */}
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Join Date</p>
                      <p className="text-base">{new Date(selectedShop.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Update</p>
                      <p className="text-base">{new Date(selectedShop.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Certificate</p>
                      <a
                        href={cloudinaryUtils.getFullUrl(selectedShop.certificateUrl)}
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