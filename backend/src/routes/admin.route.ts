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

// Pet Type management routes
router.post('/pet-types', adminDependencies.petTypeController.createPetType as RequestHandler);
router.get('/pet-types', adminDependencies.petTypeController.getAllPetTypes as RequestHandler);
router.get('/pet-types/:id', adminDependencies.petTypeController.getPetTypeById as RequestHandler);
router.put('/pet-types/:id', adminDependencies.petTypeController.updatePetType as RequestHandler);
router.patch('/pet-types/:id/status', adminDependencies.petTypeController.updatePetTypeStatus as RequestHandler);


// Service Type management routes
router.post('/service-types', adminDependencies.serviceController.createServiceType as RequestHandler);
router.get('/service-types', adminDependencies.serviceController.getAllServiceTypes as RequestHandler);
router.get('/service-types/:id', adminDependencies.serviceController.getServiceTypeById as RequestHandler);
router.put('/service-types/:id', adminDependencies.serviceController.updateServiceType as RequestHandler);
router.patch('/service-types/:id/status', adminDependencies.serviceController.updateServiceTypeStatus as RequestHandler);

export default router;