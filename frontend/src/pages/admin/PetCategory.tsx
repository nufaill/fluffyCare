import { useState } from "react"
import { PawPrint, Search, Edit2, Shield, ShieldCheck } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/Badge"
import { Switch } from "@/components/ui/switch"
import { Table } from "@/components/ui/Table"
import  AdminSidebar  from "@/components/admin/Sidebar"
import  AdminNavbar  from "@/components/admin/Navbar"
import { AddItemForm } from "@/components/admin/add-item-form"
import { StatsCards } from "@/components/admin/stats-cards"

interface Category {
  id: string
  name: string
  createdAt: string
  status: "active" | "blocked"
}

export default function PetCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "Dogs", createdAt: "2024-01-15", status: "active" },
    { id: "2", name: "Cats", createdAt: "2024-01-10", status: "active" },
    { id: "3", name: "Birds", createdAt: "2024-01-08", status: "blocked" },
    { id: "4", name: "Fish", createdAt: "2024-01-05", status: "active" },
  ])

  const [searchTerm, setSearchTerm] = useState<string>("")
  const [sortBy, setSortBy] = useState<string | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined)

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeCategories = categories.filter((cat) => cat.status === "active").length
  const blockedCategories = categories.filter((cat) => cat.status === "blocked").length

  const handleAddCategory = (name: string) => {
    const isDuplicate = categories.some((cat) => cat.name.toLowerCase() === name.toLowerCase())

    if (isDuplicate) {
      alert("Category already exists")
      return
    }

    const newCat: Category = {
      id: Date.now().toString(),
      name: name,
      createdAt: new Date().toISOString().split("T")[0],
      status: "active",
    }
    setCategories((prev) => [...prev, newCat])
  }

  const handleToggleStatus = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, status: cat.status === "active" ? "blocked" : "active" } : cat,
      ),
    )
  }

  const handleSort = (key: string, order: "asc" | "desc") => {
    setSortBy(key)
    setSortOrder(order)
  }

  const statsData = [
    { label: "Active Categories", value: activeCategories, color: "text-green-600 dark:text-green-400" },
    { label: "Blocked Categories", value: blockedCategories, color: "text-red-600 dark:text-red-400" },
  ]

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
          onAdd={handleAddCategory}
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
                {filteredCategories.length} categories
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table<Category>
              columns={[
                {
                  key: "name",
                  title: "Category Name",
                  dataIndex: "name",
                  sortable: true,
                  align: "left",
                },
                {
                  key: "status",
                  title: "Status",
                  dataIndex: "status",
                  sortable: true,
                  align: "left",
                  render: (value: "active" | "blocked") => (
                    <Badge
                      className={
                        value === "active"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                      }
                    >
                      {value === "active" ? (
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
                  render: (_, record: Category) => (
                    <div className="flex items-center justify-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={record.status === "active"}
                          onCheckedChange={() => handleToggleStatus(record.id)}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {record.status === "active" ? "Block" : "Unblock"}
                        </span>
                      </div>
                    </div>
                  ),
                },
              ]}
              data={filteredCategories}
              rowKey="id"
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
