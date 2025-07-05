// adminInjection.ts
import { AdminAuthController } from "../controllers/admin/admin.controller";
import { ShopController } from "../controllers/shop/shop.controller";
import { UserController } from "../controllers/user/user.controller";
import { PetController } from "../controllers/pet.controller";
import { ServiceController } from "@controllers/service.controller";
import { AuthService as AdminAuthService } from "../services/admin/adminService";
import { ShopRepository } from "../repositories/shopRepository";
import { UserRepository } from "../repositories/userRepository";
import { PetRepository } from "../repositories/petRepository";
import { PetService } from "../services/petServices";
import { ServiceRepository } from "repositories/serviceRepository";
import { ServiceService } from "services/serviceServices";
import { JwtService } from "../services/jwt/jwtService";
import { AdminRepository } from "../repositories/adminRepository";
import { AuthMiddleware } from 'middlewares/auth.middleware';

// Initialize repositories
const shopRepository = new ShopRepository();
const userRepository = new UserRepository();
const adminRepository = new AdminRepository();
const petRepository = new PetRepository();
const serviceRepository = new ServiceRepository();

// Initialize services
const jwtService = new JwtService();
const adminAuthService = new AdminAuthService(adminRepository, jwtService);
const petService = new PetService(petRepository);
const serviceService = new ServiceService(serviceRepository)

const authMiddlewareInstance = new AuthMiddleware(jwtService);
const authMiddleware = authMiddlewareInstance;

// Initialize controllers with dependencies
const injectedAdminAuthController = new AdminAuthController(adminAuthService);
const injectedShopController = new ShopController(shopRepository);
const injectedUserController = new UserController(userRepository);
const injectedPetController = new PetController(petService);
const injectedServiceController = new ServiceController(serviceService)

// Export for route usage
export const adminDependencies = {
  adminAuthController: injectedAdminAuthController,
  shopController: injectedShopController,
  userController: injectedUserController,
  petController: injectedPetController,
  serviceController: injectedServiceController,
  authMiddleware
};