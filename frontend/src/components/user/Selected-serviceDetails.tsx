import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar, Clock, DollarSign, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import Useraxios from "@/api/user.axios";
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary";
import type { TimeSlot } from "@/types/schedule.types";

interface PetDetails {
  id?: string;
  _id?: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  weight: string;
  specialNotes: string;
  profileImage?: string;
  petTypeId?: { _id: string; name: string };
}

interface SelectedServiceDetailsProps {
  onBookNow: () => void;
  onSelectPetId: (petId: string) => void;
  selectedSlots: TimeSlot[];
  selectedPetId?: string;
}

export default function SelectedServiceDetails({
  onBookNow,
  onSelectPetId,
  selectedSlots,
  selectedPetId: parentSelectedPetId,
}: SelectedServiceDetailsProps) {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [service, setService] = useState<any>(null);
  const [pets, setPets] = useState<PetDetails[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>(parentSelectedPetId || "");
  const [showPetDetails, setShowPetDetails] = useState(!!parentSelectedPetId);
  const [petDetails, setPetDetails] = useState<PetDetails>({
    name: "",
    type: "",
    breed: "",
    age: "",
    weight: "",
    specialNotes: "",
    profileImage: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (parentSelectedPetId && parentSelectedPetId !== selectedPetId) {
      setSelectedPetId(parentSelectedPetId);
      const selectedPet = pets.find(
        (pet) => (pet.id && pet.id === parentSelectedPetId) || (pet._id && pet._id === parentSelectedPetId)
      );
      if (selectedPet) {
        setPetDetails(selectedPet);
        setShowPetDetails(true);
      }
    }
  }, [parentSelectedPetId, pets, selectedPetId]);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!serviceId) return;
      try {
        const response = await Useraxios.get(`/services/${serviceId}`);
        setService(response.data.data || response.data);
      } catch (err) {
        console.error("Error fetching service details", err);
      }
    };

    const fetchUserPets = async () => {
      try {
        const response = await Useraxios.get("/pets/1");
        setPets(response.data.data || response.data);
      } catch (err) {
        console.error("Error fetching user pets", err);
      }
    };

    fetchServiceDetails();
    fetchUserPets();
  }, [serviceId]);

  const formatPetTypes = (petTypes: any[]) => {
    if (!petTypes || petTypes.length === 0) return [];
    return petTypes.map((pet) => (typeof pet === "string" ? pet.charAt(0).toUpperCase() + pet.slice(1) : pet.name));
  };

  const getCompatiblePets = () => {
    if (!service || !service.petTypeIds || !pets) return [];
    const servicePetTypes = formatPetTypes(service.petTypeIds).map((type) => type.toLowerCase());
    return pets.filter((pet) => {
      const petTypeName = pet.petTypeId?.name?.toLowerCase() || pet.type?.toLowerCase();
      return servicePetTypes.includes(petTypeName);
    });
  };

  const handlePetSelection = (pet: PetDetails) => {
    const petId = pet.id || pet._id || "";
    if (!petId) {
      console.error("Pet ID is missing:", pet);
      return;
    }
    setPetDetails(pet);
    setSelectedPetId(petId);
    setShowPetDetails(true);
    setIsModalOpen(false);
    onSelectPetId(petId);
  };

  const openPetModal = () => {
    setIsModalOpen(true);
  };

  const petTypes = service ? formatPetTypes(service.petTypeIds) : [];
  const compatiblePets = getCompatiblePets();

  const duration = service
    ? (() => {
        const totalSeconds = Math.round((service.durationHour || 0) * 3600);
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const s = String(totalSeconds % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
      })()
    : "00:00";

  if (!service) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent mx-auto mb-4"></div>
          <p className="text-black font-medium">Loading service details...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-2 border-black shadow-xl">
      <CardHeader className="bg-black text-white p-4">
        <CardTitle className="text-xl font-bold">{service.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-black" />
            <h3 className="font-semibold">Duration</h3>
          </div>
          <p className="text-gray-600">{duration}</p>
        </div>
        <Separator className="bg-gray-200" />
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-black" />
            <h3 className="font-semibold">Price</h3>
          </div>
          <p className="text-2xl font-bold">₹{service.price}</p>
          <p className="text-sm text-gray-500">Includes all taxes and fees</p>
        </div>
        <Separator className="bg-gray-200" />
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <PawPrint className="w-6 h-6" />
            <h2 className="text-xl font-bold">Pet Details</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={openPetModal}
            className="border-black text-black hover:bg-black hover:text-white"
          >
            {selectedPetId ? "Change Pet" : "Select Pet"}
          </Button>
          {showPetDetails && selectedPetId && (
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-4">
                {petDetails.profileImage && (
                  <img
                    src={cloudinaryUtils.getFullUrl(petDetails.profileImage)}
                    alt={petDetails.name}
                    className="w-16 h-16 object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/100";
                    }}
                  />
                )}
                <div>
                  <p className="text-lg font-semibold">{petDetails.name}</p>
                  <p className="text-sm text-gray-500">{petDetails.petTypeId?.name || petDetails.type}</p>
                </div>
              </div>
            </div>
          )}
          {!selectedPetId && (
            <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
              <p className="text-orange-800 text-sm">⚠️ Please select a pet to continue.</p>
            </div>
          )}
        </div>
        <Separator className="bg-gray-200" />
        {selectedSlots.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-black" />
              <h3 className="font-semibold">Selected Slot</h3>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p>
                {selectedSlots[0].slotDate} {selectedSlots[0].startTime} - {selectedSlots[0].endTime} (
                {selectedSlots[0].staffName || "Professional Staff"})
              </p>
            </div>
          </div>
        )}
        <Button
          onClick={onBookNow}
          className="w-full bg-black text-white hover:bg-gray-800 font-semibold py-3 text-lg"
          size="lg"
          disabled={!selectedPetId || selectedSlots.length === 0}
        >
          <Calendar className="w-5 h-5 mr-2" />
          Confirm Booking
        </Button>
      </CardContent>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Select Your Pet</DialogTitle>
            <DialogClose asChild />
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
            {compatiblePets.length === 0 ? (
              <div className="col-span-2 text-center p-4">
                <p className="text-gray-600 mb-2">No compatible pets found for this service.</p>
                <p className="text-sm text-gray-500">
                  This service is only available for: {petTypes.join(", ")}
                </p>
              </div>
            ) : (
              compatiblePets.map((pet) => {
                const petId = pet.id || pet._id || "";
                const isSelected = petId === selectedPetId;
                return (
                  <Button
                    key={petId}
                    variant="outline"
                    className={`flex flex-col items-center p-4 h-auto border-2 hover:border-black ${
                      isSelected ? "border-black bg-black text-white" : "border-gray-300"
                    }`}
                    onClick={() => handlePetSelection(pet)}
                  >
                    <img
                      src={pet.profileImage ? cloudinaryUtils.getFullUrl(pet.profileImage) : "https://via.placeholder.com/100"}
                      alt={pet.name}
                      className="w-24 h-24 object-cover rounded-full mb-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/100";
                      }}
                    />
                    <span className="font-semibold">{pet.name}</span>
                    <span className={`text-xs ${isSelected ? "text-gray-200" : "text-gray-500"}`}>
                      {pet.petTypeId?.name || pet.type}
                    </span>
                    {isSelected && (
                      <span className="text-xs bg-white text-black px-2 py-1 rounded-full mt-1">Selected</span>
                    )}
                  </Button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}