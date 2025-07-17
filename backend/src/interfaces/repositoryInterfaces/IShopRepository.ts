import { Types } from 'mongoose';
import { CreateShopData, ShopDocument } from '../../types/Shop.types';

interface IShopRepository {
  findByEmail(email: string): Promise<ShopDocument | null>;
  findById(id: string): Promise<ShopDocument | null>;
  createShop(data: CreateShopData): Promise<ShopDocument>;
  updateShop(id: string, updateData: Partial<CreateShopData>): Promise<ShopDocument | null>;
  existsByEmail(email: string): Promise<boolean>;
  setResetToken(email: string, token: string, expires: Date): Promise<ShopDocument | null>;
  findByResetToken(token: string): Promise<ShopDocument | null>;
  updatePasswordAndClearToken(shopId: Types.ObjectId, hashedPassword: string): Promise<ShopDocument | null>;
  getAllShops(): Promise<ShopDocument[]>;
  updateShopStatus(shopId: string, isActive: boolean): Promise<ShopDocument | null>;
  getUnverifiedShops(): Promise<ShopDocument[]>;
  updateShopVerification(shopId: string, isVerified: boolean): Promise<ShopDocument | null>;
  checkShopNameExists(name: string, excludeShopId?: string): Promise<boolean>;
}

export default IShopRepository;