import { Model, FilterQuery, UpdateQuery, Types, Query } from 'mongoose';
import { CustomError } from '../../util/CustomerError';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../shared/constant';
import { IBaseRepository } from '../../interfaces/repositoryInterfaces/IBaseRepository';


export class BaseRepository<T extends Document> implements IBaseRepository<T> {
 protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  find(filter: FilterQuery<T> = {}): Query<T[], T> {
    try {
      return this.model.find(filter);
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  findOne(filter: FilterQuery<T>): Query<T | null, T> {
    try {
      return this.model.findOne(filter);
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return null;
      }
      return await this.model.findById(id).exec();
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async create(payload: Partial<T>): Promise<T> {
    try {
      const doc = new this.model(payload);
      return await doc.save();
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  update(filter: FilterQuery<T>, update: UpdateQuery<T>): Query<T | null, T> {
    try {
      return this.model.findOneAndUpdate(filter, update, { new: true, runValidators: true });
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  updateById(id: string, update: UpdateQuery<T>): Query<T | null, T> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return this.model.findOne({ _id: id } as FilterQuery<T>);
      }
      return this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    try {
      const doc = await this.model.findOne(filter).select('_id').exec();
      return !!doc;
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    try {
      return await this.model.countDocuments(filter).exec();
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}