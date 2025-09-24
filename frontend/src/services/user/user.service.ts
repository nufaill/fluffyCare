import Useraxios from "@/api/user.axios";
import type { UserDocument, UserUpdatePayload } from "@/types/user.type";
import type { Pet, CreatePetData, PetType } from "@/types/pet.type";

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}

export interface LocationUpdatePayload {
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  timestamp: number;
}

export interface NearbyServicesRequest {
  lat: number;
  lng: number;
  radius: number;
  serviceType?: string;
  petType?: string;
}

export interface ServiceLocation {
  _id: string;
  name: string;
  serviceType: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  rating: number;
  price: number;
  description?: string;
  distance?: number; 
}
let currentUserLocation: UserLocation | null = null;

export const userService = {
  async getUser(userId: string): Promise<UserDocument> {
    const res = await Useraxios.get(`/profile/${userId}`);
    const data = res.data.data;

    return {
      ...data,
      id: data._id,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  },

  async editUser(userId: string, data: UserUpdatePayload): Promise<UserDocument> {
    const res = await Useraxios.patch(`/profile/update/${userId}`, data);
    const updated = res.data.data;

    return {
      ...updated,
      id: updated._id.toString(),
      createdAt: new Date(updated.createdAt),
      updatedAt: new Date(updated.updatedAt),
    };
  },

  async createPet(petData: CreatePetData): Promise<Pet> {
    const res = await Useraxios.post('/add-pets', petData);
    const data = res.data.data;
    return {
      ...data,
      id: data._id.toString(),
    };
  },

  async getPetsByUserId(userId: string): Promise<Pet[]> {
    const res = await Useraxios.get(`/pets/${userId}`);
    return res.data.data.map((pet: any) => ({
      ...pet,
      id: pet._id.toString(),
    }));
  },

  async getPetById(petId: string): Promise<Pet> {
    const res = await Useraxios.get(`/pets/${petId}`);
    let data = res.data.data;
    if (Array.isArray(data)) {
      if (data.length === 0) {
        throw new Error('No pet data found');
      }
      data = data[0];
    }
    if (!data || !data._id) {
      throw new Error('Invalid pet data received');
    }
    return {
      ...data,
      id: data._id.toString(),
    };
  },

  async updatePet(petId: string, updateData: Partial<CreatePetData>): Promise<Pet> {
    try {
      const res = await Useraxios.put(`/pets/${petId}`, updateData);
      const data = res.data.data;
      return {
        ...data,
        id: data._id.toString(),
      };
    } catch (error: any) {
      console.error('Update pet error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getAllPetTypes(): Promise<PetType[]> {
    const res = await Useraxios.get('/pet-types');
    return res.data.data.map((type: any) => ({
      ...type,
      id: type._id.toString(),
    }));
  },
   setUserLocation(location: UserLocation, syncWithBackend: boolean = false): void {
    currentUserLocation = location;
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('userLocation', JSON.stringify(location));
    } catch (error) {
      console.warn('Failed to store location in localStorage:', error);
    }
    
    // Optionally sync with backend
    if (syncWithBackend) {
      this.syncLocationWithBackend(location).catch(error => {
        console.error('Failed to sync location with backend:', error);
      });
    }
  },

  /**
   * Get stored user location
   */
  getUserLocation(): UserLocation | null {
    if (currentUserLocation) {
      return currentUserLocation;
    }
    
    // Try to get from localStorage
    try {
      const stored = localStorage.getItem('userLocation');
      if (stored) {
        currentUserLocation = JSON.parse(stored);
        return currentUserLocation;
      }
    } catch (error) {
      console.warn('Failed to retrieve location from localStorage:', error);
    }
    
    return null;
  },

  /**
   * Clear stored user location
   */
  clearUserLocation(): void {
    currentUserLocation = null;
    try {
      localStorage.removeItem('userLocation');
    } catch (error) {
      console.warn('Failed to clear location from localStorage:', error);
    }
  },

  /**
   * Sync location with backend (if your backend supports it)
   */
  async syncLocationWithBackend(location: UserLocation): Promise<void> {
    try {
      const payload: LocationUpdatePayload = {
        location: {
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy,
        },
        timestamp: location.timestamp,
      };
      
      await Useraxios.post('/location', payload);
    } catch (error) {
      console.error('Error syncing location with backend:', error);
      throw error;
    }
  },

  async getNearbyServices(params: NearbyServicesRequest): Promise<ServiceLocation[]> {
    try {
      const res = await Useraxios.get('/services/nearby', { params });
      return res.data.data.map((service: any) => ({
        ...service,
        id: service._id.toString(),
      }));
    } catch (error) {
      console.error('Error fetching nearby services:', error);
      throw error;
    }
  },

  async getServicesWithLocation(): Promise<ServiceLocation[]> {
    try {
      const res = await Useraxios.get('/services/with-location');
      return res.data.data.map((service: any) => ({
        ...service,
        id: service._id.toString(),
      }));
    } catch (error) {
      console.error('Error fetching services with location:', error);
      throw error;
    }
  },

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  getDistanceFromUser(targetLat: number, targetLng: number): number | null {
    const userLocation = this.getUserLocation();
    if (!userLocation) return null;
    
    return this.calculateDistance(
      userLocation.lat,
      userLocation.lng,
      targetLat,
      targetLng
    );
  },

  isUserWithinRadius(targetLat: number, targetLng: number, radiusKm: number): boolean {
    const distance = this.getDistanceFromUser(targetLat, targetLng);
    return distance !== null && distance <= radiusKm;
  },

  getUserLocationAge(): number | null {
    const location = this.getUserLocation();
    return location ? Date.now() - location.timestamp : null;
  },

  isUserLocationFresh(): boolean {
    const age = this.getUserLocationAge();
    return age !== null && age < 300000; 
  },
};