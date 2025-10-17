// routes/shop.routes.ts
import { RequestHandler, Router } from 'express';
import { shopDependencies } from '../di/shopInjection';
import { validateCreateService } from '../validations/service.validator';
import { validateCreateStaff } from '../validations/staff.validator';
import { ValidationChain } from 'express-validator';
import { appointmentDependencies } from '../di/appointmentInjection';
import { checkVerifiedShop } from '../middlewares/checkisVerifiedShop.middleware';
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
router.use(shopDependencies.authMiddleware.authenticate as RequestHandler);


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
router.patch('/profile/update/:shopId', shopDependencies.shopController.updateShopProfile as RequestHandler);

router.use(checkVerifiedShop as RequestHandler);

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
router.post('/service-create/:shopId', validateCreateService, shopDependencies.serviceController.createService as RequestHandler);

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
router.get('/service-list/:shopId', shopDependencies.serviceController.getServicesByShop as RequestHandler);

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
router.get('/service/:shopId/:serviceId', shopDependencies.serviceController.getServiceById as RequestHandler);

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
router.patch('/service/:shopId/:serviceId', validateCreateService, shopDependencies.serviceController.updateService as RequestHandler);

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
router.patch('/service/:shopId/:serviceId/toggle-status', shopDependencies.serviceController.toggleServiceStatus as RequestHandler);

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
router.get('/staff/:shopId', shopDependencies.staffController.getAllStaff as RequestHandler);

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
router.post('/staff-create/:shopId', validateCreateStaff as (ValidationChain | RequestHandler)[], shopDependencies.staffController.create as RequestHandler);

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
router.patch('/staff/:staffId', validateCreateStaff as (ValidationChain | RequestHandler)[], shopDependencies.staffController.update as RequestHandler);

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

router.get('/shops/:shopId/subscription', shopDependencies.shopController.getShopSubscription as RequestHandler);
router.patch('/shops/:shopId/subscription', shopDependencies.shopController.updateShopSubscription as RequestHandler);
router.post('/payment/create-subscription-payment-intent', shopDependencies.shopController.createSubscriptionPaymentIntent as RequestHandler);
router.post('/payment/confirm-subscription-payment', shopDependencies.shopController.confirmSubscriptionPayment as RequestHandler);

/**
 * @swagger
 * /shop/appointments:
 *   post:
 *     summary: Get All appointment
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shopId
 *               - serviceId
 *               - date
 *             properties:
 *               shopId:
 *                 type: string
 *                 format: uuid
 *               serviceId:
 *                 type: string
 *                 format: uuid
 *               staffId:
 *                 type: string
 *                 format: uuid
 *               date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Time slot not available
 */
router.post('/appointments', appointmentDependencies.appointmentController.createAppointment.bind(appointmentDependencies.appointmentController) as RequestHandler);

/**
 * @swagger
 * /shop/appointments/slots/availability:
 *   get:
 *     summary: Check slot availability
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: shopId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shop ID
 *       - in: query
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Service ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check availability (YYYY-MM-DD)
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Specific staff ID (optional)
 *     responses:
 *       200:
 *         description: Slot availability retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SlotAvailability'
 *       400:
 *         description: Missing required parameters
 *       401:
 *         description: Unauthorized
 */
router.get('/appointments/slots/availability', appointmentDependencies.appointmentController.checkSlotAvailability.bind(appointmentDependencies.appointmentController) as RequestHandler);

/**
 * @swagger
 * /shop/appointments/{appointmentId}:
 *   put:
 *     summary: Update an appointment
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               staffId:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 */
router.put('/appointments/:appointmentId', appointmentDependencies.appointmentController.updateAppointment.bind(appointmentDependencies.appointmentController) as RequestHandler);

/**
 * @swagger
 * /shop/appointments/{appointmentId}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 */
router.get('/appointments/:appointmentId', appointmentDependencies.appointmentController.getAppointmentById.bind(appointmentDependencies.appointmentController) as RequestHandler);

/**
 * @swagger
 * /shop/appointments/user/{userId}:
 *   get:
 *     summary: Get appointments by user ID
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, ongoing, completed, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: User appointments retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Unauthorized
 */
router.get('/appointments/user/:userId', appointmentDependencies.appointmentController.getAppointmentsByUserId.bind(appointmentDependencies.appointmentController) as RequestHandler);

