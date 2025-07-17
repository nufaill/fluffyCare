import { ShopDocument, CreateShopData } from '../../types/Shop.types';
import { UpdateShopDTO } from '../../dto/shop.dto';

export interface IShopService {
  getShopById(shopId: string): Promise<ShopDocument>;
  updateShop(shopId: string, updateData: UpdateShopDTO): Promise<ShopDocument>;
  getAllShops(): Promise<ShopDocument[]>;
  updateShopStatus(shopId: string, isActive: boolean): Promise<ShopDocument>;
  getUnverifiedShops(): Promise<ShopDocument[]>;
  approveShop(shopId: string): Promise<ShopDocument>;
  rejectShop(shopId: string): Promise<ShopDocument>;
  updateShopProfile(shopId: string, updateData: UpdateShopDTO): Promise<ShopDocument>;
}