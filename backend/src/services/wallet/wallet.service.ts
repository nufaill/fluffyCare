import mongoose, { Types } from 'mongoose';
import { IWalletRepository } from '../../interfaces/repositoryInterfaces/IWalletRepository';
import { IWalletService } from '../../interfaces/serviceInterfaces/IWalletService';
import { IAppointmentService } from '../../interfaces/serviceInterfaces/IAppointmentService';
import {
  CreateWalletDto,
  WalletTransactionDto,
  ProcessPaymentDto,
  RefundPaymentDto,
  WalletResponseDto,
} from '../../dto/wallet.dto';
import { IWallet, IWalletTransaction } from '../../types/Wallet.types';
import { Shop } from '../../models/shop.model';
import { SubscriptionModel } from '../../models/subscription.model';

const DEFAULT_COMMISSION_RATE = Number(process.env.DEFAULT_COMMISSION_RATE || '0.5')

export class WalletService implements IWalletService {
  public walletRepository: IWalletRepository; 
  private _appointmentService?: IAppointmentService;

  constructor(walletRepository: IWalletRepository) {
    this.walletRepository = walletRepository;
  }

  public setAppointmentService(appointmentService: IAppointmentService): void {
    this._appointmentService = appointmentService;
  }

  public async getCommissionRate(shopId: Types.ObjectId): Promise<number> {
    try {
      const shop = await Shop.findById(shopId)
        .populate('subscription.subscriptionId')
        .select('subscription')
        .exec();
      
      if (!shop || !shop.subscription) {
        console.warn(`Shop ${shopId} not found or has no subscription, using default commission`);
        return DEFAULT_COMMISSION_RATE;
      }

      // If shop has an active subscription with subscriptionId
      if (shop.subscription.subscriptionId && shop.subscription.isActive) {
        const subscriptionPlan = shop.subscription.subscriptionId as any;
        if (subscriptionPlan && subscriptionPlan.profitPercentage !== undefined) {
          return subscriptionPlan.profitPercentage / 100; 
        }
      }

      const planName = shop.subscription.plan?.toLowerCase();
      switch (planName) {
        case 'free':
          return 0.5; // 50%
        default:
          return DEFAULT_COMMISSION_RATE;
      }
    } catch (error: any) {
      console.error(`Error fetching commission rate for shop ${shopId}:`, error);
      return DEFAULT_COMMISSION_RATE; 
    }
  }

  public async getCommissionRateByPlan(planName: string): Promise<number> {
    try {
      const subscriptionPlan = await SubscriptionModel.findOne({ 
        plan: planName,
        isActive: true 
      });
      
      if (subscriptionPlan && subscriptionPlan.profitPercentage !== undefined) {
        return subscriptionPlan.profitPercentage / 100; 
      }

      return DEFAULT_COMMISSION_RATE;
    } catch (error: any) {
      console.error(`Error fetching commission rate for plan ${planName}:`, error);
      return DEFAULT_COMMISSION_RATE;
    }
  }

  public async processSubscriptionPayment(dto: {
    shopId: Types.ObjectId;
    amount: number;
    currency: string;
    planName: string;
    profitPercentage: number;
    paymentIntentId: string;
  }): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const adminId = process.env.ADMIN_ID || '685ff3212adf35c013419da4';
        const adminWallet = await this.walletRepository.findWalletByOwner(
          new Types.ObjectId(adminId),
          'admin'
        );

        if (!adminWallet || !adminWallet._id) {
          throw new Error(`Admin wallet not found for ID: ${adminId}`);
        }
      
        const commissionRate = dto.profitPercentage / 100;
        const commission = Math.round(dto.amount * commissionRate * 100) / 100;

        const adminTransaction = new WalletTransactionDto(
          'credit',
          commission,
          dto.currency,
          `Subscription payment commission from shop ${dto.shopId} for ${dto.planName} plan (Stripe ID: ${dto.paymentIntentId})`,
          undefined
        );

