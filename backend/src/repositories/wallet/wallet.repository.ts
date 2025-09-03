import mongoose, { Types } from 'mongoose';
import WalletModel from '../../models/wallet.model';
import { IWallet, IWalletTransaction } from '../../types/Wallet.types';
import { IWalletRepository } from '../../interfaces/repositoryInterfaces/IWalletRepository';

export class WalletRepository implements IWalletRepository {
    async createWallet(
        ownerId: Types.ObjectId,
        ownerType: 'user' | 'shop' | 'admin',
        currency: string
    ): Promise<IWallet> {
        const wallet = new WalletModel({
            ownerId,
            ownerType,
            currency,
            balance: 0,
            transactions: [],
        });
        return await wallet.save();
    }

    async findWalletByOwner(
        ownerId: Types.ObjectId,
        ownerType: 'user' | 'shop' | 'admin'
    ): Promise<IWallet | null> {
        return await WalletModel.findOne({ ownerId, ownerType }).exec();
    }

    async findWalletById(walletId: Types.ObjectId): Promise<IWallet | null> {
        return await WalletModel.findById(walletId).exec();
    }

    async updateBalance(
        walletId: Types.ObjectId,
        amount: number,
        type: 'credit' | 'debit'
    ): Promise<IWallet> {
        const update = type === 'credit' ? { $inc: { balance: amount } } : { $inc: { balance: -amount } };
        const wallet = await WalletModel.findByIdAndUpdate(
            walletId,
            update,
            { new: true }
        ).exec();
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        return wallet;
    }

    async addTransaction(
        walletId: Types.ObjectId,
        transaction: IWalletTransaction
    ): Promise<IWallet> {
        const wallet = await WalletModel.findByIdAndUpdate(
            walletId,
            { $push: { transactions: transaction } },
            { new: true }
        ).exec();
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        return wallet;
    }

    async getTransactionHistory(
        walletId: Types.ObjectId,
        limit: number = 10,
        skip: number = 0
    ): Promise<IWalletTransaction[]> {
        const wallet = await WalletModel.findById(walletId)
            .select('transactions')
            .slice('transactions', [skip, limit])
            .exec();
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        return wallet.transactions;
    }
}