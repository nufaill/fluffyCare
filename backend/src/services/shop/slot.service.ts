import { SlotRepository } from '../../repositories/slot.repository';
import { ISlotService } from '../../interfaces/serviceInterfaces/ISlotService';
import { Slot } from '../../types/slot.type';
import { Types } from 'mongoose';

export class SlotService implements ISlotService {
  private readonly slotRepository: SlotRepository;

  constructor(slotRepository: SlotRepository) {
    this.slotRepository = slotRepository;
  }

  private validateDateFormat(date: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(date) && !isNaN(new Date(date).getTime());
  }

  private validateTimeFormat(time: string): boolean {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  }

  private async hasOverlappingSlot(
    shopId: string,
    slotDate: string,
    startTime: string,
    endTime: string,
    staffId: string,
    excludeId?: string,
  ): Promise<boolean> {
    const slots = await this.slotRepository.findByShopAndDateRange(shopId, slotDate, slotDate);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const newStart = startHour * 60 + startMinute;
    const newEnd = endHour * 60 + endMinute;

    return slots.some((slot) => {
      if (excludeId && slot._id?.toString() === excludeId) return false;
      if (slot.staffId.toString() !== staffId) return false;
      const [slotStartHour, slotStartMinute] = slot.startTime.split(':').map(Number);
      const [slotEndHour, slotEndMinute] = slot.endTime.split(':').map(Number);
      const slotStart = slotStartHour * 60 + slotStartMinute;
      const slotEnd = slotEndHour * 60 + slotEndMinute;
      return slot.isActive && !slot.isCancelled && newStart < slotEnd && newEnd > slotStart;
    });
  }

  async create(slotData: Partial<Slot>): Promise<Slot> {
    if (!slotData.shopId || !Types.ObjectId.isValid(slotData.shopId)) {
      throw new Error('Invalid shop ID');
    }
    if (!slotData.staffId || !Types.ObjectId.isValid(slotData.staffId)) {
      throw new Error('Invalid staff ID');
    }
    if (!slotData.slotDate || !this.validateDateFormat(slotData.slotDate)) {
      throw new Error('Invalid slot date format (YYYY-MM-DD required)');
    }
    if (
      !slotData.startTime ||
      !slotData.endTime ||
      !this.validateTimeFormat(slotData.startTime) ||
      !this.validateTimeFormat(slotData.endTime)
    ) {
      throw new Error('Invalid time format (HH:MM required)');
    }
    if (!slotData.durationInMinutes || slotData.durationInMinutes <= 0) {
      throw new Error('Invalid duration');
    }
    const hasOverlap = await this.hasOverlappingSlot(
      slotData.shopId.toString(),
      slotData.slotDate,
      slotData.startTime,
      slotData.endTime,
      slotData.staffId.toString(),
    );
    if (hasOverlap) {
      throw new Error('Slot overlaps with an existing active slot for this staff');
    }
    return this.slotRepository.create(slotData);
  }
  async findById(id: string): Promise<Slot | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid slot ID');
    }
    return this.slotRepository.findById(id);
  }

  async findByShopAndDateRange(shopId: string, startDate: string, endDate: string): Promise<Slot[]> {
    if (!Types.ObjectId.isValid(shopId)) {
      throw new Error('Invalid shop ID');
    }
    if (!this.validateDateFormat(startDate) || !this.validateDateFormat(endDate)) {
      throw new Error('Invalid date format (YYYY-MM-DD required)');
    }
    return this.slotRepository.findByShopAndDateRange(shopId, startDate, endDate);
  }

  async findByShop(shopId: string): Promise<Slot[]> {
    if (!Types.ObjectId.isValid(shopId)) {
      throw new Error('Invalid shop ID');
    }
    return this.slotRepository.findByShop(shopId);
  }

  async update(id: string, updateData: Partial<Slot>): Promise<Slot | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid slot ID');
    }
    if (updateData.slotDate && !this.validateDateFormat(updateData.slotDate)) {
      throw new Error('Invalid slot date format (YYYY-MM-DD required)');
    }
    if (
      (updateData.startTime && !this.validateTimeFormat(updateData.startTime)) ||
      (updateData.endTime && !this.validateTimeFormat(updateData.endTime))
    ) {
      throw new Error('Invalid time format (HH:MM required)');
    }
    if (updateData.durationInMinutes && updateData.durationInMinutes <= 0) {
      throw new Error('Invalid duration');
    }
    if (updateData.staffId && !Types.ObjectId.isValid(updateData.staffId)) {
      throw new Error('Invalid staff ID');
    }
    if (updateData.shopId || updateData.staffId || updateData.startTime || updateData.endTime || updateData.slotDate) {
      const slot = await this.slotRepository.findById(id);
      if (!slot) {
        throw new Error('Slot not found');
      }
      const hasOverlap = await this.hasOverlappingSlot(
        (updateData.shopId || slot.shopId).toString(),
        updateData.slotDate || slot.slotDate,
        updateData.startTime || slot.startTime,
        updateData.endTime || slot.endTime,
        (updateData.staffId || slot.staffId).toString(),
        id,
      );
      if (hasOverlap) {
        throw new Error('Updated slot overlaps with an existing active slot for this staff');
      }
    }
    return this.slotRepository.update(id, updateData);
  }

  async delete(id: string): Promise<Slot | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid slot ID');
    }
    return this.slotRepository.delete(id);
  }

  async cancel(id: string): Promise<Slot | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid slot ID');
    }
    return this.slotRepository.cancel(id);
  }

  async findByDate(slotDate: string): Promise<Slot[]> {
    if (!this.validateDateFormat(slotDate)) {
      throw new Error('Invalid slot date format (YYYY-MM-DD required)');
    }
    return this.slotRepository.findByDate(slotDate);
  }

  async findBookedByShop(shopId: string): Promise<Slot[]> {
    if (!Types.ObjectId.isValid(shopId)) {
      throw new Error('Invalid shop ID');
    }
    return this.slotRepository.findBookedByShop(shopId);
  }

  async getStaffByShop(
    shopId: string,
    options: {
      sortByCreatedAt?: 'asc' | 'desc';
      createdAtFrom?: string;
      createdAtTo?: string;
    } = {}
  ): Promise<{
    staff: { name: string; phone: string }[];
    count: number;
  }> {
    if (!Types.ObjectId.isValid(shopId)) {
      throw new Error('Invalid shop ID');
    }
    if (options.createdAtFrom && !this.validateDateFormat(options.createdAtFrom)) {
      throw new Error('Invalid createdAtFrom date format (YYYY-MM-DD required)');
    }
    if (options.createdAtTo && !this.validateDateFormat(options.createdAtTo)) {
      throw new Error('Invalid createdAtTo date format (YYYY-MM-DD required)');
    }
    return this.slotRepository.getStaffByShop(shopId, options);
  }
}