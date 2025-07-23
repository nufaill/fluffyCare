import { Request, Response, NextFunction } from 'express';
import { StaffService } from '../../services/shop/staff.service';
import { IStaffController } from '../../interfaces/controllerInterfaces/IStaffController';
import { Staff } from '../../types/staff.types';
import { HTTP_STATUS } from '../../shared/constant';
import { CustomError } from '../../util/CustomerError';

export class StaffController implements IStaffController {
  constructor(private staffService: StaffService) {}
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const shopId = req.shop?.shopId;
      const staffData =req.body;
      if (!shopId) {
        throw new CustomError('Shop ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      const staffPayload = {
        ...staffData,
        shopId: shopId
      };

      const newStaff = await this.staffService.create(staffPayload);
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
      const staff = await this.staffService.findById(id);
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
      const shopId = req.shop?.shopId;
      if (!shopId) {
        throw new CustomError('Shop ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      const staffList = await this.staffService.findByShopId(shopId as string);
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
      const staffData: Partial<Staff> = req.body;
      if (!staffId) {
        throw new CustomError('Staff ID is required', HTTP_STATUS.BAD_REQUEST);
      }
      const updatedStaff = await this.staffService.update(staffId, staffData);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: updatedStaff,
        message: 'Staff updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { staffId } = req.params;
      if (!staffId) {
        throw new CustomError('Staff ID is required', HTTP_STATUS.BAD_REQUEST);
      }
      await this.staffService.delete(staffId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Staff deleted successfully',
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
      const staff = await this.staffService.findByEmail(email);
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
      if (!staffId) {
        throw new CustomError('Staff ID is required', HTTP_STATUS.BAD_REQUEST);
      }
      const updatedStaff = await this.staffService.toggleStatus(staffId);
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