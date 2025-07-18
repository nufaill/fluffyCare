// userInjection.ts
import { UserController } from "../controllers/user/user.controller";
import { UserService } from "../services/user/user.service"; 
import { AuthService } from "../services/user/auth.service";
import { UserRepository } from "../repositories/user.repository";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { PetController } from "../controllers/pet/pet.controller";
import { PetService } from "../services/pet/pet.service";
import { PetRepository } from "../repositories/pet.repository";
import { jwtService, googleAuthService, emailService, otpRepository } from "./authInjection";

// Initialize repositories
const userRepository = new UserRepository();
const petRepository = new PetRepository();

// Initialize services
const authService = new AuthService(
  userRepository,
  jwtService,
  googleAuthService,
  emailService,
  otpRepository
);
const userService = new UserService(userRepository); 
const authMiddleware = new AuthMiddleware(jwtService);
const petService = new PetService(petRepository);

// Initialize controllers
const injectedUserController = new UserController(userService); 
const petController = new PetController(petService);

// Export for route usage
export const userDependencies = {
  userController: injectedUserController,
  authService,
  userRepository,
  userService,
  jwtService,
  authMiddleware,
  petController,
  petService,
  petRepository,
};