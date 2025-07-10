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

// Protected routes
router.use(userDependencies.authMiddleware.authenticate("user") as RequestHandler);

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