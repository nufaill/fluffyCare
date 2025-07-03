
// authInjection.ts 
import { AuthController } from "../controllers/user/auth.controller";
import { UserRepository } from "../repositories/userRepository";
import { AuthService } from "../services/user/authService";
import { JwtService } from "../services/jwt/jwtService";
import { GoogleAuthService } from "../services/googleAuth/googleService"; 
import { EmailService } from "../services/emailService/emailService";
import { OtpRepository } from "../repositories/otpRepository";

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
