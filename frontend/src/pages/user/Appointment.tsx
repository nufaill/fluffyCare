import { useState, useEffect, useMemo } from "react";
import { Calendar, Clock, MapPin, Search, Filter, Plus, Eye, X, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ToasterSetup from "@/components/ui/ToasterSetup";
import Header from "@/components/user/Header";
import Footer from "@/components/user/Footer";
import { ModernSidebar } from "@/components/user/App-sidebar";
import { Link } from "react-router-dom";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import Useraxios from "@/api/user.axios";
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary";
import { Pagination } from "@/components/ui/Pagination";

interface Appointment {
  _id: string;
  petId: {
    profileImage: any;
    _id: string;
    name: string;
    breed: string;
    image?: string;
    age?: number;
  };
  serviceId: {
    _id: string;
    name: string;
    price: number;
    duration: number;
  };
  shopId: {
    _id: string;
    name: string;
    address: string;
    phone?: string;
  };
  staffId: {
    _id: string;
    name: string;
  };
  slotDetails?: {
    date?: string;
    startTime: string;
    endTime: string;
  };
  appointmentStatus: string;
  paymentStatus: string;
  paymentMethod?: string;
  requestStatus?: string;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  userId?: {
    _id: string;
    email: string;
    phone: string;
  };
}

interface Stats {
  completed: number;
  upcoming: number;
  pending: number;
  totalSpent: number;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
    case "paid":
    case "completed":
      return "bg-black text-white border-black";
    case "pending":
      return "bg-white text-black border-black";
    case "cancelled":
    case "refunded":
      return "bg-gray-200 text-black border-black";
    default:
      return "bg-gray-100 text-black border-black";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
    case "completed":
      return <CheckCircle className="w-4 h-4" />;
    case "pending":
      return <Clock className="w-4 h-4" />;
    case "cancelled":
      return <X className="w-4 h-4" />;
    default:
      return <Calendar className="w-4 h-4" />;
  }
};

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats>({ completed: 0, upcoming: 0, pending: 0, totalSpent: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.user.userDatas);
  const userId = user?._id || user?.id || "";

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userId) {
        setError("User not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const appointmentsResponse = await Useraxios.get(`/appointments/user/${userId}`, {
          params: {
            page: currentPage,
            limit: pageSize,
            status: statusFilter === "all" ? undefined : statusFilter,
          },
        });

        const { data, meta } = appointmentsResponse.data;
        setAppointments(Array.isArray(data) ? data : []);
        setTotalAppointments(meta?.total || 0);
        const calculatedStats = calculateStats(data);
        setStats(calculatedStats);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Failed to fetch appointments:", err);
        setError("Failed to fetch appointments");
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [userId, currentPage, pageSize, statusFilter]);

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const calculateStats = (appointmentsData: Appointment[]): Stats => {
    if (!Array.isArray(appointmentsData)) return { completed: 0, upcoming: 0, pending: 0, totalSpent: 0 };

    const now = new Date();
    const stats = {
      completed: 0,
      upcoming: 0,
      pending: 0,
      totalSpent: 0,
    };

    appointmentsData.forEach((appointment) => {
      const appointmentDate = new Date(appointment.createdAt);

      switch (appointment.appointmentStatus.toLowerCase()) {
        case "completed":
          stats.completed++;
          stats.totalSpent += appointment.serviceId.price;
          break;
        case "pending":
          stats.pending++;
          break;
        case "confirmed":
        case "booked":
          if (appointmentDate >= now) {
            stats.upcoming++;
          }
          break;
      }
    });

    return stats;
  };

  const filteredAndSortedAppointments = useMemo(() => {
    if (!Array.isArray(appointments)) return [];

    const filtered = appointments.filter((appointment) => {
      const matchesSearch =
        appointment.petId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.serviceId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.shopId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.staffId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "price-asc":
          return a.serviceId.price - b.serviceId.price;
        case "price-desc":
          return b.serviceId.price - a.serviceId.price;
        case "created-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [appointments, searchTerm, sortBy]);

  const upcomingAppointments = filteredAndSortedAppointments.filter(
    (apt) =>
      (new Date(apt.createdAt) >= new Date() && apt.appointmentStatus !== "Cancelled") ||
      apt.appointmentStatus === "pending" ||
      apt.appointmentStatus === "confirmed"
  );

  const pastAppointments = filteredAndSortedAppointments.filter(
    (apt) => apt.appointmentStatus === "Completed" || apt.appointmentStatus === "Cancelled"
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const response = await Useraxios.patch(`/appointments/${appointmentId}/cancel`, {
        reason: cancelReason,
      });

      if (response.status === 200) {
        ToasterSetup({
          title: "Success",
          description: "Appointment cancelled successfully",
          variant: "success",
        });
        const appointmentsResponse = await Useraxios.get(`/appointments/user/${userId}`, {
          params: {
            page: currentPage,
            limit: pageSize,
            status: statusFilter === "all" ? undefined : statusFilter,
          },
        });
        const { data, meta } = appointmentsResponse.data;
        setAppointments(Array.isArray(data) ? data : []);
        setTotalAppointments(meta?.total || 0);
        setStats(calculateStats(data));
        setShowCancelDialog(null);
        setCancelReason("");
      }
    } catch (err: any) {
      console.error("Failed to cancel appointment:", err);
      const errorMessage = err.response?.data?.message || "Failed to cancel appointment";

      ToasterSetup({
        title: "Error",
        description:
          errorMessage === "This slot has just been booked by another user"
            ? "This appointment slot is no longer available. Please refresh and try again."
            : errorMessage,
        variant: "destructive",
      });

      if (errorMessage === "This slot has just been booked by another user") {
        const fetchAppointments = async () => {
          try {
            const appointmentsResponse = await Useraxios.get(`/appointments/user/${userId}`, {
              params: {
                page: currentPage,
                limit: pageSize,
                status: statusFilter === "all" ? undefined : statusFilter,
              },
            });
            const { data, meta } = appointmentsResponse.data;
            setAppointments(Array.isArray(data) ? data : []);
            setTotalAppointments(meta?.total || 0);
            setStats(calculateStats(data));
          } catch (fetchErr) {
            console.error("Failed to refresh appointments:", fetchErr);
            setError("Failed to refresh appointments");
          }
        };
        fetchAppointments();
      }
    }
  };

  const handlePageChange = (page: number, newPageSize?: number) => {
    setCurrentPage(page);
    if (newPageSize) {
      setPageSize(newPageSize);
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const { petId, staffId, serviceId, shopId, slotDetails, appointmentStatus, paymentStatus, _id, notes, createdAt } = appointment;

    return (
      <Card className="border-2 border-black bg-white shadow-lg hover:shadow-xl transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-black">
              <img
                src={
                  petId?.profileImage && typeof petId.profileImage === "string"
                    ? cloudinaryUtils.getFullUrl(petId.profileImage)
                    : "/placeholder.svg?height=80&width=80&query=pet"
                }
                alt={petId?.name || "Pet"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-black">{petId?.name || "Unknown Pet"}</h3>
                  <p className="text-sm font-medium text-gray-700">{petId?.breed || "Unknown Breed"}</p>
                </div>
                <Badge className={`flex items-center gap-1 ${getStatusColor(appointmentStatus)} font-semibold`}>
                  {getStatusIcon(appointmentStatus)} {appointmentStatus}
                </Badge>
              </div>
              <div className="text-sm font-medium text-gray-700 space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {slotDetails?.date ? formatDate(slotDetails.date) : "No date"} at{" "}
                  {slotDetails?.startTime ? formatTime(slotDetails.startTime) : "No time"}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {shopId?.name} - {shopId?.address}
                </div>
                <div><strong>Service:</strong> {serviceId?.name}</div>
                <div><strong>Price:</strong> ${serviceId?.price?.toFixed(2)}</div>
                <div><strong>Staff:</strong> {staffId?.name || "Unknown Staff"}</div>
                {notes && <div><strong>Notes:</strong> {notes}</div>}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="border-2 border-black bg-white text-black hover:bg-black hover:text-white font-semibold"
                  onClick={() => handleViewDetails(appointment)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                {appointmentStatus !== "Cancelled" && appointmentStatus !== "Completed" && (
                  <Button
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                    onClick={() => setShowCancelDialog(_id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <ModernSidebar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-3xl font-bold text-black">Your Appointments</h1>
              <Link to="/book-now">
                <Button className="bg-black hover:bg-gray-800 text-white font-semibold">
                  <Plus className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </Link>
            </div>

            <Card className="border-2 border-black bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      placeholder="Search by pet, service, shop, or staff"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-2 border-black bg-white text-black font-semibold"
                    />
                  </div>
                  <div className="flex gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-44 border-2 border-black bg-white text-black font-semibold">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black bg-white">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="booked">Booked</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-44 border-2 border-black bg-white text-black font-semibold">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black bg-white">
                        <SelectItem value="date-desc">Newest First</SelectItem>
                        <SelectItem value="date-asc">Oldest First</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="created-desc">Recently Created</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="upcoming" className="space-y-8">
              <TabsList className="grid w-full grid-cols-2 lg:w-96 bg-white border-2 border-black">
                <TabsTrigger
                  value="upcoming"
                  className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white font-semibold"
                >
                  <Calendar className="w-4 h-4" />
                  Upcoming ({upcomingAppointments.length})
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white font-semibold"
                >
                  <CheckCircle className="w-4 h-4" />
                  Past ({pastAppointments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-6">
                {upcomingAppointments.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {upcomingAppointments.map((appointment) => (
                      <AppointmentCard key={appointment._id} appointment={appointment} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-2 border-black bg-white shadow-lg">
                    <CardContent className="p-16 text-center">
                      <Calendar className="w-16 h-16 text-black mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-black mb-4">No upcoming appointments</h3>
                      <p className="text-gray-700 mb-6 text-lg">You don't have any upcoming appointments scheduled.</p>
                      <Link to="/book-now">
                        <Button className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-4 text-lg">
                          <Plus className="w-5 h-5 mr-2" />
                          Book Your First Appointment
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-6">
                {pastAppointments.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {pastAppointments.map((appointment) => (
                      <AppointmentCard key={appointment._id} appointment={appointment} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-2 border-black bg-white shadow-lg">
                    <CardContent className="p-16 text-center">
                      <CheckCircle className="w-16 h-16 text-black mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-black mb-4">No past appointments</h3>
                      <p className="text-gray-700 text-lg">Your appointment history will appear here.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            <Pagination
              current={currentPage}
              total={totalAppointments}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={true}
              showQuickJumper={true}
              showTotal={(total, range) => `Showing ${range[0]}-${range[1]} of ${total} appointments`}
              pageSizeOptions={[10, 20, 50]}
              className="mt-6"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-2 border-black bg-white shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-black">{stats.completed}</div>
                  <div className="text-sm font-semibold text-gray-700 mt-1">Completed</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-black bg-white shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-black">{stats.upcoming}</div>
                  <div className="text-sm font-semibold text-gray-700 mt-1">Upcoming</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-black bg-white shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-black">{stats.pending}</div>
                  <div className="text-sm font-semibold text-gray-700 mt-1">Pending</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-black bg-white shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-black">${stats.totalSpent.toFixed(0)}</div>
                  <div className="text-sm font-semibold text-gray-700 mt-1">Total Spent</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="sm:max-w-[500px] border-2 border-black bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-black">Appointment Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={
                    selectedAppointment.petId?.profileImage &&
                      typeof selectedAppointment.petId.profileImage === "string"
                      ? cloudinaryUtils.getFullUrl(selectedAppointment.petId.profileImage)
                      : "/placeholder.svg?height=64&width=64&query=pet"
                  }
                  alt={selectedAppointment.petId?.name || "Pet"}
                  className="w-16 h-16 rounded-full object-cover border-2 border-black"
                />
                <div>
                  <h4 className="font-bold text-lg text-black">{selectedAppointment.petId?.name || "Unknown Pet"}</h4>
                  <p className="text-sm font-medium text-gray-700">
                    {selectedAppointment.petId?.breed || "Unknown Breed"}{" "}
                    {selectedAppointment.petId?.age ? `, ${selectedAppointment.petId.age} years` : ""}
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-sm font-medium text-gray-800">
                <p><strong className="text-black">Service:</strong> {selectedAppointment.serviceId?.name}</p>
                <p><strong className="text-black">Price:</strong> ${selectedAppointment.serviceId?.price?.toFixed(2)}</p>
                <p><strong className="text-black">Duration:</strong> {selectedAppointment.serviceId?.duration ?? "N/A"} hours</p>
                <p><strong className="text-black">Shop:</strong> {selectedAppointment.shopId?.name} - {selectedAppointment.shopId?.address}</p>
                <p><strong className="text-black">Staff:</strong> {selectedAppointment.staffId?.name || "Unknown Staff"}</p>
                <p><strong className="text-black">Date & Time:</strong>{" "}
                  {selectedAppointment.slotDetails?.date
                    ? formatDate(selectedAppointment.slotDetails.date)
                    : "No date"}{" "}
                  at{" "}
                  {selectedAppointment.slotDetails?.startTime
                    ? formatTime(selectedAppointment.slotDetails.startTime)
                    : "No time"}{" "}
                  -{" "}
                  {selectedAppointment.slotDetails?.endTime
                    ? formatTime(selectedAppointment.slotDetails.endTime)
                    : "No time"}
                </p>
                <p><strong className="text-black">Appointment Status:</strong> {selectedAppointment.appointmentStatus}</p>
                <p><strong className="text-black">Payment Status:</strong> {selectedAppointment.paymentStatus}</p>
                <p><strong className="text-black">Payment Method:</strong> {selectedAppointment.paymentMethod || "N/A"}</p>
                {selectedAppointment.notes && (
                  <p><strong className="text-black">Notes:</strong> {selectedAppointment.notes}</p>
                )}
                <p><strong className="text-black">Booked On:</strong> {formatDate(selectedAppointment.createdAt)}</p>
              </div>
            </div>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="mt-6 border-2 border-black bg-white text-black hover:bg-black hover:text-white font-semibold"
              >
                Close
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )}
      {showCancelDialog && (
        <Dialog open={!!showCancelDialog} onOpenChange={() => {
          setShowCancelDialog(null);
          setCancelReason("");
        }}>
          <DialogContent className="sm:max-w-[500px] border-2 border-black bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-black">Cancel Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-gray-700">Please provide a reason for cancelling this appointment:</p>
              <Textarea
                placeholder="Enter cancellation reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="border-2 border-black bg-white text-black"
              />
              <div className="flex gap-4">
                <Button
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                  onClick={() => handleCancelAppointment(showCancelDialog)}
                  disabled={!cancelReason.trim()}
                >
                  <X className="w-4 h-4 mr-2" />
                  Confirm Cancellation
                </Button>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="border-2 border-black bg-white text-black hover:bg-black hover:text-white font-semibold"
                  >
                    Close
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <Footer />
    </div>
  );
}