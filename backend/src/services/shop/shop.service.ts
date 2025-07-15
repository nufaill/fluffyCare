import { ShopRepository } from '../../repositories/shop.repository';
import { CreateShopData, ShopDocument } from '../../types/Shop.types';
import { UpdateShopDTO } from '../../dtos/shop.dto';
import { CustomError } from '../../util/CustomerError';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../shared/constant';
import { IShopService } from '../../interfaces/serviceInterfaces/shop.interface';

export class ShopService implements IShopService {
  constructor(private readonly shopRepository: ShopRepository) {}

  async createShop(shopData: Partial<CreateShopData>): Promise<ShopDocument> {
    if (!shopData.email || !shopData.name || !shopData.phone || !shopData.city || !shopData.streetAddress || !shopData.certificateUrl || !shopData.location) {
      throw new CustomError('All required fields must be provided', HTTP_STATUS.BAD_REQUEST);
    }

    if (shopData.location) {
      if (shopData.location.type !== 'Point' || !Array.isArray(shopData.location.coordinates) || shopData.location.coordinates.length !== 2) {
        throw new CustomError('Location must be a valid GeoJSON Point', HTTP_STATUS.BAD_REQUEST);
      }
      const [lng, lat] = shopData.location.coordinates;
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        throw new CustomError('Invalid longitude or latitude values', HTTP_STATUS.BAD_REQUEST);
      }
    }

    const existingShop = await this.shopRepository.findByEmail(shopData.email);
    if (existingShop) {
      throw new CustomError('Shop with this email already exists', HTTP_STATUS.CONFLICT);
    }

    const completeShopData: CreateShopData = {
      email: shopData.email,
      name: shopData.name,
      phone: shopData.phone,
      city: shopData.city,
      streetAddress: shopData.streetAddress,
      certificateUrl: shopData.certificateUrl,
      location: shopData.location,
      password: shopData.password || '',
      logo: shopData.logo || '',
      description: shopData.description || '',
      isActive: shopData.isActive ?? true,
      isVerified: shopData.isVerified ?? false,
    };

    const shop = await this.shopRepository.createShop(completeShopData);
    if (!shop) {
      throw new CustomError('Failed to create shop', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    return shop;
  }

  async getShopById(shopId: string): Promise<ShopDocument | null> {
    const shop = await this.shopRepository.findById(shopId);
    if (!shop) {
      throw new CustomError('Shop not found', HTTP_STATUS.NOT_FOUND);
    }
    return shop;
  }

  async updateShop(shopId: string, updateData: UpdateShopDTO): Promise<ShopDocument | null> {
    if (!Object.keys(updateData).length) {
      throw new CustomError('At least one field must be provided for update', HTTP_STATUS.BAD_REQUEST);
    }

    if (updateData.location) {
      if (updateData.location.type !== 'Point' || !Array.isArray(updateData.location.coordinates) || updateData.location.coordinates.length !== 2) {
        throw new CustomError('Location must be a valid GeoJSON Point', HTTP_STATUS.BAD_REQUEST);
      }
      const [lng, lat] = updateData.location.coordinates;
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        throw new CustomError('Invalid longitude or latitude values', HTTP_STATUS.BAD_REQUEST);
      }
    }

    if (updateData.name && (updateData.name.length < 3 || updateData.name.length > 100)) {
      throw new CustomError('Shop name must be between 3 and 100 characters', HTTP_STATUS.BAD_REQUEST);
    }

    if (updateData.phone && !/^\+?[\d\s-]{10,}$/.test(updateData.phone)) {
      throw new CustomError('Please enter a valid phone number', HTTP_STATUS.BAD_REQUEST);
    }

    if (updateData.city && (updateData.city.length < 2 || updateData.city.length > 100)) {
      throw new CustomError('City must be between 2 and 100 characters', HTTP_STATUS.BAD_REQUEST);
    }

    if (updateData.streetAddress && (updateData.streetAddress.length < 5 || updateData.streetAddress.length > 200)) {
      throw new CustomError('Street address must be between 5 and 200 characters', HTTP_STATUS.BAD_REQUEST);
    }

    if (updateData.description && updateData.description.length > 1000) {
      throw new CustomError('Description must be less than 1000 characters', HTTP_STATUS.BAD_REQUEST);
    }

    const shop = await this.shopRepository.updateShop(shopId, updateData);
    if (!shop) {
      throw new CustomError('Shop not found', HTTP_STATUS.NOT_FOUND);
    }
    return shop;
  }
}