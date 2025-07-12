import { Model, Document } from 'mongoose';
import { CustomError } from '../../util/CustomerError';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../shared/constant';

export abstract class BaseRepository<T extends Document> {
  constructor(protected model: Model<T>) {}

  async findById(id: string): Promise<T | null> {
    try {
      return await this.model.findById(id).exec();
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async create(entity: Partial<T>): Promise<T> {
    try {
      const document = new this.model(entity);
      return await document.save();
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(id: string, updateData: Partial<T>): Promise<T | null> {
    try {
      return await this.model.findByIdAndUpdate(id, updateData, { new: true }).exec();
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.model.findByIdAndDelete(id).exec();
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}