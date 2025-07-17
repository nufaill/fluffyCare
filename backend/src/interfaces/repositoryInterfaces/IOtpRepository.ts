import { IOtp } from '../../models/otpModel';
import { CreateUserDTO, CreateShopDTO } from '../../dto/auth.dto';

export interface IOtpRepository {
    createOtp(email: string, otp: string, userData: CreateUserDTO | CreateShopDTO): Promise<IOtp>;
    findByEmail(email: string): Promise<IOtp | null>;
    verifyOtp(email: string, otp: string): Promise<{ isValid: boolean; userData?: CreateUserDTO; isExpired?: boolean; maxAttemptsReached?: boolean;}>;
    deleteOtp(email: string): Promise<void>;
    cleanupExpired(): Promise<void>;
    getOtpInfo(email: string): Promise<{ attempts: number; expiresAt: Date; exists: boolean } | null>;
}