import { Request, Response, NextFunction } from 'express';
import { IStaffService } from '../../interfaces/serviceInterfaces/IStaffService';
import { IStaffController } from '../../interfaces/controllerInterfaces/IStaffController';
import { createStaffDTO, updatesStaffDTO, UpdateStaffStatusDTO, StaffResponseDTO } from '../../dto/staff.dto';
import { HTTP_STATUS } from '../../shared/constant';
import { CustomError } from '../../util/CustomerError';
import mongoose from 'mongoose';

export class StaffController implements IStaffController {
  private readonly _staffService: IStaffService;

  constructor(staffService: IStaffService) {
    this._staffService = staffService;
  }

  async getAllStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const shopId = req.query.shopId as string;

      if (!shopId) {
        throw new CustomError('Shop ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      if (isNaN(page) || page < 1) {
        throw new CustomError('Invalid page number', HTTP_STATUS.BAD_REQUEST);
      }
      if (isNaN(limit) || limit < 1) {
        throw new CustomError('Invalid limit value', HTTP_STATUS.BAD_REQUEST);
      }

      const { staff, total } = await this._staffService.getAllStaff(page, limit, shopId as string);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          staff,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        message: 'Staff list retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shopId } = req.params;
      const staffData: createStaffDTO = req.body;

      if (!shopId) {
        throw new CustomError('Shop ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      if (!mongoose.Types.ObjectId.isValid(shopId)) {
        throw new CustomError('Invalid Shop ID format', HTTP_STATUS.BAD_REQUEST);
      }

      const staffPayload: createStaffDTO & { shopId: string | mongoose.Types.ObjectId } = {
        ...staffData,
        shopId
      };

      const newStaff = await this._staffService.create(staffPayload);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: newStaff,
        message: 'Staff created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CustomError('Staff ID is required', HTTP_STATUS.BAD_REQUEST);
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError('Invalid Staff ID format', HTTP_STATUS.BAD_REQUEST);
      }
      const staff = await this._staffService.findById(id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: staff,
        message: 'Staff retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async findByShopId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shopId } = req.params;
      if (!shopId) {
        throw new CustomError('Shop ID is required', HTTP_STATUS.BAD_REQUEST);
      }
      if (!mongoose.Types.ObjectId.isValid(shopId)) {
        throw new CustomError('Invalid Shop ID format', HTTP_STATUS.BAD_REQUEST);
      }
      const staffList = await this._staffService.findByShopId(shopId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: staffList,
        message: 'Staff list retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { staffId } = req.params;
      const staffData: updatesStaffDTO = req.body;
      if (!staffId) {
        throw new CustomError('Staff ID is required', HTTP_STATUS.BAD_REQUEST);
      }
      if (!mongoose.Types.ObjectId.isValid(staffId)) {
        throw new CustomError('Invalid Staff ID format', HTTP_STATUS.BAD_REQUEST);
      }
      const updatedStaff = await this._staffService.update(staffId, staffData);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: updatedStaff,
        message: 'Staff updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async findByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.query;
      if (!email || typeof email !== 'string') {
        throw new CustomError('Email is required', HTTP_STATUS.BAD_REQUEST);
      }
      const staff = await this._staffService.findByEmail(email);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: staff,
        message: staff ? 'Staff retrieved successfully' : 'Staff not found',
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { staffId } = req.params;
      const statusData: UpdateStaffStatusDTO = req.body;
      if (!staffId) {
        throw new CustomError('Staff ID is required', HTTP_STATUS.BAD_REQUEST);
      }
      if (!mongoose.Types.ObjectId.isValid(staffId)) {
        throw new CustomError('Invalid Staff ID format', HTTP_STATUS.BAD_REQUEST);
      }
      const updatedStaff = await this._staffService.toggleStatus(staffId, statusData);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: updatedStaff,
        message: 'Staff status toggled successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}