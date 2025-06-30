"use client"

import type React from "react"
import { useState, useMemo } from "react"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, Download, Plus, Phone, Mail, User, Heart, Eye, Edit, Trash2, MoreVertical, DollarSign } from 'lucide-react'
import { useNavigate } from "react-router-dom"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  profilePhoto?: string
  isActive: boolean
  joinDate: string
  totalPets: number
  lastVisit: string
  totalSpent: number
  status: "active" | "inactive" | "suspended"
}

// Sample data
const generateSampleData = (): Customer[] => {
  const names: string[] = [
    "Alice Johnson",
    "Bob Smith",
    "Carol Davis",
    "David Wilson",
    "Emma Brown",
    "Frank Miller",
    "Grace Lee",
    "Henry Taylor",
    "Ivy Chen",
    "Jack Anderson",
    "Kate Thompson",
    "Liam Garcia",
    "Mia Rodriguez",
    "Noah Martinez",
    "Olivia Lopez",
    "Paul Hernandez",
    "Quinn Walker",
    "Ruby Hall",
    "Sam Allen",
    "Tina Young",
  ]

  const emails: string[] = names.map((name) => name.toLowerCase().replace(" ", ".") + "@example.com")

  return names.map(
    (name, index): Customer => ({
      id: `customer-${index + 1}`,
      name,
      email: emails[index],
      phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      profilePhoto: Math.random() > 0.5 ? `/placeholder.svg?height=40&width=40` : undefined,
      isActive: Math.random() > 0.3,
      joinDate: new Date(
        2020 + Math.floor(Math.random() * 4),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1,
      )
        .toISOString()
        .split("T")[0],
      totalPets: Math.floor(Math.random() * 5) + 1,
      lastVisit: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      totalSpent: Math.floor(Math.random() * 2000) + 100,
      status: Math.random() > 0.8 ? "suspended" : Math.random() > 0.3 ? "active" : "inactive",
    }),
  )
}

const CustomerDetails: React.FC = () => {
  const navigate = useNavigate()
  const [customers] = useState<Customer[]>(generateSampleData())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [loading, setLoading] = useState(false)
  const [activeMenuItem, setActiveMenuItem] = useState("CustomerPetsDetail")

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm),
    )

    if (sortBy) {
      filtered.sort((a, b) => {
        const aValue = (a as any)[sortBy]
        const bValue = (b as any)[sortBy]

        if (typeof aValue === "string") {
          return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        if (typeof aValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue
        }

        return 0
      })
    }

    return filtered
  }, [customers, searchTerm, sortBy, sortOrder])

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

  const handleToggleActive = async (customerId: string, isActive: boolean): Promise<void> => {
    setLoading(true)
    setTimeout(() => {
      console.log(`Customer ${customerId} set to ${isActive ? "active" : "inactive"}`)
      setLoading(false)
    }, 500)
  }

  const handleViewPetDetails = (customer: Customer): void => {
    console.log(`Viewing pet details for ${customer.name}`)
  }

  const handleEditCustomer = (customer: Customer): void => {
    console.log(`Editing customer ${customer.name}`)
  }

  const handleDeleteCustomer = (customer: Customer): void => {
    console.log(`Deleting customer ${customer.name}`)
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

  const columns: TableColumn<Customer>[] = [
    {
      key: "customer",
      title: "Customer",
      dataIndex: "name",
      sortable: true,
      render: (_: any, record: Customer) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-gray-200 dark:ring-gray-600">
            <AvatarImage src={record.profilePhoto || "/placeholder.svg?height=40&width=40"} />
            <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300">
              {record.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{record.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {record.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      title: "Contact Info",
      dataIndex: "email",
      render: (_: any, record: Customer) => (
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
      dataIndex: "status",
      sortable: true,
      render: (_: any, record: Customer) => (
        <div className="space-y-2">
          <Badge
            className={
              record.status === "active"
                ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800"
                : record.status === "suspended"
                  ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600"
            }
          >
            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
          </Badge>
        </div>
      ),
    },
    {
      key: "isActive",
      title: "Active",
      dataIndex: "isActive",
      align: "center",
      render: (_: any, record: Customer) => (
        <Switch
          checked={record.isActive}
          onCheckedChange={(checked: boolean) => handleToggleActive(record.id, checked)}
          disabled={loading}
          className="data-[state=checked]:bg-gray-900 dark:data-[state=checked]:bg-gray-100"
        />
      ),
    },
    {
      key: "pets",
      title: "Pets",
      dataIndex: "totalPets",
      sortable: true,
      align: "center",
      render: (_: any, record: Customer) => (
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Heart className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-gray-100">{record.totalPets}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewPetDetails(record)}
            className="text-xs border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
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
      key: "totalSpent",
      title: "Total Spent",
      dataIndex: "totalSpent",
      sortable: true,
      align: "right",
      render: (value: number) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">${value.toLocaleString()}</span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      dataIndex: "actions",
      align: "center",
      render: (_: any, record: Customer) => (
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
              onClick={() => handleEditCustomer(record)}
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Customer
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleViewPetDetails(record)}
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Heart className="h-4 w-4 mr-2" />
              Pet Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeleteCustomer(record)}
              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Customer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

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
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage customer information and pet details</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{customers.length}</p>
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Customers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {customers.filter((c) => c.isActive).length}
                    </p>
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pets</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {customers.reduce((sum, c) => sum + c.totalPets, 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
                      ${customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
