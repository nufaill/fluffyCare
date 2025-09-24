import mongoose, { Types } from 'mongoose';
import { CreateWalletDto, WalletResponseDto, WalletTransactionDto, ProcessPaymentDto, RefundPaymentDto } from '../../dto/wallet.dto';
import { IAppointmentService } from './IAppointmentService';

export interface IWalletService {
  setAppointmentService(appointmentService: IAppointmentService): void;
  createWallet(dto: CreateWalletDto): Promise<WalletResponseDto>;
  getWalletByOwner(
    ownerId: Types.ObjectId,
    ownerType: 'user' | 'shop' | 'admin',
    session?: mongoose.ClientSession
  ): Promise<WalletResponseDto | null>;
  getWalletById(walletId: Types.ObjectId): Promise<WalletResponseDto | null>;
  processPayment(dto: ProcessPaymentDto): Promise<void>;
  refundPayment(dto: RefundPaymentDto): Promise<void>;
  getTransactionHistory(
    walletId: Types.ObjectId,
    limit?: number,
    skip?: number
  ): Promise<WalletTransactionDto[]>;
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
}