import { AuthController } from "../controllers/user/auth.controller";
import { UserRepository } from "../repositories/userRepository";
import { AuthService } from "../services/user/authService";
import { JwtService } from "../services/jwt/jwtService";
import { GoogleAuthService } from "../services/googleAuth/googleService"; 
import { EmailService } from "services/emailService/emailService";
import { OtpRepository } from "repositories/otpRepository";

const userRepository = new UserRepository();
const tokenService = new JwtService();
const googleService = new GoogleAuthService();
const emailService = new EmailService();
const otpRepository = new OtpRepository();

const authService = new AuthService(
  userRepository,
  tokenService,
  googleService,
  emailService,
  otpRepository
);
export const injectedAuthController = AuthController;
