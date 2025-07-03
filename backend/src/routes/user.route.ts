// routes/user.routes.ts
import { Router } from 'express';
import { userDependencies } from '../di/userInjection';

const router = Router();

router.get('/profile/:userId', userDependencies.userController.getProfile);
router.patch('/profile/update/:userId', userDependencies.userController.updateProfile);

export default router;