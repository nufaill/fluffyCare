import { ShopAuthController } from "../controllers/shop/auth.controller";
import { ShopController } from "../controllers/shop/shop.controller";
import { ServiceController } from "../controllers/service/service.controller";
import { StaffController } from '../controllers/shop/staff.controller';
import { SlotController } from "../controllers/shop/slot.controller";
import { OtpRepository } from "../repositories/otp.repository";
import { ShopRepository } from "../repositories/shop.repository";
import { ServiceRepository } from "../repositories/service.repository";
import { StaffRepository } from '../repositories/staff.repository';
import { SlotRepository } from "../repositories/slot.repository";
import { AuthService as ShopAuthService } from "../services/shop/auth.service";
import { ShopService } from "../services/shop/shop.service"; 
import { ServiceService } from "../services/service/service.service";
import { StaffService } from '../services/shop/staff.service';
import { ShopAvailabilityService } from '../services/shop/shopAvailability.service';
import { SlotService } from "../services/shop/slot.service";
import { JwtService } from "../services/jwt/jwt.service";
import { EmailService } from "../services/emailService/email.service";
import { AuthMiddleware } from "../middlewares/auth.middleware";

// Initialize repositories
const shopRepository = new ShopRepository();
const serviceRepository = new ServiceRepository();
const otpRepository = new OtpRepository();
const staffRepository = new StaffRepository();
const slotRepository = new SlotRepository();

// Initialize services
const jwtService = new JwtService();
const emailService = new EmailService();
const shopService = new ShopService(shopRepository); 
const shopAvailabilityService = new ShopAvailabilityService(shopRepository);
const shopAuthService = new ShopAuthService(
  shopRepository,
  jwtService,
  emailService,
  otpRepository
);
const serviceService = new ServiceService(serviceRepository);
const staffService = new StaffService(staffRepository);
const slotService = new SlotService(slotRepository);

// Initialize middleware
const authMiddlewareInstance = new AuthMiddleware(jwtService);
const authMiddleware = authMiddlewareInstance;

// Initialize controllers with dependencies
const injectedShopAuthController = new ShopAuthController(shopAuthService);
const injectedShopController = new ShopController(shopService, shopAvailabilityService); 
const injectedServiceController = new ServiceController(serviceService);
const injectedStaffController = new StaffController(staffService);
const injectedSlotController = new SlotController(slotService);

const boundStaffController = {
  create: injectedStaffController.create.bind(injectedStaffController),
  findById: injectedStaffController.findById.bind(injectedStaffController),
  findByShopId: injectedStaffController.findByShopId.bind(injectedStaffController),
  getAllStaff: injectedStaffController.getAllStaff.bind(injectedStaffController),
  update: injectedStaffController.update.bind(injectedStaffController),
  findByEmail: injectedStaffController.findByEmail.bind(injectedStaffController),
  toggleStatus: injectedStaffController.toggleStatus.bind(injectedStaffController)
};

const boundSlotController = {
  create: injectedSlotController.create.bind(injectedSlotController),
  findById: injectedSlotController.findById.bind(injectedSlotController),
  findByShopAndDateRange: injectedSlotController.findByShopAndDateRange.bind(injectedSlotController),
  findByShop: injectedSlotController.findByShop.bind(injectedSlotController),
  update: injectedSlotController.update.bind(injectedSlotController),
  delete: injectedSlotController.delete.bind(injectedSlotController),
  cancel: injectedSlotController.cancel.bind(injectedSlotController),
  findByDate: injectedSlotController.findByDate.bind(injectedSlotController),
  getStaffByShop: injectedSlotController.getStaffByShop.bind(injectedSlotController),
  findBookedByShop: injectedSlotController.findBookedByShop.bind(injectedSlotController)
};

// Export for route usage
export const shopDependencies = {
  shopAuthController: injectedShopAuthController,
  shopController: injectedShopController,
  serviceController: injectedServiceController,
  staffController: boundStaffController,
  slotController: boundSlotController, 
  shopAuthService,
  shopService,
  shopAvailabilityService,
  serviceService,
  staffService,
  slotService,
  shopRepository,
  serviceRepository,
  staffRepository,
  slotRepository,
  jwtService,
  authMiddleware
};