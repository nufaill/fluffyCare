// routes/admin.routes.ts
import { RequestHandler, Router } from 'express';
import { adminDependencies } from '../di/adminInjection';

const router = Router();

// Admin auth routes
router.post('/login', adminDependencies.adminAuthController.login as RequestHandler);
router.post('/logout', adminDependencies.adminAuthController.logout as RequestHandler);

router.use(adminDependencies.authMiddleware.authenticate("admin") as RequestHandler)

// Shop management routes
router.get('/shops', adminDependencies.shopController.getAllShops as RequestHandler);
router.patch('/shops/:shopId/status', adminDependencies.shopController.updateShopStatus as RequestHandler);
router.get('/unverified', adminDependencies.shopController.getUnverifiedShops as RequestHandler);
router.patch('/unverified/:shopId/approve', adminDependencies.shopController.approveShop as RequestHandler);
router.patch('/unverified/:shopId/reject', adminDependencies.shopController.rejectShop as RequestHandler);

// User management routes
router.get('/users', adminDependencies.userController.getAllUsers as RequestHandler);
router.patch('/users/:userId/status', adminDependencies.userController.updateUserStatus as RequestHandler);

export default router;