        await this.walletRepository.updateBalance(adminWallet._id!, commission, 'credit');
        await this.walletRepository.addTransaction(adminWallet._id!, adminTransaction);
      });

    } catch (error: any) {
      console.error(`❌ Failed to process subscription payment commission:`, error);
      throw error;
    } finally {
      session.endSession();
    }
  }

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

  async updateBalance(walletId: Types.ObjectId, amount: number, type: 'credit' | 'debit'): Promise<void> {
    await this.walletRepository.updateBalance(walletId, amount, type);
  }

  async addTransaction(walletId: Types.ObjectId, transaction: IWalletTransaction): Promise<void> {
    await this.walletRepository.addTransaction(walletId, transaction);
  }

  async processPayment(dto: ProcessPaymentDto): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const userWallet = await this.walletRepository.findWalletByOwner(dto.userId, 'user');
        const shopWallet = await this.walletRepository.findWalletByOwner(dto.shopId, 'shop');

        const adminId = process.env.ADMIN_ID || '685ff3212adf35c013419da4';
        const adminWallet = await this.walletRepository.findWalletByOwner(
          new Types.ObjectId(adminId),
          'admin'
        );

        if (!userWallet || !userWallet._id) {
          throw new Error(`User wallet not found for ID: ${dto.userId}`);
        }
        if (!shopWallet || !shopWallet._id) {
          throw new Error(`Shop wallet not found for ID: ${dto.shopId}`);
        }
        if (!adminWallet || !adminWallet._id) {
          throw new Error(`Admin wallet not found for ID: ${adminId}`);
        }

        if (userWallet.balance < dto.amount) {
          throw new Error(`Insufficient balance in user wallet. Required: ${dto.amount}, Available: ${userWallet.balance}`);
        }

        const appointment = await this._appointmentService?.getAppointmentById(dto.appointmentId.toString());
        if (!appointment?.success || !appointment.data) {
          throw new Error('Appointment not found for payment');
        }
        const bookingNumber = appointment.data.bookingNumber;

        const commissionRate = await this.getCommissionRate(dto.shopId);

        const commission = Math.round(dto.amount * commissionRate * 100) / 100;
        const shopAmount = Math.round((dto.amount - commission) * 100) / 100;

        const userTransaction = new WalletTransactionDto(
          'debit',
          dto.amount,
          dto.currency,
          `Payment for appointment ${bookingNumber}`,
          dto.appointmentId
        );

        const shopTransaction = new WalletTransactionDto(
          'credit',
          shopAmount,
          dto.currency,
          `Payment received for appointment ${bookingNumber} (after ${(commissionRate * 100).toFixed(1)}% commission)`,
          dto.appointmentId
        );

        const adminTransaction = new WalletTransactionDto(
          'credit',
          commission,
          dto.currency,
          `Commission (${(commissionRate * 100).toFixed(1)}%) for appointment ${bookingNumber}`,
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
    if (!this._appointmentService) {
      throw new Error('AppointmentService not initialized');
    }

    const session = await mongoose.startSession();

    try {
      const appointmentResult = await this._appointmentService.getAppointmentById(dto.appointmentId.toString());
      if (!appointmentResult.success || !appointmentResult.data) {
        throw new Error('Appointment not found for refund');
      }
      const appointment = appointmentResult.data;
      const bookingNumber = appointment.bookingNumber;

      await session.withTransaction(async () => {
        const userWallet = await this.walletRepository.findWalletByOwner(appointment.userId, 'user');
        const shopWallet = await this.walletRepository.findWalletByOwner(appointment.shopId, 'shop');

        const adminId = process.env.ADMIN_ID || '685ff3212adf35c013419da4';
        const adminWallet = await this.walletRepository.findWalletByOwner(
          new Types.ObjectId(adminId),
          'admin'
        );

        if (!userWallet || !userWallet._id || !shopWallet || !shopWallet._id || !adminWallet || !adminWallet._id) {
          throw new Error('One or more wallets not found for refund');
        }

        const commissionRate = await this.getCommissionRate(appointment.shopId);

        const commission = Math.round(dto.amount * commissionRate * 100) / 100;
        const shopAmount = Math.round((dto.amount - commission) * 100) / 100;

        if (shopWallet.balance < shopAmount) {
          throw new Error(`Insufficient balance in shop wallet for refund. Required: ${shopAmount}, Available: ${shopWallet.balance}`);
        }
        if (adminWallet.balance < commission) {
          throw new Error(`Insufficient balance in admin wallet for refund. Required: ${commission}, Available: ${adminWallet.balance}`);
        }

        const userTransaction = new WalletTransactionDto(
          'credit',
          dto.amount,
          dto.currency,
          `Refund for appointment ${bookingNumber}`,
          dto.appointmentId
        );

        const shopTransaction = new WalletTransactionDto(
          'debit',
          shopAmount,
          dto.currency,
          `Refund debited for appointment ${bookingNumber} (${(commissionRate * 100).toFixed(1)}% commission reversed)`,
          dto.appointmentId
        );

        const adminTransaction = new WalletTransactionDto(
          'debit',
          commission,
          dto.currency,
          `Commission refund (${(commissionRate * 100).toFixed(1)}%) for appointment ${bookingNumber}`,
          dto.appointmentId
        );

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