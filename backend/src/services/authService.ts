import '../config/env';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/userRepository';
import { RegisterSchema, LoginSchema } from '../validations';
import { JwtService } from './jwt/jwtService';

const SALT_ROUNDS = 10;

export class AuthService {
  private userRepository: UserRepository;
  private tokenService: JwtService;

  constructor(userRepository: UserRepository, tokenService: JwtService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  async register(data: RegisterSchema) {
    const exists = await this.userRepository.findByEmail(data.email);
    if (exists) throw new Error("Email already exists");

    const hash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await this.userRepository.createUser({
      profileImage: data.profileImage || "",
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      password: hash,
      isActive: data.isActive ?? true,
      location: data.location || {},
    });

    const accessToken = this.tokenService.generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: "User",
    });
    const refreshToken = this.tokenService.generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
      role: "User",
    });

    return { user, accessToken, refreshToken };
  }

  async login(data: LoginSchema) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new Error("Invalid credentials");

    const accessToken = this.tokenService.generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: "User",
    });
    const refreshToken = this.tokenService.generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
      role: "User",
    });

    return { user, accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string) {
    const decoded = this.tokenService.verifyRefreshtoken(refreshToken);
    if (!decoded || typeof decoded === "string") {
      throw new Error("Invalid refresh token");
    }

    const { id, email, role } = decoded;
    return this.tokenService.generateAccessToken({ id, email, role });
  }
}
