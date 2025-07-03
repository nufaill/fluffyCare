// adminInjection.ts
import { AdminAuthController } from "../controllers/admin/admin.controller";
import { ShopController } from "../controllers/shop/shop.controller";
import { UserController } from "../controllers/user/user.controller";
import { AuthService as AdminAuthService } from "../services/admin/adminService";
import { ShopRepository } from "../repositories/shopRepository";
import { UserRepository } from "../repositories/userRepository";
import { JwtService } from "../services/jwt/jwtService";
import {AdminRepository} from "../repositories/adminRepository"
// Initialize repositories
const shopRepository = new ShopRepository();
const userRepository = new UserRepository();
const adminRepository = new AdminRepository();

// Initialize services
const jwtService = new JwtService();
const adminAuthService = new AdminAuthService(adminRepository,jwtService);

// Initialize controllers with dependencies
export const injectedAdminAuthController = new AdminAuthController(adminAuthService);
export const injectedShopController = new ShopController(shopRepository);
export const injectedUserController = new UserController(userRepository);

// Export for route usage
export const adminDependencies = {
  adminAuthController: injectedAdminAuthController,
  shopController: injectedShopController,
  userController: injectedUserController
};