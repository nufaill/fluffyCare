import { ShopRepository } from '../../repositories/shop.repository';
import { CustomError } from '../../util/CustomerError';
import { HTTP_STATUS } from '../../shared/constant';
import { ShopAvailabilityDTO, ShopResponseDTO } from '../../dto/shop.dto';
import { IShopAvailabilityService } from '../../interfaces/serviceInterfaces/IShopAvailabilityService';
import { ShopAvailability } from '../../types/Shop.types';

export class ShopAvailabilityService implements IShopAvailabilityService {
    constructor(private readonly shopRepository: ShopRepository) { }

    private validateAvailabilityData(data: ShopAvailabilityDTO): void {
        if (!data.workingDays || !Array.isArray(data.workingDays) || data.workingDays.length === 0) {
            throw new CustomError('At least one working day must be provided', HTTP_STATUS.BAD_REQUEST);
        }

        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        if (!data.workingDays.every(day => validDays.includes(day))) {
            throw new CustomError('Invalid working days provided', HTTP_STATUS.BAD_REQUEST);
        }

        const timeFormat = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!data.openingTime || !timeFormat.test(data.openingTime)) {
            throw new CustomError('Invalid opening time format (HH:MM required)', HTTP_STATUS.BAD_REQUEST);
        }

        if (!data.closingTime || !timeFormat.test(data.closingTime)) {
            throw new CustomError('Invalid closing time format (HH:MM required)', HTTP_STATUS.BAD_REQUEST);
        }

        if (data.lunchBreak && (!timeFormat.test(data.lunchBreak.start) || !timeFormat.test(data.lunchBreak.end))) {
            throw new CustomError('Invalid lunch break time format (HH:MM required)', HTTP_STATUS.BAD_REQUEST);
        }

        if (data.customHolidays) {
            if (!Array.isArray(data.customHolidays) || !data.customHolidays.every(date => /^\d{4}-\d{2}-\d{2}$/.test(date))) {
                throw new CustomError('Invalid custom holidays format (YYYY-MM-DD required)', HTTP_STATUS.BAD_REQUEST);
            }
        }
    }

    async getShopAvailability(shopId: string): Promise<ShopAvailabilityDTO> {
        if (!/^[a-f\d]{24}$/i.test(shopId)) {
            throw new CustomError('Invalid shop ID', HTTP_STATUS.BAD_REQUEST);
        }

        const shop = await this.shopRepository.findById(shopId);
        if (!shop) {
            throw new CustomError('Shop not found', HTTP_STATUS.NOT_FOUND);
        }

        // Provide default availability if not configured
        const defaultAvailability: ShopAvailability = {
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            openingTime: '09:00',
            closingTime: '18:00',
            lunchBreak: { start: '13:00', end: '14:00' },
            teaBreak: { start: '', end: '' },
            customHolidays: [],
        };

        const availability = shop.shopAvailability || defaultAvailability ;

        return {
            workingDays: availability.workingDays,
            openingTime: availability.openingTime,
            closingTime: availability.closingTime,
            lunchBreak: availability.lunchBreak
                ? {
                    start: availability.lunchBreak.start || '',
                    end: availability.lunchBreak.end || '',
                }
                : { start: '', end: '' },
            teaBreak: availability.teaBreak
                ? {
                    start: availability.teaBreak.start || '',
                    end: availability.teaBreak.end || '',
                }
                : { start: '', end: '' },
            customHolidays: availability.customHolidays || [],
        };
    }

    async updateShopAvailability(shopId: string, data: ShopAvailabilityDTO): Promise<ShopResponseDTO> {
        this.validateAvailabilityData(data);

        if (!/^[a-f\d]{24}$/i.test(shopId)) {
            throw new CustomError('Invalid shop ID', HTTP_STATUS.BAD_REQUEST);
        }

        const shop = await this.shopRepository.findById(shopId);
        if (!shop) {
            throw new CustomError('Shop not found', HTTP_STATUS.NOT_FOUND);
        }

        const updatedAvailability: ShopAvailability = {
            workingDays: data.workingDays,
            openingTime: data.openingTime,
            closingTime: data.closingTime,
            lunchBreak: data.lunchBreak || { start: '', end: '' },
            teaBreak: data.teaBreak || { start: '', end: '' },
            customHolidays: data.customHolidays || [],
        };

        const updatedShop = await this.shopRepository.updateShop(shopId, { shopAvailability: updatedAvailability });
        if (!updatedShop) {
            throw new CustomError('Shop not found', HTTP_STATUS.NOT_FOUND);
        }

        return updatedShop as ShopResponseDTO;
    }
}