import { ShopResponseDTO, UpdateShopDTO } from '../../dto/shop.dto';

export interface IShopService {
  getShopById(shopId: string): Promise<ShopResponseDTO>;
  getShopSubscription(shopId: string): Promise<string>;
  updateShop(shopId: string, updateData: UpdateShopDTO): Promise<ShopResponseDTO>;
  getAllShops(page: number, limit: number): Promise<{ shops: ShopResponseDTO[], total: number, page: number, limit: number }>;
  updateShopStatus(shopId: string, isActive: boolean): Promise<ShopResponseDTO>;
  updateShopSubscription(  shopId: string, subscriptionData: { subscriptionId?: string | null;  plan: string; subscriptionStart?: Date; subscriptionEnd?: Date;  isActive?: boolean; }): Promise<ShopResponseDTO>;
  getUnverifiedShops(page: number, limit: number): Promise<{ shops: ShopResponseDTO[], total: number, page: number, limit: number }>;
  approveShop(shopId: string): Promise<ShopResponseDTO>;
  rejectShop(shopId: string, rejectionReason?: string): Promise<ShopResponseDTO>;
  updateShopProfile(shopId: string, updateData: UpdateShopDTO): Promise<ShopResponseDTO>;
}