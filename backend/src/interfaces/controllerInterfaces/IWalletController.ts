import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { WalletResponseDto, WalletTransactionDto } from '../../dto/wallet.dto';

export interface IWalletController {
  /**
   * Creates a new wallet for a user, shop, or admin.
   * @param req Express request object containing wallet creation data (ownerId, ownerType, currency).
   * @param res Express response object to send the result.
   */
  createWallet(req: Request, res: Response): Promise<void>;

  /**
   * Retrieves a wallet by owner ID and owner type.
   * @param req Express request object containing ownerId and ownerType.
   * @param res Express response object to send the wallet data.
   */
  getWalletByOwner(req: Request, res: Response): Promise<void>;

  /**
   * Retrieves a wallet by its ID.
   * @param req Express request object containing walletId.
   * @param res Express response object to send the wallet data.
   */
  getWalletById(req: Request, res: Response): Promise<void>;

  /**
   * Processes a payment for an appointment, debiting the user's wallet and crediting the shop and admin wallets.
   * @param req Express request object containing payment details (userId, shopId, amount, currency, appointmentId, description).
   * @param res Express response object to send the result.
   */
  processPayment(req: Request, res: Response): Promise<void>;

  /**
   * Processes a refund for an appointment, crediting the user's wallet and debiting the shop and admin wallets.
   * @param req Express request object containing refund details (appointmentId, amount, currency, description).
   * @param res Express response object to send the result.
   */
  refundPayment(req: Request, res: Response): Promise<void>;

  /**
   * Retrieves the transaction history for a wallet.
   * @param req Express request object containing walletId and optional query parameters (limit, skip).
   * @param res Express response object to send the transaction history.
   */
  getTransactionHistory(req: Request, res: Response): Promise<void>;
}