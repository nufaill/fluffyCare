import 'express';

declare module 'express' {
  export interface Request {
    user?: {
      userId: string;
      email: string;
    };
    shop?: {
      shopId: string;
      email: string;
    };
    admin?: {
      adminId: string;
      email: string;
    };

  }
}