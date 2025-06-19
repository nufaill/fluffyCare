// backend/src/routes/auth.route.ts
import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import { registerSchema } from '../validations/register.validation';
import { loginSchema } from '../validations/login.validation';
import { googleAuthSchema } from '../validations/google-auth.validation';

// Dependencies
import { UserRepository } from '../repositories/userRepository';
import { JwtService } from '../services/jwt/jwtService';
import { GoogleAuthService } from '../services/googleAuth/googleService';
import { AuthService } from '../services/authService';

const router = express.Router();

// Initialize services
const userRepository = new UserRepository();
const jwtService = new JwtService();
const googleService = new GoogleAuthService();
const authService = new AuthService(userRepository, jwtService, googleService);
const authController = new AuthController(authService);
const authMiddleware = new AuthMiddleware(jwtService);

// Public routes
router.post('/signup', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/google', validateRequest(googleAuthSchema), authController.googleAuth);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

// Protected routes
// router.get('/me', authMiddleware.authenticate, authController.me);

export default router;