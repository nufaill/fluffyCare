// authInjection.ts
import { AuthController } from "../controllers/user/auth.controller";
import { UserRepository } from "../repositories/user/user.repository";
import { AuthService } from "../services/user/auth.service";
import { JwtService } from "../services/jwt/jwt.service";
import { GoogleAuthService } from "../services/googleAuth/google.service";
import { EmailService } from "../services/emailService/email.service";
import { OtpRepository } from "../repositories/otp.repository";

// Initialize shared services
export const jwtService = new JwtService();
export const googleAuthService = new GoogleAuthService();
export const emailService = new EmailService();

// Initialize repositories
const userRepository = new UserRepository();
export const otpRepository = new OtpRepository();

// Initialize auth service
const authService = new AuthService(
  userRepository,
  jwtService,
  googleAuthService,
  emailService,
  otpRepository
);

// Initialize controller
export const injectedAuthController = new AuthController(authService);

export const authDependencies = {
  authController: injectedAuthController,
  authService,
  userRepository,
  jwtService,
  googleAuthService,
  emailService,
  otpRepository,
};