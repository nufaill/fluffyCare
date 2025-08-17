import { Types } from 'mongoose';

export class CreateWalletDto {
  ownerId: Types.ObjectId;
  ownerType: 'user' | 'shop' | 'admin';
  currency: string;

  constructor(ownerId: Types.ObjectId, ownerType: 'user' | 'shop' | 'admin', currency: string) {
    this.ownerId = ownerId;
    this.ownerType = ownerType;
    this.currency = currency;
  }
}

export class WalletTransactionDto {
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  referenceId?: Types.ObjectId;

  constructor(
    type: 'credit' | 'debit',
    amount: number,
    currency: string,
    description: string,
    referenceId?: Types.ObjectId
  ) {
    this.type = type;
    this.amount = amount;
    this.currency = currency;
    this.description = description;
    this.referenceId = referenceId;
  }
}

export class ProcessPaymentDto {
  userId: Types.ObjectId;
  shopId: Types.ObjectId;
  amount: number;
  currency: string;
  appointmentId: Types.ObjectId;
  description: string;

  constructor(
    userId: Types.ObjectId,
    shopId: Types.ObjectId,
    amount: number,
    currency: string,
    appointmentId: Types.ObjectId,
    description: string
  ) {
    this.userId = userId;
    this.shopId = shopId;
    this.amount = amount;
    this.currency = currency;
    this.appointmentId = appointmentId;
    this.description = description;
  }
}

export class RefundPaymentDto {
  appointmentId: Types.ObjectId;
  amount: number;
  currency: string;
  description: string;

  constructor(
    appointmentId: Types.ObjectId,
    amount: number,
    currency: string,
    description: string
  ) {
    this.appointmentId = appointmentId;
    this.amount = amount;
    this.currency = currency;
    this.description = description;
  }
}

export class WalletResponseDto {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  ownerType: 'user' | 'shop' | 'admin';
  balance: number;
  currency: string;
  transactions: WalletTransactionDto[];
  createdAt: Date;
  updatedAt: Date;

  constructor(
    _id: Types.ObjectId,
    ownerId: Types.ObjectId,
    ownerType: 'user' | 'shop' | 'admin',
    balance: number,
    currency: string,
    transactions: WalletTransactionDto[],
    createdAt: Date,
    updatedAt: Date
  ) {
    this._id = _id;
    this.ownerId = ownerId;
    this.ownerType = ownerType;
    this.balance = balance;
    this.currency = currency;
    this.transactions = transactions;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}