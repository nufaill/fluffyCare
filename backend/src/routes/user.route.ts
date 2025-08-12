import { RequestHandler, Router } from 'express';
import { serviceDependencies } from '../di/serviceInjection';
import { userDependencies } from '../di/userInjection';
import { appointmentDependencies } from '../di/appointmentInjection';

const router = Router();

/**
 * @swagger
 * /user/service-types:
 *   get:
 *     summary: Get all service types
 *     tags: [User]
 *     responses:
 *       200:
 *         description: List of service types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *       500:
 *         description: Server error
 */
router.get('/service-types', serviceDependencies.serviceController.getServiceTypes.bind(serviceDependencies.serviceController) as RequestHandler);

/**
 * @swagger
 * /user/pet-types:
 *   get:
 *     summary: Get all pet types
 *     tags: [User]
 *     responses:
 *       200:
 *         description: List of pet types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *       500:
 *         description: Server error
 */
router.get('/pet-types', serviceDependencies.serviceController.getPetTypes.bind(serviceDependencies.serviceController) as RequestHandler);

/**
 * @swagger
 * /user/services:
 *   get:
 *     summary: Get all services
 *     tags: [User]
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *       500:
 *         description: Server error
 */
router.get('/services', serviceDependencies.serviceController.getAllServices.bind(serviceDependencies.serviceController) as RequestHandler);

/**
 * @swagger
 * /user/services/{serviceId}:
 *   get:
 *     summary: Get service by ID
 *     tags: [User]
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
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.get('/services/:serviceId', serviceDependencies.serviceController.getServiceByIdPublic.bind(serviceDependencies.serviceController) as RequestHandler);

// router.post('/payment/webhook', appointmentDependencies.paymentController.handleWebhook as RequestHandler);

router.use(userDependencies.authMiddleware.authenticate("user") as RequestHandler);


/**
 * @swagger
 * /user/nearby-shops:
 *   get:
 *     summary: Get nearby shops based on user location
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: User's latitude
 *         example: 10.0261
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: User's longitude  
 *         example: 76.3105
 *       - in: query
 *         name: maxDistance
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 100
 *           maximum: 50000
 *         description: Maximum distance in meters (default 5000m)
 *         example: 5000
 *     responses:
 *       200:
 *         description: List of nearby shops with distances
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       address:
 *                         type: string
 *                       location:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           coordinates:
 *                             type: array
 *                             items:
 *                               type: number
 *                       distance:
 *                         type: number
 *                         description: Distance in meters
 *                       isActive:
 *                         type: boolean
 *                       isVerified:
 *                         type: boolean
 *                 message:
 *                   type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                     searchRadius:
 *                       type: integer
 *                     userLocation:
 *                       type: object
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/nearby-shops', userDependencies.userController.getNearbyShops as RequestHandler);


/**
 * @swagger
 * /user/profile/{userId}:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/profile/:userId', userDependencies.userController.getProfile as RequestHandler);

/**
 * @swagger
 * /user/profile/update/{userId}:
 *   patch:
 *     summary: Update user profile
 *     tags: [User]
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
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               profileImage:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: ['Point']
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.patch('/profile/update/:userId', userDependencies.userController.updateProfile as RequestHandler);

/**
 * @swagger
 * /user/add-pets:
 *   post:
 *     summary: Add a new pet
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pet'
 *     responses:
 *       201:
 *         description: Pet added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/add-pets', userDependencies.petController.createPet as RequestHandler);

/**
 * @swagger
 * /user/pets/{userId}:
 *   get:
 *     summary: Get pets by user ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of pets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pet'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/pets/:userId', userDependencies.petController.getPetsByUserId as RequestHandler);

/**
 * @swagger
 * /user/pets/{petId}:
 *   get:
 *     summary: Get pet by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the pet
 *     responses:
 *       200:
 *         description: Pet details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pet not found
 */
router.get('/pets/:petId', userDependencies.petController.getPetById as RequestHandler);

/**
 * @swagger
 * /user/pets/{petId}:
 *   put:
 *     summary: Update pet details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the pet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pet'
 *     responses:
 *       200:
 *         description: Pet updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pet not found
 */
router.put('/pets/:petId', userDependencies.petController.updatePet as RequestHandler);






router.get('/:shopId/availability', userDependencies.shopController.getShopAvailability as RequestHandler);
router.get('/staff', userDependencies.staffController.getAllStaff as RequestHandler);



router.post("/payment/create-payment-intent", appointmentDependencies.paymentController.createPaymentIntent as RequestHandler);
router.post('/confirm-payment', appointmentDependencies.paymentController.confirmPayment.bind(appointmentDependencies.paymentController) as RequestHandler);
router.get('/appointments/stats/:shopId',appointmentDependencies.appointmentController.getAppointmentStats.bind(appointmentDependencies.appointmentController) as RequestHandler);
router.get('/appointments/slots/availability',appointmentDependencies.appointmentController.checkSlotAvailability.bind(appointmentDependencies.appointmentController) as RequestHandler);
router.put('/appointments/:appointmentId', appointmentDependencies.appointmentController.updateAppointment.bind(appointmentDependencies.appointmentController) as RequestHandler);
router.patch('/appointments/:appointmentId/cancel', appointmentDependencies.appointmentController.cancelAppointment.bind(appointmentDependencies.appointmentController) as RequestHandler);
router.get('/appointments/:appointmentId', appointmentDependencies.appointmentController.getAppointmentById.bind(appointmentDependencies.appointmentController) as RequestHandler);
router.get('/appointments/user/:userId',appointmentDependencies.appointmentController.getAppointmentsByUserId.bind(appointmentDependencies.appointmentController) as RequestHandler);
router.get('/appointments/shop/:shopId',appointmentDependencies.appointmentController.getAppointmentsByShopId.bind(appointmentDependencies.appointmentController) as RequestHandler);
router.get('/appointments/staff/:staffId', appointmentDependencies.appointmentController.getAppointmentsByStaffId.bind(appointmentDependencies.appointmentController) as RequestHandler);
router.patch('/appointments/:appointmentId/confirm',appointmentDependencies.appointmentController.confirmAppointment.bind(appointmentDependencies.appointmentController) as RequestHandler);
router.patch('/appointments/:appointmentId/complete', appointmentDependencies.appointmentController.completeAppointment.bind(appointmentDependencies.appointmentController) as RequestHandler);
router.get('/appointments/status/:status', appointmentDependencies.appointmentController.getAppointmentsByStatus.bind(appointmentDependencies.appointmentController) as RequestHandler);



/**
 * @swagger
 * /user/appointments/booked-slots/{shopId}:
 *   get:
 *     summary: Get booked slots for a specific shop and date
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the shop
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-\d{2}-\d{2}$'
 *         description: Date in YYYY-MM-DD format
 *       - in: query
 *         name: staffId
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional staff ID to filter slots
 *     responses:
 *       200:
 *         description: List of booked slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       shopId:
 *                         type: string
 *                       staffId:
 *                         type: string
 *                       slotDate:
 *                         type: string
 *                       startTime:
 *                         type: string
 *                       endTime:
 *                         type: string
 *                       status:
 *                         type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/appointments/booked-slots/:shopId', appointmentDependencies.appointmentController.getBookedSlots.bind(appointmentDependencies.appointmentController) as RequestHandler);

// Add this route for creating appointments with real-time updates
router.post('/appointments', appointmentDependencies.appointmentController.createAppointment.bind(appointmentDependencies.appointmentController) as RequestHandler);

export default router;