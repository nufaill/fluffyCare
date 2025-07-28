import { Model } from 'mongoose';
import { Slot } from '../types/slot.type';
import SlotModel from '../models/slot.model';
import { Staff } from '../types/staff.types';
import StaffModel from '../models/staff.model';
import { ISlotRepository } from '../interfaces/repositoryInterfaces/ISlotRepository';

export class SlotRepository implements ISlotRepository {
    private readonly slotModel: Model<Slot>;
    private readonly staffModel: Model<Staff>;

    constructor() {
        this.slotModel = SlotModel;
        this.staffModel = StaffModel;
    }

    async create(slotData: Partial<Slot>): Promise<Slot> {
        const slot = await this.slotModel.create(slotData);
        return slot.toObject();
    }

    async findById(id: string): Promise<Slot | null> {
        return this.slotModel
            .findOne({ _id: id, deletedAt: null })
            .populate('staffId', 'name phone')
            .lean()
            .exec();
    }

    async findByShopAndDateRange(
        shopId: string,
        startDate: string,
        endDate: string,
    ): Promise<Slot[]> {
        return this.slotModel
            .find({
                shopId,
                slotDate: { $gte: startDate, $lte: endDate },
                isActive: true,
                isCancelled: false,
                deletedAt: null,
            })
            .populate('staffId', 'name phone')
            .lean()
            .exec();
    }

    async findByShop(shopId: string): Promise<Slot[]> {
        return this.slotModel
            .find({ shopId, deletedAt: null })
            .populate('staffId', 'name phone')
            .lean()
            .exec();
    }

    async update(id: string, updateData: Partial<Slot>): Promise<Slot | null> {
        return this.slotModel
            .findOneAndUpdate(
                { _id: id, deletedAt: null },
                { $set: updateData },
                { new: true, lean: true },
            )
            .populate('staffId', 'name phone')
            .exec();
    }

    async delete(id: string): Promise<Slot | null> {
        return this.slotModel
            .findOneAndUpdate(
                { _id: id, deletedAt: null },
                { $set: { deletedAt: new Date() } },
                { new: true, lean: true },
            )
            .populate('staffId', 'name phone')
            .exec();
    }

    async cancel(id: string): Promise<Slot | null> {
        return this.slotModel
            .findOneAndUpdate(
                { _id: id, deletedAt: null },
                { $set: { isCancelled: true, isActive: false } },
                { new: true, lean: true },
            )
            .populate('staffId', 'name phone')
            .exec();
    }

    async findByDate(slotDate: string): Promise<Slot[]> {
        return this.slotModel
            .find({
                slotDate,
                isActive: true,
                isCancelled: false,
                deletedAt: null,
            })
            .populate('staffId', 'name phone')
            .lean()
            .exec();
    }

    async findBookedByShop(shopId: string): Promise<Slot[]> {
        return this.slotModel
            .find({
                shopId,
                isBooked: true,
                isActive: true,
                isCancelled: false,
                deletedAt: null,
            })
            .populate('staffId', 'name phone')
            .lean()
            .exec();
    }

    async getStaffByShop(
        shopId: string,
        options: {
            sortByCreatedAt?: 'asc' | 'desc';
            createdAtFrom?: string;
            createdAtTo?: string;
        } = {}
    ): Promise<{
        staff: { _id: string; name: string; phone: string }[];
        count: number;
    }> {
        const query: any = { shopId, isActive: true };
        if (options.createdAtFrom || options.createdAtTo) {
            query.createdAt = {};
            if (options.createdAtFrom) {
                query.createdAt.$gte = new Date(options.createdAtFrom);
            }
            if (options.createdAtTo) {
                query.createdAt.$lte = new Date(options.createdAtTo);
            }
        }
        const sort: any = {};
        if (options.sortByCreatedAt) {
            sort.createdAt = options.sortByCreatedAt === 'asc' ? 1 : -1;
        }

        const staff = await this.staffModel
            .find(query)
            .select('_id name phone') 
            .sort(sort)
            .lean()
            .exec();

        const staffList = staff.map((s) => ({
            _id: s._id.toString(), 
            name: s.name,
            phone: s.phone || '',
        }));
        return {
            staff: staffList,
            count: staffList.length,
        };
    }
}