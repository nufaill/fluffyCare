import { ShopRepository } from '../../repositories/shop/shop.repository';
import { UpdateShopDTO, ShopResponseDTO } from '../../dto/shop.dto';
import { CustomError } from '../../util/CustomerError';
import { HTTP_STATUS } from '../../shared/constant';
import { IShopService } from '../../interfaces/serviceInterfaces/IShopService';
import { Types } from 'mongoose';

export class ShopService implements IShopService {
  constructor(private readonly shopRepository: ShopRepository) { }

  private validateShopId(shopId: string): void {
    if (!Types.ObjectId.isValid(shopId)) {
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

  async getShopById(shopId: string): Promise<ShopResponseDTO> {
    this.validateShopId(shopId);
    const shop = await this.shopRepository.findById(shopId);
    if (!shop) {
      throw new CustomError('Shop not found', HTTP_STATUS.NOT_FOUND);
    }
    return shop;
  }

  async updateShop(shopId: string, updateData: UpdateShopDTO): Promise<ShopResponseDTO> {
    this.validateShopId(shopId);
    this.validateShopData(updateData);

    const updatedShop = await this.shopRepository.updateShop(shopId, updateData);
    if (!updatedShop) {
      throw new CustomError('Shop not found', HTTP_STATUS.NOT_FOUND);
    }
    return updatedShop as ShopResponseDTO;
  }

  async getAllShops(page: number = 1, limit: number = 10): Promise<{ shops: ShopResponseDTO[], total: number, page: number, limit: number }> {
    const skip = (page - 1) * limit;
    const [shops, total] = await Promise.all([
      this.shopRepository.getAllShops(skip, limit),
      this.shopRepository.countDocuments({})
    ]);

    return {
      shops,
      total,
      page,
      limit
    };
  }

  async updateShopStatus(shopId: string, isActive: boolean): Promise<ShopResponseDTO> {
    this.validateShopId(shopId);
    const updatedShop = await this.shopRepository.updateShopStatus(shopId, isActive);
    if (!updatedShop) {
      throw new CustomError('Shop not found', HTTP_STATUS.NOT_FOUND);
    }
    return updatedShop;
  }

  async getShopSubscription(shopId: string): Promise<string> {
    this.validateShopId(shopId);
    const shop = await this.shopRepository.findById(shopId);
    if (!shop) {
      throw new CustomError('Shop not found', HTTP_STATUS.NOT_FOUND);
    }
    return shop.subscription?.plan || 'free';
  }

  async updateShopSubscription(
    shopId: string,
    subscriptionData: {
      subscriptionId?: string | null;
      plan: string;
      subscriptionStart?: Date;
      subscriptionEnd?: Date;
      isActive?: boolean;
    }
  ): Promise<ShopResponseDTO> {
    this.validateShopId(shopId);

    if (!subscriptionData.plan) {
      throw new CustomError('Subscription plan is required', HTTP_STATUS.BAD_REQUEST);
    }

    const updatedShop = await this.shopRepository.updateShopSubscription(shopId, {
      subscriptionId: subscriptionData.subscriptionId || null,
      plan: subscriptionData.plan,
      subscriptionStart: subscriptionData.subscriptionStart,
      subscriptionEnd: subscriptionData.subscriptionEnd,
      isActive: subscriptionData.isActive ?? true
    });

    if (!updatedShop) {
      throw new CustomError('Shop not found', HTTP_STATUS.NOT_FOUND);
    }
    return updatedShop;
  }

  async getUnverifiedShops(page: number = 1, limit: number = 10): Promise<{ shops: ShopResponseDTO[], total: number, page: number, limit: number }> {
    const skip = (page - 1) * limit;
    const [shops, total] = await Promise.all([
      this.shopRepository.getUnverifiedShops(skip, limit),
      this.shopRepository.countDocuments({ isVerified: 'pending' })
    ]);

    return {
      shops,
      total,
      page,
      limit
    };
  }

  async approveShop(shopId: string): Promise<ShopResponseDTO> {
    this.validateShopId(shopId);
    const approvedShop = await this.shopRepository.updateShopVerification(shopId, 'approved');
    if (!approvedShop) {
      throw new CustomError('Shop not found', HTTP_STATUS.NOT_FOUND);
    }
    return approvedShop;
  }

  async rejectShop(shopId: string, rejectionReason?: string): Promise<ShopResponseDTO> {
    this.validateShopId(shopId);

    const shop = await this.shopRepository.findById(shopId);
    if (!shop) {
      throw new CustomError('Shop not found', HTTP_STATUS.NOT_FOUND);
    }

    if (shop.isVerified.status === 'approved') {
      throw new CustomError('Shop is already approved', HTTP_STATUS.BAD_REQUEST);
    }

    // Validate rejection reason
    if (rejectionReason) {
      if (typeof rejectionReason !== 'string') {
        throw new CustomError('Rejection reason must be a string', HTTP_STATUS.BAD_REQUEST);
      }
      if (rejectionReason.trim().length < 5) {
        throw new CustomError('Rejection reason must be at least 5 characters long', HTTP_STATUS.BAD_REQUEST);
      }
      if (rejectionReason.length > 500) {
        throw new CustomError('Rejection reason must be less than 500 characters', HTTP_STATUS.BAD_REQUEST);
      }
    }

    const updatedShop = await this.shopRepository.updateShopVerification(
      shopId,
      'rejected',
      rejectionReason?.trim()
    );

    if (!updatedShop) {
      throw new CustomError('Failed to reject shop', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return updatedShop;
  }

  async updateShopProfile(shopId: string, updateData: UpdateShopDTO): Promise<ShopResponseDTO> {
    this.validateShopId(shopId);
    this.validateShopData(updateData);

    const updatedShop = await this.shopRepository.updateShop(shopId, updateData);
    if (!updatedShop) {
      throw new CustomError('Shop not found', HTTP_STATUS.NOT_FOUND);
    }
    return updatedShop as ShopResponseDTO;
  }

  async getShopsOverview(): Promise<{ totalShops: number; activeShops: number; inactiveShops: number; pendingShops: number }> {
    return await this.shopRepository.getShopsOverview();
  }
}