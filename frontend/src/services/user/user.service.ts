import Useraxios from "@/api/user.axios";
import type { UserDocument, UserUpdatePayload } from "@/types/user.type";
import type { Pet, CreatePetData, PetType } from "@/types/pet.type";

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
    console.log('Fetching pet with ID:', petId);
    const res = await Useraxios.get(`/pets/${petId}`);
    console.log('Pet API response:', res.data);
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
    console.log('Updating pet with ID:', petId, 'Data:', updateData);
    try {
      const res = await Useraxios.put(`/pets/${petId}`, updateData);
      console.log('Update pet response:', res.data);
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
  }
};