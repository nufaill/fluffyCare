// adminInjection.ts
import { AdminAuthController } from "../controllers/admin/admin.controller";
import { ShopController } from "../controllers/shop/shop.controller";
import { UserController } from "../controllers/user/user.controller";
import { PetTypeController } from "../controllers/pet/petType.controller";
import { ServiceTypeController } from "@controllers/service/serviceType.controller";
import { AuthService as AdminAuthService } from "../services/admin/admin.service";
import { ShopService } from "../services/shop/shop.service";
import { UserService } from "../services/user/user.service";
import { ShopRepository } from "../repositories/shop/shop.repository";
import { UserRepository } from "../repositories/user/user.repository";
import { AdminRepository } from "../repositories/admin/admin.repository";
import { PetTypeRepository } from "../repositories/pet/petType.repository";
import { ServiceTypeRepository } from "repositories/service/serviceType.repository";
import { PetTypeService } from "../services/pet/petType.service";
import { ServiceTypeService } from "services/service/serviceType.service";
import { JwtService } from "../services/jwt/jwt.service";
import { AuthMiddleware } from 'middlewares/auth.middleware';
import { IAdminService } from "../interfaces/serviceInterfaces/IAdminService";
import { WalletService } from "../services/wallet/wallet.service";
import { WalletRepository } from "../repositories/wallet/wallet.repository";
import { ShopAvailabilityService } from "../services/shop/shopAvailability.service";
import { SubscriptionRepository } from '../repositories/subscription/subscription.repository';
import { SubscriptionService } from '../services/subscription/subscription.service';
import { SubscriptionController } from './../controllers/subscription/subscription.controller';
import { NearbyService } from "../services/user/nearby.service";
import { ReviewController } from '../controllers/review/review.controller';
import { ReviewService } from "../services/review/review.service";
import { ReviewRepository } from "../repositories/review/review.repository";

// Initialize repositories
const shopRepository = new ShopRepository();
const userRepository = new UserRepository();
const adminRepository = new AdminRepository();
const petTypeRepository = new PetTypeRepository();
const serviceTypeRepository = new ServiceTypeRepository();
const walletRepository = new WalletRepository();
const subscriptionRepository = new SubscriptionRepository();
const reviewRepository = new ReviewRepository();

// Initialize services
const jwtService = new JwtService();
const adminAuthService: IAdminService = new AdminAuthService(adminRepository, jwtService);
const shopService = new ShopService(shopRepository);
const userService = new UserService(userRepository);
const petTypeService = new PetTypeService(petTypeRepository);
const serviceService = new ServiceTypeService(serviceTypeRepository);
const walletService = new WalletService(walletRepository);
const nearbyService = new NearbyService(shopRepository);
const shopAvailabilityService = new ShopAvailabilityService(shopRepository);
const subscriptionService = new SubscriptionService(subscriptionRepository);
const reviewService = new ReviewService(reviewRepository);

const authMiddlewareInstance = new AuthMiddleware(jwtService);
const authMiddleware = authMiddlewareInstance;

// Initialize controllers with dependencies
const injectedAdminAuthController = new AdminAuthController(adminAuthService);
const injectedShopController = new ShopController(shopService, shopAvailabilityService, walletService);
const injectedUserController = new UserController(userService, nearbyService);
const injectedPetTypeController = new PetTypeController(petTypeService);
const injectedServiceController = new ServiceTypeController(serviceService);
const injectedSubscriptionController = new SubscriptionController(subscriptionService);
const reviewController = new ReviewController(reviewService)

// Bind controller methods to their instances
export const adminDependencies = {
  adminAuthController: {
    login: injectedAdminAuthController.login.bind(injectedAdminAuthController),
    logout: injectedAdminAuthController.logout.bind(injectedAdminAuthController),
  },
  shopController: {
    getAllShops: injectedShopController.getAllShops.bind(injectedShopController),
    getShopsOverview: injectedShopController.getShopsOverview.bind(injectedShopController),
    updateShopStatus: injectedShopController.updateShopStatus.bind(injectedShopController),
    getUnverifiedShops: injectedShopController.getUnverifiedShops.bind(injectedShopController),
    approveShop: injectedShopController.approveShop.bind(injectedShopController),
    rejectShop: injectedShopController.rejectShop.bind(injectedShopController),
  },
  userController: {
    getAllUsers: injectedUserController.getAllUsers.bind(injectedUserController),
    updateUserStatus: injectedUserController.updateUserStatus.bind(injectedUserController),
    getCustomerAnalytics: injectedUserController.getCustomerAnalytics.bind(injectedUserController)
  },
  petTypeController: {
    createPetType: injectedPetTypeController.createPetType.bind(injectedPetTypeController),
    getAllPetTypes: injectedPetTypeController.getAllPetTypes.bind(injectedPetTypeController),
    getPetTypeById: injectedPetTypeController.getPetTypeById.bind(injectedPetTypeController),
    updatePetType: injectedPetTypeController.updatePetType.bind(injectedPetTypeController),
    updatePetTypeStatus: injectedPetTypeController.updatePetTypeStatus.bind(injectedPetTypeController),
  },
  serviceController: {
    createServiceType: injectedServiceController.createServiceType.bind(injectedServiceController),
    getAllServiceTypes: injectedServiceController.getAllServiceTypes.bind(injectedServiceController),
    getServiceTypeById: injectedServiceController.getServiceTypeById.bind(injectedServiceController),
    updateServiceType: injectedServiceController.updateServiceType.bind(injectedServiceController),
    updateServiceTypeStatus: injectedServiceController.updateServiceTypeStatus.bind(injectedServiceController),
  },
  subscriptionController: injectedSubscriptionController,
  authMiddleware,
  userService,
  userRepository,
  reviewController
};