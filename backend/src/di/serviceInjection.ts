// serviceInjection.ts
import { ServiceController } from '../controllers/service/service.controller';
import { ServiceService } from '../services/service/service.service';
import { ServiceRepository } from '../repositories/service/service.repository';

// Instantiate dependencies
const serviceRepository = new ServiceRepository();
const serviceService = new ServiceService(serviceRepository);
const serviceController = new ServiceController(serviceService);

export const serviceDependencies = {
  serviceController,
  serviceService,
  serviceRepository,
};