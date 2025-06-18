import { authController } from "../controllers/auth.controller";
import { UserRepository } from "../repositories/userRepository";
import { AuthService } from "../services/authService";
import { JwtService } from "../services/jwt/jwtService";

const userRepository = new UserRepository();
const tokenService = new JwtService();
const authService = new AuthService(userRepository, tokenService);
export const injectedAuthController = authController;

