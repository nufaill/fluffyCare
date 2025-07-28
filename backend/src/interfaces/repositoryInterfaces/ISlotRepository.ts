import { Slot } from '../../types/slot.type';

export interface ISlotRepository {
    create(slotData: Partial<Slot>): Promise<Slot>;
    findById(id: string): Promise<Slot | null>;
    findByShopAndDateRange(shopId: string, startDate: string, endDate: string,): Promise<Slot[]>;
    findByShop(shopId: string): Promise<Slot[]>;
    update(id: string, updateData: Partial<Slot>): Promise<Slot | null>;
    delete(id: string): Promise<Slot | null>;
    cancel(id: string): Promise<Slot | null>;
    findByDate(slotDate: string): Promise<Slot[]>;
    findBookedByShop(shopId: string): Promise<Slot[]>;
}