import { Document, FilterQuery, UpdateQuery } from "mongoose";

export interface IBaseRepository<T extends Document> {
  find(filter?: FilterQuery<T>): Promise<T[]>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  findById(id: string): Promise<T | null>;
  create(payload: Partial<T>): Promise<T>;
  update(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null>;
  updateById(id: string, update: UpdateQuery<T>): Promise<T | null>;
  exists(filter: FilterQuery<T>): Promise<boolean>;
  count(filter?: FilterQuery<T>): Promise<number>;
}