import { ShopDocument } from '../../models/shop.model';

export interface ShopQueryOptions {
  limit?: number;
  sortOrder?: 'asc' | 'desc';
  openNow?: boolean;
}

export interface INearbyRepository {
  getNearbyShops(opts: ShopQueryOptions): Promise<ShopDocument[]>;
}