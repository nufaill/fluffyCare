
// userInjection.ts 
import { UserController } from "../controllers/user/user.controller";
import { AuthService } from "../services/user/authService";
import { UserRepository } from "../repositories/userRepository";
import { JwtService } from "../services/jwt/jwtService";
import { GoogleAuthService } from "../services/googleAuth/googleService";
import { EmailService } from "../services/emailService/emailService";
import { OtpRepository } from "../repositories/otpRepository";
import { AuthMiddleware } from 'middlewares/auth.middleware';
import { PetController } from "../controllers/pet.controller";
import { PetService } from "../services/petServices";
import { PetRepository } from "../repositories/petRepository";

// Initialize repositories
const userRepository = new UserRepository();
const otpRepository = new OtpRepository();
const petRepository = new PetRepository();

// Initialize services
const jwtService = new JwtService();
const googleAuthService = new GoogleAuthService();
const emailService = new EmailService();
const authMiddlewareInstance = new AuthMiddleware(jwtService);
const petService = new PetService(petRepository);

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
const petController = new PetController(petService);

// Export for route usage
export const userDependencies = {
  userController: injectedUserController,
  authService,
  userRepository,
  jwtService,
  authMiddleware,
   petController,
  petService,
  petRepository
};