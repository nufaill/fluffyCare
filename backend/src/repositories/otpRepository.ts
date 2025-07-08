// backend/src/repositories/otpRepository.ts
import { OtpModel, IOtp } from '../models/otpModel';
import bcrypt from 'bcrypt';

export class OtpRepository {
  async createOtp(email: string, otp: string, userData: any): Promise<IOtp> {
   
    const saltRounds = 10;
    const otpHash = await bcrypt.hash(otp, saltRounds);

    const deleteResult = await OtpModel.deleteMany({ email });
    const otpDoc = new OtpModel({
      email: email.toLowerCase().trim(),
      otpHash,
      userData,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      attempts: 0, 
    });

    const savedOtp = await otpDoc.save();
    return savedOtp;
  }

  async findByEmail(email: string): Promise<IOtp | null> {
    const otpDoc = await OtpModel.findOne({ 
      email: email.toLowerCase().trim(),
      expiresAt: { $gt: new Date() }
    });

    return otpDoc;
  }

  async verifyOtp(email: string, otp: string): Promise<{ 
    isValid: boolean; 
    userData?: any; 
    isExpired?: boolean; 
    maxAttemptsReached?: boolean 
  }> {
    const normalizedEmail = email.toLowerCase().trim();
    const otpDoc = await OtpModel.findOne({ email: normalizedEmail });

    if (!otpDoc) {
      console.log(`❌ [OtpRepository] No OTP document found for ${normalizedEmail}`);
      return { isValid: false };
    }

    if (otpDoc.expiresAt < new Date()) {
      console.log(`⏰ [OtpRepository] OTP expired for ${normalizedEmail}`);
      await OtpModel.deleteOne({ email: normalizedEmail });
      return { isValid: false, isExpired: true };
    }

    if (otpDoc.attempts >= 3) {
      console.log(`🚫 [OtpRepository] Max attempts (${otpDoc.attempts}) reached for ${normalizedEmail}`);
      await OtpModel.deleteOne({ email: normalizedEmail });
      return { isValid: false, maxAttemptsReached: true };
    }
    const isValid = await bcrypt.compare(otp.toString(), otpDoc.otpHash);

    if (isValid) {
      const userData = otpDoc.userData;
      await OtpModel.deleteOne({ email: normalizedEmail });
      return { isValid: true, userData };
    } else {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return { isValid: false };
    }
  }

  async deleteOtp(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    
    const deleteResult = await OtpModel.deleteMany({ email: normalizedEmail });
    console.log(`✅ [OtpRepository] Deleted ${deleteResult.deletedCount} OTP records for ${normalizedEmail}`);
  }

  
  async cleanupExpired(): Promise<void> {
    
    const deleteResult = await OtpModel.deleteMany({ 
      expiresAt: { $lt: new Date() } 
    });
  }

  
  async getOtpInfo(email: string): Promise<{ attempts: number; expiresAt: Date; exists: boolean } | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const otpDoc = await OtpModel.findOne({ email: normalizedEmail });
    
    if (!otpDoc) {
      return null;
    }

    return {
      attempts: otpDoc.attempts,
      expiresAt: otpDoc.expiresAt,
      exists: true
    };
  }
}