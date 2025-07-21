import { ShopRepository } from '../../repositories/shop.repository';
import { ShopDocument } from '../../types/Shop.types';
import {NearbyShopsQuery,NearbyShop} from '../../interfaces/serviceInterfaces/INearbyShopsService'



export class NearbyService {
  constructor(private shopRepository: ShopRepository) {}

 async findNearbyShops(query: NearbyShopsQuery): Promise<NearbyShop[]> {
  const { latitude, longitude, maxDistance = 5000, serviceType, petType } = query;

  const shops = await this.shopRepository.findNearbyShops(
    longitude,
    latitude,
    maxDistance,
    { serviceType, petType }
  );

  return shops.map(shop => ({
    _id: shop._id.toString(),
    name: shop.name,
    email: shop.email,
    phone: shop.phone,
    address: shop.streetAddress,
    location: shop.location,
    isActive: shop.isActive,
    isVerified: shop.isVerified,
    distance: this.calculateDistance(
      latitude,
      longitude,
      shop.location.coordinates[1],
      shop.location.coordinates[0]
    ),
    profileImage: shop.logo,
    description: shop.description,
  })).sort((a, b) => a.distance - b.distance);
}

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}