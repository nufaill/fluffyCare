import ms from "ms";
import { ITokenService } from "../../interfaces/serviceInterfaces/tokenServiceInterface";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";

export class JwtService implements ITokenService {
  private _accessSecret: Secret;
  private _accessExpiresIn: string;
  private _refreshExpiresIn: string;

  constructor() {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing in .env");
    if (!process.env.JWT_ACCESS_EXPIRES) throw new Error("JWT_ACCESS_EXPIRES is missing in .env");
    if (!process.env.JWT_REFRESH_EXPIRES) throw new Error("JWT_REFRESH_EXPIRES is missing in .env");

    this._accessSecret = process.env.JWT_SECRET as Secret;
    this._accessExpiresIn = process.env.JWT_ACCESS_EXPIRES;
    this._refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES;
  }
  verifyRefreshtoken(token: string): string | JwtPayload | null {
    throw new Error("Method not implemented.");
  }

  generateAccessToken(payload: {
    id: string;
    email: string;
  }): string {
    const jwtPayload = {
      userId: payload.id,
      email: payload.email,
    };

    return jwt.sign(jwtPayload, this._accessSecret, {
      expiresIn: this._accessExpiresIn as ms.StringValue,
    });
  }

  generateRefreshToken(payload: {
    id: string;
    email: string;
  }): string {
    return jwt.sign(
      { userId: payload.id, email: payload.email },
      this._accessSecret,
      {
        expiresIn: this._refreshExpiresIn as ms.StringValue,
      }
    );
  }

  generateTokens(payload: {
    id: string;
    email: string;
  }): { accessToken: string; refreshToken: string } {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): string | JwtPayload | null {
    try {
      return jwt.verify(token, this._accessSecret) as JwtPayload;
    } catch (error) {
      console.error("Access token verification failed:", error);
      return null;
    }
  }

  verifyRefreshToken(token: string): string | JwtPayload | null {
    try {
      return jwt.verify(token, this._accessSecret) as JwtPayload;
    } catch (error) {
      console.error("Refresh token verification failed:", error);
      return null;
    }
  }

  decodeAccessToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      console.error("Token decoding failed:", error);
      return null;
    }
  }
}