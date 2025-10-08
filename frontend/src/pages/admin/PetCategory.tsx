import { useState, useEffect, useCallback } from "react";
import { PawPrint, Search, Edit2, Shield, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/switch";
import { Table } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import AdminSidebar from "@/components/admin/sidebar";
import AdminNavbar from "@/components/admin/Navbar";
import { AddItemForm } from "@/components/admin/add-item-form";
import { StatsCards } from "@/components/admin/stats-cards";
import { createPetType, getAllPetTypes, updatePetType, updatePetTypeStatus } from "@/services/admin/admin.service";
import toast from 'react-hot-toast';
import Footer from "@/components/user/Footer";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface PetType {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PetCategoryPage() {
  const [petTypes, setPetTypes] = useState<PetType[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [nameError, setNameError] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const validateName = (name: string): string => {
    const nameRegex = /^[a-zA-Z0-9]+$/;
    if (!name) return "Pet type name is required";
    if (name.length > 20) return "Pet type name must be 20 characters or less";
    if (name.includes(" ")) return "Pet type name cannot contain spaces";
    if (!nameRegex.test(name)) return "Pet type name can only contain alphanumeric characters";
    return "";
  };

  const fetchPetTypes = useCallback(async (term: string, retryCount = 0) => {
    try {
      setLoading(true);
      const response = await getAllPetTypes(term);
      if (response.success) {
        setPetTypes(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch pet types:', error);
      if (retryCount < 3) {
        setTimeout(() => fetchPetTypes(term, retryCount + 1), 1000);
      } else {
        toast.error('Failed to fetch pet types after retries');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchPetTypes(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchPetTypes]);

  const activePetTypes = petTypes.filter((pet) => pet.isActive).length;
  const blockedPetTypes = petTypes.filter((pet) => !pet.isActive).length;

  const handleAddPetType = async (name: string) => {
    const error = validateName(name);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      const response = await createPetType({ name });
      if (response.success) {
        setPetTypes((prev) => [response.data, ...prev]);
        setCurrentPage(1);
        toast.success('Pet type created successfully');
      }
    } catch (error) {
      console.error('Failed to create pet type:', error);
      toast.error('Failed to create pet type');
    }
  };

  const handleToggleStatus = async (petTypeId: string, currentStatus: boolean) => {
    try {
      const response = await updatePetTypeStatus(petTypeId, !currentStatus);
      if (response.success) {
        setPetTypes((prev) =>
          prev.map((pet) =>
            pet._id === petTypeId ? { ...pet, isActive: !currentStatus } : pet,
          ),
        );
        toast.success(`Pet type ${currentStatus ? 'blocked' : 'unblocked'} successfully`);
      }
    } catch (error) {
      console.error('Failed to update pet type status:', error);
      toast.error('Failed to update pet type status');
    }
  };

  const handleStartEdit = (petType: PetType) => {
    setEditingId(petType._id);
    setEditingName(petType.name);
    setNameError("");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) {
      toast.error('Pet type name is required');
      return;
    }

    const error = validateName(editingName);
    if (error) {
      setNameError(error);
      toast.error(error);
      return;
    }

    try {
      const response = await updatePetType(editingId, { name: editingName });
      if (response.success) {
        setPetTypes((prev) =>
          prev.map((pet) =>
            pet._id === editingId ? { ...pet, name: editingName } : pet,
          ),
        );
        setEditingId(null);
        setEditingName("");
        setNameError("");
        toast.success('Pet type updated successfully');
      }
    } catch (error) {
      console.error('Failed to update pet type:', error);
      toast.error('Failed to update pet type');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setNameError("");
  };

  const handleSort = (key: string, order: "asc" | "desc") => {
    setSortBy(key);
    setSortOrder(order);
  };

  const handlePageChange = (page: number, newPageSize?: number) => {
    setCurrentPage(page);
    if (newPageSize) {
      setPageSize(newPageSize);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const statsData = [
    { label: "Active Categories", value: activePetTypes, color: "text-green-600 dark:text-green-400" },
    { label: "Blocked Categories", value: blockedPetTypes, color: "text-red-600 dark:text-red-400" },
  ];

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPetTypes = petTypes.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading pet types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar 
        activeItem="PetCategory" 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <AdminNavbar 
        userName="NUFAIL" 
        onSearch={setSearchTerm} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <main className="pt-16 md:ml-64 p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-3 bg-black dark:bg-white rounded-lg">
              <PawPrint className="h-5 sm:h-6 w-5 sm:w-6 text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Pet Categories</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage pet categories for your services</p>
            </div>
          </div>
        </div>

        <AddItemForm
          title="Add New Pet Category"
          placeholder="Enter category name (e.g., Dogs, Cats, Birds)"
          onAdd={handleAddPetType}
          icon={<PawPrint className="h-4 w-4 text-white dark:text-black" />}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <StatsCards stats={statsData} />
        </div>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
              <span className="text-base sm:text-lg">Categories List</span>
              <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs sm:text-sm">
                {petTypes.length} categories
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
                      <>
                        <Input
                          value={editingName}
                          onChange={(e) => {
                            setEditingName(e.target.value);
                            setNameError(validateName(e.target.value));
                          }}
                          onBlur={handleSaveEdit}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="w-full text-sm"
                        />
                        {nameError && (
                          <p className="text-red-500 text-xs mt-1">{nameError}</p>
                        )}
                      </>
                    ) : (
                      <span className="text-sm sm:text-base">{value}</span>
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
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 text-xs sm:text-sm"
                          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 text-xs sm:text-sm"
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
                  render: (value: string) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                },
                {
                  key: "actions",
                  title: "Actions",
                  dataIndex: "actions",
                  align: "center",
                  render: (_, record: PetType) => (
                    <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                      {editingId === record._id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveEdit}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs sm:text-sm"
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs sm:text-sm"
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
                          <Edit2 className="h-3 sm:h-4 w-3 sm:w-4" />
                        </Button>
                      )}
                      <div className="flex items-center space-x-1 sm:space-x-2">
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
              data={paginatedPetTypes}
              rowKey="_id"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              emptyText={debouncedSearchTerm ? "No categories found matching your search." : "No categories available."}
            />
          </CardContent>
        </Card>
        <Pagination
          current={currentPage}
          total={petTypes.length}
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
       <div className="md:ml-64 p-4 md:p-6">
        <Footer />
      </div>
    </div>
  );
}