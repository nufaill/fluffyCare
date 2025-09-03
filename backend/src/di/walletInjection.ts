// di/walletInjection.ts
import { WalletController } from "../controllers/wallet/wallet.controller";
import { WalletService } from "../services/wallet/wallet.service";
import { WalletRepository } from "../repositories/wallet/wallet.repository"; 

const walletRepository = new WalletRepository();
const walletService = new WalletService(walletRepository);
const walletController = new WalletController(walletService);

export const walletDependencies = {
  walletRepository,
  walletService,
  walletController
};