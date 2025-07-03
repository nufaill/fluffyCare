// src/services/userService/userService.ts
import Useraxios from "@/api/user.axios";
import type { UserDocument, UserUpdatePayload } from "@/types/user.type";

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
};