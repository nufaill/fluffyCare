// routes/admin.routes.ts
import { Router } from 'express';
import { adminDependencies } from '../di/adminInjection';

const router = Router();

// Admin auth routes
router.post('/login', adminDependencies.adminAuthController.login);
router.post('/logout', adminDependencies.adminAuthController.logout);

// Shop management routes
router.get('/shops', adminDependencies.shopController.getAllShops);
router.patch('/shops/:shopId/status', adminDependencies.shopController.updateShopStatus);
router.get('/unverified', adminDependencies.shopController.getUnverifiedShops);
router.patch('/unverified/:shopId/approve', adminDependencies.shopController.approveShop);
router.patch('/unverified/:shopId/reject', adminDependencies.shopController.rejectShop);

// User management routes
router.get('/users', adminDependencies.userController.getAllUsers);
router.patch('/users/:userId/status', adminDependencies.userController.updateUserStatus);

export default router;