import { createBaseAxios } from '@/api/base.axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

interface IWalletTransaction {
  _id?: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  referenceId?: string;
  createdAt: Date;
}

interface WalletData {
  _id: string;
  balance: number;
  currency: string;
  transactions: IWalletTransaction[];
}

export interface WalletResponse {
  success: boolean;
  message: string;
  data: WalletData;
}

export interface CreateWalletRequest {
  ownerId: string;
  ownerType: 'user' | 'shop' | 'admin';
  currency: string;
}

export interface TransactionRequest {
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  referenceId?: string;
}

export class WalletService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = createBaseAxios('/wallet');
    
    // Add request interceptor for debugging (similar to wallet.axios.ts)
    this.axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        console.log('Wallet API Request:', {
          method: config.method,
          url: config.url,
          baseURL: config.baseURL,
          withCredentials: config.withCredentials,
        });
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  private async handleRequest<T>(request: Promise<any>): Promise<T> {
    try {
      const response = await request;
      if (!response.data.success) {
        throw new Error(response.data.message || 'Request failed');
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Network error occurred');
    }
  }

  // Admin wallet methods
  async createAdminWallet(request: CreateWalletRequest): Promise<WalletData> {
    if (!request.ownerId || !request.ownerType || !request.currency) {
      throw new Error('ownerId, ownerType, and currency are required');
    }

    const response = await this.handleRequest<WalletResponse>(
      this.axios.post('/admin/create', request)
    );
    return response.data;
  }

  async getAdminWallet(ownerId: string, ownerType: string): Promise<WalletData> {
    if (!ownerId || !ownerType) {
      throw new Error('ownerId and ownerType are required');
    }

    const response = await this.handleRequest<WalletResponse>(
      this.axios.get(`/admin/owner/${ownerId}/${ownerType}`)
    );
    return response.data;
  }

  // Shop wallet methods
  async createShopWallet(request: CreateWalletRequest): Promise<WalletData> {
    if (!request.ownerId || !request.ownerType || !request.currency) {
      throw new Error('ownerId, ownerType, and currency are required');
    }

    const response = await this.handleRequest<WalletResponse>(
      this.axios.post('/shop/create', request)
    );
    return response.data;
  }

  async getShopWallet(ownerId: string, ownerType: string): Promise<WalletData> {
    if (!ownerId || !ownerType) {
      throw new Error('ownerId and ownerType are required');
    }

    const response = await this.handleRequest<WalletResponse>(
      this.axios.get(`/shop/owner/${ownerId}/${ownerType}`)
    );
    return response.data;
  }

  // User wallet methods
  async createUserWallet(request: CreateWalletRequest): Promise<WalletData> {
    if (!request.ownerId || !request.ownerType || !request.currency) {
      throw new Error('ownerId, ownerType, and currency are required');
    }

    const response = await this.handleRequest<WalletResponse>(
      this.axios.post('/user/create', request)
    );
    return response.data;
  }

  async getUserWallet(ownerId: string, ownerType: string): Promise<WalletData> {
    if (!ownerId || !ownerType) {
      throw new Error('ownerId and ownerType are required');
    }

    const response = await this.handleRequest<WalletResponse>(
      this.axios.get(`/user/owner/${ownerId}/${ownerType}`)
    );
    return response.data;
  }

  // Generic wallet methods
  async getWalletById(walletId: string): Promise<WalletData> {
    if (!walletId) {
      throw new Error('walletId is required');
    }

    const response = await this.handleRequest<WalletResponse>(
      this.axios.get(`/${walletId}`)
    );
    return response.data;
  }

  async addTransaction(request: TransactionRequest): Promise<WalletData> {
    if (!request.walletId || !request.type || !request.amount || !request.description) {
      throw new Error('walletId, type, amount, and description are required');
    }

    if (request.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!['credit', 'debit'].includes(request.type)) {
      throw new Error('Transaction type must be either credit or debit');
    }

    const response = await this.handleRequest<WalletResponse>(
      this.axios.post(`/${request.walletId}/transaction`, {
        type: request.type,
        amount: request.amount,
        description: request.description.trim(),
        referenceId: request.referenceId,
      })
    );
    return response.data;
  }

  async getTransactionHistory(
    walletId: string,
    page: number = 1,
    limit: number = 20,
    type?: 'credit' | 'debit'
  ): Promise<{
    transactions: IWalletTransaction[];
    totalPages: number;
    currentPage: number;
    totalTransactions: number;
  }> {
    if (!walletId) {
      throw new Error('walletId is required');
    }

    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));

    const params: any = {
      page: validPage,
      limit: validLimit,
    };

    if (type) {
      params.type = type;
    }

    const response = await this.handleRequest<{
      success: boolean;
      message: string;
      data: {
        transactions: IWalletTransaction[];
        totalPages: number;
        currentPage: number;
        totalTransactions: number;
      };
    }>(
      this.axios.get(`/${walletId}/transactions`, { params })
    );
    return response.data;
  }

  async updateWalletBalance(walletId: string, newBalance: number): Promise<WalletData> {
    if (!walletId) {
      throw new Error('walletId is required');
    }

    if (newBalance < 0) {
      throw new Error('Balance cannot be negative');
    }

    const response = await this.handleRequest<WalletResponse>(
      this.axios.put(`/${walletId}/balance`, { balance: newBalance })
    );
    return response.data;
  }

  async deleteWallet(walletId: string): Promise<boolean> {
    if (!walletId) {
      throw new Error('walletId is required');
    }

    const response = await this.handleRequest<{ success: boolean }>(
      this.axios.delete(`/${walletId}`)
    );
    return response.success;
  }

  // Utility method to format transactions
  formatTransactions(transactions: any[]): IWalletTransaction[] {
    return transactions?.map((t: any) => ({
      ...t,
      createdAt: new Date(t.createdAt),
    })) || [];
  }

  // Utility method to format wallet data
  formatWalletData(data: any): WalletData {
    return {
      _id: data._id,
      balance: data.balance,
      currency: data.currency,
      transactions: this.formatTransactions(data.transactions),
    };
  }
}

export const walletService = new WalletService();