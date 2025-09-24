"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
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
import { Search, Filter, Download, Phone, Mail, User } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import { getAllUsers, updateUserStatus } from "@/services/admin/admin.service"
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary";
import toast from "react-hot-toast"

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  isActive: boolean;
  isGoogleUser: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define statistics interface
interface UserStats {
  totalUsers: number
  activeUsers: number
  blockedUsers: number
  googleUsers: number
}

const CustomerDetails: React.FC = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [activeMenuItem, setActiveMenuItem] = useState("CustomerPetsDetail")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

 const fetchUsers = async (): Promise<void> => {
  setLoading(true);
  try {
    const response = await getAllUsers();
    if (response.success && response.data) {
      const mappedUsers: User[] = response.data.map((user: any) => ({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        profileImage: user.profileImage || '',
        isActive: user.isActive,
        isGoogleUser: user.isGoogleUser ?? false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));
      setUsers(mappedUsers);
    } else {
      console.error('Failed to fetch users:', response.message);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    setLoading(false);
  }
};

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean): Promise<void> => {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.error('Invalid user ID:', userId);
      toast.error('Invalid user ID. Please try again.', {
        position: 'top-right',
        duration: 4000,
        style: {
          background: '#FEE2E2',
          color: '#DC2626',
          border: '1px solid #F87171'
        }
      });
      return;
    }
    setUpdateLoading(userId);
    try {
      const newStatus = !currentStatus;
      const response = await updateUserStatus(userId, newStatus);
      if (response.success) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId
              ? { ...user, isActive: newStatus }
              : user
          )
        );
        toast.success(`User ${newStatus ? 'activated' : 'blocked'} successfully!`, {
          position: 'top-right',
          duration: 4000,
          style: {
            background: newStatus ? '#D1FAE5' : '#FEF3C7',
            color: newStatus ? '#059669' : '#D97706',
            border: `1px solid ${newStatus ? '#34D399' : '#FBBF24'}`
          }
        });
      } else {
        console.error('Failed to update user status:', response.message);
        toast.error(response.message || 'Failed to update user status.', {
          position: 'top-right',
          duration: 4000,
          style: {
            background: '#FEE2E2',
            color: '#DC2626',
            border: '1px solid #F87171'
          }
        });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('An error occurred while updating user status.', {
        position: 'top-right',
        duration: 4000,
        style: {
          background: '#FEE2E2',
          color: '#DC2626',
          border: '1px solid #F87171'
        }
      });
    } finally {
      setUpdateLoading(null);
    }
  };

  // Filter and sort users data
  const filteredAndSortedData = useMemo(() => {
    const filtered = users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm))
    )

    if (sortBy) {
      filtered.sort((a, b) => {
        const aValue = (a as unknown as Record<string, unknown>)[sortBy]
        const bValue = (b as unknown as Record<string, unknown>)[sortBy]

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue
        }

        if (typeof aValue === "boolean" && typeof bValue === "boolean") {
          return sortOrder === "asc"
            ? (aValue === bValue ? 0 : aValue ? 1 : -1)
            : (aValue === bValue ? 0 : aValue ? -1 : 1)
        }

        return 0
      })
    }

    return filtered
  }, [users, searchTerm, sortBy, sortOrder])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize)
  }, [filteredAndSortedData, currentPage, pageSize])

  const handleMenuItemClick = (item: string): void => {
    setActiveMenuItem(item)
  }

  const handleLogout = async (): Promise<void> => {
    try {
      localStorage.removeItem("adminToken")
      sessionStorage.clear()
      navigate("/admin/login")
    } catch (error) {
      console.error("Logout failed:", error)
      navigate("/admin/login")
    }
  }

  const handleSearch = (query: string): void => {
    setSearchTerm(query)
    setCurrentPage(1) 
  }

  const handleSort = (key: string, order: "asc" | "desc"): void => {
    setSortBy(key)
    setSortOrder(order)
  }

  const handlePageChange = (page: number, newPageSize?: number): void => {
    setCurrentPage(page)
    if (newPageSize) {
      setPageSize(newPageSize)
      setCurrentPage(1) 
    }
  }

  const columns: TableColumn<User>[] = [
    {
      key: "customer",
      title: "Customer",
      dataIndex: "fullName",
      sortable: true,
      render: (_value: unknown, record: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-gray-200 dark:ring-gray-600">
            <AvatarImage src={record.profileImage ? cloudinaryUtils.getFullUrl(record.profileImage) : "/placeholder.svg?height=40&width=40"} />
            <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300">
              {record.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{record.fullName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {record.isGoogleUser ? 'Google User' : 'Regular User'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      title: "Contact Info",
      dataIndex: "email",
      render: (_value: unknown, record: User) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 dark:text-gray-100">{record.email}</span>
          </div>
          {record.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900 dark:text-gray-100">{record.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "isActive",
      sortable: true,
      render: (_value: unknown, record: User) => (
        <Badge
          className={
            record.isActive
              ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800"
              : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800"
          }
        >
          {record.isActive ? 'Active' : 'Blocked'}
        </Badge>
      ),
    },
    {
      key: "isActive",
      title: "Block/Unblock",
      dataIndex: "isActive",
      align: "center",
      render: (_value: unknown, record: User) => (
        <Switch
          checked={record.isActive}
          onCheckedChange={() => handleToggleUserStatus(record._id, record.isActive)}
          disabled={updateLoading === record._id}
          className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
        />
      ),
    },
    {
      key: "joinDate",
      title: "Join Date",
      dataIndex: "createdAt",
      sortable: true,
      render: (value: unknown) => (
        <span className="text-gray-900 dark:text-gray-100">
          {typeof value === 'string' ? new Date(value).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
  ]

  // Calculate statistics
  const stats: UserStats = useMemo(() => ({
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    blockedUsers: users.filter(u => !u.isActive).length,
    googleUsers: users.filter(u => u.isGoogleUser).length,
  }), [users])

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
                Customer Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage customer information and user accounts</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={()=>({})}
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activeUsers}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Blocked Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.blockedUsers}</p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <User className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Google Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.googleUsers}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                    placeholder="Search customers by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={()=>({})}
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
                Showing {range[0]} to {range[1]} of {total} customers
              </span>
            )}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          />
        </div>
      </main>

      {/* Footer */}
      <div className="ml-64">
        <Footer />
      </div>
    </div>
  )
}

export default CustomerDetails