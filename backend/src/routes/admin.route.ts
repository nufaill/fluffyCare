// backend/src/routes/admin.route.ts
import express from "express";
import { AdminAuthController } from "../controllers/admin/admin.controller";
import { UserController } from '../controllers/user/user.controller';
import { validateRequest } from "../middlewares/validateRequest";
import { loginSchema } from "../validations/login.validation";

// Dependencies
import { AdminRepository } from "../repositories/adminRepository";
import { JwtService } from "../services/jwt/jwtService";
import { AuthService } from "../services/admin/adminService";
import { UserRepository } from "../repositories/userRepository";

const router = express.Router();

// Initialize dependencies
const adminRepository = new AdminRepository();
const jwtService = new JwtService();
const authService = new AuthService(adminRepository, jwtService);
const adminAuthController = new AdminAuthController(authService);
const userRepository = new UserRepository();
const adminUserController = new UserController(userRepository);

// Public routes
router.post("/login", validateRequest(loginSchema), adminAuthController.login);
router.get('/users', adminUserController.getAllUsers);
router.patch('/users/:userId/status', adminUserController.updateUserStatus);
router.post("/logout", adminAuthController.logout);

export default router;