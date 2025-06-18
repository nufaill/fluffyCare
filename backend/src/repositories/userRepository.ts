import { User } from "@models/userModel";

export class UserRepository {
  static findByEmail: any;
  static createUser: any;
  async findByEmail(email: string) {
    return await User.findOne({ email });
  }

  async createUser(userData: {
    profileImage: string;
    fullName: string;
    email: string;
    phone: string;
    password: string;
    isActive: boolean;
    location: object;
  }) {
    const user = new User(userData);
    return await user.save();
  }

  async findById(id: string) {
    return await User.findById(id);
  }
}
