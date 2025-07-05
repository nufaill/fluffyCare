// routes/auth.routes.ts
import { RequestHandler, Router } from 'express';
import { authDependencies } from '../di/authInjection';

const router = Router();

router.post('/signup', authDependencies.authController.register as RequestHandler);
router.post('/verify-otp', authDependencies.authController.verifyOtp as RequestHandler);
router.post('/resend-otp', authDependencies.authController.resendOtp as RequestHandler);
router.post('/login', authDependencies.authController.login as RequestHandler);
router.post('/google-login', authDependencies.authController.googleAuth as RequestHandler);
router.post('/refresh-token', authDependencies.authController.refreshToken as RequestHandler);
router.post('/forgot-password', authDependencies.authController.sendResetLink as RequestHandler);
router.post('/reset-password', authDependencies.authController.resetPassword as RequestHandler);
router.post('/logout', authDependencies.authController.logout as RequestHandler);

export default router;