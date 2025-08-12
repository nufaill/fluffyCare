import type React from "react";
import { useState, useEffect } from "react";
import { PawPrint, Search, Edit2, Save, X, Plus, Clock, DollarSign, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/Badge";
import { Navbar } from '@/components/shop/Navbar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { PetCareLayout } from "@/components/layout/PetCareLayout";
import { serviceService } from "@/services/shop/service.service";
import type { PetType, ServiceType, CreateServiceData, UpdateServiceData } from "@/types/service.type";

interface Service {
  _id: string;
  name: string;
  description: string;
  serviceTypeId: { _id: string; name: string } | string;
  petTypeIds: Array<{ _id: string; name: string } | string>;
  price: number;
  durationHour: number;
  image?: string;
  isActive: boolean;
  createdAt: string;
}

interface ServiceFormData {
  name: string;
  description: string;
  serviceTypeId: string;
  petTypeIds: string[];
  price: string;
  durationHour: string;
  image?: string;
}

interface ValidationErrors {
  name?: string;
  description?: string;
  serviceTypeId?: string;
  petTypeIds?: string;
  price?: string;
  durationHour?: string;
  image?: string;
}

// Updated duration options with numeric values
const durationOptions = [
  { value: "0.5", label: "30 minutes" },
  { value: "1", label: "1 hour" },
  { value: "2", label: "2 hours" },
];

const handleImageUpload = async (file: File): Promise<string | undefined> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url || undefined;
  } catch (error) {
    console.error("Error uploading image:", error);
    return undefined;
  }
};

const validateForm = (data: ServiceFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.name.trim()) {
    errors.name = "Service name is required";
  } else if (data.name.length < 2 || data.name.length > 100) {
    errors.name = "Service name must be between 2 and 100 characters";
  }

  if (!data.description.trim()) {
    errors.description = "Description is required";
  } else if (data.description.length < 10 || data.description.length > 500) {
    errors.description = "Description must be between 10 and 500 characters";
  }

  if (!data.serviceTypeId) {
    errors.serviceTypeId = "Service type is required";
  } else if (!/^[a-f\d]{24}$/i.test(data.serviceTypeId)) {
    errors.serviceTypeId = "Invalid service type ID";
  }

  if (!Array.isArray(data.petTypeIds) || data.petTypeIds.length === 0) {
    errors.petTypeIds = "At least one pet type must be selected";
  } else {
    const invalidIds = data.petTypeIds.filter(id => !/^[a-f\d]{24}$/i.test(id));
    if (invalidIds.length > 0) {
      errors.petTypeIds = "One or more pet type IDs are invalid";
    }
  }

  const price = parseFloat(data.price);
  if (isNaN(price)) {
    errors.price = "Price must be a number";
  } else if (price < 0) {
    errors.price = "Price must be greater than or equal to 0";
  }

  if (!data.durationHour) {
    errors.durationHour = "Duration is required";
  } else if (!durationOptions.some(opt => opt.value === data.durationHour)) {
    errors.durationHour = "Please select a valid duration (30 minutes, 1 hour, or 2 hours)";
  }

  return errors;
};

