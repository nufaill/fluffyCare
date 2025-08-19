import { ShopAuthController } from "../controllers/shop/auth.controller";
import { ShopController } from "../controllers/shop/shop.controller";
import { ServiceController } from "../controllers/service/service.controller";
import { StaffController } from '../controllers/shop/staff.controller';
import { WalletController } from "@controllers/wallet.controller";
import { OtpRepository } from "../repositories/otp.repository";
import { ShopRepository } from "../repositories/shop.repository";
import { ServiceRepository } from "../repositories/service.repository";
import { StaffRepository } from '../repositories/staff.repository';
import { WalletRepository } from "repositories/wallet.repository";
import { AuthService as ShopAuthService } from "../services/shop/auth.service";
import { ShopService } from "../services/shop/shop.service";
import { ServiceService } from "../services/service/service.service";
import { StaffService } from '../services/shop/staff.service';
import { ShopAvailabilityService } from '../services/shop/shopAvailability.service';
import { WalletService } from "services/wallet.service";
import { JwtService } from "../services/jwt/jwt.service";
import { EmailService } from "../services/emailService/email.service";
import { AuthMiddleware } from "../middlewares/auth.middleware";

// Initialize repositories
const shopRepository = new ShopRepository();
const serviceRepository = new ServiceRepository();
const otpRepository = new OtpRepository();
const staffRepository = new StaffRepository();
const walletRepository = new WalletRepository();

// Initialize services
const jwtService = new JwtService();
const emailService = new EmailService();
const shopService = new ShopService(shopRepository);
const shopAvailabilityService = new ShopAvailabilityService(shopRepository);
const walletService = new WalletService(walletRepository);
const shopAuthService = new ShopAuthService(
  shopRepository,
  jwtService,
  emailService,
  otpRepository
);
const serviceService = new ServiceService(serviceRepository);
const staffService = new StaffService(staffRepository);

// Initialize middleware
const authMiddlewareInstance = new AuthMiddleware(jwtService);
const authMiddleware = authMiddlewareInstance;

// Initialize controllers with dependencies
const injectedShopAuthController = new ShopAuthController(shopAuthService);
const injectedShopController = new ShopController(shopService, shopAvailabilityService, walletService);
const injectedServiceController = new ServiceController(serviceService);
const injectedStaffController = new StaffController(staffService);

const boundShopAuthController = {
  register: injectedShopAuthController.register.bind(injectedShopAuthController),
  verifyOtp: injectedShopAuthController.verifyOtp.bind(injectedShopAuthController),
  resendOtp: injectedShopAuthController.resendOtp.bind(injectedShopAuthController),
  login: injectedShopAuthController.login.bind(injectedShopAuthController),
  logout: injectedShopAuthController.logout.bind(injectedShopAuthController),
  refreshToken: injectedShopAuthController.refreshToken.bind(injectedShopAuthController),
  sendResetLink: injectedShopAuthController.sendResetLink.bind(injectedShopAuthController),
  resetPassword: injectedShopAuthController.resetPassword.bind(injectedShopAuthController),
};

const boundServiceController = {
  createService: injectedServiceController.createService.bind(injectedServiceController),
  getServicesByShop: injectedServiceController.getServicesByShop.bind(injectedServiceController),
  getServiceById: injectedServiceController.getServiceById.bind(injectedServiceController),
  getServiceByIdPublic: injectedServiceController.getServiceByIdPublic.bind(injectedServiceController),
  updateService: injectedServiceController.updateService.bind(injectedServiceController),
  toggleServiceStatus: injectedServiceController.toggleServiceStatus.bind(injectedServiceController),
  getServiceTypes: injectedServiceController.getServiceTypes.bind(injectedServiceController),
  getPetTypes: injectedServiceController.getPetTypes.bind(injectedServiceController),
  getAllServices: injectedServiceController.getAllServices.bind(injectedServiceController),
};

const boundStaffController = {
  create: injectedStaffController.create.bind(injectedStaffController),
  findById: injectedStaffController.findById.bind(injectedStaffController),
  findByShopId: injectedStaffController.findByShopId.bind(injectedStaffController),
  getAllStaff: injectedStaffController.getAllStaff.bind(injectedStaffController),
  update: injectedStaffController.update.bind(injectedStaffController),
  findByEmail: injectedStaffController.findByEmail.bind(injectedStaffController),
  toggleStatus: injectedStaffController.toggleStatus.bind(injectedStaffController),
};

// Export for route usage
export const shopDependencies = {
  shopAuthController: boundShopAuthController,
  shopController: injectedShopController,
  serviceController: boundServiceController,
  staffController: boundStaffController,
  shopAuthService,
  shopService,
  shopAvailabilityService,
  serviceService,
  staffService,
  shopRepository,
  serviceRepository,
  staffRepository,
  jwtService,
  authMiddleware,
};