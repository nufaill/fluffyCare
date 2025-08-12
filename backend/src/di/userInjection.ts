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
import { StaffController } from '../controllers/shop/staff.controller';
import { StaffRepository } from '../repositories/staff.repository';
import { StaffService } from '../services/shop/staff.service';
import { SlotService } from "../services/shop/slot.service";
import { ShopAvailabilityService } from "../services/shop/shopAvailability.service";
import { SlotRepository } from "../repositories/slot.repository";
import { jwtService, googleAuthService, emailService, otpRepository } from "./authInjection";
import { ShopController } from "../controllers/shop/shop.controller";
import { ShopService } from "../services/shop/shop.service";

// Initialize repositories
const userRepository = new UserRepository();
const petRepository = new PetRepository();
const slotRepository = new SlotRepository();
const staffRepository = new StaffRepository();
const shopRepository = new ShopRepository();

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
const nearbyService = new NearbyService(shopRepository);
const staffService = new StaffService(staffRepository);
const shopAvailabilityService = new ShopAvailabilityService(shopRepository);
const shopService = new ShopService(shopRepository);
const slotService = new SlotService(slotRepository);

// Initialize controllers
const injectedUserController = new UserController(userService, nearbyService);
const petController = new PetController(petService);
const slotController = new SlotController(slotService);
const injectedStaffController = new StaffController(staffService);
const shopController = new ShopController(shopService, shopAvailabilityService);

// Bind slot controller methods
const boundSlotController = {
  getslotByShopId: slotController.getslotByShopId.bind(slotController),
  findByShopAndDateRange: slotController.findByShopAndDateRange.bind(slotController),
};

const boundStaffController = {
  findById: injectedStaffController.findById.bind(injectedStaffController),
  getAllStaff: injectedStaffController.getAllStaff.bind(injectedStaffController)
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
  slotController: boundSlotController,
  slotService,
  slotRepository,
  shopController,
  staffController:boundStaffController,
  staffService,
  staffRepository,
};
