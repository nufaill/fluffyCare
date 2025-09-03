// routes/admin.routes.ts
import { RequestHandler, Router } from 'express';
import { adminDependencies } from '../di/adminInjection';
import { appointmentDependencies } from '../di/appointmentInjection';

const router = Router();

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Login an admin
 *     tags: [Admin]
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
 *         description: Admin logged in successfully
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
router.post('/login', adminDependencies.adminAuthController.login as RequestHandler);

/**
 * @swagger
 * /admin/logout:
 *   post:
 *     summary: Logout an admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', adminDependencies.adminAuthController.logout as RequestHandler);

// Protected routes
router.use(adminDependencies.authMiddleware.authenticate("admin") as RequestHandler);

/**
 * @swagger
 * /admin/shops:
 *   get:
 *     summary: Get all shops
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of shops
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shop'
 *       401:
 *         description: Unauthorized
 */
router.get('/shops', adminDependencies.shopController.getAllShops as RequestHandler);

/**
 * @swagger
 * /admin/shops/{shopId}/status:
 *   patch:
 *     summary: Update shop status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the shop
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Shop status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shop'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shop not found
 */
router.patch('/shops/:shopId/status', adminDependencies.shopController.updateShopStatus as RequestHandler);

/**
 * @swagger
 * /admin/unverified:
 *   get:
 *     summary: Get unverified shops
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of unverified shops
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shop'
 *       401:
 *         description: Unauthorized
 */
router.get('/unverified', adminDependencies.shopController.getUnverifiedShops as RequestHandler);

/**
 * @swagger
 * /admin/unverified/{shopId}/approve:
 *   patch:
 *     summary: Approve an unverified shop
 *     tags: [Admin]
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
 *         description: Shop approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shop'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shop not found
 */
router.patch('/unverified/:shopId/approve', adminDependencies.shopController.approveShop as RequestHandler);

/**
 * @swagger
 * /admin/unverified/{shopId}/reject:
 *   patch:
 *     summary: Reject an unverified shop
 *     tags: [Admin]
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
 *         description: Shop rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shop'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shop not found
 */
router.patch('/unverified/:shopId/reject', adminDependencies.shopController.rejectShop as RequestHandler);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/users', adminDependencies.userController.getAllUsers as RequestHandler);

/**
 * @swagger
 * /admin/users/{userId}/status:
 *   patch:
 *     summary: Update user status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.patch('/users/:userId/status', adminDependencies.userController.updateUserStatus as RequestHandler);

/**
 * @swagger
 * /admin/pet-types:
 *   post:
 *     summary: Create a new pet type
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PetType'
 *     responses:
 *       201:
 *         description: Pet type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PetType'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/pet-types', adminDependencies.petTypeController.createPetType as RequestHandler);

/**
 * @swagger
 * /admin/pet-types:
 *   get:
 *     summary: Get all pet types
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pet types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PetType'
 *       401:
 *         description: Unauthorized
 */
router.get('/pet-types', adminDependencies.petTypeController.getAllPetTypes as RequestHandler);

/**
 * @swagger
 * /admin/pet-types/{id}:
 *   get:
 *     summary: Get pet type by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the pet type
 *     responses:
 *       200:
 *         description: Pet type details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PetType'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pet type not found
 */
router.get('/pet-types/:id', adminDependencies.petTypeController.getPetTypeById as RequestHandler);

/**
 * @swagger
 * /admin/pet-types/{id}:
 *   put:
 *     summary: Update pet type
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the pet type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PetType'
 *     responses:
 *       200:
 *         description: Pet type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PetType'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pet type not found
 */
router.put('/pet-types/:id', adminDependencies.petTypeController.updatePetType as RequestHandler);

/**
 * @swagger
 * /admin/pet-types/{id}/status:
 *   patch:
 *     summary: Update pet type status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the pet type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Pet type status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PetType'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pet type not found
 */
router.patch('/pet-types/:id/status', adminDependencies.petTypeController.updatePetTypeStatus as RequestHandler);

/**
 * @swagger
 * /admin/service-types:
 *   post:
 *     summary: Create a new service type
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceType'
 *     responses:
 *       201:
 *         description: Service type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceType'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/service-types', adminDependencies.serviceController.createServiceType as RequestHandler);

/**
 * @swagger
 * /admin/service-types:
 *   get:
 *     summary: Get all service types
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of service types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceType'
 *       401:
 *         description: Unauthorized
 */
router.get('/service-types', adminDependencies.serviceController.getAllServiceTypes as RequestHandler);

/**
 * @swagger
 * /admin/service-types/{id}:
 *   get:
 *     summary: Get service type by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the service type
 *     responses:
 *       200:
 *         description: Service type details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceType'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Service type not found
 */
router.get('/service-types/:id', adminDependencies.serviceController.getServiceTypeById as RequestHandler);

/**
 * @swagger
 * /admin/service-types/{id}:
 *   put:
 *     summary: Update service type
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the service type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceType'
 *     responses:
 *       200:
 *         description: Service type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceType'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Service type not found
 */
router.put('/service-types/:id', adminDependencies.serviceController.updateServiceType as RequestHandler);

/**
 * @swagger
 * /admin/service-types/{id}/status:
 *   patch:
 *     summary: Update service type status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the service type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Service type status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceType'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Service type not found
 */
router.patch('/service-types/:id/status', adminDependencies.serviceController.updateServiceTypeStatus as RequestHandler);

/**
 * @swagger
 * /admin/appointments:
 *   get:
 *     summary: Get all appointments
 *     description: Retrieve a list of all appointments with optional filtering and pagination
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *         description: Filter by appointment status
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by appointment date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of appointments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/appointments', appointmentDependencies.appointmentController.getAllAppointments.bind(appointmentDependencies.appointmentController) as RequestHandler);



router.post('/subscriptions', adminDependencies.subscriptionController.createSubscription as RequestHandler);
router.put('/subscriptions/:id', adminDependencies.subscriptionController.updateSubscription as RequestHandler);
router.get('/subscriptions', adminDependencies.subscriptionController.getAllSubscriptions as RequestHandler);



export default router;