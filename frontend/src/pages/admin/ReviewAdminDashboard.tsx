import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/Badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table } from "@/components/ui/Table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, Edit, Trash2, Filter, Search, Users, MessageSquare, TrendingUp } from "lucide-react"
import Navbar from "@/components/admin/Navbar"
import Sidebar from "@/components/admin/sidebar"
import AdminAxios from "@/api/admin.axios"
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary"
import { Pagination } from "@/components/ui/Pagination"
import debounce from "lodash.debounce"

interface Review {
    _id: string;
    shopId: {
        _id: string;
        name: string;
        logo?: string;
    };
    userId: {
        _id: string;
        fullName: string;
        profileImage?: string;
    };
    rating: number;
    comment?: string;
    createdAt: string;
    updatedAt: string;
}

export default function ReviewAdminDashboard() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
    const [ratingFilter, setRatingFilter] = useState<string>("all")
    const [shopFilter, setShopFilter] = useState<string>("all")
    const [sortBy, setSortBy] = useState<string>("createdAt")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [editingReview, setEditingReview] = useState<Review | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalReviews, setTotalReviews] = useState(0)

    // Debounce search term updates
    const debouncedSetSearchTerm = useCallback(
        debounce((value: string) => {
            setDebouncedSearchTerm(value)
        }, 500),
        []
    )

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        debouncedSetSearchTerm(e.target.value)
    }

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearchTerm, ratingFilter, shopFilter])

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true)
                setError(null)
                const queryParams = new URLSearchParams({
                    page: currentPage.toString(),
                    limit: pageSize.toString(),
                    ...(debouncedSearchTerm && { searchTerm: debouncedSearchTerm }),
                    ...(ratingFilter !== "all" && { rating: ratingFilter }),
                    ...(shopFilter !== "all" && { shopId: shopFilter }),
                    sortBy,
                    sortOrder
                })

                console.log("Fetching reviews with URL:", `/reviews?${queryParams}`)
                const response = await AdminAxios.get(`/reviews?${queryParams}`)
                console.log("API response:", response.data)

                const responseData = response.data.data || response.data
                const reviewsData = responseData.reviews || []
                const total = responseData.pagination?.totalCount ?? 0 // Use pagination.totalCount

                const transformedReviews: Review[] = reviewsData.map((review: any) => ({
                    _id: review.id || review._id,
                    shopId: {
                        _id: review.shopId.id || review.shopId._id,
                        name: review.shopId.name,
                        logo: review.shopId.logo
                    },
                    userId: {
                        _id: review.userId.id || review.userId._id,
                        fullName: review.userId.fullName,
                        profileImage: review.userId.profileImage
                    },
                    rating: review.rating,
                    comment: review.comment,
                    createdAt: review.createdAt,
                    updatedAt: review.updatedAt
                }))

                setReviews(transformedReviews)
                setTotalReviews(total)
                setLoading(false)
                console.log("Pagination state:", { currentPage, pageSize, totalReviews: total })
            } catch (err: any) {
                console.error("Fetch error for page", currentPage, ":", err)
                setError(`Failed to fetch reviews for page ${currentPage}: ${err.message}`)
                setLoading(false)
            }
        }
        fetchReviews()
    }, [currentPage, pageSize, debouncedSearchTerm, ratingFilter, shopFilter, sortBy, sortOrder])

    const uniqueShops = Array.from(new Set(reviews.map((r) => r.shopId?._id)))
        .filter(Boolean)
        .map((shopId) => reviews.find((r) => r.shopId._id === shopId)?.shopId)

    const stats = {
        totalReviews,
        averageRating: reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0",
        ratingDistribution: [1, 2, 3, 4, 5].map(
            (rating) => reviews.filter((r) => r.rating === rating).length
        )
    }

    const handleEditReview = (review: Review) => {
        setEditingReview({ ...review })
    }

    const handleSaveReview = async () => {
        if (!editingReview || !editingReview._id) {
            setError("No review selected for editing")
            return
        }

        try {
            const response = await AdminAxios.put(`/reviews/${editingReview._id}`, {
                rating: editingReview.rating,
                comment: editingReview.comment,
            })

            const reviewData = response.data.data || response.data

            const updatedReviewData: Review = {
                _id: reviewData.id || reviewData._id,
                shopId: {
                    _id: reviewData.shopId?.id || reviewData.shopId?._id || editingReview.shopId._id,
                    name: reviewData.shopId?.name || editingReview.shopId.name,
                    logo: reviewData.shopId?.logo || editingReview.shopId.logo,
                },
                userId: {
                    _id: reviewData.userId?.id || reviewData.userId?._id || editingReview.userId._id,
                    fullName: reviewData.userId?.fullName || editingReview.userId.fullName,
                    profileImage: reviewData.userId?.profileImage || editingReview.userId.profileImage,
                },
                rating: reviewData.rating || editingReview.rating,
                comment: reviewData.comment || editingReview.comment,
                createdAt: reviewData.createdAt || editingReview.createdAt,
                updatedAt: reviewData.updatedAt || editingReview.updatedAt,
            }

            setReviews((prev) =>
                prev.map((r) => (r._id === editingReview._id ? updatedReviewData : r))
            )
            setEditingReview(null)
        } catch (err: any) {
            console.error("Failed to save review:", err)
            setError(err.message || "Failed to save review")
        }
    }

    const handleDeleteReview = async (reviewId: string) => {
        try {
            await AdminAxios.delete(`/reviews/${reviewId}`)
            setReviews((prev) => prev.filter((r) => r._id !== reviewId))
            setTotalReviews((prev) => prev - 1)
        } catch (err) {
            setError("Failed to delete review")
        }
    }

    const handlePaginationChange = (page: number, newPageSize?: number) => {
        console.log("Pagination change:", { page, newPageSize: newPageSize || pageSize })
        setCurrentPage(page)
        if (newPageSize) {
            setPageSize(newPageSize)
        }
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        ))
    }

    const getRatingBadgeColor = (rating: number) => {
        if (rating >= 4) return "bg-green-100 text-green-800"
        if (rating >= 3) return "bg-yellow-100 text-yellow-800"
        return "bg-red-100 text-red-800"
    }

    const columns = [
        {
            key: "rating",
            title: "Rating",
            dataIndex: "rating",
            render: (value: number, review: Review) => (
                <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <Badge className={getRatingBadgeColor(review.rating)}>{review.rating}</Badge>
                </div>
            ),
        },
        {
            key: "shopId",
            title: "Shop",
            dataIndex: "shopId",
            render: (shop: Review["shopId"]) => (
                <div className="flex items-center gap-2">
                    {shop.logo && (
                        <img
                            src={cloudinaryUtils.getFullUrl(shop.logo)}
                            alt={`${shop.name} logo`}
                            className="h-6 w-6 rounded-full object-cover"
                        />
                    )}
                    <span className="font-mono text-sm">{shop.name}</span>
                </div>
            ),
        },
        {
            key: "userId",
            title: "User",
            dataIndex: "userId",
            render: (user: Review["userId"]) => (
                <div className="flex items-center gap-2">
                    {user.profileImage && (
                        <img
                            src={cloudinaryUtils.getFullUrl(user.profileImage)}
                            alt={`${user.fullName} avatar`}
                            className="h-6 w-6 rounded-full object-cover"
                        />
                    )}
                    <span className="font-mono text-sm">{user.fullName}</span>
                </div>
            ),
        },
        {
            key: "comment",
            title: "Comment",
            dataIndex: "comment",
            render: (value: string) => (
                <div className="max-w-xs">
                    <div className="truncate" title={value}>
                        {value || "No comment"}
                    </div>
                </div>
            ),
        },
        {
            key: "createdAt",
            title: "Created",
            dataIndex: "createdAt",
            render: (value: string) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(value).toLocaleDateString() || "N/A"}
                </span>
            ),
        },
        {
            key: "updatedAt",
            title: "Updated",
            dataIndex: "updatedAt",
            render: (value: string) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(value).toLocaleDateString() || "N/A"}
                </span>
            ),
        },
        {
            key: "actions",
            title: "Actions",
            dataIndex: "actions",
            render: (_: any, review: Review) => (
                <div className="flex items-center justify-end gap-2">
                    <Dialog onOpenChange={(open) => !open && setEditingReview(null)}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleEditReview(review)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <Dialog open={!!editingReview} onOpenChange={(open) => !open && setEditingReview(null)}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit Review</DialogTitle>
                                </DialogHeader>
                                {editingReview && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="rating">Rating</Label>
                                            <Select
                                                value={editingReview.rating.toString()}
                                                onValueChange={(value) =>
                                                    setEditingReview({
                                                        ...editingReview,
                                                        rating: parseInt(value),
                                                    })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">1 Star</SelectItem>
                                                    <SelectItem value="2">2 Stars</SelectItem>
                                                    <SelectItem value="3">3 Stars</SelectItem>
                                                    <SelectItem value="4">4 Stars</SelectItem>
                                                    <SelectItem value="5">5 Stars</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="comment">Comment</Label>
                                            <Textarea
                                                id="comment"
                                                value={editingReview.comment || ""}
                                                onChange={(e) =>
                                                    setEditingReview({
                                                        ...editingReview,
                                                        comment: e.target.value,
                                                    })
                                                }
                                                rows={4}
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => setEditingReview(null)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleSaveReview}>Save Changes</Button>
                                        </div>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </Dialog>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <div className="min-h-screen bg-background">
            <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
                <Navbar userName="NUFAIL" />
            </div>
            <div className="flex flex-1 pt-16">
                <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 bg-white shadow-md w-64 hidden lg:block">
                    <Sidebar />
                </div>
                <div className="flex-1 lg:ml-64">
                    <header className="border-b bg-card">
                        <div className="container mx-auto px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground">Review Management</h1>
                                    <p className="text-muted-foreground">Manage and monitor customer reviews</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant="secondary" className="px-3 py-1">
                                        {stats.totalReviews} Total Reviews
                                    </Badge>
                                    <Badge className="px-3 py-1">
                                        ⭐ {stats.averageRating} Average
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="container mx-auto px-6 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalReviews}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                                    <Star className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.averageRating}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">5-Star Reviews</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.ratingDistribution[4]}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{uniqueShops.length}</div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    Filters & Search
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={(e) => e.preventDefault()}>
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search reviews..."
                                                value={searchTerm}
                                                onChange={handleSearchChange}
                                                className="pl-10"
                                            />
                                        </div>

                                        <Select value={ratingFilter} onValueChange={setRatingFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Filter by rating" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Ratings</SelectItem>
                                                <SelectItem value="5">5 Stars</SelectItem>
                                                <SelectItem value="4">4 Stars</SelectItem>
                                                <SelectItem value="3">3 Stars</SelectItem>
                                                <SelectItem value="2">2 Stars</SelectItem>
                                                <SelectItem value="1">1 Star</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={shopFilter} onValueChange={setShopFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Filter by shop" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Shops</SelectItem>
                                                {uniqueShops.map((shop) => (
                                                    <SelectItem key={shop?._id} value={shop?._id || ""}>
                                                        {shop?.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select value={sortBy} onValueChange={setSortBy}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sort by" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="createdAt">Date Created</SelectItem>
                                                <SelectItem value="updatedAt">Date Updated</SelectItem>
                                                <SelectItem value="rating">Rating</SelectItem>
                                                <SelectItem value="shopId">Shop Name</SelectItem>
                                                <SelectItem value="userId">User Name</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Button variant="outline" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                                            {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {error && (
                            <div className="text-red-500 p-6 text-center">
                                {error}
                                <Button
                                    variant="outline"
                                    className="ml-4"
                                    onClick={() => {
                                        setError(null)
                                        setSearchTerm("")
                                        setDebouncedSearchTerm("")
                                        setRatingFilter("all")
                                        setShopFilter("all")
                                    }}
                                >
                                    Clear Error & Filters
                                </Button>
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center p-6">Loading reviews...</div>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Reviews ({totalReviews})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table columns={columns} data={reviews} rowKey="_id" />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Pagination
                            current={currentPage}
                            total={totalReviews}
                            pageSize={pageSize}
                            onChange={handlePaginationChange}
                            showSizeChanger={true}
                            showQuickJumper={true}
                            showTotal={(total, range) => `Showing ${range[0]} to ${range[1]} of ${total} reviews`}
                            pageSizeOptions={[10, 20, 50, 100]}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}