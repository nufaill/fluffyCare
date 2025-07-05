
// userInjection.ts 
import { UserController } from "../controllers/user/user.controller";
import { AuthService } from "../services/user/authService";
import { UserRepository } from "../repositories/userRepository";
import { JwtService } from "../services/jwt/jwtService";
import { GoogleAuthService } from "../services/googleAuth/googleService";
import { EmailService } from "../services/emailService/emailService";
import { OtpRepository } from "../repositories/otpRepository";
import { AuthMiddleware } from 'middlewares/auth.middleware';

// Initialize repositories
const userRepository = new UserRepository();
const otpRepository = new OtpRepository();

// Initialize services
const jwtService = new JwtService();
const googleAuthService = new GoogleAuthService();
const emailService = new EmailService();
const authMiddlewareInstance = new AuthMiddleware(jwtService);

const authMiddleware = authMiddlewareInstance;


const authService = new AuthService(
  userRepository,
  jwtService,
  googleAuthService,
  emailService,
  otpRepository
);

// Initialize controller with dependencies
const injectedUserController = new UserController(userRepository);

// Export for route usage
export const userDependencies = {
  userController: injectedUserController,
  authService,
  userRepository,
  jwtService,
  authMiddleware
};