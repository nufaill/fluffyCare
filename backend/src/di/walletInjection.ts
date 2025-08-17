// di/walletInjection.ts
import { WalletController } from "../controllers/wallet.controller";
import { WalletService } from "../services/wallet.service";
import { WalletRepository } from "../repositories/wallet.repository"; 

const walletRepository = new WalletRepository();
const walletService = new WalletService(walletRepository);
const walletController = new WalletController(walletService);

export const walletDependencies = {
  walletRepository,
  walletService,
  walletController
};