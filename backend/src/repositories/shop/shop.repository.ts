import { Shop } from '../../models/shop.model';
import { CreateShopData, ShopDocument } from '../../types/Shop.types';
import { Types } from 'mongoose';
import { UpdateShopDTO, ShopResponseDTO } from '../../dto/shop.dto';
import IShopRepository from '../../interfaces/repositoryInterfaces/IShopRepository';
import { BaseRepository } from '../base-repository/base.repository';

export class ShopRepository extends BaseRepository<any> implements IShopRepository {
  constructor() {
    super(Shop);
  }

  private mapToResponseDTO(shop: ShopDocument): ShopResponseDTO {
    return {
      id: shop._id.toString(),
      name: shop.name,
      email: shop.email,
      phone: shop.phone,
      city: shop.city,
      streetAddress: shop.streetAddress,
      logo: shop.logo,
      description: shop.description,
      certificateUrl: shop.certificateUrl,
      isActive: shop.isActive,
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt,
      isVerified: shop.isVerified,
      subscription: shop.subscription,
      shopAvailability: shop.shopAvailability
        ? {
          workingDays: shop.shopAvailability.workingDays,
          openingTime: shop.shopAvailability.openingTime,
          closingTime: shop.shopAvailability.closingTime,
          lunchBreak: shop.shopAvailability.lunchBreak
            ? {
              start: shop.shopAvailability.lunchBreak.start || '',
              end: shop.shopAvailability.lunchBreak.end || '',
            }
            : undefined,
          teaBreak: shop.shopAvailability.teaBreak
            ? {
              start: shop.shopAvailability.teaBreak.start || '',
              end: shop.shopAvailability.teaBreak.end || '',
            }
            : undefined,
          customHolidays: shop.shopAvailability.customHolidays || [],
        }
        : undefined,
      subscriptionHistory: shop.subscriptionHistory
        ? shop.subscriptionHistory.map(h => ({
          subscriptionId: h.subscriptionId ? h.subscriptionId.toString() : null,
          plan: h.plan,
          start: h.start,
          end: h.end,
        }))
        : [],
    };
  }

  async findById(id: string): Promise<ShopResponseDTO | null> {
    const shop = await this.checkAndExpireSubscription(id);
    return shop ? this.mapToResponseDTO(shop) : null;
  }

  async findByEmail(email: string): Promise<ShopResponseDTO | null> {
    const shop = await this.findOne({ email }).exec();
    return shop ? this.mapToResponseDTO(shop) : null;
  }

  async findByEmailWithPassword(email: string): Promise<ShopDocument | null> {
    return await this.findOne({ email }).exec();
  }

  // async findById(id: string): Promise<ShopResponseDTO | null> {
  //   const shop = await super.findById(id);
  //   return shop ? this.mapToResponseDTO(shop) : null;
  // }

  async createShop(data: CreateShopData): Promise<ShopResponseDTO> {
    const shop = await this.create(data);
    return this.mapToResponseDTO(shop);
  }

  async updateShop(id: string, updateData: Partial<CreateShopData>): Promise<UpdateShopDTO | null> {
    const updatedShop = await this.updateById(id, { $set: updateData }).exec();
    return updatedShop ? this.mapToResponseDTO(updatedShop) : null;
  }

  async updateShopSubscription(id: string, subscriptionData: {
    subscriptionId: string | null;
    plan: string;
    subscriptionStart?: Date;
    subscriptionEnd?: Date;
    isActive?: boolean;
  }): Promise<ShopResponseDTO | null> {
    await this.checkAndExpireSubscription(id);
    const shop = await this.model.findById(id).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!shop) return null;

    if (shop.subscription.plan !== 'free') {
      shop.subscriptionHistory.push({
        subscriptionId: shop.subscription.subscriptionId,
        plan: shop.subscription.plan,
        start: shop.subscription.subscriptionStart,
        end: shop.subscription.subscriptionEnd,
      });
    }

    shop.subscription.subscriptionId = subscriptionData.subscriptionId ? new Types.ObjectId(subscriptionData.subscriptionId) : null;
    shop.subscription.plan = subscriptionData.plan;
    shop.subscription.subscriptionStart = subscriptionData.subscriptionStart;
    shop.subscription.subscriptionEnd = subscriptionData.subscriptionEnd;
    shop.subscription.isActive = subscriptionData.isActive ?? true;

