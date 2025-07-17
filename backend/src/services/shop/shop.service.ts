import { ShopRepository } from '../../repositories/shop.repository';
import { ShopDocument, CreateShopData } from '../../types/Shop.types';
import { UpdateShopDTO } from '../../dto/shop.dto';
import { CustomError } from '../../util/CustomerError';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../shared/constant';
import { IShopService } from '../../interfaces/serviceInterfaces/IShopService';
import { Types } from 'mongoose';

export class ShopService implements IShopService {
  constructor(private readonly shopRepository: ShopRepository) {}

  private validateShopId(shopId: string): void {
    if (!/^[a-f\d]{24}$/i.test(shopId)) {
      throw new CustomError('Invalid shop ID', HTTP_STATUS.BAD_REQUEST);
    }
  }

  private validateShopData(updateData: UpdateShopDTO): void {
    if (!Object.keys(updateData).length) {
      throw new CustomError('At least one field must be provided for update', HTTP_STATUS.BAD_REQUEST);
    }

    if (updateData.location && updateData.location !== null) {
      if (!updateData.location.type || updateData.location.type !== 'Point' || !Array.isArray(updateData.location.coordinates) || updateData.location.coordinates.length !== 2) {
        throw new CustomError('Location must be a valid GeoJSON Point', HTTP_STATUS.BAD_REQUEST);
      }
      const [lng, lat] = updateData.location.coordinates;
      if (typeof lng !== 'number' || typeof lat !== 'number' || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
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
  }

  async getShopById(shopId: string): Promise<ShopDocument> {
    this.validateShopId(shopId);
    const shop = await this.shopRepository.findById(shopId);
    if (!shop) {
      throw new CustomError('Shop not found', HTTP_STATUS.NOT_FOUND);
    }
    return shop;
  }

  async updateShop(shopId: string, updateData: UpdateShopDTO): Promise<ShopDocument> {
    this.validateShopId(shopId);
    this.validateShopData(updateData);

    if (updateData.name) {
      const nameExists = await this.shopRepository.checkShopNameExists(updateData.name, shopId);
      if (nameExists) {
        throw new CustomError('Shop name already exists', HTTP_STATUS.BAD_REQUEST);
      }
    }

    const shop = await this.shopRepository.updateShop(shopId, updateData);
    if (!shop) {
      throw new CustomError('Shop not found', HTTP_STATUS.NOT_FOUND);
    }
    return shop;
  }

  async getAllShops(): Promise<ShopDocument[]> {
    return await this.shopRepository.getAllShops();
  }

  async updateShopStatus(shopId: string, isActive: boolean): Promise<ShopDocument> {
    this.validateShopId(shopId);
    const updatedShop = await this.shopRepository.updateShopStatus(shopId, isActive);
    if (!updatedShop) {
      throw new CustomError('Shop not found', HTTP_STATUS.NOT_FOUND);
    }
    return updatedShop;
  }

  async getUnverifiedShops(): Promise<ShopDocument[]> {
    return await this.shopRepository.getUnverifiedShops();
  }

  async approveShop(shopId: string): Promise<ShopDocument> {
    this.validateShopId(shopId);
    const approvedShop = await this.shopRepository.updateShopVerification(shopId, true);
    if (!approvedShop) {
      throw new CustomError('Shop not found', HTTP_STATUS.NOT_FOUND);
    }
    return approvedShop;
  }

  async rejectShop(shopId: string): Promise<ShopDocument> {
    this.validateShopId(shopId);
    const shop = await this.shopRepository.findById(shopId);
    if (!shop) {
      throw new CustomError('Shop not found', HTTP_STATUS.NOT_FOUND);
    }
    if (shop.isVerified) {
      throw new CustomError('Shop is already verified', HTTP_STATUS.BAD_REQUEST);
    }
    const updatedShop = await this.shopRepository.updateShopVerification(shopId, false);
    if (!updatedShop) {
      throw new CustomError('Failed to reject shop', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    return updatedShop;
  }

  async updateShopProfile(shopId: string, updateData: UpdateShopDTO): Promise<ShopDocument> {
    this.validateShopId(shopId);
    this.validateShopData(updateData);

    if (updateData.name) {
      const nameExists = await this.shopRepository.checkShopNameExists(updateData.name, shopId);
      if (nameExists) {
        throw new CustomError('Shop name already exists', HTTP_STATUS.BAD_REQUEST);
      }
    }

    const updatedShop = await this.shopRepository.updateShop(shopId, updateData);
    if (!updatedShop) {
      throw new CustomError('Shop not found', HTTP_STATUS.NOT_FOUND);
    }
    return updatedShop;
  }
}