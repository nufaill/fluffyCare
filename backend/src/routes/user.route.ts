// routes/user.routes.ts
import { RequestHandler, Router } from 'express';
import { userDependencies } from '../di/userInjection';


const router = Router();

router.get('/pet-types', userDependencies.petController.getAllPetTypes as RequestHandler);

router.use(userDependencies.authMiddleware.authenticate("user") as RequestHandler)

router.get('/profile/:userId', userDependencies.userController.getProfile as RequestHandler);
router.patch('/profile/update/:userId', userDependencies.userController.updateProfile as RequestHandler);


router.post('/add-pets', userDependencies.petController.createPet as RequestHandler);
router.get('/pets/:userId', userDependencies.petController.getPetsByUserId as RequestHandler);
router.get('/pets/:petId', userDependencies.petController.getPetById as RequestHandler);
router.put('/pets/:petId', userDependencies.petController.updatePet as RequestHandler);

export default router;