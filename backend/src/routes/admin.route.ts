// backend/src/routes/admin.route.ts
import express from "express";
import { AdminAuthController } from "../controllers/admin/admin.controller";
import { UserController } from '../controllers/user/user.controller';
import { ShopController } from '../controllers/shop/shop.controller';
import { validateRequest } from "../middlewares/validateRequest";
import { loginSchema } from "../validations/login.validation";

// Dependencies
import { AdminRepository } from "../repositories/adminRepository";
import { JwtService } from "../services/jwt/jwtService";
import { AuthService } from "../services/admin/adminService";
import { UserRepository } from "../repositories/userRepository";
import { ShopRepository } from "../repositories/shopRepository";
import { AdminMiddleware } from "../middlewares/admin.middleware";

const router = express.Router();

// Initialize dependencies
const adminRepository = new AdminRepository();
const jwtService = new JwtService();
const authService = new AuthService(adminRepository, jwtService);
const adminAuthController = new AdminAuthController(authService);
const userRepository = new UserRepository();
const adminUserController = new UserController(userRepository);
const shopRepository = new ShopRepository();
const adminShopController = new ShopController(shopRepository);
const adminMiddleware = new AdminMiddleware(jwtService);

// Public routes 
router.post("/login", validateRequest(loginSchema), adminAuthController.login);
router.post("/logout", adminAuthController.logout);

// Protected routes 
router.get('/customer-pets-detail',  adminUserController.getAllUsers);
router.patch('/customer-pets-detail/:userId/status',  adminUserController.updateUserStatus);
router.get('/shops',  adminShopController.getAllShops);
router.patch('/shops/:shopId/status',  adminShopController.updateShopStatus);

export default router;