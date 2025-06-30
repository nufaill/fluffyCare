// backend/src/routes/admin.route.ts
import express from "express";
import { AdminAuthController } from "../controllers/admin/admin.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { loginSchema } from "../validations/login.validation";

// Dependencies
import { AdminRepository } from "../repositories/adminRepository";
import { JwtService } from "../services/jwt/jwtService";
import { AuthService } from "../services/admin/adminService";

const router = express.Router();

// Initialize dependencies
const adminRepository = new AdminRepository();
const jwtService = new JwtService();
const authService = new AuthService(adminRepository, jwtService);
const adminAuthController = new AdminAuthController(authService);

// Public routes
router.post("/admin/login", validateRequest(loginSchema), adminAuthController.login);
router.post("/admin/logout", adminAuthController.logout);

export default router;