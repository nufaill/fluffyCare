import { Response } from "express";
import { config } from "../config/env"; 

// Set both access and refresh tokens in cookies
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
  accessTokenName: string,
  refreshTokenName: string
) => {
  const isProduction = config.server.NODE_ENV === "production";

  res.cookie(accessTokenName, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie(refreshTokenName, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Update only access token (useful during token refresh)
export const updateCookieWithAccessToken = (
  res: Response,
  accessToken: string,
  accessTokenName: string
) => {
  const isProduction = config.server.NODE_ENV === "production";

  res.cookie(accessTokenName, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
};

// Clear both cookies (e.g., on logout)
export const clearAuthCookies = (
  res: Response,
  accessTokenName: string,
  refreshTokenName: string
) => {
  res.clearCookie(accessTokenName);
  res.clearCookie(refreshTokenName);
};
