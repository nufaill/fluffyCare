import { ShopDocument } from '../models/shop.model';
import { ShopDTO } from '../interfaces/serviceInterfaces/INearbyShopsService';

export function mapRepoShopToDTO(shop: ShopDocument): ShopDTO {
  return {
    id: shop._id.toString(),
    name: shop.name,
    location: shop.location,
    shopAvailability: shop.shopAvailability,
    isVerified: shop.isVerified,
    isActive: shop.isActive,
  };
}