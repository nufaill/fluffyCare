// backend/src/repositories/adminRepository.ts
import { Admin } from '../models/adminModel';
import { AdminDocument } from '../types/admin.types';

export class AdminRepository {
  
  // Find admin by email
  async findByEmail(email: string): Promise<AdminDocument | null> {
    try {
      return await Admin.findOne({ email }).exec();
    } catch (error) {
      console.error('Error finding admin by email:', error);
      throw error;
    }
  }

  // Find admin by ID
  async findById(id: string): Promise<AdminDocument | null> {
    try {
      return await Admin.findById(id).exec();
    } catch (error) {
      console.error('Error finding admin by ID:', error);
      throw error;
    }
  }
}