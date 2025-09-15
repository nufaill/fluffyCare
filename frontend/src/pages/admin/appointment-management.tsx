import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/Badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, type TableColumn } from "@/components/ui/Table"
import { Search, Filter, Eye, Calendar, CreditCard, Dog, Hash, Scissors, StickyNote, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import Navbar from "@/components/admin/Navbar"
import Sidebar from "@/components/admin/sidebar"
import Footer from "@/components/user/Footer"
import AdminAxios from "@/api/admin.axios"
import { Pagination } from "@/components/ui/Pagination"
import type { Appointment } from "@/types/appointment.types"

// Define status colors for badges
const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  ongoing: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
} as const

// Define payment status colors for badges
const paymentStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
} as const

// Define the expected backend response structure
interface AppointmentApiResponse {
  success: boolean
  message: string
  data: {
    appointments: Appointment[]
    pagination: {
      total: number
      page: number
      limit: number
      pages: number
    }
  }
}

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const itemsPerPage = 6

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true)
      try {
        const response = await AdminAxios.get<AppointmentApiResponse>('/appointments', {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            status: statusFilter !== "all" ? statusFilter : undefined,
            date: dateFilter || undefined,
          }
        })
        setAppointments(response.data.data.appointments || [])
        setTotalItems(response.data.data.pagination.total || 0)
        setError(null)
      } catch (err) {
        setError("Failed to fetch appointments")
        console.error("Fetch appointments error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [currentPage, statusFilter, dateFilter])

  const filteredAppointments = useMemo(() => {
    if (!Array.isArray(appointments)) return []

    return appointments.filter((appointment) => {
      const q = searchTerm.toLowerCase()
      const matchesSearch =
        appointment._id.toLowerCase().includes(q) ||
        appointment.petId.name.toLowerCase().includes(q) ||
        appointment.shopId.name.toLowerCase().includes(q) ||
        appointment.staffId.name.toLowerCase().includes(q) ||
        appointment.serviceId.name.toLowerCase().includes(q)

      const matchesStatus =
        statusFilter === "all" || appointment.appointmentStatus === statusFilter
      const matchesPaymentStatus =
        paymentStatusFilter === "all" ||
        appointment.paymentDetails.status === paymentStatusFilter
      const matchesDate = !dateFilter || appointment.slotDetails.date === dateFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPaymentStatus &&
        matchesDate
      )
    })
  }, [appointments, searchTerm, statusFilter, paymentStatusFilter, dateFilter])

  const sortedAndFilteredAppointments = useMemo(() => {
    const sorted = [...filteredAppointments]
    if (sortBy) {
      sorted.sort((a, b) => {
        let aValue: string | number
        let bValue: string | number

        switch (sortBy) {
          case "petName":
            aValue = a.petId.name
            bValue = b.petId.name
            break
          case "shopName":
            aValue = a.shopId.name
            bValue = b.shopId.name
            break
          case "amount":
            aValue = a.paymentDetails.amount || 0
            bValue = b.paymentDetails.amount || 0
            break
          case "bookingNumber":
            aValue = a._id
            bValue = b._id
            break
          case "slotDetails.date":
            aValue = a.slotDetails.date
            bValue = b.slotDetails.date
            break
          case "appointmentStatus":
            aValue = a.appointmentStatus
            bValue = b.appointmentStatus
            break
          default:
            return 0
        }

        if (typeof aValue === "string") {
          return sortOrder === "asc" ? aValue.localeCompare(bValue as string) : (bValue as string).localeCompare(aValue)
        }
        return sortOrder === "asc" ? aValue - (bValue as number) : (bValue as number) - aValue
      })
    }
    return sorted
  }, [filteredAppointments, sortBy, sortOrder])

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })

  const StatusBadge = ({ status }: { status: string }) => (
    <Badge className={`${statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"} border-0 font-medium`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )

  const PaymentStatusBadge = ({ status }: { status: string }) => (
    <Badge className={`${paymentStatusColors[status as keyof typeof paymentStatusColors] || "bg-gray-100 text-gray-800"} border-0 font-medium`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )

  const handleSort = (key: string, order: "asc" | "desc") => {
    setSortBy(key)
    setSortOrder(order)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
  }

  const columns: TableColumn<Appointment>[] = [
    {
      key: "serialNumber",
      title: "S.No",
      dataIndex: "_id",
      width: "60px",
      sortable: false,
      render: (_, __, index) => {
        const sequentialNumber = (currentPage - 1) * itemsPerPage + index + 1;
        return <span className="font-medium">{sequentialNumber}</span>;
      },
    },
    {
      key: "bookingNumber",
      title: "Booking Number",
      dataIndex: "_id",
      width: "80px",
      sortable: true,
      render: (_, record) => <span className="font-medium">{record.bookingNumber}</span>,
    },
    {
      key: "petService",
      title: "Pet & Service",
      dataIndex: "petName",
      width: "150px",
      sortable: true,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.petId.name}</div>
          <div className="text-sm text-muted-foreground truncate max-w-[120px]">{record.serviceId.name}</div>
        </div>
      ),
    },
    {
      key: "dateTime",
      title: "Date & Time",
      dataIndex: "slotDetails.date",
      width: "120px",
      sortable: true,
      render: (_, record) => (
        <div>
          <div className="text-sm">{formatDate(record.slotDetails.date)}</div>
          <div className="text-xs text-muted-foreground">{record.slotDetails.startTime} - {record.slotDetails.endTime}</div>
        </div>
      ),
    },
    {
      key: "shopStaff",
      title: "Shop & Staff",
      dataIndex: "shopName",
      width: "150px",
      sortable: true,
      render: (_, record) => (
        <div>
          <div className="font-medium text-sm truncate max-w-[120px]">{record.shopId.name}</div>
          <div className="text-xs text-muted-foreground truncate max-w-[120px]">{record.staffId.name}</div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "appointmentStatus",
      width: "100px",
      sortable: true,
      render: (v) => <StatusBadge status={v} />
    },
    {
      key: "payment",
      title: "Payment",
      dataIndex: "paymentDetails.method",
      width: "120px",
      render: (_, record) => (
        <div>
          <div className="font-medium text-sm">{record.paymentDetails.method}</div>
          <PaymentStatusBadge status={record.paymentDetails.status} />
        </div>
      ),
    },
    {
      key: "amount",
      title: "Amount",
      dataIndex: "paymentDetails.amount",
      width: "80px",
      sortable: true,
      align: "right" as const,
      render: (_, record) => {
        return <div>
          <div className="font-medium text-sm">₹{record.paymentDetails.amount}</div>
        </div>
      },
    },
    {
      key: "actions",
      title: "Actions",
      dataIndex: "actions",
      width: "120px",
      render: (_, record) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-transparent"
            onClick={() => handleViewDetails(record)}
          >
            <Eye className="h-3 w-3" />
          </Button>
          {/* {record.appointmentStatus !== "cancelled" && record.appointmentStatus !== "completed" && (
            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-destructive hover:text-destructive bg-transparent">
              <X className="h-3 w-3" />
            </Button>
          )} */}
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName="NUFAIL" />
      <Sidebar />
      <main className="transition-all duration-300 pt-16 pb-6 lg:ml-64">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Appointment Management</h1>
                <p className="text-muted-foreground mt-1">Manage and track all pet care appointments</p>
              </div>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search appointments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Payment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Payments</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full sm:w-[150px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={sortedAndFilteredAppointments}
                rowKey="_id"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                emptyText={loading ? "Loading..." : "No appointments found"}
                className="w-full min-w-[860px]"
              />
            </div>

            <Pagination
              current={currentPage}
              total={totalItems}
              pageSize={itemsPerPage}
              onChange={handlePageChange}
              showTotal={(total, range) => (
                <span className="text-sm text-muted-foreground">
                  Showing {range[0]} to {range[1]} of {total} appointments
                </span>
              )}
              showSizeChanger={false}
              showQuickJumper={true}
            />


            <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
              <DialogContent className="sm:max-w-[500px] rounded-2xl shadow-lg bg-gradient-to-br from-white to-gray-50">
                <DialogHeader className="border-b pb-3">
                  <DialogTitle className="text-lg font-bold flex items-center gap-2 text-gray-900">
                    <Calendar className="h-5 w-5 text-gray-700" />
                    Appointment Details
                  </DialogTitle>
                  <DialogClose />
                </DialogHeader>

                {selectedAppointment && (
                  <div className="grid gap-4 py-4 text-sm text-gray-800">
                    <div className="grid grid-cols-4 items-center gap-4 bg-gray-50 rounded-lg p-3">
                      <Hash className="h-4 w-4 text-gray-600 col-span-1" />
                      <span className="col-span-3 font-medium">
                        {selectedAppointment._id.slice(0, 6).toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4 bg-gray-50 rounded-lg p-3">
                      <Calendar className="h-4 w-4 text-gray-600 col-span-1" />
                      <span className="col-span-3">
                        {formatDate(selectedAppointment.createdAt as string)}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4 bg-gray-50 rounded-lg p-3">
                      <User className="h-4 w-4 text-gray-600 col-span-1" />
                      <span className="col-span-3">{selectedAppointment.userId.fullName}</span>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4 bg-gray-50 rounded-lg p-3">
                      <Dog className="h-4 w-4 text-gray-600 col-span-1" />
                      <span className="col-span-3">
                        {selectedAppointment.petId.name} ({selectedAppointment.petId.breed})
                      </span>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4 bg-gray-50 rounded-lg p-3">
                      <Scissors className="h-4 w-4 text-gray-600 col-span-1" />
                      <span className="col-span-3">{selectedAppointment.serviceId.name}</span>
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4 bg-gray-100 rounded-lg p-3 border border-gray-200">
                      <CreditCard className="h-4 w-4 text-gray-700 col-span-1 mt-1" />
                      <div className="col-span-3 space-y-1">
                        <div>Amount: ₹{selectedAppointment.paymentDetails.amount} {selectedAppointment.paymentDetails.currency}</div>
                        <div>Method: {selectedAppointment.paymentDetails.method}</div>
                        <div>Status: <PaymentStatusBadge status={selectedAppointment.paymentDetails.status} /></div>
                        {selectedAppointment.paymentDetails.paidAt && (
                          <div>Paid At: {formatDate(selectedAppointment.paymentDetails.paidAt as string)}</div>
                        )}
                        <div>Payment ID: {selectedAppointment.paymentDetails.paymentIntentId}</div>
                      </div>
                    </div>

                    {selectedAppointment.appointmentStatus === "cancelled" && selectedAppointment.notes && (
                      <div className="grid grid-cols-4 items-start gap-4 bg-red-50 rounded-lg p-3 border border-red-100">
                        <StickyNote className="h-4 w-4 text-red-600 col-span-1 mt-1" />
                        <span className="col-span-3 whitespace-pre-wrap text-red-700">{selectedAppointment.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}