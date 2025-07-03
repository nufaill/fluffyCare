// routes/shop.routes.ts
import { Router } from 'express';
import { shopDependencies } from '../di/shopInjection';

const router = Router();

// Shop auth routes
router.post('/signup', shopDependencies.shopAuthController.register);
router.post('/verify-otp', shopDependencies.shopAuthController.verifyOtp);
router.post('/resend-otp', shopDependencies.shopAuthController.resendOtp);
router.post('/login', shopDependencies.shopAuthController.login);
router.post('/refresh-token', shopDependencies.shopAuthController.refreshToken);
router.post('/forgot-password', shopDependencies.shopAuthController.sendResetLink);
router.post('/reset-password', shopDependencies.shopAuthController.resetPassword);
router.post('/logout', shopDependencies.shopAuthController.logout);

export default router;