// routes/shop.routes.ts
import { RequestHandler, Router } from 'express';
import { shopDependencies } from '../di/shopInjection';

const router = Router();


// Shop auth routes
router.post('/signup', shopDependencies.shopAuthController.register as RequestHandler);
router.post('/verify-otp', shopDependencies.shopAuthController.verifyOtp as RequestHandler);
router.post('/resend-otp', shopDependencies.shopAuthController.resendOtp as RequestHandler);
router.post('/login', shopDependencies.shopAuthController.login as RequestHandler);
router.post('/logout', shopDependencies.shopAuthController.logout as RequestHandler);
router.post('/refresh-token', shopDependencies.shopAuthController.refreshToken as RequestHandler);
router.post('/forgot-password', shopDependencies.shopAuthController.sendResetLink as RequestHandler);
router.post('/reset-password', shopDependencies.shopAuthController.resetPassword as RequestHandler);

router.use(shopDependencies.authMiddleware.authenticate("shop") as RequestHandler)

router.get('/profile/:shopId', shopDependencies.shopController.getShopProfile as RequestHandler);
router.patch('/profile/update/:shopId', shopDependencies.shopController.updateShopProfile as RequestHandler);

export default router;