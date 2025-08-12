import type React from "react";
import { useState, useEffect } from "react";
import { X, Clock, User, AlertTriangle, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/separator";

interface Staff {
  name: string;
  id: number;
}

interface ShopAvailability {
  workingDays: string[];
  openingTime: string;
  closingTime: string;
  lunchBreak: { start: string; end: string };
  teaBreak: { start: string; end: string };
  customHolidays: string[];
}

interface Service {
  id: string;
  name: string;
  duration: number;
  color: string;
}

interface SelectedSlot {
  staffId: string | number;
  startTime: string;
  endTime: string;
  duration: number;
  serviceDuration: number;
  serviceId: string;
}

interface SlotCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSlotCreate: (slotData: any) => void;
  staff: Staff[];
  selectedStaff: number | null;
  selectedTimeSlot: string | null;
  shopAvailability: ShopAvailability;
  services: Service[];
}

export function SlotCreationModal({
  isOpen,
  onClose,
  onSlotCreate,
  staff,
  selectedStaff,
  selectedTimeSlot,
  shopAvailability,
  services,
}: SlotCreationModalProps) {
  const [formData, setFormData] = useState<SelectedSlot>({
    staffId: selectedStaff || "",
    startTime: selectedTimeSlot || "",
    endTime: "",
    duration: services.length > 0 ? services[0].duration : 60,
    serviceDuration: services.length > 0 ? services[0].duration : 60,
    serviceId: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (selectedStaff) {
      setFormData((prev) => ({ ...prev, staffId: selectedStaff }));
    }
    if (selectedTimeSlot) {
      setFormData((prev) => ({ ...prev, startTime: selectedTimeSlot }));
    }
  }, [selectedStaff, selectedTimeSlot]);

  useEffect(() => {
    if (formData.startTime && formData.duration) {
      const start = new Date(`2000-01-01T${formData.startTime}:00`);
      start.setMinutes(start.getMinutes() + formData.duration);
      const endTime = start.toTimeString().slice(0, 5);
      setFormData((prev) => ({ ...prev, endTime }));
    }
  }, [formData.startTime, formData.duration]);

  const validateSlot = () => {
    const newErrors: string[] = [];

    if (!formData.staffId) {
      newErrors.push("Please select a staff member");
    }

    if (!formData.serviceId) {
      newErrors.push("Please select a service");
    }

    if (!formData.startTime) {
      newErrors.push("Please provide a start time");
    }

    if (formData.startTime < shopAvailability.openingTime || formData.endTime > shopAvailability.closingTime) {
      newErrors.push("Slot must be within shop hours");
    }

    const lunchStart = shopAvailability.lunchBreak.start;
    const lunchEnd = shopAvailability.lunchBreak.end;
    const teaStart = shopAvailability.teaBreak.start;
    const teaEnd = shopAvailability.teaBreak.end;

    if (
      (formData.startTime >= lunchStart && formData.startTime < lunchEnd) ||
      (formData.endTime > lunchStart && formData.endTime <= lunchEnd) ||
      (formData.startTime >= teaStart && formData.startTime < teaEnd) ||
      (formData.endTime > teaStart && formData.endTime <= teaEnd)
    ) {
      newErrors.push("Slot overlaps with break time");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSlot()) {
      return;
    }

    const selectedService = services.find((s) => s.id === formData.serviceId);

    onSlotCreate({
      staffId: Number(formData.staffId),
      startTime: formData.startTime,
      endTime: formData.endTime,
      duration: formData.duration,
      serviceId: formData.serviceId,
      serviceName: selectedService?.name,
      serviceColor: selectedService?.color,
    });

    setFormData({
      staffId: "",
      startTime: "",
      endTime: "",
      duration: services.length > 0 ? services[0].duration : 60,
      serviceDuration: services.length > 0 ? services[0].duration : 60,
      serviceId: "",
    });
    setErrors([]);
  };

  const generateSlots = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const slots = [];
      const selectedService = services.find((s) => s.id === formData.serviceId);
      if (!selectedService) {
        setIsGenerating(false);
        setErrors(["Please select a service"]);
        return;
      }
      const serviceDuration = selectedService.duration;
      const start = new Date(`2000-01-01T${shopAvailability.openingTime}:00`);
      const end = new Date(`2000-01-01T${shopAvailability.closingTime}:00`);

      while (start < end) {
        const startTime = start.toTimeString().slice(0, 5);
        const slotEnd = new Date(start);
        slotEnd.setMinutes(slotEnd.getMinutes() + serviceDuration);
        const endTime = slotEnd.toTimeString().slice(0, 5);

        const lunchStart = shopAvailability.lunchBreak.start;
        const lunchEnd = shopAvailability.lunchBreak.end;
        const teaStart = shopAvailability.teaBreak.start;
        const teaEnd = shopAvailability.teaBreak.end;

        const overlapsLunch =
          (startTime >= lunchStart && startTime < lunchEnd) || (endTime > lunchStart && endTime <= lunchEnd);
        const overlapsTea = (startTime >= teaStart && startTime < teaEnd) || (endTime > teaStart && endTime <= teaEnd);

        if (!overlapsLunch && !overlapsTea && slotEnd <= end) {
          slots.push({
            startTime,
            endTime,
            duration: serviceDuration,
          });
        }

        start.setMinutes(start.getMinutes() + serviceDuration); // Increment by service duration
      }

      setIsGenerating(false);

      slots.forEach((slot) => {
        onSlotCreate({
          staffId: Number(formData.staffId),
          ...slot,
          serviceId: formData.serviceId,
          serviceName: selectedService.name,
          serviceColor: selectedService.color,
        });
      });

      onClose();
    }, 1500);
  };

  const selectedStaffName = staff.find((s) => s.id === Number(formData.staffId))?.name;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] border-2 border-black">
        <DialogHeader className="bg-black text-white p-4 -m-6 mb-6">
          <DialogTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6" />
              Create Time Slot
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-gray-800">
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Staff Selection */}
          <div className="space-y-2">
            <Label htmlFor="staff" className="text-sm font-semibold">
              Select Staff Member
            </Label>
            <Select
              value={formData.staffId.toString()}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, staffId: Number(value) }))}
            >
              <SelectTrigger className="border-2 border-gray-300 focus:border-black">
                <SelectValue placeholder="Choose staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {member.name.charAt(0)}
                      </div>
                      {member.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service Selection */}
          <div className="space-y-2">
            <Label htmlFor="service" className="text-sm font-semibold">
              Select Service
            </Label>
            <Select
              value={formData.serviceId}
              onValueChange={(value) => {
                const service = services.find((s) => s.id === value);
                setFormData((prev) => ({
                  ...prev,
                  serviceId: value,
                  duration: service?.duration || 60,
                  serviceDuration: service?.duration || 60,
                }));
              }}
            >
              <SelectTrigger className="border-2 border-gray-300 focus:border-black">
                <SelectValue placeholder="Choose service type" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 ${service.color} rounded`}></div>
                      <span>
                        {service.name} ({service.duration} min)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-sm font-semibold">
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                className="border-2 border-gray-300 focus:border-black"
                min={shopAvailability.openingTime}
                max={shopAvailability.closingTime}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-sm font-semibold">
                End Time (Auto-calculated)
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                readOnly
                className="border-2 border-gray-200 bg-gray-50"
              />
            </div>
          </div>

          {/* Duration Display */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-semibold">
              Slot Duration (minutes)
            </Label>
            <Input
              id="duration"
              type="text"
              value={formData.duration + " minutes"}
              readOnly
              className="border-2 border-gray-200 bg-gray-50"
            />
          </div>

          <Separator className="bg-gray-200" />

          {/* Generate Slots Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">Auto-Generate Slots</h3>
            </div>
            <p className="text-sm text-gray-600">
              Generate all possible slots for the selected staff member based on service duration
            </p>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Service Duration for Generation</Label>
              <Select
                value={formData.serviceDuration.toString()}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, serviceDuration: Number(value) }))}
                disabled={!formData.serviceId}
              >
                <SelectTrigger className="border-2 border-gray-300 focus:border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formData.serviceId && (
                    <SelectItem value={services.find((s) => s.id === formData.serviceId)?.duration.toString() || "60"}>
                      {services.find((s) => s.id === formData.serviceId)?.name} - {services.find((s) => s.id === formData.serviceId)?.duration} minutes
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              onClick={generateSlots}
              disabled={!formData.staffId || !formData.serviceId || isGenerating}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isGenerating ? "Generating Slots..." : "Generate All Slots"}
            </Button>
          </div>

          {/* Error Display */}
          {errors.length > 0 && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h4 className="font-semibold text-red-800">Validation Errors</h4>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Slot Preview */}
          {formData.staffId && formData.startTime && formData.endTime && (
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Slot Preview</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Staff:</span>
                  <Badge className="bg-black text-white">{selectedStaffName}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold">
                    {formData.startTime} - {formData.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">{formData.duration} minutes</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-black text-white hover:bg-gray-800" disabled={errors.length > 0}>
              Create Slot
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}