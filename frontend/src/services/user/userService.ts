// src/services/userService/userService.ts
import Useraxios from "@/api/user.axios";
import type { UserDocument, UserUpdatePayload } from "@/types/user.type";
import type { PetDocument, CreatePetData } from "@/types/pet.type";

  export interface PetType {
    _id:string
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

export const userService = {
  async getUser(userId: string): Promise<UserDocument> {
    const res = await Useraxios.get(`/profile/${userId}`);
    const data = res.data.data;

    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  },

  async editUser(userId: string, data: UserUpdatePayload): Promise<UserDocument> {
    const res = await Useraxios.patch(`/profile/update/${userId}`, data);
    const updated = res.data.data;

    return {
      ...updated,
      createdAt: new Date(updated.createdAt),
      updatedAt: new Date(updated.updatedAt),
    };
  },

   async createPet(petData: CreatePetData): Promise<PetDocument> {
    const res = await Useraxios.post('/add-pets', petData);
    return res.data.data;
  },

  async getPetsByUserId(userId: string): Promise<PetDocument[]> {
    const res = await Useraxios.get(`/pets/${userId}`);
    return res.data.data;
  },

  async getPetById(petId: string): Promise<PetDocument> {
    const res = await Useraxios.get(`/pets/${petId}`);
    return res.data.data;
  },

  async updatePet(petId: string, updateData: Partial<CreatePetData>): Promise<PetDocument> {
    const res = await Useraxios.put(`/pets/${petId}`, updateData);
    return res.data.data;
  },

  async getAllPetTypes():Promise<PetType[]>{
    const res = await Useraxios.get('/pet-types');
    return res.data.data 
  }

};