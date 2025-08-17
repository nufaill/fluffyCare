import { Types } from 'mongoose';
import { CreateWalletDto, WalletResponseDto, ProcessPaymentDto, RefundPaymentDto, WalletTransactionDto } from '../../dto/wallet.dto';

export interface IWalletService {
  createWallet(dto: CreateWalletDto): Promise<WalletResponseDto>;
  getWalletByOwner(ownerId: Types.ObjectId, ownerType: 'user' | 'shop' | 'admin'): Promise<WalletResponseDto | null>;
  getWalletById(walletId: Types.ObjectId): Promise<WalletResponseDto | null>;
  processPayment(dto: ProcessPaymentDto): Promise<void>;
  refundPayment(dto: RefundPaymentDto): Promise<void>;
  getTransactionHistory(walletId: Types.ObjectId, limit?: number, skip?: number): Promise<WalletTransactionDto[]>;
}