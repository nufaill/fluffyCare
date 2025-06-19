import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/userRepository';
import { JwtService } from './jwt/jwtService';
import { GoogleAuthService } from '../services/googleAuth/googleService';
import { AuthResponse, GoogleUserInfo } from '../types/auth.types';
import { CreateUserData } from '../types/user';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  profileImage?: string;
  location?: Record<string, unknown>;
}

export class AuthService {
  private readonly saltRounds = 12;

  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private googleService: GoogleAuthService
  ) {}

  async register(data: RegisterData): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) throw new Error('User with this email already exists');

    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

    const userData: CreateUserData = {
      ...data,
      password: hashedPassword,
    };

    const user = await this.userRepository.createUser(userData);

    const tokens = this.jwtService.generateTokens({
      id: user._id.toString(),
      email: user.email,
      role: 'user',
    });

    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        profileImage: user.profileImage,
      },
      tokens,
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) throw new Error('Invalid email or password');

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) throw new Error('Invalid email or password');

    const tokens = this.jwtService.generateTokens({
      id: user._id.toString(),
      email: user.email,
      role: 'user',
    });

    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        profileImage: user.profileImage,
      },
      tokens,
    };
  }

  async googleAuth(idToken: string): Promise<AuthResponse> {
    const googleUser: GoogleUserInfo = await this.googleService.verifyIdToken(idToken);

    if (!googleUser.verified_email) throw new Error('Google email not verified');

    let user = await this.userRepository.findByGoogleId(googleUser.id);

    if (!user) {
      const existingUser = await this.userRepository.findByEmail(googleUser.email);

      if (existingUser) {
        user = await this.userRepository.updateUser(existingUser._id.toString(), {
          googleId: googleUser.id,
          profileImage: existingUser.profileImage || googleUser.picture,
        });
      } else {
        const userData: CreateUserData = {
          fullName: googleUser.name,
          email: googleUser.email,
          password: '',
          profileImage: googleUser.picture,
          googleId: googleUser.id,
          isActive: true,
        };

        user = await this.userRepository.createUser(userData);
      }
    }

    if (!user) throw new Error('Failed to create or update user');

    const tokens = this.jwtService.generateTokens({
      id: user._id.toString(),
      email: user.email,
      role: 'user',
    });

    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        profileImage: user.profileImage,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<string> {
    const payload = this.jwtService.verifyRefreshtoken(refreshToken);

    if (!payload || typeof payload === 'string') {
      throw new Error('Invalid refresh token');
    }

    const user = await this.userRepository.findById(payload.id);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    const { accessToken } = this.jwtService.generateTokens({
      id: user._id.toString(),
      email: user.email,
      role: 'user',
    });

    return accessToken;
  }
}
