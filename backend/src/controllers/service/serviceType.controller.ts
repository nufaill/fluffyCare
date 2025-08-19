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

            if (!serviceTypeData.name || typeof serviceTypeData.name !== 'string' || serviceTypeData.name.trim().length === 0) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Service type name is required and must be a non-empty string'
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
            const serviceTypes = await this._service.getAllServiceTypes();

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

            if (!serviceTypeData.name || typeof serviceTypeData.name !== 'string' || serviceTypeData.name.trim().length === 0) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Service type name is required and must be a non-empty string'
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
}