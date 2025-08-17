import { Types } from 'mongoose';
import { IWallet, IWalletTransaction } from '../../types/Wallet.types';

export interface IWalletRepository {
  createWallet(ownerId: Types.ObjectId, ownerType: 'user' | 'shop' | 'admin', currency: string): Promise<IWallet>;
  findWalletByOwner(ownerId: Types.ObjectId, ownerType: 'user' | 'shop' | 'admin'): Promise<IWallet | null>;
  findWalletById(walletId: Types.ObjectId): Promise<IWallet | null>;
  updateBalance(walletId: Types.ObjectId, amount: number, type: 'credit' | 'debit'): Promise<IWallet>;
  addTransaction(
    walletId: Types.ObjectId,
    transaction: IWalletTransaction
  ): Promise<IWallet>;
  getTransactionHistory(walletId: Types.ObjectId, limit?: number, skip?: number): Promise<IWalletTransaction[]>;
}