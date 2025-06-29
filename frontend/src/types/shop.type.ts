// types/shop.types.ts
export interface Shop {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  streetAddress: string;
  buildingNumber: string;
  description: string;
  logo: string;
  certificateUrl: string;
  location: {
    lat?: number;
    lng?: number;
  };
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShopLoginData {
  email: string;
  password: string;
}

export interface ShopRegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  streetAddress: string;
  buildingNumber: string;
  description: string;
  logo: string;
  certificateUrl: string;
  location: {
    lat?: number;
    lng?: number;
  };
}

export interface ShopAuthResponse {
  success: boolean;
  message: string;
  token: string;
  shop: Shop;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
}

export interface OtpFormData {
  otp: string;
}

export interface OtpVerificationData {
  email: string;
  otp: string;
}

export interface ResendOtpData {
  email: string;
}

export interface OtpResponse {
  success: boolean;
  message: string;
}

// Storage keys as constants to avoid typos
export const STORAGE_KEYS = {
  SHOP_TOKEN: 'shopToken',
  SHOP_DATA: 'shopData',
  PENDING_VERIFICATION_EMAIL: 'pendingVerificationEmail',
} as const;

// Type-safe localStorage utilities
export class StorageUtils {
  static setShopToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.SHOP_TOKEN, token);
  }

  static getShopToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.SHOP_TOKEN);
  }

  static setShopData(shop: Shop): void {
    localStorage.setItem(STORAGE_KEYS.SHOP_DATA, JSON.stringify(shop));
  }

  static getShopData(): Shop | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SHOP_DATA);
      return data ? JSON.parse(data) as Shop : null;
    } catch (error) {
      console.error('Error parsing shop data from localStorage:', error);
      return null;
    }
  }

  static setPendingVerificationEmail(email: string): void {
    localStorage.setItem(STORAGE_KEYS.PENDING_VERIFICATION_EMAIL, email);
  }

  static getPendingVerificationEmail(): string | null {
    return localStorage.getItem(STORAGE_KEYS.PENDING_VERIFICATION_EMAIL);
  }

  static clearShopAuth(): void {
    localStorage.removeItem(STORAGE_KEYS.SHOP_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.SHOP_DATA);
  }

  static clearPendingVerificationEmail(): void {
    localStorage.removeItem(STORAGE_KEYS.PENDING_VERIFICATION_EMAIL);
  }

  static clearAllShopData(): void {
    this.clearShopAuth();
    this.clearPendingVerificationEmail();
  }
}

// Error handling utility
export class ErrorHandler {
  static extractMessage(error: unknown): string {
    console.error('Extracting error message from:', error);

    if (this.isApiError(error)) {
      if (error.response?.data?.message) {
        return error.response.data.message;
      }
      if (error.response?.data?.error) {
        return error.response.data.error;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  private static isApiError(error: unknown): error is ApiError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'response' in error
    );
  }
}