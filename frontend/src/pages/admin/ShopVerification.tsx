import type React from "react";
import { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/admin/Navbar";
import Sidebar from "@/components/admin/sidebar";
import Footer from "@/components/user/Footer";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Mail,
  Calendar,
  FileText,
  Eye,
  Store,
  Info,
  Phone,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUnverifiedShops, approveShop, rejectShop } from "@/services/admin/admin.service";
import toast from "react-hot-toast";
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary";

type VerificationStatus = "approved" | "rejected" | "pending";

interface Shop {
  certificateUrl(certificateUrl: any): string | undefined;
  id: string;
  name: string;
  logo?: string;
  email: string;
  phone: string;
  address: string;
  isVerified: VerificationStatus;
  rating: number;
  totalServices: number;
  joinDate: string;
  lastActive: string;
  totalRevenue: number;
  description: string;
  documents: string[];
  verificationNotes?: string;
  submittedDate: string;
}

const ShopVerification: React.FC = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("Verification");

  useEffect(() => {
    const fetchUnverifiedShops = async () => {
      setLoading(true);
      try {
        const response = await getUnverifiedShops();

        if (!response.success || !Array.isArray(response.data)) {
          throw new Error("Invalid API response structure");
        }

        const transformedShops: Shop[] = response.data.map((shop: any) => {
          let documents: string[] = [];
          if (Array.isArray(shop.certificateUrl)) {
            documents = shop.certificateUrl;
          } else if (typeof shop.certificateUrl === "string") {
            documents = [shop.certificateUrl];
          } else {
            documents = [];
          }

          return {
            id: shop.id,
            name: shop.name,
            logo: shop.logo || "/placeholder.svg?height=48&width=48",
            email: shop.email,
            phone: shop.phone,
            address: `${shop.streetAddress}, ${shop.city}`,
            isVerified: shop.isVerified.status || "pending",
            rating: shop.rating || 0,
            totalServices: shop.totalServices || 0,
            joinDate: shop.createdAt,
            lastActive: shop.updatedAt,
            totalRevenue: shop.totalRevenue || 0,
            description: shop.description || "",
            documents,
            verificationNotes: shop.isVerified.reason || "",
            submittedDate: shop.createdAt,
          };
        });
        setShops(transformedShops);
      } catch (error: any) {
        console.error("Error fetching shops:", error);
        toast.error(error.message || "Failed to fetch shops", {
          position: "top-right",
          duration: 4000,
          style: {
            background: "#FEE2E2",
            color: "#DC2626",
            border: "1px solid #F87171",
          },
        });
        setShops([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUnverifiedShops();
  }, []);

  const filteredAndSortedData = useMemo(() => {
    const filtered = shops.filter(
      (shop) =>
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.address.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    if (sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[sortBy as keyof Shop];
        const bValue = b[sortBy as keyof Shop];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
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
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  const handleMenuItemClick = (item: string) => {
    setActiveMenuItem(item);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("adminToken");
      sessionStorage.clear();
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/admin/login");
    }
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  const handleVerificationAction = async (
    shopId: string,
    action: "approve" | "reject",
    notes: string,
  ): Promise<void> => {
    setLoading(true);
    try {
      if (action === "approve") {
        await approveShop(shopId);
        setShops((prevShops) => prevShops.filter((shop) => shop.id !== shopId));
      } else {
        await rejectShop(shopId, notes);
        setShops((prevShops) =>
          prevShops.map((shop) =>
            shop.id === shopId ? { ...shop, isVerified: "rejected", verificationNotes: notes } : shop,
          ),
        );
      }
      setVerificationNotes("");
      setSelectedShop(null);
    } catch (error) {
      console.error(`Failed to ${action} shop:`, error);
      toast.error(`Failed to ${action} shop`, {
        position: "top-right",
        duration: 4000,
        style: {
          background: "#FEE2E2",
          color: "#DC2626",
          border: "1px solid #F87171",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (shop: Shop): void => {
    console.log("Selected Shop for Review:", shop); // Debug: Log selected shop
    setSelectedShop(shop);
    setShowDetailsModal(true);
  };

  const handleSort = (key: string, order: "asc" | "desc"): void => {
    setSortBy(key);
    setSortOrder(order);
  };

  const handlePageChange = (page: number, newPageSize?: number): void => {
    setCurrentPage(page);
    if (newPageSize) {
      setPageSize(newPageSize);
    }
  };

  const columns: TableColumn<Shop>[] = [
    {
      key: "shop",
      title: "Shop Information",
      dataIndex: "name",
      sortable: true,
      render: (_value: string, record: Shop) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-gray-200 dark:ring-gray-600">
            <AvatarImage src={cloudinaryUtils.getFullUrl(record?.logo ?? "")} />
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
      render: (_value: string, record: Shop) => (
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
          {/* <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 dark:text-gray-100">{record.totalServices} services</span>
          </div> */}
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "isVerified",
      align: "center",
      render: (value: VerificationStatus, record: Shop) => (
        <>
          {value === "pending" && (
            <Badge className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
              <Clock className="h-3 w-3 mr-1" />
              Pending Review
            </Badge>
          )}
          {value === "rejected" && (
            <div className="flex flex-col items-center">
              <Badge className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800">
                <XCircle className="h-3 w-3 mr-1" />
                Rejected
              </Badge>
              {record.verificationNotes && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1 max-w-xs truncate">
                  Reason: {record.verificationNotes}
                </p>
              )}
            </div>
          )}
          {value === "approved" && (
            <Badge className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Approved
            </Badge>
          )}
        </>
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
            Review
          </Button>
          {(record.isVerified === "pending" || record.isVerified === "rejected") && (
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
                      setVerificationNotes("");
                      setSelectedShop(null);
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
          )}
          {record.isVerified === "pending" && (
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
                      setVerificationNotes("");
                      setSelectedShop(null);
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
          )}
        </div>
      ),
    },
  ];

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
            <div className="flex items-center gap-4">
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
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {shops.filter((shop) => shop.isVerified === "pending").length}
                    </p>
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected Shops</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {shops.filter((shop) => shop.isVerified === "rejected").length}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
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
                Showing {range[0]} to {range[1]} of {total} shops
              </span>
            )}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          />

          {/* Shop Details Modal */}
          <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
            <DialogContent className="max-w-4xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Store className="h-6 w-6 text-black-500 dark:text-black-400" aria-hidden="true" />
                  Shop Review Details
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
                  Review all shop information and documents before making a decision.
                </DialogDescription>
              </DialogHeader>
              {selectedShop && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                      <CardHeader className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-black-500 dark:text-black-400" aria-hidden="true" />
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Basic Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{selectedShop.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <Mail className="h-4 w-4" aria-hidden="true" />
                              {selectedShop.email}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <Phone className="h-4 w-4" aria-hidden="true" />
                              {selectedShop.phone}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-gray-100">{selectedShop.address}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Submitted Documents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedShop.documents && selectedShop.documents.length > 0 ? (
                          <div className="space-y-2">
                            {selectedShop.documents.map((doc, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500"
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(cloudinaryUtils.getFullUrl(doc), "_blank")}
                                  className="text-xs bg-transparent"
                                >
                                  View
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            No documents submitted.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-black-500 dark:text-black-400" aria-hidden="true" />
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Shop Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-900 dark:text-gray-100">
                        {selectedShop.description || "No description provided."}
                      </p>
                      {selectedShop.isVerified === "rejected" && selectedShop.verificationNotes && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" aria-hidden="true" />
                            Rejection Reason
                          </h4>
                          <p className="text-sm text-gray-900 dark:text-gray-100 mt-2">
                            {selectedShop.verificationNotes}
                          </p>
                        </div>
                      )}
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
      </main>

      {/* Footer */}
      <div className="ml-64">
        <Footer />
      </div>
    </div>
  );
};

export default ShopVerification;