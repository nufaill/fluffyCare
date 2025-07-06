// backend/src/services/shop/shopService.ts
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { ShopRepository } from '../../repositories/shopRepository';
import { JwtService } from '../jwt/jwt.service';
import { EmailService } from '../emailService/email.service';
import { OtpRepository } from '../../repositories/otpRepository';
import { JwtPayload } from '../../types/auth.types';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../shared/constant';
import { CustomError } from '../../util/CustomerError';
import { generateOtp, sendOtpEmail } from '../../util/sendOtp';
import PASSWORD_RESET_MAIL_CONTENT from '../../shared/mailTemplate';

export class ShopService {
  private readonly saltRounds = 12;

  constructor(
    private readonly shopRepository: ShopRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly otpRepository: OtpRepository
  ) {}

}