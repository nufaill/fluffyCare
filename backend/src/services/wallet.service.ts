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

// Configurable commission rate (could be moved to a database or config service)
const DEFAULT_COMMISSION_RATE = 0.1; // 10% commission

export class WalletService implements IWalletService {
  public walletRepository: IWalletRepository; // Made public for access in PaymentController
  private appointmentService?: IAppointmentService;

  constructor(walletRepository: IWalletRepository) {
    this.walletRepository = walletRepository;
  }

  // Add setter for AppointmentService
  public setAppointmentService(appointmentService: IAppointmentService): void {
    this.appointmentService = appointmentService;
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
      console.log(`=== PROCESSING WALLET PAYMENT ===`);
      console.log(`User ID: ${dto.userId}, Shop ID: ${dto.shopId}`);
      console.log(`Amount: ${dto.amount} ${dto.currency}`);
      console.log(`Appointment ID: ${dto.appointmentId}`);

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

        // Calculate commission
        const commission = Math.round(dto.amount * DEFAULT_COMMISSION_RATE * 100) / 100;
        const shopAmount = Math.round((dto.amount - commission) * 100) / 100;

        console.log(`Commission breakdown:`);
        console.log(`Total: ${dto.amount}, Commission: ${commission}, Shop Amount: ${shopAmount}`);

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

        // Update wallets
        console.log(`Updating wallet balances...`);

        // Debit user wallet
        await this.walletRepository.updateBalance(userWallet._id!, dto.amount, 'debit');
        await this.walletRepository.addTransaction(userWallet._id!, userTransaction);
        console.log(`✅ Debited ${dto.amount} from user wallet`);

        // Credit shop wallet
        await this.walletRepository.updateBalance(shopWallet._id!, shopAmount, 'credit');
        await this.walletRepository.addTransaction(shopWallet._id!, shopTransaction);
        console.log(`✅ Credited ${shopAmount} to shop wallet`);

        // Credit admin wallet
        await this.walletRepository.updateBalance(adminWallet._id!, commission, 'credit');
        await this.walletRepository.addTransaction(adminWallet._id!, adminTransaction);
        console.log(`✅ Credited ${commission} to admin wallet`);
      });

      console.log(`✅ Wallet payment processed successfully`);
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
      console.log(`=== PROCESSING WALLET REFUND ===`);
      console.log(`Appointment ID: ${dto.appointmentId}`);
      console.log(`Refund Amount: ${dto.amount} ${dto.currency}`);

      const appointmentResult = await this.appointmentService.getAppointmentById(dto.appointmentId);
      if (!appointmentResult.success || !appointmentResult.data) {
        throw new Error('Appointment not found for refund');
      }
      const appointment = appointmentResult.data;

      await session.withTransaction(async () => {
        // Fetch wallets
        const userWallet = await this.walletRepository.findWalletByOwner(appointment.userId, 'user');
        const shopWallet = await this.walletRepository.findWalletByOwner(appointment.shopId, 'shop');

        // Get admin ID from environment or use default
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

        // Calculate commission for reversal
        const commission = Math.round(dto.amount * DEFAULT_COMMISSION_RATE * 100) / 100;
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
        console.log(`✅ Credited ${dto.amount} to user wallet`);

        // Debit shop wallet
        await this.walletRepository.updateBalance(shopWallet._id!, shopAmount, 'debit');
        await this.walletRepository.addTransaction(shopWallet._id!, shopTransaction);
        console.log(`✅ Debited ${shopAmount} from shop wallet`);

        // Debit admin wallet
        await this.walletRepository.updateBalance(adminWallet._id!, commission, 'debit');
        await this.walletRepository.addTransaction(adminWallet._id!, adminTransaction);
        console.log(`✅ Debited ${commission} from admin wallet`);
      });

      console.log(`✅ Wallet refund processed successfully`);
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