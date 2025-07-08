// shopInjection.ts
import { ShopAuthController } from "../controllers/shop/auth.controller";
import { ShopController } from "../controllers/shop/shop.controller";
import { ServiceController } from "../controllers/service/service.controller";
import { ShopRepository } from "../repositories/shopRepository";
import { ServiceRepository } from "../repositories/serviceRepository";
import { AuthService as ShopAuthService } from "../services/shop/auth.service";
import { ServiceService } from "../services/service/service.service";
import { JwtService } from "../services/jwt/jwt.service";
import { EmailService } from "../services/emailService/email.service";
import { OtpRepository } from "../repositories/otpRepository";
import { AuthMiddleware } from 'middlewares/auth.middleware';

// Initialize repositories
const shopRepository = new ShopRepository();
const serviceRepository = new ServiceRepository();
const otpRepository = new OtpRepository();

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

const serviceService = new ServiceService(serviceRepository);

const injectedShopAuthController = new ShopAuthController(shopAuthService);
const injectedShopController = new ShopController(shopRepository);
const injectedServiceController = new ServiceController(serviceService);

export const shopDependencies = {
  shopAuthController: injectedShopAuthController,
  shopController: injectedShopController,
  serviceController: injectedServiceController,
  shopAuthService,
  serviceService,
  shopRepository,
  serviceRepository,
  jwtService,
  authMiddleware
};