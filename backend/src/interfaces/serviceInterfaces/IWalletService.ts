import { Types } from 'mongoose';
import { IWalletRepository } from '../../interfaces/repositoryInterfaces/IWalletRepository';
import { IAppointmentService } from '../../interfaces/serviceInterfaces/IAppointmentService';
import {
  CreateWalletDto,
  WalletTransactionDto,
  ProcessPaymentDto,
  RefundPaymentDto,
  WalletResponseDto,
} from '../../dto/wallet.dto';
import { IWalletTransaction } from '../../types/Wallet.types';

export interface IWalletService {
  walletRepository: IWalletRepository;
  setAppointmentService(appointmentService: IAppointmentService): void;
  getCommissionRate(shopId: Types.ObjectId): Promise<number>;
  getCommissionRateByPlan(planName: string): Promise<number>;
  processSubscriptionPayment(dto: {
    shopId: Types.ObjectId;
    amount: number;
    currency: string;
    planName: string;
    profitPercentage: number;
    paymentIntentId: string;
  }): Promise<void>;
  createWallet(dto: CreateWalletDto): Promise<WalletResponseDto>;
  getWalletByOwner(
    ownerId: Types.ObjectId,
    ownerType: 'user' | 'shop' | 'admin',
    session?: import('mongoose').ClientSession
  ): Promise<WalletResponseDto | null>;
  getWalletById(walletId: Types.ObjectId): Promise<WalletResponseDto | null>;
  processPayment(dto: ProcessPaymentDto): Promise<void>;
  refundPayment(dto: RefundPaymentDto): Promise<void>;
  getTransactionHistory(
    walletId: Types.ObjectId,
    limit?: number,
    skip?: number
  ): Promise<WalletTransactionDto[]>;
  updateBalance(walletId: Types.ObjectId, amount: number, type: 'credit' | 'debit'): Promise<void>;
  addTransaction(walletId: Types.ObjectId, transaction: IWalletTransaction): Promise<void>;
}