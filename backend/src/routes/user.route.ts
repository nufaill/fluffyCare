// routes/user.routes.ts
import { RequestHandler, Router } from 'express';
import { userDependencies } from '../di/userInjection';


const router = Router();
router.use(userDependencies.authMiddleware.authenticate("shop") as RequestHandler)

router.get('/profile/:userId', userDependencies.userController.getProfile as RequestHandler);
router.patch('/profile/update/:userId', userDependencies.userController.updateProfile as RequestHandler);

export default router;