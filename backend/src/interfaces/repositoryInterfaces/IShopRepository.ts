import { ShopResponseDTO, UpdateShopDTO } from '../../dto/shop.dto';
import { CreateShopData, ShopDocument } from '../../types/Shop.types';
import { Types } from 'mongoose';

export default interface IShopRepository {
  findByEmail(email: string): Promise<ShopResponseDTO | null>;
  findByEmailWithPassword(email: string): Promise<ShopDocument | null>;
  findById(id: string): Promise<ShopResponseDTO | null>;
  createShop(data: CreateShopData): Promise<ShopResponseDTO>;
  updateShop(id: string, updateData: Partial<CreateShopData>): Promise<UpdateShopDTO | null>;
  updateShopSubscription(id: string, subscription: 'free' | 'basic' | 'premium'): Promise<ShopResponseDTO | null>;
  existsByEmail(email: string): Promise<boolean>;
  setResetToken(email: string, token: string, expires: Date): Promise<ShopResponseDTO | null>;
  findByResetToken(token: string): Promise<ShopResponseDTO | null>;
  updatePasswordAndClearToken(shopId: Types.ObjectId, hashedPassword: string): Promise<ShopResponseDTO | null>;
  getAllShops(skip: number, limit: number): Promise<ShopResponseDTO[]>;
  countDocuments(query: any): Promise<number>;
  updateShopStatus(shopId: string, isActive: boolean): Promise<ShopResponseDTO | null>;
  getUnverifiedShops(skip: number, limit: number): Promise<ShopResponseDTO[]>;
  updateShopVerification(shopId: string, isVerified: 'pending' | 'approved' | 'rejected'): Promise<ShopResponseDTO | null>;
  checkShopNameExists(name: string, excludeShopId?: string): Promise<boolean>;
  findNearbyShops(longitude: number, latitude: number, maxDistance: number, filters?: { serviceType?: string; petType?: string }): Promise<ShopResponseDTO[]>;
  findShopsWithinRadius(longitude: number, latitude: number, radiusInMeters: number): Promise<ShopResponseDTO[]>;
}