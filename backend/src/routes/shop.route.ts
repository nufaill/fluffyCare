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
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { ShopMiddleware } from '../middlewares/shop.middleware';

const router = express.Router();

// Init dependencies
const shopRepository = new ShopRepository();
const jwtService = new JwtService();
const emailService = new EmailService();
const otpRepository = new OtpRepository();
const authService = new AuthService(shopRepository, jwtService, emailService, otpRepository);
const shopAuthController = new ShopAuthController(authService);
const authMiddleware = new AuthMiddleware(jwtService);
const shopMiddleware = new ShopMiddleware(jwtService);

// Public routes
router.post("/signup", shopAuthController.register);
router.post("/login", validateRequest(loginSchema), shopAuthController.login);
router.post("/verify-otp", shopAuthController.verifyOtp);
router.post("/resend-otp", shopAuthController.resendOtp);
router.post('/forgot-password', shopAuthController.sendResetLink);
router.post('/reset-password' , shopAuthController.resetPassword);
router.post("/refresh", shopAuthController.refreshToken);
router.post("/logout", shopAuthController.logout);
// router.get('/dashboard', shopMiddleware.authenticate, shopAuthController.getDashboard);


// Protected route
router.get("/me", authMiddleware.authenticate, shopAuthController.me);

export default router;
