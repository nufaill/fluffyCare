// adminInjection.ts
import { AdminAuthController } from "../controllers/admin/admin.controller";
import { ShopController } from "../controllers/shop/shop.controller";
import { UserController } from "../controllers/user/user.controller";
import { PetTypeController } from "../controllers/pet/petType.controller";
import { ServiceController } from "@controllers/service/serviceType.controller";
import { AuthService as AdminAuthService } from "../services/admin/admin.service";
import { ShopRepository } from "../repositories/shop.repository";
import { UserRepository } from "../repositories/user.repository";
import { PetTypeRepository } from "../repositories/petType.repository";
import { PetTypeService } from "../services/pet/petType.service";
import { ServiceTypeRepository } from "repositories/serviceType.repository";
import { ServiceTypeService } from "services/service/serviceType.service";
import { JwtService } from "../services/jwt/jwt.service";
import { AdminRepository } from "../repositories/admin.repository";
import { AuthMiddleware } from 'middlewares/auth.middleware';

// Initialize repositories
const shopRepository = new ShopRepository();
const userRepository = new UserRepository();
const adminRepository = new AdminRepository();
const petTypeRepository = new PetTypeRepository();
const serviceTypeRepository = new ServiceTypeRepository();

// Initialize services
const jwtService = new JwtService();
const adminAuthService = new AdminAuthService(adminRepository, jwtService);
const petTypeService = new PetTypeService(petTypeRepository);
const serviceService = new ServiceTypeService(serviceTypeRepository)

const authMiddlewareInstance = new AuthMiddleware(jwtService);
const authMiddleware = authMiddlewareInstance;

// Initialize controllers with dependencies
const injectedAdminAuthController = new AdminAuthController(adminAuthService);
const injectedShopController = new ShopController(shopRepository);
const injectedUserController = new UserController(userRepository);
const injectedPetTypeController = new PetTypeController(petTypeService);
const injectedServiceController = new ServiceController(serviceService)

// Export for route usage
export const adminDependencies = {
  adminAuthController: injectedAdminAuthController,
  shopController: injectedShopController,
  userController: injectedUserController,
  petTypeController: injectedPetTypeController,
  serviceController: injectedServiceController,
  authMiddleware
};