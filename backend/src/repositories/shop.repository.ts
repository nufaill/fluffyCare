import { Shop } from '../models/shopModel';
import { CreateShopData, ShopDocument } from '../types/Shop.types';
import { Types } from 'mongoose';
import IShopRepository from '../interfaces/repositoryInterfaces/IShopRepository';
import { BaseRepository } from './base-repository/base.repository';

export class ShopRepository extends BaseRepository<any> implements IShopRepository {
  constructor() {
    super(Shop);
  }

  async findByEmail(email: string): Promise<ShopDocument | null> {
    return await this.findOne({ email }).exec();
  }

  async findById(id: string): Promise<ShopDocument | null> {
    return await super.findById(id);
  }

  async createShop(data: CreateShopData): Promise<ShopDocument> {
    return await this.create(data);
  }

  async updateShop(id: string, updateData: Partial<CreateShopData>): Promise<ShopDocument | null> {
    return await this.updateById(id, { $set: updateData }).exec();
  }

  async existsByEmail(email: string): Promise<boolean> {
    return await this.exists({ email });
  }

  async setResetToken(email: string, token: string, expires: Date): Promise<ShopDocument | null> {
    return await this.update(
      { email },
      {
        resetPasswordToken: token,
        resetPasswordExpires: expires
      }
    ).exec();
  }

  async findByResetToken(token: string): Promise<ShopDocument | null> {
    return await this.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    }).exec();
  }

  async updatePasswordAndClearToken(shopId: Types.ObjectId, hashedPassword: string): Promise<ShopDocument | null> {
    return await this.updateById(
      shopId.toString(),
      {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      }
    ).exec();
  }

  async getAllShops(): Promise<ShopDocument[]> {
    return await this.find({})
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateShopStatus(shopId: string, isActive: boolean): Promise<ShopDocument | null> {
    return await this.updateById(shopId, { isActive })
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .exec();
  }

  async getUnverifiedShops(): Promise<ShopDocument[]> {
    return await this.find({ isVerified: false })
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateShopVerification(shopId: string, isVerified: boolean): Promise<ShopDocument | null> {
    return await this.updateById(shopId, { isVerified })
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .exec();
  }

  async checkShopNameExists(name: string, excludeShopId?: string): Promise<boolean> {
    const query = excludeShopId
      ? { name: { $regex: `^${name}$`, $options: 'i' }, _id: { $ne: excludeShopId } }
      : { name: { $regex: `^${name}$`, $options: 'i' } };
    return await this.exists(query);
  }
}