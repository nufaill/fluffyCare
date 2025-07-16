import { ShopAuthController } from "../controllers/shop/auth.controller";
import { ShopController } from "../controllers/shop/shop.controller";
import { ServiceController } from "../controllers/service/service.controller";
import { ShopService } from "../services/shop/shop.service"; 
import { ShopRepository } from "../repositories/shop.repository";
import { ServiceRepository } from "../repositories/service.repository";
import { AuthService as ShopAuthService } from "../services/shop/auth.service";
import { ServiceService } from "../services/service/service.service";
import { JwtService } from "../services/jwt/jwt.service";
import { EmailService } from "../services/emailService/email.service";
import { OtpRepository } from "../repositories/otp.repository";
import { AuthMiddleware } from 'middlewares/auth.middleware';

// Initialize repositories
const shopRepository = new ShopRepository();
const serviceRepository = new ServiceRepository();
const otpRepository = new OtpRepository();

// Initialize services
const jwtService = new JwtService();
const emailService = new EmailService();
const shopService = new ShopService(shopRepository); 
const shopAuthService = new ShopAuthService(
  shopRepository,
  jwtService,
  emailService,
  otpRepository
);
const serviceService = new ServiceService(serviceRepository);

// Initialize middleware
const authMiddlewareInstance = new AuthMiddleware(jwtService);
const authMiddleware = authMiddlewareInstance;

// Initialize controllers with dependencies
const injectedShopAuthController = new ShopAuthController(shopAuthService);
const injectedShopController = new ShopController(shopService); 
const injectedServiceController = new ServiceController(serviceService);

// Export for route usage
export const shopDependencies = {
  shopAuthController: injectedShopAuthController,
  shopController: injectedShopController,
  serviceController: injectedServiceController,
  shopAuthService,
  serviceService,
  shopService,
  shopRepository,
  serviceRepository,
  jwtService,
  authMiddleware
};