// adminInjection.ts
import { AdminAuthController } from "../controllers/admin/admin.controller";
import { ShopController } from "../controllers/shop/shop.controller";
import { UserController } from "../controllers/user/user.controller";
import { PetTypeController } from "../controllers/pet/petType.controller";
import { ServiceTypeController } from "@controllers/service/serviceType.controller";
import { AuthService as AdminAuthService } from "../services/admin/admin.service";
import { ShopService } from "../services/shop/shop.service"; 
import { UserService } from "../services/user/user.service"; 
import { ShopRepository } from "../repositories/shop.repository";
import { UserRepository } from "../repositories/user.repository";
import { AdminRepository } from "../repositories/admin.repository";
import { PetTypeRepository } from "../repositories/petType.repository";
import { ServiceTypeRepository } from "repositories/serviceType.repository";
import { PetTypeService } from "../services/pet/petType.service";
import { ServiceTypeService } from "services/service/serviceType.service";
import { JwtService } from "../services/jwt/jwt.service";
import { AuthMiddleware } from 'middlewares/auth.middleware';
import { IAdminService } from "../interfaces/serviceInterfaces/IAdminService";

// Initialize repositories
const shopRepository = new ShopRepository();
const userRepository = new UserRepository();
const adminRepository = new AdminRepository();
const petTypeRepository = new PetTypeRepository();
const serviceTypeRepository = new ServiceTypeRepository();

// Initialize services
const jwtService = new JwtService();
const adminAuthService: IAdminService = new AdminAuthService(adminRepository, jwtService);
const shopService = new ShopService(shopRepository); 
const userService = new UserService(userRepository); 
const petTypeService = new PetTypeService(petTypeRepository);
const serviceService = new ServiceTypeService(serviceTypeRepository);

const authMiddlewareInstance = new AuthMiddleware(jwtService);
const authMiddleware = authMiddlewareInstance;

// Initialize controllers with dependencies
const injectedAdminAuthController = new AdminAuthController(adminAuthService);
const injectedShopController = new ShopController(shopService); 
const injectedUserController = new UserController(userService); 
const injectedPetTypeController = new PetTypeController(petTypeService);
const injectedServiceController = new ServiceTypeController(serviceService);

// Export for route usage
export const adminDependencies = {
  adminAuthController: injectedAdminAuthController,
  shopController: injectedShopController,
  userController: injectedUserController,
  petTypeController: injectedPetTypeController,
  serviceController: injectedServiceController,
  authMiddleware,
  userService,
  userRepository 
};