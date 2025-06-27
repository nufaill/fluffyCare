// backend/src/repositories/otpRepository.ts
import { OtpModel, IOtp } from '../models/otpModel';
import bcrypt from 'bcrypt';

export class OtpRepository {
  async createOtp(email: string, otp: string, userData: any): Promise<IOtp> {
    console.log(`🔧 [OtpRepository] Creating OTP for email: ${email}`);
    
    // Hash the OTP before storing
    const saltRounds = 10;
    const otpHash = await bcrypt.hash(otp, saltRounds);
    console.log(`🔐 [OtpRepository] OTP hashed successfully`);

    // Remove any existing OTP for this email
    const deleteResult = await OtpModel.deleteMany({ email });
    console.log(`🗑️ [OtpRepository] Deleted ${deleteResult.deletedCount} existing OTP records for ${email}`);

    const otpDoc = new OtpModel({
      email: email.toLowerCase().trim(),
      otpHash,
      userData,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      attempts: 0, // Reset attempts for new OTP
    });

    const savedOtp = await otpDoc.save();
    console.log(`✅ [OtpRepository] OTP created successfully for ${email}, expires at: ${savedOtp.expiresAt}`);
    
    return savedOtp;
  }

  async findByEmail(email: string): Promise<IOtp | null> {
    console.log(`🔍 [OtpRepository] Finding OTP for email: ${email}`);
    
    const otpDoc = await OtpModel.findOne({ 
      email: email.toLowerCase().trim(),
      expiresAt: { $gt: new Date() } // Only return non-expired OTPs
    });

    if (otpDoc) {
      console.log(`✅ [OtpRepository] Found valid OTP for ${email}, attempts: ${otpDoc.attempts}`);
    } else {
      console.log(`❌ [OtpRepository] No valid OTP found for ${email}`);
    }

    return otpDoc;
  }

  async verifyOtp(email: string, otp: string): Promise<{ 
    isValid: boolean; 
    userData?: any; 
    isExpired?: boolean; 
    maxAttemptsReached?: boolean 
  }> {
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`🔍 [OtpRepository] Verifying OTP for email: ${normalizedEmail}`);
    console.log(`🔢 [OtpRepository] Received OTP: ${otp}`);

    const otpDoc = await OtpModel.findOne({ email: normalizedEmail });

    if (!otpDoc) {
      console.log(`❌ [OtpRepository] No OTP document found for ${normalizedEmail}`);
      return { isValid: false };
    }

    console.log(`📋 [OtpRepository] Found OTP document - Attempts: ${otpDoc.attempts}, Expires: ${otpDoc.expiresAt}`);

    // Check if expired
    if (otpDoc.expiresAt < new Date()) {
      console.log(`⏰ [OtpRepository] OTP expired for ${normalizedEmail}`);
      await OtpModel.deleteOne({ email: normalizedEmail });
      return { isValid: false, isExpired: true };
    }

    // Check attempts limit BEFORE incrementing
    if (otpDoc.attempts >= 3) {
      console.log(`🚫 [OtpRepository] Max attempts (${otpDoc.attempts}) reached for ${normalizedEmail}`);
      await OtpModel.deleteOne({ email: normalizedEmail });
      return { isValid: false, maxAttemptsReached: true };
    }

    // Verify OTP first, then increment attempts
    console.log(`🔐 [OtpRepository] Comparing OTP with hash...`);
    const isValid = await bcrypt.compare(otp.toString(), otpDoc.otpHash);
    console.log(`🔍 [OtpRepository] OTP comparison result: ${isValid}`);

    if (isValid) {
      // OTP is valid, return user data and cleanup
      const userData = otpDoc.userData;
      console.log(`✅ [OtpRepository] OTP verified successfully for ${normalizedEmail}`);
      await OtpModel.deleteOne({ email: normalizedEmail });
      console.log(`🗑️ [OtpRepository] OTP document deleted after successful verification`);
      return { isValid: true, userData };
    } else {
      // Increment attempts only after failed verification
      otpDoc.attempts += 1;
      await otpDoc.save();
      console.log(`❌ [OtpRepository] Invalid OTP for ${normalizedEmail}, attempts now: ${otpDoc.attempts}`);
      return { isValid: false };
    }
  }

  async deleteOtp(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`🗑️ [OtpRepository] Deleting OTP for email: ${normalizedEmail}`);
    
    const deleteResult = await OtpModel.deleteMany({ email: normalizedEmail });
    console.log(`✅ [OtpRepository] Deleted ${deleteResult.deletedCount} OTP records for ${normalizedEmail}`);
  }

  // Cleanup expired OTPs (optional, as MongoDB TTL will handle this)
  async cleanupExpired(): Promise<void> {
    console.log(`🧹 [OtpRepository] Cleaning up expired OTPs...`);
    
    const deleteResult = await OtpModel.deleteMany({ 
      expiresAt: { $lt: new Date() } 
    });
    
    console.log(`✅ [OtpRepository] Cleaned up ${deleteResult.deletedCount} expired OTP records`);
  }

  // Get OTP attempts for debugging
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