import { INearbyRepository } from '../../interfaces/repositoryInterfaces/INearbyShopRepository';
import { INearbyShopsService, NearbyShopsQuery, ShopDTO } from '../../interfaces/serviceInterfaces/INearbyShopsService';
import { mapRepoShopToDTO } from '../../dto/nearby.dto';

export class NearbyShopsService implements INearbyShopsService {
  constructor(private readonly _nearbyRepository: INearbyRepository) {}

  async getNearbyShops(query: NearbyShopsQuery): Promise<ShopDTO[]> {
    const { limit, sortOrder, openNow } = query;

    const options = {
      limit,
      sortOrder,
      openNow,
    };

    const shops = await this._nearbyRepository.getNearbyShops(options);

    return shops.map(mapRepoShopToDTO);
  }
}