import { Shop } from '../models/shopModel';
import { CreateShopData, ShopDocument } from '../types/Shop.types';
import { Types } from 'mongoose';
export class ShopRepository {
  async findByEmail(email: string): Promise<ShopDocument | null> {
    const shop = await Shop.findOne({ email });
    return shop;
  }
  async findById(id: string): Promise<ShopDocument | null> {
    return await Shop.findById(id);
  }
  async createShop(data: CreateShopData): Promise<ShopDocument> {
      const shop = new Shop(data);
      return await shop.save();
    }
  
    async updateShop(id: string, updateData: Partial<CreateShopData>): Promise<ShopDocument | null> {
      return await Shop.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    }
  
    async existsByEmail(email: string): Promise<boolean> {
      const shop = await Shop.findOne({ email });
      return !!shop;
    }
    async setResetToken(email: string, token: string, expires: Date): Promise<ShopDocument | null> {
        console.log("🔧 [ShopRepository] Setting reset token for email:", email);
        return await Shop.findOneAndUpdate(
          { email }, 
          {
            resetPasswordToken: token,
            resetPasswordExpires: expires
          },
          { new: true }
        );
      }
    
      async findByResetToken(token: string): Promise<ShopDocument | null> {
        console.log("🔧 [ShopRepository] Finding user by reset token");
        return await Shop.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: new Date() } });
      }
    
      async updatePasswordAndClearToken(userId: Types.ObjectId, hashedPassword: string): Promise<ShopDocument | null> {
        console.log("🔧 [ShopRepository] Updating password and clearing reset token");
        return await Shop.findByIdAndUpdate(
          userId, 
          {
            password: hashedPassword,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined,
          },
          { new: true }
        );
      }
}
