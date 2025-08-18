// wallet.service.ts (updated)
import mongoose, { Types } from 'mongoose';
import { IWalletRepository } from '../interfaces/repositoryInterfaces/IWalletRepository';
import { IWalletService } from '../interfaces/serviceInterfaces/IWalletService';
import { IAppointmentService } from '../interfaces/serviceInterfaces/IAppointmentService';
import {
  CreateWalletDto,
  WalletTransactionDto,
  ProcessPaymentDto,
  RefundPaymentDto,
  WalletResponseDto,
} from '../dto/wallet.dto';
import { IWallet, IWalletTransaction } from '../types/Wallet.types';
import { Shop } from '../models/shop.model';  // Added import

// Configurable commission rate (could be moved to a database or config service)
const DEFAULT_COMMISSION_RATE = 0.1; // 10% commission

export class WalletService implements IWalletService {
  public walletRepository: IWalletRepository; 
  private appointmentService?: IAppointmentService;

  constructor(walletRepository: IWalletRepository) {
    this.walletRepository = walletRepository;
  }

  // Add setter for AppointmentService
  public setAppointmentService(appointmentService: IAppointmentService): void {
    this.appointmentService = appointmentService;
  }

  // Added method to get commission rate based on shop subscription
  public async getCommissionRate(shopId: Types.ObjectId): Promise<number> {
    try {
      const shop = await Shop.findById(shopId).select('subscription').exec();
      if (!shop) {
        throw new Error('Shop not found');
      }
      switch (shop.subscription?.toLowerCase()) {
        case 'free':
          return 0.1;
        case 'basic':
          return 0.05;
        case 'premium':
          return 0.03;
        default:
          return DEFAULT_COMMISSION_RATE;
      }
    } catch (error: any) {
      console.error(`Error fetching commission rate for shop ${shopId}:`, error);
      return DEFAULT_COMMISSION_RATE; // Fallback to default if error
    }
  }

  // In wallet.service.ts
  async createWallet(dto: CreateWalletDto): Promise<WalletResponseDto> {
    try {
      const existingWallet = await this.walletRepository.findWalletByOwner(dto.ownerId, dto.ownerType);
      if (existingWallet && existingWallet._id) {
        return new WalletResponseDto(
          existingWallet._id,
          existingWallet.ownerId,
          existingWallet.ownerType,
          existingWallet.balance,
          existingWallet.currency,
          existingWallet.transactions,
          existingWallet.createdAt ?? new Date(),
          existingWallet.updatedAt ?? new Date()
        );
      }

      const wallet = await this.walletRepository.createWallet(
        dto.ownerId,
        dto.ownerType,
        dto.currency,
      );

      if (!wallet._id) {
        throw new Error('Wallet creation failed: Missing ID');
      }

      return new WalletResponseDto(
        wallet._id,
        wallet.ownerId,
        wallet.ownerType,
        wallet.balance,
        wallet.currency,
        wallet.transactions,
        wallet.createdAt ?? new Date(),
        wallet.updatedAt ?? new Date()
      );
    } catch (error: any) {
      console.error(`❌ Failed to create wallet for ${dto.ownerType} ${dto.ownerId}:`, error);
      throw error;
    }
  }

  async getWalletByOwner(
    ownerId: Types.ObjectId,
    ownerType: 'user' | 'shop' | 'admin',
    session?: mongoose.ClientSession
  ): Promise<WalletResponseDto | null> {
    try {
      const wallet = await this.walletRepository.findWalletByOwner(ownerId, ownerType);
      if (!wallet || !wallet._id) return null;

      return new WalletResponseDto(
        wallet._id,
        wallet.ownerId,
        wallet.ownerType,
        wallet.balance,
        wallet.currency,
        wallet.transactions,
        wallet.createdAt ?? new Date(),
        wallet.updatedAt ?? new Date()
      );
    } catch (error: any) {
      console.error(`Error fetching ${ownerType} wallet for ${ownerId}:`, error);
      throw error;
    }
  }

