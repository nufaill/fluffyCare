// src/services/userService/userService.ts
// import toast from 'react-hot-toast';
import Useraxios from "@/api/user.axios";
import type { UserDocument, UserUpdatePayload } from "@/types/user.type";

export const userService = {
  async getUser(): Promise<UserDocument> {
    const res = await Useraxios.get("/profile");
    const data = res.data;

    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  },

  async editUser(data: UserUpdatePayload): Promise<UserDocument> {
    const res = await Useraxios.patch("/profile/update", data);
    const updated = res.data;

    
    return {
      ...updated,
      createdAt: new Date(updated.createdAt),
      updatedAt: new Date(updated.updatedAt),
    };
  },
};

