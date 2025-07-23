export interface Staff {
    _id: string;
    shopId: string;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

export interface CreateStaffPayload {
    name: string;
    email: string;
    phone: string;
    shopId: string;
    role?: string;
}

export interface UpdateStaffPayload {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
}