const formatDuration = (hours: number): string => {
  const totalSeconds = Math.round(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// New function for user-friendly duration display
const formatDurationDisplay = (hours: number): string => {
  if (hours === 0.5) return "30 minutes";
  if (hours === 1) return "1 hour";
  if (hours === 2) return "2 hours";
  return formatDuration(hours); // Fallback to HH:MM:SS
};

function PetTypeMultiSelect({
  selectedIds,
  onSelectionChange,
  petTypes,
  error,
}: {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  petTypes: PetType[];
  error?: string;
}) {
  const togglePetType = (petTypeId: string) => {
    if (selectedIds.includes(petTypeId)) {
      onSelectionChange(selectedIds.filter((id) => id !== petTypeId));
    } else {
      onSelectionChange([...selectedIds, petTypeId]);
    }
  };

  const removeAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Pet Types *</Label>
        {selectedIds.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeAll}
            className="h-6 text-xs text-muted-foreground hover:text-destructive"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {petTypes.map((petType) => {
          const isSelected = selectedIds.includes(petType._id);
          return (
            <div
              key={petType._id}
              onClick={() => togglePetType(petType._id)}
              className={`
                relative cursor-pointer rounded-lg border-2 p-3 text-center transition-all duration-200
                ${isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted hover:border-primary/50 hover:bg-muted/50"
                }
                ${error ? "border-destructive/50" : ""}
              `}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm font-medium">{petType.name}</span>
                {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
              </div>
            </div>
          );
        })}
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedIds.map((id) => {
            const petType = petTypes.find((pt) => pt._id === id);
            return (
              <Badge key={id} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                {petType?.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePetType(id);
                  }}
                  className="ml-1 h-4 w-4 p-0 hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}

function StatusToggle({
  isActive,
  onToggle,
  disabled = false,
}: {
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center space-x-3">
      <Switch
        checked={isActive}
        onCheckedChange={onToggle}
        disabled={disabled}
        className="data-[state=checked]:bg-green-500"
      />
      <div className="flex items-center space-x-2">
        <Badge
          variant={isActive ? "default" : "secondary"}
          className={
            isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300"
          }
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      </div>
    </div>
  );
}

function ServiceForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}: {
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<ServiceFormData>;
  isEditing?: boolean;
}) {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    serviceTypeId: initialData?.serviceTypeId || "",
    petTypeIds: initialData?.petTypeIds || [],
    price: initialData?.price || "",
    durationHour: initialData?.durationHour ? initialData.durationHour.toString() : "",
    image: initialData?.image || undefined,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [petTypes, setPetTypes] = useState<PetType[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  useEffect(() => {
    const fetchPetTypes = async () => {
      try {
        const types = await serviceService.getAllPetTypes();
        setPetTypes(types);
      } catch (error) {
        console.error("Error fetching pet types:", error);
      }
    };
    fetchPetTypes();
  }, []);

  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const types = await serviceService.getAllServiceTypes();
        setServiceTypes(types);
      } catch (error) {
        console.error("Error fetching service types:", error);
      }
    };
    fetchServiceTypes();
  }, []);

  const handleInputChange = (field: keyof ServiceFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "Image size must be less than 5MB" }));
        return;
      }
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, image: "Please select a valid image file" }));
        return;
      }
      setSelectedFile(file);
      setErrors((prev) => ({ ...prev, image: undefined }));
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          setImagePreview(result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setSelectedFile(null);
      setFormData((prev) => ({ ...prev, image: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined = formData.image;
      if (selectedFile) {
        imageUrl = await handleImageUpload(selectedFile);

        if (!imageUrl) {
          setErrors((prev) => ({ ...prev, image: "Failed to upload image" }));
          setIsSubmitting(false);
          return;
        }
      }
      console.log("Frontend sending durationHour:", formData.durationHour, "Parsed:", Number.parseFloat(formData.durationHour));
      await onSubmit({ ...formData, image: imageUrl });
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors((prev) => ({ ...prev, form: "Failed to process form" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <PawPrint className="h-5 w-5" />
          {isEditing ? "Edit Service" : "Add New Service"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Service Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Premium Dog Grooming"
              className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${errors.name ? "border-destructive" : ""}`}
            />
            {errors.name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Service Type *</Label>
            <Select value={formData.serviceTypeId} onValueChange={(value) => handleInputChange("serviceTypeId", value)}>
              <SelectTrigger className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${errors.serviceTypeId ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
                {serviceTypes.map((type) => (
                  <SelectItem key={type._id} value={type._id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceTypeId && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.serviceTypeId}
              </p>
            )}
          </div>

          <PetTypeMultiSelect
            selectedIds={formData.petTypeIds}
            onSelectionChange={(ids) => handleInputChange("petTypeIds", ids)}
            petTypes={petTypes}
            error={errors.petTypeIds}
          />

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the service in detail..."
              rows={4}
              className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${errors.description ? "border-destructive" : ""}`}
            />
            {errors.description && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                <DollarSign className="h-4 w-4" />
                Price (₹) *
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${errors.price ? "border-destructive" : ""}`}
              />
              {errors.price && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.price}
              </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                <Clock className="h-4 w-4" />
                Duration *
              </Label>
              <Select value={formData.durationHour} onValueChange={(value) => handleInputChange("durationHour", value)}>
                <SelectTrigger className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${errors.durationHour ? "border-destructive" : ""}`}>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.durationHour && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.durationHour}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-gray-700 dark:text-gray-300">Service Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${errors.image ? "border-destructive" : ""}`}
            />
            {imagePreview && (
              <div className="flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-16 w-16 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setImagePreview(null);
                    setSelectedFile(null);
                    setFormData((prev) => ({ ...prev, image: undefined }));
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            {errors.image && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.image}
              </p>
            )}
          </div>

          <Separator />

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px] bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {isEditing ? "Updating..." : "Adding..."}
                </div>
              ) : (
                <>
                  {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  {isEditing ? "Update Service" : "Add Service"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPetTypeFilter, setSelectedPetTypeFilter] = useState("all");
  const [selectedServiceTypeFilter, setSelectedServiceTypeFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [petTypes, setPetTypes] = useState<PetType[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, petTypesData, serviceTypesData] = await Promise.all([
          serviceService.getServices(),
          serviceService.getAllPetTypes(),
          serviceService.getAllServiceTypes(),
        ]);
        setServices(servicesData);
        setPetTypes(petTypesData);
        setServiceTypes(serviceTypesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPetType = selectedPetTypeFilter === "all" || 
      (Array.isArray(service.petTypeIds) && service.petTypeIds.some(pt => 
        typeof pt === 'object' ? pt._id === selectedPetTypeFilter : pt === selectedPetTypeFilter));
    const matchesServiceType = selectedServiceTypeFilter === "all" || 
      (typeof service.serviceTypeId === 'object' 
        ? service.serviceTypeId._id === selectedServiceTypeFilter 
        : service.serviceTypeId === selectedServiceTypeFilter);
    return matchesSearch && matchesPetType && matchesServiceType;
  });

  const handleAddService = async (data: ServiceFormData) => {
    try {
      const durationValue = Number.parseFloat(data.durationHour);
      const priceValue = Number.parseFloat(data.price);

      if (isNaN(durationValue) || durationValue <= 0) {
        console.error("Invalid duration value:", data.durationHour);
        return;
      }

      if (isNaN(priceValue) || priceValue < 0) {
        console.error("Invalid price value:", data.price);
        return;
      }

      const serviceData: CreateServiceData = {
        name: data.name,
        description: data.description,
        serviceTypeId: data.serviceTypeId,
        petTypeIds: data.petTypeIds,
        price: priceValue,
        durationHour: durationValue,
        image: data.image,
      };

      console.log("Sending service data:", serviceData);

      const newService = await serviceService.createService(serviceData);
      setServices((prev) => [...prev, newService]);
      setShowAddForm(false);
      showSuccess("Service added successfully!");
    } catch (error) {
      console.error("Error adding service:", error);
    }
  };

  const handleEditService = async (data: ServiceFormData) => {
    if (!editingService) return;

    try {
      const durationValue = Number.parseFloat(data.durationHour);
      const priceValue = Number.parseFloat(data.price);

      if (isNaN(durationValue) || durationValue <= 0) {
        console.error("Invalid duration value:", data.durationHour);
        return;
      }

      if (isNaN(priceValue) || priceValue < 0) {
        console.error("Invalid price value:", data.price);
        return;
      }

      const updateData: UpdateServiceData = {
        name: data.name,
        description: data.description,
        serviceTypeId: data.serviceTypeId,
        petTypeIds: data.petTypeIds,
        price: priceValue,
        durationHour: durationValue,
        image: data.image,
      };

      console.log("Updating service data:", updateData);

      const updatedService = await serviceService.updateService(editingService._id, updateData);
      setServices((prev) => prev.map((s) => (s._id === editingService._id ? updatedService : s)));
      setEditingService(null);
      showSuccess("Service updated successfully!");
    } catch (error) {
      console.error("Error updating service:", error);
    }
  };

  const handleToggleStatus = async (serviceId: string) => {
    try {
      const updatedService = await serviceService.toggleServiceStatus(serviceId);
      setServices((prev) => prev.map((service) => (service._id === serviceId ? updatedService : service)));
      showSuccess("Service status updated!");
    } catch (error) {
      console.error("Error toggling service status:", error);
    }
  };

  const activeServices = services.filter((s) => s.isActive).length;
  const totalRevenue = services.reduce((sum, s) => sum + (s.isActive ? s.price : 0), 0);

  if (isLoading) {
    return (
      <PetCareLayout>
        <div className="container mx-auto p-6">
          <p className="text-gray-900 dark:text-gray-100">Loading...</p>
        </div>
      </PetCareLayout>
    );
  }

  return (
    <PetCareLayout>
      <Navbar />
      <div className="container mx-auto p-6 space-y-6 max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-gray-100">
              <div className="p-2 bg-black dark:bg-gray-200 rounded-lg">
                <PawPrint className="h-6 w-6 text-white dark:text-black" />
              </div>
              Services Management
            </h1>
            <p className="text-muted-foreground mt-1">Manage your pet care services with multiple pet type support</p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            size="lg"
            className="min-w-[160px] bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Service
          </Button>
        </div>

        {successMessage && (
          <Alert className="border-green-600 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Services</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{services.length}</p>
                </div>
                <PawPrint className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Services</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeServices}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {(showAddForm || editingService) && (
          <ServiceForm
            onSubmit={editingService ? handleEditService : handleAddService}
            onCancel={() => {
              setShowAddForm(false);
              setEditingService(null);
            }}
            initialData={
              editingService
                ? {
                    name: editingService.name,
                    description: editingService.description,
                    serviceTypeId: typeof editingService.serviceTypeId === 'object' ? editingService.serviceTypeId._id : editingService.serviceTypeId,
                    petTypeIds: editingService.petTypeIds.map(pt => typeof pt === 'object' ? pt._id : pt),
                    price: editingService.price.toString(),
                    durationHour: editingService.durationHour.toString(),
                    image: editingService.image,
                  }
                : undefined
            }
            isEditing={!!editingService}
          />
        )}

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Search Services</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Filter by Pet Type</Label>
                <Select value={selectedPetTypeFilter} onValueChange={setSelectedPetTypeFilter}>
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
                    <SelectItem value="all">All Pet Types</SelectItem>
                    {petTypes.map((type) => (
                      <SelectItem key={type._id} value={type._id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Filter by Service Type</Label>
                <Select value={selectedServiceTypeFilter} onValueChange={setSelectedServiceTypeFilter}>
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
                    <SelectItem value="all">All Service Types</SelectItem>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type._id} value={type._id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
              Services List
              <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {filteredServices.length} of {services.length} services
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <PawPrint className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">No services found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedPetTypeFilter !== "all" || selectedServiceTypeFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Get started by adding your first service"}
                </p>
                {!showAddForm && (
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
                {filteredServices.map((service) => (
                  <Card key={service._id} className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {service.image && (
                          <img
                            src={service.image || "/placeholder.svg?height=128&width=128"}
                            alt={service.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-lg leading-tight text-gray-900 dark:text-gray-100">{service.name}</h3>
                            <StatusToggle isActive={service.isActive} onToggle={() => handleToggleStatus(service._id)} />
                          </div>
                          <Badge className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            {typeof service.serviceTypeId === 'object' && service.serviceTypeId?.name
                              ? service.serviceTypeId.name
                              : 'Unknown'}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className="text-muted-foreground line-clamp-2">{service.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-semibold">₹{service.price.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{formatDurationDisplay(service.durationHour)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Pet Types:</p>
                          <div className="flex flex-wrap gap-1">
                            {service.petTypeIds.length > 0 ? (
                              service.petTypeIds.map((petType) => {
                                const petTypeName = typeof petType === 'object' && petType?.name ? petType.name : 'Unknown';
                                return (
                                  <Badge
                                    key={typeof petType === 'object' ? petType._id : petType}
                                    variant="secondary"
                                    className="bg-primary/10 text-primary hover:bg-primary/20"
                                  >
                                    {petTypeName}
                                  </Badge>
                                );
                              })
                            ) : (
                              <p className="text-sm text-muted-foreground">No pet types assigned</p>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-xs text-muted-foreground">
                            Created {new Date(service.createdAt).toLocaleDateString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingService(service)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PetCareLayout>
  );
}