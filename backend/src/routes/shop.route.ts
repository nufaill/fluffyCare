// backend/src/routes/shopAuth.route.ts
import express from "express";
import { ShopAuthController } from "../controllers/shop/auth.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { shopRegisterSchema } from "../validations/shopRegister.validation";
import { loginSchema } from "../validations/login.validation";

// Dependencies
import { ShopRepository } from "../repositories/shopRepository";
import { JwtService } from "../services/jwt/jwtService";
import { AuthService } from "../services/shop/authService";
import { EmailService } from "../services/emailService/emailService";
import { OtpRepository } from "../repositories/otpRepository";
import { AuthMiddleware } from "../middlewares/user.middleware";

const router = express.Router();

// Init dependencies
const shopRepository = new ShopRepository();
const jwtService = new JwtService();
const emailService = new EmailService();
const otpRepository = new OtpRepository();
const authService = new AuthService(shopRepository, jwtService, emailService, otpRepository);
const shopAuthController = new ShopAuthController(authService);
const authMiddleware = new AuthMiddleware(jwtService);

// Public routes
router.post("/shop/signup", shopAuthController.register);
router.post("/shop/login", validateRequest(loginSchema), shopAuthController.login);
router.post("/shop/verify-otp", shopAuthController.verifyOtp);
router.post("/shop/resend-otp", shopAuthController.resendOtp);
router.post("/shop/refresh", shopAuthController.refreshToken);
router.post("/shop/logout", shopAuthController.logout);

// Protected route
router.get("/me", authMiddleware.authenticate, shopAuthController.me);

export default router;
