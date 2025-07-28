import { Request, Response } from 'express';
import { SlotService } from '../../services/shop/slot.service';
import { ISlotController } from '../../interfaces/controllerInterfaces/ISlotController';
import { Slot } from '../../types/slot.type';

export class SlotController implements ISlotController {
  private readonly slotService: SlotService;

  constructor(slotService: SlotService) {
    if (!slotService) {
      throw new Error('SlotService is required');
    }
    this.slotService = slotService;
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!this.slotService) {
        res.status(500).json({
          success: false,
          message: 'SlotService not initialized'
        });
        return;
      }

      const slotData: Partial<Slot> = req.body;
      const newSlot = await this.slotService.create(slotData);

      res.status(201).json({
        success: true,
        data: newSlot,
        message: 'Slot created successfully'
      });
    } catch (error: any) {
      console.error(error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      if (!this.slotService) {
        res.status(500).json({
          success: false,
          message: 'SlotService not initialized'
        });
        return;
      }

      const { slotId: id } = req.params;
      const slot = await this.slotService.findById(id);

      if (!slot) {
        res.status(404).json({
          success: false,
          message: 'Slot not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: slot,
        message: 'Slot retrieved successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async findByShopAndDateRange(req: Request, res: Response): Promise<void> {
    try {
      if (!this.slotService) {
        res.status(500).json({
          success: false,
          message: 'SlotService not initialized'
        });
        return;
      }

      const { shopId } = req.params;
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'startDate and endDate query parameters are required'
        });
        return;
      }

      const slots = await this.slotService.findByShopAndDateRange(shopId, startDate, endDate);

      res.status(200).json({
        success: true,
        data: slots,
        message: 'Slots retrieved successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async findByShop(req: Request, res: Response): Promise<void> {
    try {
      if (!this.slotService) {
        res.status(500).json({
          success: false,
          message: 'SlotService not initialized'
        });
        return;
      }

      const { shopId } = req.params;
      const slots = await this.slotService.findByShop(shopId);

      res.status(200).json({
        success: true,
        data: slots,
        message: 'Slots retrieved successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      if (!this.slotService) {
        res.status(500).json({
          success: false,
          message: 'SlotService not initialized'
        });
        return;
      }

      const { slotId: id } = req.params;
      const updateData: Partial<Slot> = req.body;
      const updatedSlot = await this.slotService.update(id, updateData);

      if (!updatedSlot) {
        res.status(404).json({
          success: false,
          message: 'Slot not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedSlot,
        message: 'Slot updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      if (!this.slotService) {
        res.status(500).json({
          success: false,
          message: 'SlotService not initialized'
        });
        return;
      }

      const { slotId: id } = req.params;
      const deletedSlot = await this.slotService.delete(id);

      if (!deletedSlot) {
        res.status(404).json({
          success: false,
          message: 'Slot not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: deletedSlot,
        message: 'Slot deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async cancel(req: Request, res: Response): Promise<void> {
    try {
      if (!this.slotService) {
        res.status(500).json({
          success: false,
          message: 'SlotService not initialized'
        });
        return;
      }

      const { slotId: id } = req.params;
      const cancelledSlot = await this.slotService.cancel(id);

      if (!cancelledSlot) {
        res.status(404).json({
          success: false,
          message: 'Slot not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: cancelledSlot,
        message: 'Slot cancelled successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async findByDate(req: Request, res: Response): Promise<void> {
    try {
      if (!this.slotService) {
        res.status(500).json({
          success: false,
          message: 'SlotService not initialized'
        });
        return;
      }

      const { slotDate } = req.params;
      const slots = await this.slotService.findByDate(slotDate);

      res.status(200).json({
        success: true,
        data: slots,
        message: 'Slots retrieved successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async findBookedByShop(req: Request, res: Response): Promise<void> {
    try {
      if (!this.slotService) {
        res.status(500).json({
          success: false,
          message: 'SlotService not initialized'
        });
        return;
      }

      const { shopId } = req.params;
      const slots = await this.slotService.findBookedByShop(shopId);

      res.status(200).json({
        success: true,
        data: slots,
        message: 'Booked slots retrieved successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getStaffByShop(req: Request, res: Response): Promise<void> {
    try {
      if (!this.slotService) {
        res.status(500).json({
          success: false,
          message: 'SlotService not initialized'
        });
        return;
      }

      const { shopId } = req.params;
      const { sortByCreatedAt, createdAtFrom, createdAtTo } = req.query as {
        sortByCreatedAt?: 'asc' | 'desc';
        createdAtFrom?: string;
        createdAtTo?: string;
      };

      if (sortByCreatedAt && !['asc', 'desc'].includes(sortByCreatedAt)) {
        res.status(400).json({
          success: false,
          message: 'Invalid sortByCreatedAt value. Must be "asc" or "desc"',
        });
        return;
      }

      const options: {
        sortByCreatedAt?: 'asc' | 'desc';
        createdAtFrom?: string;
        createdAtTo?: string;
      } = {};
      if (sortByCreatedAt) options.sortByCreatedAt = sortByCreatedAt;
      if (createdAtFrom) options.createdAtFrom = createdAtFrom;
      if (createdAtTo) options.createdAtTo = createdAtTo;

      const result = await this.slotService.getStaffByShop(shopId, options);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Staff retrieved successfully',
      });
    } catch (error: any) {
      console.error(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getslotByShopId(req: Request, res: Response): Promise<void> {
    try {
      if (!this.slotService) {
        res.status(500).json({
          success: false,
          message: 'SlotService not initialized',
        });
        return;
      }

      const { shopId } = req.params;
      const slots = await this.slotService.findByShop(shopId);

      const availableSlots = slots.filter(
        (slot) => !slot.isBooked && slot.isActive && !slot.isCancelled && !slot.deletedAt
      );

      res.status(200).json({
        success: true,
        data: availableSlots,
        message: 'Available slots retrieved successfully',
      });
    } catch (error: any) {
      console.error(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}