/**
 * @swagger
 * /shop/appointments/shop/{shopId}:
 *   get:
 *     summary: Get appointments by shop ID
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shop ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, ongoing, completed, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Shop appointments retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Unauthorized
 */
router.get('/appointments/shop/:shopId', appointmentDependencies.appointmentController.getAppointmentsByShopId.bind(appointmentDependencies.appointmentController) as RequestHandler);

/**
 * @swagger
 * /shop/appointments/staff/{staffId}:
 *   get:
 *     summary: Get appointments by staff ID
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Staff ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, ongoing, completed, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Staff appointments retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Unauthorized
 */
router.get('/appointments/staff/:staffId', appointmentDependencies.appointmentController.getAppointmentsByStaffId.bind(appointmentDependencies.appointmentController) as RequestHandler);

/**
 * @swagger
 * /shop/appointments/{appointmentId}/confirm:
 *   patch:
 *     summary: Confirm an appointment
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 *       409:
 *         description: Appointment cannot be confirmed
 */
router.patch('/appointments/:appointmentId/confirm', appointmentDependencies.appointmentController.confirmAppointment.bind(appointmentDependencies.appointmentController) as RequestHandler);

/**
 * @swagger
 * /shop/appointments/{appointmentId}/complete:
 *   patch:
 *     summary: Mark appointment as completed
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 *       409:
 *         description: Appointment cannot be completed
 */
router.patch('/appointments/:appointmentId/complete', appointmentDependencies.appointmentController.completeAppointment.bind(appointmentDependencies.appointmentController) as RequestHandler);

/**
 * @swagger
 * /shop/appointments/{appointmentId}/cancel:
 *   patch:
 *     summary: Cancel an appointment
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 *       409:
 *         description: Appointment cannot be cancelled
 */
router.patch('/appointments/:appointmentId/cancel', appointmentDependencies.appointmentController.cancelAppointment.bind(appointmentDependencies.appointmentController) as RequestHandler);

/**
 * @swagger
 * /shop/appointments/{appointmentId}/ongoing:
 *   patch:
 *     summary: Mark appointment as ongoing
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment marked as ongoing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 *       409:
 *         description: Appointment cannot be marked as ongoing
 */
router.patch('/appointments/:appointmentId/ongoing', appointmentDependencies.appointmentController.startOngoingAppointment.bind(appointmentDependencies.appointmentController) as RequestHandler);

/**
 * @swagger
 * /shop/appointments/stats/{shopId}:
 *   get:
 *     summary: Get appointment statistics for a shop
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shop ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Appointment statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentStats'
 *       401:
 *         description: Unauthorized
 */
router.get('/appointments/stats/:shopId', appointmentDependencies.appointmentController.getAppointmentStats.bind(appointmentDependencies.appointmentController) as RequestHandler);

/**
 * @swagger
 * /shop/appointments/status/{status}:
 *   get:
 *     summary: Get appointments by status
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, ongoing, completed, cancelled]
 *         description: Appointment status
 *       - in: query
 *         name: shopId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by shop ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Appointments by status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid status
 */
router.get('/appointments/status/:status', appointmentDependencies.appointmentController.getAppointmentsByStatus.bind(appointmentDependencies.appointmentController) as RequestHandler);


router.get('/subscriptions-active', shopDependencies.subscriptionController.getAllActiveSubscriptions as RequestHandler);
router.get('/subscriptions/by-name/:planName', shopDependencies.subscriptionController.getSubscriptionByName as RequestHandler);

router.get("/shops/:shopId/reviews", shopDependencies.reviewController.getReviewsByShop as RequestHandler);
router.get("/shops/:shopId/reviews/summary", shopDependencies.reviewController.getShopRatingSummary as RequestHandler);

router.put('/notifications/:notificationId', shopDependencies.notificationController.updateNotification.bind(shopDependencies.notificationController) as RequestHandler);
router.delete('/notifications/:notificationId', shopDependencies.notificationController.deleteNotification.bind(shopDependencies.notificationController) as RequestHandler);
router.get('/notifications/:shopId', shopDependencies.notificationController.getShopNotifications.bind(shopDependencies.notificationController) as RequestHandler);

export default router;