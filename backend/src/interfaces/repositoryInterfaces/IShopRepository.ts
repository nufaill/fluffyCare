import { CreateShopData } from "types/Shop.types";
import { ShopResponseDTO,UpdateShopDTO } from "../../dto/shop.dto";
import { Types } from "mongoose";

interface IShopRepository {
  findByEmail(email: string): Promise<ShopResponseDTO | null>;
  findById(id: string): Promise<ShopResponseDTO | null>;
  createShop(data: CreateShopData): Promise<ShopResponseDTO>;
  updateShop(id: string, updateData: Partial<CreateShopData>): Promise<UpdateShopDTO | null>;
  existsByEmail(email: string): Promise<boolean>;
  setResetToken(email: string, token: string, expires: Date): Promise<ShopResponseDTO | null>;
  findByResetToken(token: string): Promise<ShopResponseDTO | null>;
  updatePasswordAndClearToken(shopId: Types.ObjectId, hashedPassword: string): Promise<ShopResponseDTO | null>;
  getAllShops(skip?: number, limit?: number): Promise<ShopResponseDTO[]>;
  countDocuments(query?: any): Promise<number>;
  updateShopStatus(shopId: string, isActive: boolean): Promise<ShopResponseDTO | null>;
  getUnverifiedShops(skip?: number, limit?: number): Promise<ShopResponseDTO[]>;
  updateShopVerification(shopId: string, isVerified: boolean): Promise<ShopResponseDTO | null>;
  checkShopNameExists(name: string, excludeShopId?: string): Promise<boolean>;
}
export default IShopRepository;