    await shop.save();
    return this.mapToResponseDTO(shop);
  }

  async existsByEmail(email: string): Promise<boolean> {
    return await this.exists({ email });
  }

  async setResetToken(email: string, token: string, expires: Date): Promise<ShopResponseDTO | null> {
    const updatedShop = await this.update(
      { email },
      {
        resetPasswordToken: token,
        resetPasswordExpires: expires
      }
    ).exec();
    return updatedShop ? this.mapToResponseDTO(updatedShop) : null;
  }

  async findByResetToken(token: string): Promise<ShopResponseDTO | null> {
    const shop = await this.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    }).exec();
    return shop ? this.mapToResponseDTO(shop) : null;
  }

  async updatePasswordAndClearToken(shopId: Types.ObjectId, hashedPassword: string): Promise<ShopResponseDTO | null> {
    const updatedShop = await this.updateById(
      shopId.toString(),
      {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      }
    ).exec();
    return updatedShop ? this.mapToResponseDTO(updatedShop) : null;
  }

  async getAllShops(skip: number = 0, limit: number = 10): Promise<ShopResponseDTO[]> {
    const shops = await this.find({})
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return shops.map(shop => this.mapToResponseDTO(shop));
  }

  async countDocuments(query: any = {}): Promise<number> {
    return await this.model.countDocuments(query).exec();
  }

  async updateShopStatus(shopId: string, isActive: boolean): Promise<ShopResponseDTO | null> {
    const updatedShop = await this.updateById(shopId, { isActive })
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .exec();
    return updatedShop ? this.mapToResponseDTO(updatedShop) : null;
  }

  async getUnverifiedShops(skip: number = 0, limit: number = 10): Promise<ShopResponseDTO[]> {
    const query = {
      'isVerified.status': { $in: ['pending', 'rejected'] }
    };

    const [shops, total] = await Promise.all([
      Shop.find(query)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      Shop.countDocuments(query).exec()
    ]);

    return shops.map(shop => this.mapToResponseDTO(shop));
  }

  async updateShopVerification(
    shopId: string,
    status: 'pending' | 'approved' | 'rejected',
    reason?: string
  ): Promise<ShopResponseDTO | null> {
    const updateData: any = { 'isVerified.status': status };

    if (status === 'rejected' && reason) {
      updateData['isVerified.reason'] = reason;
    } else if (status === 'approved') {
      updateData['isVerified.reason'] = null;
    }

    const updatedShop = await this.updateById(shopId, updateData)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .exec();
    return updatedShop ? this.mapToResponseDTO(updatedShop) : null;
  }

  async checkShopNameExists(name: string, excludeShopId?: string): Promise<boolean> {
    const query = excludeShopId
      ? { name: { $regex: `^${name}$`, $options: 'i' }, _id: { $ne: excludeShopId } }
      : { name: { $regex: `^${name}$`, $options: 'i' } };
    return await this.exists(query);
  }

  async findNearbyShops(longitude: number, latitude: number, maxDistance: number, filters: { serviceType?: string; petType?: string } = {}): Promise<ShopResponseDTO[]> {
    const query: any = {
      isActive: true,
      isVerified: 'approved',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistance,
        },
      },
    };

    if (filters.serviceType) {
      query.serviceType = filters.serviceType;
    }
    if (filters.petType) {
      query.petType = filters.petType;
    }

    const shops = await this.model
      .find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .exec();
    return shops.map(shop => this.mapToResponseDTO(shop));
  }

  async findShopsWithinRadius(longitude: number, latitude: number, radiusInMeters: number): Promise<ShopResponseDTO[]> {
    const shops = await this.model.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          distanceField: 'distance',
          maxDistance: radiusInMeters,
          spherical: true,
          query: {
            isActive: true,
            isVerified: 'approved'
          }
        }
      },
      {
        $project: {
          password: 0,
          resetPasswordToken: 0,
          resetPasswordExpires: 0
        }
      }
    ]);
    return shops.map(shop => this.mapToResponseDTO(shop));
  }

  async getShopsOverview(): Promise<{ totalShops: number; activeShops: number; inactiveShops: number; pendingShops: number }> {
    const [total, active, inactive, pending] = await Promise.all([
      this.countDocuments({}),
      this.countDocuments({ isActive: true }),
      this.countDocuments({ isActive: false }),
      this.countDocuments({ 'isVerified.status': 'pending' })
    ]);

    return {
      totalShops: total,
      activeShops: active,
      inactiveShops: inactive,
      pendingShops: pending
    };
  }
  async checkAndExpireSubscription(id: string): Promise<ShopDocument | null> {
    const shop = await this.model.findById(id);
    if (!shop) return null;

    const now = new Date();
    if (shop.subscription.subscriptionEnd && now > shop.subscription.subscriptionEnd && shop.subscription.plan !== 'free') {
      shop.subscriptionHistory.push({
        subscriptionId: shop.subscription.subscriptionId,
        plan: shop.subscription.plan,
        start: shop.subscription.subscriptionStart,
        end: shop.subscription.subscriptionEnd,
      });

      shop.subscription = {
        subscriptionId: null,
        subscriptionStart: null,
        subscriptionEnd: null,
        isActive: true,
        plan: 'free'
      };

      await shop.save();
    }

    return shop;
  }

  async expireAllSubscriptions(): Promise<void> {
    const now = new Date();
    const shops = await this.model.find({
      'subscription.subscriptionEnd': { $lt: now },
      'subscription.plan': { $ne: 'free' }
    });

    for (const shop of shops) {
      shop.subscriptionHistory.push({
        subscriptionId: shop.subscription.subscriptionId,
        plan: shop.subscription.plan,
        start: shop.subscription.subscriptionStart,
        end: shop.subscription.subscriptionEnd,
      });

      shop.subscription = {
        subscriptionId: null,
        subscriptionStart: null,
        subscriptionEnd: null,
        isActive: true,
        plan: 'free'
      };

      await shop.save();
    }
  }
}