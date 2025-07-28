// userInjection.ts
import { UserController } from "../controllers/user/user.controller";
import { UserService } from "../services/user/user.service";
import { AuthService } from "../services/user/auth.service";
import { NearbyService } from "../services/user/nearby.service";
import { UserRepository } from "../repositories/user.repository";
import { ShopRepository } from "../repositories/shop.repository";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { PetController } from "../controllers/pet/pet.controller";
import { PetService } from "../services/pet/pet.service";
import { PetRepository } from "../repositories/pet.repository";
import { SlotController } from "../controllers/shop/slot.controller";
import { SlotService } from "../services/shop/slot.service";
import { SlotRepository } from "../repositories/slot.repository";
import { jwtService, googleAuthService, emailService, otpRepository } from "./authInjection";

// Initialize repositories
const userRepository = new UserRepository();
const petRepository = new PetRepository();
const slotRepository = new SlotRepository();

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
const shopRepository = new ShopRepository();
const nearbyService = new NearbyService(shopRepository);
const slotService = new SlotService(slotRepository);

// Initialize controllers
const injectedUserController = new UserController(userService, nearbyService);
const petController = new PetController(petService);
const slotController = new SlotController(slotService);


const boundSlotController = {
  getslotByShopId: slotController.getslotByShopId.bind(slotController),
  findByShopAndDateRange: slotController.findByShopAndDateRange.bind(slotController),
};

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
  nearbyService,
  slotController:boundSlotController, 
  slotService,   
  slotRepository
};