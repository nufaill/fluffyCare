
// authInjection.ts 
import { AuthController } from "../controllers/user/auth.controller";
import { UserRepository } from "../repositories/user.repository";
import { AuthService } from "../services/user/auth.service";
import { JwtService } from "../services/jwt/jwt.service";
import { GoogleAuthService } from "../services/googleAuth/google.service"; 
import { EmailService } from "../services/emailService/email.service";
import { OtpRepository } from "../repositories/otp.repository";

// Initialize repositories
const userRepository = new UserRepository();
const otpRepository = new OtpRepository();

// Initialize services
const jwtService = new JwtService();
const googleAuthService = new GoogleAuthService();
const emailService = new EmailService();

const authService = new AuthService(
  userRepository,
  jwtService,
  googleAuthService,
  emailService,
  otpRepository
);

// Initialize controller with dependencies
export const injectedAuthController = new AuthController(authService);

// Export for route usage
export const authDependencies = {
  authController: injectedAuthController,
  authService,
  userRepository,
  jwtService
};
