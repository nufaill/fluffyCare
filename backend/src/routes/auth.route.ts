// backend/src/routes/auth.route.ts
import express from 'express';
import { AuthController } from '../controllers/user/auth.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import { registerSchema } from '../validations/register.validation';
import { loginSchema } from '../validations/login.validation';
import { googleAuthSchema } from '../validations/google-auth.validation';
import { verifyOtpSchema, resendOtpSchema } from '../validations/otp.validation';

// Dependencies
import { UserRepository } from '../repositories/userRepository';
import { JwtService } from '../services/jwt/jwtService';
import { GoogleAuthService } from '../services/googleAuth/googleService';
import { AuthService } from '../services/user/authService';
import { OtpRepository } from 'repositories/otpRepository';
import { EmailService } from '../services/emailService/emailService';

const router = express.Router();

// Initialize services and dependencies
const userRepository = new UserRepository();
const jwtService = new JwtService();
const googleService = new GoogleAuthService();
const otpRepository = new OtpRepository();
const emailService = new EmailService();
const authService = new AuthService(userRepository, jwtService, googleService,emailService, otpRepository);
const authController = new AuthController(authService);
const authMiddleware = new AuthMiddleware(jwtService);

// Public routes
router.post('/signup', validateRequest(registerSchema), authController.register);
router.post('/verify-otp', validateRequest(verifyOtpSchema), authController.verifyOtp);
router.post('/resend-otp', validateRequest(resendOtpSchema), authController.resendOtp);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/google-login', validateRequest(googleAuthSchema), authController.googleAuth);
router.post('/forgot-password', authController.sendResetLink);
router.post('/reset-password' , authController.resetPassword);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', authMiddleware.authenticate, authController.me);

export default router;