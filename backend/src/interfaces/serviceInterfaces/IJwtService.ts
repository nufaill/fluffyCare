import { JwtPayload, Secret } from "jsonwebtoken";

export interface IJwtService {
  generateAccessToken(payload: {
    id: string;
    email: string;
    role: "user" | "shop" | "admin";
  }): string;

  generateRefreshToken(payload: {
    id: string;
    email: string;
  }): string;

  generateTokens(payload: {
    id: string;
    email: string;
    role: "user" | "shop" | "admin";
  }): { accessToken: string; refreshToken: string };

  verifyAccessToken(token: string): string | JwtPayload | null;

  verifyRefreshToken(token: string): string | JwtPayload | null;

  verifyRefreshtoken(token: string): string | JwtPayload | null;

  decodeAccessToken(token: string): JwtPayload | null;
}