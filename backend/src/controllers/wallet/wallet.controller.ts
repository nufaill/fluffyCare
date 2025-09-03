import { Request, Response } from 'express';
import { WalletService } from '../../services/wallet/wallet.service';
import { CreateWalletDto, ProcessPaymentDto, RefundPaymentDto, WalletResponseDto } from '../../dto/wallet.dto';
import { IWalletController } from '../../interfaces/controllerInterfaces/IWalletController';
import { HTTP_STATUS, ERROR_MESSAGES } from '../../shared/constant';
import { Types } from 'mongoose';

// Define a type guard for ownerType
function isValidOwnerType(ownerType: string): ownerType is 'user' | 'shop' | 'admin' {
    return ['user', 'shop', 'admin'].includes(ownerType);
}

export class WalletController implements IWalletController {
    private walletService: WalletService;

    constructor(walletService: WalletService) {
        this.walletService = walletService;
    }

    async createWallet(req: Request, res: Response): Promise<void> {
        try {
            const { ownerId, ownerType, currency } = req.body;

            const requiredFields = [
                { field: 'ownerId', value: ownerId },
                { field: 'ownerType', value: ownerType },
                { field: 'currency', value: currency },
            ];

            const missingField = requiredFields.find(({ value }) => value === undefined || value === null || value === '');

            if (missingField) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: `Missing required field: ${missingField.field}`,
                    data: null,
                });
                return;
            }

            if (!Types.ObjectId.isValid(ownerId)) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Invalid ownerId',
                    data: null,
                });
                return;
            }

            if (!isValidOwnerType(ownerType)) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Invalid ownerType',
                    data: null,
                });
                return;
            }

            const dto = new CreateWalletDto(new Types.ObjectId(ownerId), ownerType, currency);
            const wallet: WalletResponseDto = await this.walletService.createWallet(dto);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: 'Wallet created successfully',
                data: wallet,
            });
        } catch (error: any) {
            console.error('Create wallet error:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to create wallet',
                data: null,
            });
        }
    }

    async getWalletByOwner(req: Request, res: Response): Promise<void> {
        try {
            const { ownerId, ownerType } = req.params;

            if (!ownerId || !ownerType) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'ownerId and ownerType are required',
                    data: null,
                });
                return;
            }

            if (!Types.ObjectId.isValid(ownerId)) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Invalid ownerId',
                    data: null,
                });
                return;
            }

            if (!isValidOwnerType(ownerType)) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Invalid ownerType',
                    data: null,
                });
                return;
            }

            const wallet: WalletResponseDto | null = await this.walletService.getWalletByOwner(
                new Types.ObjectId(ownerId),
                ownerType
            );

            if (!wallet) {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: 'Wallet not found',
                    data: null,
                });
                return;
            }

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Wallet retrieved successfully',
                data: wallet,
            });
        } catch (error: any) {
            console.error('Get wallet by owner error:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to retrieve wallet',
                data: null,
            });
        }
    }

    async getWalletById(req: Request, res: Response): Promise<void> {
        try {
            const { walletId } = req.params;

            if (!walletId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'walletId is required',
                    data: null,
                });
                return;
            }

            if (!Types.ObjectId.isValid(walletId)) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Invalid walletId',
                    data: null,
                });
                return;
            }

            const wallet: WalletResponseDto | null = await this.walletService.getWalletById(new Types.ObjectId(walletId));

            if (!wallet) {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: 'Wallet not found',
                    data: null,
                });
                return;
            }

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Wallet retrieved successfully',
                data: wallet,
            });
        } catch (error: any) {
            console.error('Get wallet by ID error:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to retrieve wallet',
                data: null,
            });
        }
    }

    async processPayment(req: Request, res: Response): Promise<void> {
        try {
            const { userId, shopId, amount, currency, appointmentId, description } = req.body;

            const requiredFields = [
                { field: 'userId', value: userId },
                { field: 'shopId', value: shopId },
                { field: 'amount', value: amount },
                { field: 'currency', value: currency },
                { field: 'appointmentId', value: appointmentId },
                { field: 'description', value: description },
            ];

            const missingField = requiredFields.find(({ value }) => value === undefined || value === null || value === '');

            if (missingField) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: `Missing required field: ${missingField.field}`,
                    data: null,
                });
                return;
            }

            const objectIdFields = [
                { field: 'userId', value: userId },
                { field: 'shopId', value: shopId },
                { field: 'appointmentId', value: appointmentId },
            ];

            const invalidObjectIdField = objectIdFields.find(({ value }) => !Types.ObjectId.isValid(value));

            if (invalidObjectIdField) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: `Invalid ObjectId for field: ${invalidObjectIdField.field}`,
                    data: null,
                });
                return;
            }

            if (typeof amount !== 'number' || amount <= 0) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Invalid amount: must be a positive number',
                    data: null,
                });
                return;
            }

            const dto = new ProcessPaymentDto(
                new Types.ObjectId(userId),
                new Types.ObjectId(shopId),
                amount,
                currency,
                new Types.ObjectId(appointmentId),
                description
            );

            await this.walletService.processPayment(dto);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Payment processed successfully',
                data: null,
            });
        } catch (error: any) {
            console.error('Process payment error:', error);
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message || 'Failed to process payment',
                data: null,
            });
        }
    }

    async refundPayment(req: Request, res: Response): Promise<void> {
        try {
            const { appointmentId, amount, currency, description } = req.body;

            const requiredFields = [
                { field: 'appointmentId', value: appointmentId },
                { field: 'amount', value: amount },
                { field: 'currency', value: currency },
                { field: 'description', value: description },
            ];

            const missingField = requiredFields.find(({ value }) => value === undefined || value === null || value === '');

            if (missingField) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: `Missing required field: ${missingField.field}`,
                    data: null,
                });
                return;
            }

            if (!Types.ObjectId.isValid(appointmentId)) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Invalid appointmentId',
                    data: null,
                });
                return;
            }

            if (typeof amount !== 'number' || amount <= 0) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Invalid amount: must be a positive number',
                    data: null,
                });
                return;
            }

            const dto = new RefundPaymentDto(
                new Types.ObjectId(appointmentId),
                amount,
                currency,
                description
            );

            await this.walletService.refundPayment(dto);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Refund processed successfully',
                data: null,
            });
        } catch (error: any) {
            console.error('Refund payment error:', error);
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message || 'Failed to process refund',
                data: null,
            });
        }
    }

    async getTransactionHistory(req: Request, res: Response): Promise<void> {
        try {
            const { walletId } = req.params;
            const { limit = '10', skip = '0' } = req.query;

            if (!walletId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'walletId is required',
                    data: null,
                });
                return;
            }

            if (!Types.ObjectId.isValid(walletId)) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Invalid walletId',
                    data: null,
                });
                return;
            }

            const limitNum = Math.max(1, parseInt(limit as string, 10) || 10);
            const skipNum = Math.max(0, parseInt(skip as string, 10) || 0);

            const transactions = await this.walletService.getTransactionHistory(
                new Types.ObjectId(walletId),
                limitNum,
                skipNum
            );

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Transaction history retrieved successfully',
                data: transactions,
            });
        } catch (error: any) {
            console.error('Get transaction history error:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to retrieve transaction history',
                data: null,
            });
        }
    }
}