  async getWalletById(walletId: Types.ObjectId): Promise<WalletResponseDto | null> {
    try {
      const wallet = await this.walletRepository.findWalletById(walletId);
      if (!wallet || !wallet._id) return null;

      return new WalletResponseDto(
        wallet._id,
        wallet.ownerId,
        wallet.ownerType,
        wallet.balance,
        wallet.currency,
        wallet.transactions,
        wallet.createdAt ?? new Date(),
        wallet.updatedAt ?? new Date()
      );
    } catch (error: any) {
      console.error(`Error fetching wallet by ID ${walletId}:`, error);
      throw error;
    }
  }

  async processPayment(dto: ProcessPaymentDto): Promise<void> {
    const session = await mongoose.startSession();

    try {

      await session.withTransaction(async () => {
        // Fetch wallets
        const userWallet = await this.walletRepository.findWalletByOwner(dto.userId, 'user');
        const shopWallet = await this.walletRepository.findWalletByOwner(dto.shopId, 'shop');

        // Get admin ID from environment or use default
        const adminId = process.env.ADMIN_ID || '685ff3212adf35c013419da4';
        const adminWallet = await this.walletRepository.findWalletByOwner(
          new Types.ObjectId(adminId),
          'admin'
        );

        // Strict type checking
        if (!userWallet || !userWallet._id) {
          throw new Error(`User wallet not found for ID: ${dto.userId}`);
        }
        if (!shopWallet || !shopWallet._id) {
          throw new Error(`Shop wallet not found for ID: ${dto.shopId}`);
        }
        if (!adminWallet || !adminWallet._id) {
          throw new Error(`Admin wallet not found for ID: ${adminId}`);
        }

        console.log(`Pre-transaction balances:`);
        console.log(`User: ${userWallet.balance} ${dto.currency}`);
        console.log(`Shop: ${shopWallet.balance} ${dto.currency}`);
        console.log(`Admin: ${adminWallet.balance} ${dto.currency}`);

        // Verify user has sufficient balance
        if (userWallet.balance < dto.amount) {
          throw new Error(`Insufficient balance in user wallet. Required: ${dto.amount}, Available: ${userWallet.balance}`);
        }

        // Get dynamic commission rate based on shop subscription
        const commissionRate = await this.getCommissionRate(dto.shopId);

        // Calculate commission
        const commission = Math.round(dto.amount * commissionRate * 100) / 100;
        const shopAmount = Math.round((dto.amount - commission) * 100) / 100;

        // Create transaction records
        const userTransaction = new WalletTransactionDto(
          'debit',
          dto.amount,
          dto.currency,
          `Payment for appointment ${dto.appointmentId}`,
          dto.appointmentId
        );

        const shopTransaction = new WalletTransactionDto(
          'credit',
          shopAmount,
          dto.currency,
          `Payment received for appointment ${dto.appointmentId} (after commission)`,
          dto.appointmentId
        );

        const adminTransaction = new WalletTransactionDto(
          'credit',
          commission,
          dto.currency,
          `Commission for appointment ${dto.appointmentId}`,
          dto.appointmentId
        );

        // Debit user wallet
        await this.walletRepository.updateBalance(userWallet._id!, dto.amount, 'debit');
        await this.walletRepository.addTransaction(userWallet._id!, userTransaction);
        // Credit shop wallet
        await this.walletRepository.updateBalance(shopWallet._id!, shopAmount, 'credit');
        await this.walletRepository.addTransaction(shopWallet._id!, shopTransaction);
        // Credit admin wallet
        await this.walletRepository.updateBalance(adminWallet._id!, commission, 'credit');
        await this.walletRepository.addTransaction(adminWallet._id!, adminTransaction);
      });

    } catch (error: any) {
      console.error(`❌ Failed to process wallet payment:`, error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  async refundPayment(dto: RefundPaymentDto): Promise<void> {
    if (!this.appointmentService) {
      throw new Error('AppointmentService not initialized');
    }

    const session = await mongoose.startSession();

    try {
      const appointmentResult = await this.appointmentService.getAppointmentById(dto.appointmentId);
      if (!appointmentResult.success || !appointmentResult.data) {
        throw new Error('Appointment not found for refund');
      }
      const appointment = appointmentResult.data;

      await session.withTransaction(async () => {
        // Fetch wallets
        const userWallet = await this.walletRepository.findWalletByOwner(appointment.userId, 'user');
        const shopWallet = await this.walletRepository.findWalletByOwner(appointment.shopId, 'shop');

        const adminId = process.env.ADMIN_ID || '685ff3212adf35c013419da4';
        const adminWallet = await this.walletRepository.findWalletByOwner(
          new Types.ObjectId(adminId),
          'admin'
        );

        // Strict type checking
        if (!userWallet || !userWallet._id || !shopWallet || !shopWallet._id || !adminWallet || !adminWallet._id) {
          throw new Error('One or more wallets not found for refund');
        }

        console.log(`Pre-refund balances:`);
        console.log(`User: ${userWallet.balance} ${dto.currency}`);
        console.log(`Shop: ${shopWallet.balance} ${dto.currency}`);
        console.log(`Admin: ${adminWallet.balance} ${dto.currency}`);

        // Get dynamic commission rate based on shop subscription
        const commissionRate = await this.getCommissionRate(appointment.shopId);

        // Calculate commission for reversal
        const commission = Math.round(dto.amount * commissionRate * 100) / 100;
        const shopAmount = Math.round((dto.amount - commission) * 100) / 100;

        // Verify shop and admin have sufficient balance for reversal
        if (shopWallet.balance < shopAmount) {
          throw new Error(`Insufficient balance in shop wallet for refund. Required: ${shopAmount}, Available: ${shopWallet.balance}`);
        }
        if (adminWallet.balance < commission) {
          throw new Error(`Insufficient balance in admin wallet for refund. Required: ${commission}, Available: ${adminWallet.balance}`);
        }

        // Create transaction records
        const userTransaction = new WalletTransactionDto(
          'credit',
          dto.amount,
          dto.currency,
          `Refund for appointment ${dto.appointmentId}`,
          dto.appointmentId
        );

        const shopTransaction = new WalletTransactionDto(
          'debit',
          shopAmount,
          dto.currency,
          `Refund debited for appointment ${dto.appointmentId}`,
          dto.appointmentId
        );

        const adminTransaction = new WalletTransactionDto(
          'debit',
          commission,
          dto.currency,
          `Commission refund debited for appointment ${dto.appointmentId}`,
          dto.appointmentId
        );

        // Update wallets
        console.log(`Processing refund transactions...`);

        // Credit user wallet
        await this.walletRepository.updateBalance(userWallet._id!, dto.amount, 'credit');
        await this.walletRepository.addTransaction(userWallet._id!, userTransaction);

        // Debit shop wallet
        await this.walletRepository.updateBalance(shopWallet._id!, shopAmount, 'debit');
        await this.walletRepository.addTransaction(shopWallet._id!, shopTransaction);

        // Debit admin wallet
        await this.walletRepository.updateBalance(adminWallet._id!, commission, 'debit');
        await this.walletRepository.addTransaction(adminWallet._id!, adminTransaction);
      });

    } catch (error: any) {
      console.error(`❌ Failed to process wallet refund:`, error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getTransactionHistory(
    walletId: Types.ObjectId,
    limit: number = 10,
    skip: number = 0
  ): Promise<WalletTransactionDto[]> {
    try {
      const transactions = await this.walletRepository.getTransactionHistory(walletId, limit, skip);
      return transactions.map(
        (t) =>
          new WalletTransactionDto(
            t.type,
            t.amount,
            t.currency,
            t.description,
            t.referenceId
          )
      );
    } catch (error: any) {
      console.error(`Error fetching transaction history for wallet ${walletId}:`, error);
      throw error;
    }
  }
}