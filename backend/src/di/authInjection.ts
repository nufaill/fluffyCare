import { AuthController } from "../controllers/user/auth.controller";
import { UserRepository } from "../repositories/userRepository";
import { AuthService } from "../services/user/authService";
import { JwtService } from "../services/jwt/jwtService";
import { GoogleAuthService } from "../services/googleAuth/googleService"; // <- Import this

const userRepository = new UserRepository();
const tokenService = new JwtService();
const googleService = new GoogleAuthService(); // <- Create instance

const authService = new AuthService(userRepository, tokenService, googleService); // <- Pass all 3
export const injectedAuthController = AuthController;
