import { UserController } from "../controllers/user/user.controller";
import { UserService } from "../services/user/user.service";
import { AuthService } from "../services/user/auth.service";
import { NearbyShopsService } from "../services/user/nearby.service";
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
import { NearbyRepository } from "../repositories/user/nearby.repository";
import { NotificationRepository } from "../repositories/notifications/notifications.repository";
import { NotificationService } from "../services/notifications/notification.service";
import { NotificationController } from "../controllers/notifications/notifications.controller";

// Initialize repositories
const userRepository = new UserRepository();
const petRepository = new PetRepository();
const staffRepository = new StaffRepository();
const shopRepository = new ShopRepository();
const walletRepository = new WalletRepository();
const reviewRepository = new ReviewRepository();
const nearbyRepository = new NearbyRepository();
const notificationRepository = new NotificationRepository();

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
const nearbyService = new NearbyShopsService(nearbyRepository);
const staffService = new StaffService(staffRepository);
const shopAvailabilityService = new ShopAvailabilityService(shopRepository);
const shopService = new ShopService(shopRepository);
const walletService = new WalletService(walletRepository);
const reviewService = new ReviewService(reviewRepository);
const notificationService = new NotificationService(notificationRepository);

// Initialize controllers
const injectedUserController = new UserController(userService, nearbyService);
const petController = new PetController(petService);
const injectedStaffController = new StaffController(staffService);
const shopController = new ShopController(shopService, shopAvailabilityService, walletService);
const reviewController = new ReviewController(reviewService)
const notificationController = new NotificationController(notificationService)

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
  reviewController,
  notificationController
};