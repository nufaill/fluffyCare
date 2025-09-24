import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { IServiceTypeService } from '../../interfaces/serviceInterfaces/IServiceTypeService';
import { CreateServiceTypeDTO, UpdateServiceTypeDTO, UpdateServiceTypeStatusDTO } from '../../dto/serviceType.dto';
import { IServiceTypeController } from '../../interfaces/controllerInterfaces/IServiceTypeController';

export class ServiceTypeController implements IServiceTypeController {
    private readonly _service: IServiceTypeService;

    constructor(service: IServiceTypeService) {
        this._service = service;
    }

    async createServiceType(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const serviceTypeData: CreateServiceTypeDTO = req.body;
            
            const nameValidation = this.validateName(serviceTypeData.name);
            if (!nameValidation.isValid) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: nameValidation.message
                });
                return;
            }

            const newServiceType = await this._service.createServiceType(serviceTypeData);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: SUCCESS_MESSAGES.CREATED,
                data: newServiceType
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllServiceTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { search, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
            
            const filter: Record<string, unknown> = {};
            if (typeof search === 'string' && search.trim()) {
                filter.name = { $regex: search.trim(), $options: 'i' };
            }
            if (typeof isActive === 'string' && ['true', 'false'].includes(isActive)) {
                filter.isActive = isActive === 'true';
            }

            const validSortFields = ['name', 'createdAt', 'updatedAt', 'isActive'] as const;
            type SortField = typeof validSortFields[number];

            const validatedSortBy: SortField = validSortFields.includes(sortBy as SortField)
                ? sortBy as SortField
                : 'createdAt';

            const validatedSortOrder = sortOrder === 'asc' ? 1 : -1;

            const serviceTypes = await this._service.getAllServiceTypes({
                filter,
                sort: { [validatedSortBy]: validatedSortOrder }
            });

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.FETCHED_SUCESS,
                data: serviceTypes
            });
        } catch (error) {
            next(error);
        }
    }

    async getServiceTypeById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Service type ID is required'
                });
                return;
            }

            const serviceType = await this._service.getServiceTypeById(id);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.FETCHED_SUCESS,
                data: serviceType
            });
        } catch (error) {
            next(error);
        }
    }

    async updateServiceType(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const serviceTypeData: UpdateServiceTypeDTO = req.body;

            if (!id) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Service type ID is required'
                });
                return;
            }

            const nameValidation = this.validateName(serviceTypeData.name);
            if (!nameValidation.isValid) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: nameValidation.message
                });
                return;
            }

            const updatedServiceType = await this._service.updateServiceType(id, serviceTypeData);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
                data: updatedServiceType
            });
        } catch (error) {
            next(error);
        }
    }

    async updateServiceTypeStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const statusData: UpdateServiceTypeStatusDTO = req.body;

            if (!id) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Service type ID is required'
                });
                return;
            }

            if (typeof statusData.isActive !== 'boolean') {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'isActive must be a boolean value'
                });
                return;
            }

            const updatedServiceType = await this._service.updateServiceTypeStatus(id, statusData);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
                data: updatedServiceType
            });
        } catch (error) {
            next(error);
        }
    }

    private validateName(name: string): { isValid: boolean; message: string } {
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return { isValid: false, message: 'Service type name is required' };
        }

        if (name.includes(' ')) {
            return { isValid: false, message: 'Service type name cannot contain spaces' };
        }

        if (name.length < 3 || name.length > 20) {
            return { isValid: false, message: 'Service type name must be between 3 and 20 characters' };
        }

        if (!/^[a-zA-Z0-9]+$/.test(name)) {
            return { isValid: false, message: 'Service type name can only contain alphanumeric characters' };
        }

        return { isValid: true, message: '' };
    }
}