import { Schema, model, Types, Document } from 'mongoose';
import { Shop, ShopDocument } from '../../models/shop.model';
import { INearbyRepository } from '../../interfaces/repositoryInterfaces/INearbyShopRepository';

export interface ShopQueryOptions {
  limit?: number;
  sortOrder?: 'asc' | 'desc';
  openNow?: boolean;
}

function timeToMinutes(time: string): number {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function isShopOpen(shop: ShopDocument, now: Date = new Date()): boolean {
  if (!shop.shopAvailability) return true; // Assume open if no availability data

  // Check day
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = days[now.getDay()];
  if (!shop.shopAvailability.workingDays.includes(currentDay)) {
    return false;
  }

  // Check custom holidays (assuming format 'YYYY-MM-DD')
  const currentDate = now.toISOString().slice(0, 10);
  if (shop.shopAvailability.customHolidays?.includes(currentDate)) {
    return false;
  }

  // Check time
  const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const currentMinutes = timeToMinutes(currentTimeStr);
  const openingMinutes = timeToMinutes(shop.shopAvailability.openingTime);
  const closingMinutes = timeToMinutes(shop.shopAvailability.closingTime);

  if (currentMinutes < openingMinutes || currentMinutes > closingMinutes) {
    return false;
  }

  // Check lunch break
  if (shop.shopAvailability.lunchBreak?.start && shop.shopAvailability.lunchBreak.end) {
    const lunchStart = timeToMinutes(shop.shopAvailability.lunchBreak.start);
    const lunchEnd = timeToMinutes(shop.shopAvailability.lunchBreak.end);
    if (currentMinutes >= lunchStart && currentMinutes < lunchEnd) {
      return false;
    }
  }

  // Check tea break
  if (shop.shopAvailability.teaBreak?.start && shop.shopAvailability.teaBreak.end) {
    const teaStart = timeToMinutes(shop.shopAvailability.teaBreak.start);
    const teaEnd = timeToMinutes(shop.shopAvailability.teaBreak.end);
    if (currentMinutes >= teaStart && currentMinutes < teaEnd) {
      return false;
    }
  }

  return true;
}

export class NearbyRepository implements INearbyRepository {
  async getNearbyShops(opts: ShopQueryOptions): Promise<ShopDocument[]> {
    const { limit = 50, sortOrder = 'asc', openNow = false } = opts;

    // To account for potential filtering, fetch more results internally
    const internalLimit = openNow ? limit * 4 : limit + 50; // Arbitrary buffer

    const query = {
      isActive: true,
      'isVerified.status': 'approved',
    };

    let results = await Shop.find(query).limit(internalLimit).exec() as ShopDocument[];

    // Filter for openNow if requested
    if (openNow) {
      results = results.filter(shop => isShopOpen(shop));
    }

    // Sort by name (or another field) if descending
    if (sortOrder === 'desc') {
      results.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Slice to limit
    results = results.slice(0, limit);

    return results;
  }
}