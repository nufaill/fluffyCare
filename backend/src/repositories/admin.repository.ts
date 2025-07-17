import { BaseRepository } from './base-repository/base.repository';
import { Admin, AdminDocument } from '../models/adminModel';
import { CustomError } from '../util/CustomerError';
import { ERROR_MESSAGES, HTTP_STATUS } from '../shared/constant';
import { IAdminRepository } from '../interfaces/repositoryInterfaces/IAdminRepository';

export class AdminRepository extends BaseRepository<AdminDocument> implements IAdminRepository {
  constructor() {
    super(Admin);
  }

  async findByEmail(email: string): Promise<AdminDocument | null> {
    try {
      return await this.model.findOne({ email }).exec();
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}