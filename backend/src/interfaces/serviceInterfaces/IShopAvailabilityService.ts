import { ShopAvailabilityDTO, ShopResponseDTO } from '../../dto/shop.dto';

export interface IShopAvailabilityService {
  getShopAvailability(shopId: string): Promise<ShopAvailabilityDTO>;
  updateShopAvailability(shopId: string, data: ShopAvailabilityDTO): Promise<ShopResponseDTO>;
}