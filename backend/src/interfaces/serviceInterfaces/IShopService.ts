import { UpdateShopDTO, ShopResponseDTO } from '../../dto/shop.dto';

export interface IShopService {
  getShopById(shopId: string): Promise<ShopResponseDTO>;
  updateShop(shopId: string, updateData: UpdateShopDTO): Promise<ShopResponseDTO>;
  getAllShops(page?: number, limit?: number): Promise<{ shops: ShopResponseDTO[], total: number, page: number, limit: number }>;
  updateShopStatus(shopId: string, isActive: boolean): Promise<ShopResponseDTO>;
  getUnverifiedShops(page?: number, limit?: number): Promise<{ shops: ShopResponseDTO[], total: number, page: number, limit: number }>;
  approveShop(shopId: string): Promise<ShopResponseDTO>;
  rejectShop(shopId: string): Promise<ShopResponseDTO>;
  updateShopProfile(shopId: string, updateData: UpdateShopDTO): Promise<ShopResponseDTO>;
}