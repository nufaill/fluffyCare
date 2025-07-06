// shopInjection.ts
import { ShopAuthController } from "../controllers/shop/auth.controller";
import { ShopController } from "../controllers/shop/shop.controller";
import { ShopRepository } from "../repositories/shopRepository";
import { AuthService as ShopAuthService } from "../services/shop/auth.service";
import { JwtService } from "../services/jwt/jwt.service";
import { EmailService } from "../services/emailService/email.service";
import { OtpRepository } from "../repositories/otpRepository";
import { AuthMiddleware } from 'middlewares/auth.middleware';

// Initialize repositories
const shopRepository = new ShopRepository();
const otpRepository = new OtpRepository();

// Initialize services
const jwtService = new JwtService();
const emailService = new EmailService();

const authMiddlewareInstance = new AuthMiddleware(jwtService);

const authMiddleware = authMiddlewareInstance;

const shopAuthService = new ShopAuthService(
  shopRepository,
  jwtService,
  emailService,
  otpRepository
);

// Initialize controllers with dependencies
const injectedShopAuthController = new ShopAuthController(shopAuthService);
const injectedShopController = new ShopController(shopRepository);

// Export for route usage
export const shopDependencies = {
  shopAuthController: injectedShopAuthController,
  shopController: injectedShopController,
  shopAuthService,
  shopRepository,
  jwtService,
  authMiddleware
};