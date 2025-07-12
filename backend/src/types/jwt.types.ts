// backend/src/types/jwt.types.ts
import { JwtPayload } from 'jsonwebtoken';

export interface UserJwtPayload extends JwtPayload {
  userId: string;
  email: string;
  role: 'user';
}

export interface ShopJwtPayload extends JwtPayload {
  shopId: string;
  email: string;
  role: 'shop';
}

export interface AdminJwtPayload extends JwtPayload {
  adminId: string;
  email: string;
  role: 'admin';
}

export interface RefreshJwtPayload extends JwtPayload {
  userId: string;
  email: string;
}

export type CustomJwtPayload = UserJwtPayload | ShopJwtPayload | AdminJwtPayload;

// Type guards to check JWT payload types
export function isUserPayload(payload: CustomJwtPayload): payload is UserJwtPayload {
  return payload.role === 'user' && 'userId' in payload;
}

export function isShopPayload(payload: CustomJwtPayload): payload is ShopJwtPayload {
  return payload.role === 'shop' && 'shopId' in payload;
}

export function isAdminPayload(payload: CustomJwtPayload): payload is AdminJwtPayload {
  return payload.role === 'admin' && 'adminId' in payload;
}

export function isRefreshPayload(payload: JwtPayload): payload is RefreshJwtPayload {
  return 'userId' in payload && 'email' in payload;
}