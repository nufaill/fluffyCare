// routes/shop.routes.ts
import { RequestHandler, Router } from 'express';
import { shopDependencies } from '../di/shopInjection';
import { validateCreateService } from '../validations/service.validator';
import { validateCreateStaff } from '../validations/staff.validator';
import { ValidationChain } from 'express-validator';
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         message:
 *           type: string
 *       required:
 *         - error
 *         - message
 */

/**
 * @swagger
 * /shop/signup:
 *   post:
 *     summary: Register a new shop
 *     tags: [Shop]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Shop'
 *     responses:
 *       201:
 *         description: Shop registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 shop:
 *                   $ref: '#/components/schemas/Shop'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/signup', shopDependencies.shopAuthController.register as RequestHandler);

/**
 * @swagger
 * /shop/verify-otp:
 *   post:
 *     summary: Verify OTP for shop registration
 *     tags: [Shop]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid OTP or email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/verify-otp', shopDependencies.shopAuthController.verifyOtp as RequestHandler);

/**
 * @swagger
 * /shop/resend-otp:
 *   post:
 *     summary: Resend OTP for shop registration
 *     tags: [Shop]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/resend-otp', shopDependencies.shopAuthController.resendOtp as RequestHandler);

/**
 * @swagger
 * /shop/login:
 *   post:
 *     summary: Login a shop
 *     tags: [Shop]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Shop logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', shopDependencies.shopAuthController.login as RequestHandler);

/**
 * @swagger
 * /shop/logout:
 *   post:
 *     summary: Logout a shop
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shop logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout', shopDependencies.shopAuthController.logout as RequestHandler);

/**
 * @swagger
 * /shop/refresh-token:
 *   post:
 *     summary: Refresh shop access token
 *     tags: [Shop]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh-token', shopDependencies.shopAuthController.refreshToken as RequestHandler);

/**
 * @swagger
 * /shop/forgot-password:
 *   post:
 *     summary: Send reset password link for shop
 *     tags: [Shop]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset link sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/forgot-password', shopDependencies.shopAuthController.sendResetLink as RequestHandler);

/**
 * @swagger
 * /shop/reset-password:
 *   post:
 *     summary: Reset shop password
 *     tags: [Shop]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid token or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/reset-password', shopDependencies.shopAuthController.resetPassword as RequestHandler);

/**
 * @swagger
 * /shop/service-types:
 *   get:
 *     summary: Get all service types
 *     tags: [Shop]
 *     responses:
 *       200:
 *         description: List of service types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceType'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/service-types', shopDependencies.serviceController.getServiceTypes as RequestHandler);

/**
 * @swagger
 * /shop/pet-types:
 *   get:
 *     summary: Get all pet types
 *     tags: [Shop]
 *     responses:
 *       200:
 *         description: List of pet types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PetType'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/pet-types', shopDependencies.serviceController.getPetTypes as RequestHandler);

// Protected routes
router.use(shopDependencies.authMiddleware.authenticate('shop') as RequestHandler);

/**
 * @swagger
 * /shop/profile/{shopId}:
 *   get:
 *     summary: Get shop profile
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the shop
 *     responses:
 *       200:
 *         description: Shop profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shop'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Shop not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile/:shopId', shopDependencies.shopController.getShopProfile as RequestHandler);

/**
 * @swagger
 * /shop/profile/update:
 *   patch:
 *     summary: Update shop profile
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Shop'
 *     responses:
 *       200:
 *         description: Shop profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shop'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/profile/update', shopDependencies.shopController.updateShopProfile as RequestHandler);

/**
 * @swagger
 * /shop/service-create:
 *   post:
 *     summary: Create a new service
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       201:
 *         description: Service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/service-create', validateCreateService, shopDependencies.serviceController.createService as RequestHandler);

/**
 * @swagger
 * /shop/service-list:
 *   get:
 *     summary: Get services by shop
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/service-list', shopDependencies.serviceController.getServicesByShop as RequestHandler);

/**
 * @swagger
 * /shop/{serviceId}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the service
 *     responses:
 *       200:
 *         description: Service details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/service/:serviceId', shopDependencies.serviceController.getServiceById as RequestHandler);

/**
 * @swagger
 * /shop/{serviceId}:
 *   patch:
 *     summary: Update service
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       200:
 *         description: Service updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/service/:serviceId', validateCreateService, shopDependencies.serviceController.updateService as RequestHandler);

/**
 * @swagger
 * /shop/{serviceId}/toggle-status:
 *   patch:
 *     summary: Toggle service status
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the service
 *     responses:
 *       200:
 *         description: Service status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/service/:serviceId/toggle-status', shopDependencies.serviceController.toggleServiceStatus as RequestHandler);

/**
 * @swagger
 * /shop/staff-list:
 *   get:
 *     summary: Get staff list by shop
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of staff members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Staff'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/staff', shopDependencies.staffController.getAllStaff as RequestHandler);

/**
 * @swagger
 * /shop/staff-create:
 *   post:
 *     summary: Create a new staff member
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Staff'
 *     responses:
 *       201:
 *         description: Staff created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/staff-create',validateCreateStaff as (ValidationChain | RequestHandler)[],shopDependencies.staffController.create as RequestHandler);

/**
 * @swagger
 * /shop/staff/{staffId}:
 *   patch:
 *     summary: Update a staff member
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the staff member
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Staff'
 *     responses:
 *       200:
 *         description: Staff updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Staff not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/staff/:staffId',validateCreateStaff as (ValidationChain | RequestHandler)[], shopDependencies.staffController.update as RequestHandler);

/**
 * @swagger
 * /shop/staff/{staffId}/toggle-status:
 *   patch:
 *     summary: Toggle staff status (block/unblock)
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the staff member
 *     responses:
 *       200:
 *         description: Staff status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Staff not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/staff/:staffId/toggle-status', shopDependencies.staffController.toggleStatus as RequestHandler);
router.get('/staff/:id', shopDependencies.staffController.findById as RequestHandler);


router.get('/:shopId/availability', shopDependencies.shopController.getShopAvailability as RequestHandler)
router.put('/:shopId/availability', shopDependencies.shopController.updateShopAvailability as RequestHandler)




router.post('/slot/create', shopDependencies.slotController.create as RequestHandler);
router.get('/slot/:slotId', shopDependencies.slotController.findById as RequestHandler);
router.get('/slot/shop/:shopId/range', shopDependencies.slotController.findByShopAndDateRange as RequestHandler);
router.get('/slot/shop/:shopId', shopDependencies.slotController.findByShop as RequestHandler);
router.patch('/slot/:slotId', shopDependencies.slotController.update as RequestHandler);
router.delete('/slot/:slotId', shopDependencies.slotController.delete as RequestHandler);
router.patch('/slot/:slotId/cancel', shopDependencies.slotController.cancel as RequestHandler);
router.get('/slot/date/:slotDate', shopDependencies.slotController.findByDate as RequestHandler);
router.get('/slot/:shopId/staffCount', shopDependencies.slotController.getStaffByShop as RequestHandler);
router.get('/slot/shop/:shopId/booked', shopDependencies.slotController.findBookedByShop as RequestHandler);


export default router;