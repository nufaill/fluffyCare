import express from 'express';
import { authController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { registerSchema } from '../validations/register.validation';
import { loginSchema } from '../validations/login.validation';
import { injectedAuthController } from "../di/authInjection";

const router = express.Router();

router.post("/signup", validateRequest(registerSchema),  authController.register);

router.post("/login",validateRequest(loginSchema),authController.login);

router.get("/me", authController.me);

export default router;