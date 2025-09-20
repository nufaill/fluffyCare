import { UserController } from "../controllers/user/user.controller";
import { UserService } from "../services/user/user.service";
import { AuthService } from "../services/user/auth.service";
import { NearbyService } from "../services/user/nearby.service";
import { UserRepository } from "../repositories/user/user.repository";
import { ShopRepository } from "../repositories/shop/shop.repository";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { PetController } from "../controllers/pet/pet.controller";
import { PetService } from "../services/pet/pet.service";
import { PetRepository } from "../repositories/pet/pet.repository";
import { StaffController } from "../controllers/shop/staff.controller";
import { StaffRepository } from "../repositories/shop/staff.repository";
import { StaffService } from "../services/shop/staff.service";
import { ShopAvailabilityService } from "../services/shop/shopAvailability.service";
import { WalletService } from "../services/wallet/wallet.service";
import { WalletRepository } from "../repositories/wallet/wallet.repository";
import { jwtService, googleAuthService, emailService, otpRepository } from "./authInjection";
import { ShopController } from "../controllers/shop/shop.controller";
import { ShopService } from "../services/shop/shop.service";
import { ReviewController } from '../controllers/review/review.controller';
import { ReviewService } from "../services/review/review.service";
import { ReviewRepository } from "../repositories/review/review.repository";

// Initialize repositories
const userRepository = new UserRepository();
const petRepository = new PetRepository();
const staffRepository = new StaffRepository();
const shopRepository = new ShopRepository();
const walletRepository = new WalletRepository();
const reviewRepository = new ReviewRepository();

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
const walletService = new WalletService(walletRepository);
const reviewService = new ReviewService(reviewRepository);

// Initialize controllers
const injectedUserController = new UserController(userService, nearbyService);
const petController = new PetController(petService);
const injectedStaffController = new StaffController(staffService);
const shopController = new ShopController(shopService, shopAvailabilityService, walletService);
const reviewController = new ReviewController(reviewService)

const boundPetController = {
  createPet: petController.createPet.bind(petController),
  getAllPetTypes: petController.getAllPetTypes.bind(petController),
  getPetsByUserId: petController.getPetsByUserId.bind(petController),
  getPetById: petController.getPetById.bind(petController),
  updatePet: petController.updatePet.bind(petController),
  getPetWithBookings: petController.getPetWithBookings.bind(petController),
};


const boundStaffController = {
  findById: injectedStaffController.findById.bind(injectedStaffController),
  getAllStaff: injectedStaffController.getAllStaff.bind(injectedStaffController),
};

export const userDependencies = {
  userController: injectedUserController,
  authService,
  userRepository,
  userService,
  jwtService,
  authMiddleware,
  petController: boundPetController,
  petService,
  petRepository,
  nearbyService,
  shopController,
  staffController: boundStaffController,
  staffService,
  staffRepository,
  walletService,
  reviewController
};