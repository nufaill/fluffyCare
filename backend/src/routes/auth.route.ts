// routes/auth.routes.ts
import { Router } from 'express';
import { authDependencies } from '../di/authInjection';

const router = Router();

router.post('/signup', authDependencies.authController.register);
router.post('/verify-otp', authDependencies.authController.verifyOtp);
router.post('/resend-otp', authDependencies.authController.resendOtp);
router.post('/login', authDependencies.authController.login);
router.post('/google-login', authDependencies.authController.googleAuth);
router.post('/refresh-token', authDependencies.authController.refreshToken);
router.post('/forgot-password', authDependencies.authController.sendResetLink);
router.post('/reset-password', authDependencies.authController.resetPassword);
router.post('/logout', authDependencies.authController.logout);

export default router;