// routes/shop.routes.ts
import { RequestHandler, Router } from 'express';
import { shopDependencies } from '../di/shopInjection';
import { validateCreateService } from '../validations/service.validator';

const router = Router();
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
 *         description: Invalid input
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
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
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
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       400:
 *         description: Invalid request
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
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
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
 *       401:
 *         description: Unauthorized
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
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset link sent successfully
 *       400:
 *         description: Invalid email
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
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid token
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
 */
router.get('/pet-types', shopDependencies.serviceController.getPetTypes as RequestHandler);

// Protected routes
router.use(shopDependencies.authMiddleware.authenticate("shop") as RequestHandler);

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
 *         description: Shop profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shop'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shop not found
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
 *       401:
 *         description: Unauthorized
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
 *       401:
 *         description: Unauthorized
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
 *       404:
 *         description: Service not found
 */
router.get('/:serviceId', shopDependencies.serviceController.getServiceById as RequestHandler);

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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Service not found
 */
router.patch('/:serviceId', validateCreateService, shopDependencies.serviceController.updateService as RequestHandler);

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
 *       404:
 *         description: Service not found
 */
router.patch('/:serviceId/toggle-status', shopDependencies.serviceController.toggleServiceStatus as RequestHandler);

export default router;