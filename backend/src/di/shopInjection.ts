
// shopInjection.ts
import { ShopAuthController } from "../controllers/shop/auth.controller";
import { ShopRepository } from "../repositories/shopRepository";
import { AuthService as ShopAuthService } from "../services/shop/authService";
import { JwtService } from "../services/jwt/jwtService";
import { EmailService } from "../services/emailService/emailService";
import { OtpRepository } from "../repositories/otpRepository";

// Initialize repositories
const shopRepository = new ShopRepository();
const otpRepository = new OtpRepository();

// Initialize services
const jwtService = new JwtService();
const emailService = new EmailService();

const shopAuthService = new ShopAuthService(
  shopRepository,
  jwtService,
  emailService,
  otpRepository
);

// Initialize controller with dependencies
export const injectedShopAuthController = new ShopAuthController(shopAuthService);

// Export for route usage
export const shopDependencies = {
  shopAuthController: injectedShopAuthController,
  shopAuthService,
  shopRepository,
  jwtService
};