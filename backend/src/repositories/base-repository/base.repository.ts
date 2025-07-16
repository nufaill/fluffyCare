import { Model, Document, Query } from 'mongoose';
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

  async update(id: string, updateData: Partial<T>, options: { new?: boolean; runValidators?: boolean } = { new: true }): Promise<Query<T | null, T>> {
    try {
      return this.model.findByIdAndUpdate(id, { $set: updateData }, options);
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(query: any): Promise<Query<T | null, T>> {
    try {
      return this.model.findOne(query);
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async find(query: any = {}): Promise<Query<T[], T>> {
    try {
      return this.model.find(query);
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async exists(query: any): Promise<boolean> {
    try {
      const document = await this.model.findOne(query).exec();
      return !!document;
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}