// backend/src/util/cookie-helper.ts
import { Response } from 'express';

export const setAuthCookies = (
  res: Response, 
  accessToken: string, 
  refreshToken: string,
  role:'user'|'admin'|'shop'
): void => {
  const isProduction = process.env.NODE_ENV === 'production';

  let tokenName = "";
  let refreshTokenName = ""
  if(role ==='user'){
    tokenName="userAccessToken";
    refreshTokenName="userRefreshToken"
  }else if(role === 'shop'){
    tokenName = "shopAccessToken";
     refreshTokenName="shopRefreshToken"
  }else{
    tokenName = "adminAccessToken";
     refreshTokenName="adminRefreshToken"
  }
  
  //  access token cookie
  res.cookie(tokenName, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  });

  //  refresh token cookie
  res.cookie(refreshTokenName, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

// Alternative signature for when tokens are passed as an object
export const setAuthCookiesFromObject = (
  res: Response, 
  tokens: { accessToken: string; refreshToken: string },
  role: "user"|"admin"|"shop"
): void => {
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken, role);
};

export const updateAccessTokenCookie = (
  res: Response, 
  accessToken: string,
  role : 'user'|'admin'|'shop'
): void => {
  const isProduction = process.env.NODE_ENV === 'production';

   let tokenName = "";
  if(role ==='user'){
    tokenName="userAccessToken";
  }else if(role === 'shop'){
    tokenName = "shopAccessToken";
  }else{
    tokenName = "adminAccessToken";
  }
  
  res.cookie(tokenName, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
};