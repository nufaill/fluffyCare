import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PetCareLayout } from "@/components/layout/PetCareLayout";
import { StaffService } from "@/services/shop/staff.service";
import type { Staff } from "@/types/staff.type";
import {Navbar} from '@/components/shop/Navbar';

export default function StaffManagement() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
    const [staffToToggle, setStaffToToggle] = useState<{ id: string; isActive: boolean } | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const [formErrors, setFormErrors] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const { toast } = useToast();

    // Email validation regex (strict email format)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Phone validation regex (exactly 10 digits)
    const phoneRegex = /^\d{10}$/;
    // Name validation regex (3-100 characters, letters, spaces, and basic punctuation)
    const nameRegex = /^[a-zA-Z\s'-.]{3,100}$/;

    // Validate form data with strict rules
    const validateForm = () => {
        let isValid = true;
        const errors = {
            name: "",
            email: "",
            phone: "",
        };

        // Name validation
        if (!formData.name.trim()) {
            errors.name = "Name is required";
            isValid = false;
        } else if (!nameRegex.test(formData.name.trim())) {
            errors.name = "Name must be 3-100 characters long and contain only letters, spaces, or basic punctuation";
            isValid = false;
        }

        // Email validation
        if (!formData.email) {
            errors.email = "Email is required";
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            errors.email = "Please enter a valid email address";
            isValid = false;
        }

        // Phone validation
        if (!formData.phone) {
            errors.phone = "Phone number is required";
            isValid = false;
        } else if (!phoneRegex.test(formData.phone)) {
            errors.phone = "Phone number must be exactly 10 digits";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    // Real-time validation for input fields
    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Real-time validation
        const errors = { ...formErrors };

        if (field === "name") {
            if (!value.trim()) {
                errors.name = "Name is required";
            } else if (!nameRegex.test(value.trim())) {
                errors.name = "Name must be 3-100 characters long and contain only letters, spaces, or basic punctuation";
            } else {
                errors.name = "";
            }
        }

        if (field === "email") {
            if (!value) {
                errors.email = "Email is required";
            } else if (!emailRegex.test(value)) {
                errors.email = "Please enter a valid email address";
            } else {
                errors.email = "";
            }
        }

        if (field === "phone") {
            // Only allow digits
            const digitsOnly = value.replace(/\D/g, "");
            setFormData((prev) => ({ ...prev, phone: digitsOnly }));
            if (!digitsOnly) {
                errors.phone = "Phone number is required";
            } else if (!phoneRegex.test(digitsOnly)) {
                errors.phone = "Phone number must be exactly 10 digits";
            } else {
                errors.phone = "";
            }
        }

        setFormErrors(errors);
    };

    // Load staff data on component mount
    useEffect(() => {
        const fetchStaff = async () => {
            try {
                setInitialLoading(true);
                const staffResponse = await StaffService.getStaff();
                setStaff(staffResponse || []);
            } catch (error) {
                console.error("Error loading staff data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load staff data",
                    variant: "destructive",
                });
            } finally {
                setInitialLoading(false);
            }
        };

        fetchStaff();
    }, []);

    const filteredStaff = staff.filter(
        (member) =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.phone.includes(searchTerm),
    );

    const resetForm = () => {
        setFormData({ name: "", email: "", phone: "" });
        setFormErrors({ name: "", email: "", phone: "" });
    };

    const handleAddStaff = async () => {
        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please correct all form errors before submitting",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const staffPayload = {
                name: formData.name.trim(),
                email: formData.email,
                phone: formData.phone,
                shopId: "", // This will be set by the backend from the authenticated shop
            };
            const response = await StaffService.createStaff(staffPayload);
            setStaff((prev) => [...prev, response.data]);
            setIsAddDialogOpen(false);
            resetForm();
            toast({
                title: "Success",
                description: "Staff member added successfully",
            });
        } catch (error) {
            console.error("Error adding staff:", error);
            toast({
                title: "Error",
                description: "Failed to add staff member",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditStaff = async () => {
        if (!editingStaff || !validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please correct all form errors before submitting",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const response = await StaffService.updateStaff(editingStaff._id, formData);
            setStaff((prev) =>
                prev.map((member) =>
                    member._id === editingStaff._id ? response.data : member,
                ),
            );
            setIsEditDialogOpen(false);
            setEditingStaff(null);
            resetForm();
            toast({
                title: "Success",
                description: "Staff member updated successfully",
            });
        } catch (error) {
            console.error("Error updating staff:", error);
            toast({
                title: "Error",
                description: "Failed to update staff member",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!staffToToggle) return;

        setLoading(true);
        try {
            const response = await StaffService.toggleStaffStatus(staffToToggle.id);
            setStaff((prev) =>
                prev.map((member) => (member._id === staffToToggle.id ? response.data : member)),
            );
            setIsToggleDialogOpen(false);
            setStaffToToggle(null);
            toast({
                title: "Success",
                description: "Staff status updated successfully",
            });
        } catch (error) {
            console.error("Error toggling status:", error);
            toast({
                title: "Error",
                description: "Failed to update staff status",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStaff = async () => {
        if (!staffToDelete) return;

        setLoading(true);
        try {
            await StaffService.deleteStaff(staffToDelete);
            setStaff((prev) => prev.filter((member) => member._id !== staffToDelete));
            setIsDeleteDialogOpen(false);
            setStaffToDelete(null);
            toast({
                title: "Success",
                description: "Staff member deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting staff:", error);
            toast({
                title: "Error",
                description: "Failed to delete staff member",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const openEditDialog = (staffMember: Staff) => {
        setEditingStaff(staffMember);
        setFormData({
            name: staffMember.name,
            email: staffMember.email,
            phone: staffMember.phone,
        });
        setFormErrors({ name: "", email: "", phone: "" });
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (staffId: string) => {
        setStaffToDelete(staffId);
        setIsDeleteDialogOpen(true);
    };

    const openToggleDialog = (staffId: string, isActive: boolean) => {
        setStaffToToggle({ id: staffId, isActive });
        setIsToggleDialogOpen(true);
    };

    if (initialLoading) {
        return (
            <PetCareLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading staff data...</p>
                    </div>
                </div>
            </PetCareLayout>
        );
    }

    return (
        <PetCareLayout>
            <Navbar/>
            <div className="space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="h-8 w-8" />
                        <h1 className="text-3xl font-bold">Staff Management</h1>
                    </div>
                    <p className="text-gray-600">Manage your shop staff members</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="border-2 border-black">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Staff</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{staff.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-2 border-black">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Active Staff</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{staff.filter((s) => s.isActive).length}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-2 border-black">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Inactive Staff</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{staff.filter((s) => !s.isActive).length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search staff by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-2 border-black focus:border-gray-400"
                        />
                    </div>

                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-black text-white hover:bg-gray-800 border-2 border-black">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Staff
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="border-2 border-black">
                            <DialogHeader>
                                <DialogTitle>Add New Staff Member</DialogTitle>
                                <DialogDescription>Enter the details for the new staff member.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        className={`border-2 border-black focus:border-gray-400 ${formErrors.name ? 'border-red-600' : ''}`}
                                        placeholder="Enter full name (3-100 characters)"
                                    />
                                    {formErrors.name && <p className="text-red-600 text-sm">{formErrors.name}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        className={`border-2 border-black focus:border-gray-400 ${formErrors.email ? 'border-red-600' : ''}`}
                                        placeholder="Enter valid email address"
                                    />
                                    {formErrors.email && <p className="text-red-600 text-sm">{formErrors.email}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        className={`border-2 border-black focus:border-gray-400 ${formErrors.phone ? 'border-red-600' : ''}`}
                                        placeholder="Enter 10-digit phone number"
                                        maxLength={10}
                                    />
                                    {formErrors.phone && <p className="text-red-600 text-sm">{formErrors.phone}</p>}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddDialogOpen(false);
                                        resetForm();
                                    }}
                                    className="border-2 border-black hover:bg-gray-100"
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleAddStaff} disabled={loading || Object.values(formErrors).some(err => err)} className="bg-black text-white hover:bg-gray-800">
                                    {loading ? "Adding..." : "Add Staff"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Staff Table */}
                <Card className="border-2 border-black">
                    <CardHeader>
                        <CardTitle>Staff Members</CardTitle>
                        <CardDescription>
                            {filteredStaff.length} staff member{filteredStaff.length !== 1 ? "s" : ""} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-black">
                                        <TableHead className="font-bold text-black">Name</TableHead>
                                        <TableHead className="font-bold text-black">Email</TableHead>
                                        <TableHead className="font-bold text-black">Phone</TableHead>
                                        <TableHead className="font-bold text-black">Status</TableHead>
                                        <TableHead className="font-bold text-black">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStaff.map((staffMember) => (
                                        <TableRow key={staffMember._id} className="border-black">
                                            <TableCell className="font-medium">{staffMember.name}</TableCell>
                                            <TableCell>{staffMember.email}</TableCell>
                                            <TableCell>{staffMember.phone}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={staffMember.isActive ? "default" : "secondary"}
                                                    className={
                                                        staffMember.isActive
                                                            ? "bg-black text-white"
                                                            : "bg-gray-200 text-black border border-black"
                                                    }
                                                >
                                                    {staffMember.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(staffMember)}
                                                        className="border-black hover:bg-gray-100"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openToggleDialog(staffMember._id, staffMember.isActive)}
                                                        className="border-black hover:bg-gray-100"
                                                    >
                                                        {staffMember.isActive ? (
                                                            <ToggleRight className="h-4 w-4" />
                                                        ) : (
                                                            <ToggleLeft className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openDeleteDialog(staffMember._id)}
                                                        className="border-red-600 text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {filteredStaff.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No staff members found matching your search.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="border-2 border-black">
                        <DialogHeader>
                            <DialogTitle>Edit Staff Member</DialogTitle>
                            <DialogDescription>Update the details for {editingStaff?.name}.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    className={`border-2 border-black focus:border-gray-400 ${formErrors.name ? 'border-red-600' : ''}`}
                                    placeholder="Enter full name (3-100 characters)"
                                />
                                {formErrors.name && <p className="text-red-600 text-sm">{formErrors.name}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    className={`border-2 border-black focus:border-gray-400 ${formErrors.email ? 'border-red-600' : ''}`}
                                    placeholder="Enter valid email address"
                                />
                                {formErrors.email && <p className="text-red-600 text-sm">{formErrors.email}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-phone">Phone</Label>
                                <Input
                                    id="edit-phone"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                    className={`border-2 border-black focus:border-gray-400 ${formErrors.phone ? 'border-red-600' : ''}`}
                                    placeholder="Enter 10-digit phone number"
                                    maxLength={10}
                                />
                                {formErrors.phone && <p className="text-red-600 text-sm">{formErrors.phone}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditDialogOpen(false);
                                    setEditingStaff(null);
                                    resetForm();
                                }}
                                className="border-2 border-black hover:bg-gray-100"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleEditStaff}
                                disabled={loading || Object.values(formErrors).some(err => err)}
                                className="bg-black text-white hover:bg-gray-800"
                            >
                                {loading ? "Updating..." : "Update Staff"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="border-2 border-black">
                        <DialogHeader>
                            <DialogTitle>Confirm Delete</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this staff member? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsDeleteDialogOpen(false);
                                    setStaffToDelete(null);
                                }}
                                className="border-2 border-black hover:bg-gray-100"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteStaff}
                                disabled={loading}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                {loading ? "Deleting..." : "Delete"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Toggle Status Confirmation Dialog */}
                <Dialog open={isToggleDialogOpen} onOpenChange={setIsToggleDialogOpen}>
                    <DialogContent className="border-2 border-black">
                        <DialogHeader>
                            <DialogTitle>Confirm Status Change</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to {staffToToggle?.isActive ? "deactivate" : "activate"} this staff member?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsToggleDialogOpen(false);
                                    setStaffToToggle(null);
                                }}
                                className="border-2 border-black hover:bg-gray-100"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleToggleStatus}
                                disabled={loading}
                                className="bg-black text-white hover:bg-gray-800"
                            >
                                {loading ? "Updating..." : "Confirm"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </PetCareLayout>
    );
}