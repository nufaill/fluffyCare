import { RequestHandler, Router } from 'express';
import { serviceDependencies } from '../di/serviceInjection';
import { userDependencies } from '../di/userInjection';

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

router.get('/available-slot/:shopId',userDependencies.slotController.getslotByShopId as RequestHandler)
router.get('/slot/shop/:shopId/range', userDependencies.slotController.findByShopAndDateRange as RequestHandler);


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

export default router;