import { Shop } from '../../types/Shop.types';

export interface IShopService {
  createShop(shopData: Partial<Shop>): Promise<Shop>;
  getShopById(shopId: string): Promise<Shop | null>;
  updateShop(shopId: string, updateData: Partial<Shop>): Promise<Shop | null>;
}