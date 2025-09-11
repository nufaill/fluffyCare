// routes/wallet.route.ts
import { RequestHandler, Router } from 'express';
import { walletDependencies } from '../di/walletInjection';
import { userDependencies } from '../di/userInjection';
import { shopDependencies } from '../di/shopInjection';
import { adminDependencies } from '../di/adminInjection';
import { Request, Response } from 'express';
const router = Router();

// User wallet routes
router.post(
  '/user/create',
  userDependencies.authMiddleware.authenticate as RequestHandler,
  walletDependencies.walletController.createWallet.bind(walletDependencies.walletController) as RequestHandler
);

router.get(
  '/user/owner/:ownerId/:ownerType',
  userDependencies.authMiddleware.authenticate as RequestHandler,
  walletDependencies.walletController.getWalletByOwner.bind(walletDependencies.walletController) as RequestHandler
);

router.get(
  '/user/:walletId',
  userDependencies.authMiddleware.authenticate as RequestHandler,
  walletDependencies.walletController.getWalletById.bind(walletDependencies.walletController) as RequestHandler
);

router.get(
  '/user/:walletId/transactions',
  userDependencies.authMiddleware.authenticate as RequestHandler,
  walletDependencies.walletController.getTransactionHistory.bind(walletDependencies.walletController) as RequestHandler
);

// Shop wallet routes
router.post(
  '/shop/create',
  shopDependencies.authMiddleware.authenticate as RequestHandler,
  walletDependencies.walletController.createWallet.bind(walletDependencies.walletController) as RequestHandler
);

router.get(
  '/shop/owner/:ownerId/:ownerType',
  shopDependencies.authMiddleware.authenticate as RequestHandler,
  walletDependencies.walletController.getWalletByOwner.bind(walletDependencies.walletController) as RequestHandler
);

router.get(
  '/shop/:walletId',
  shopDependencies.authMiddleware.authenticate as RequestHandler,
  walletDependencies.walletController.getWalletById.bind(walletDependencies.walletController) as RequestHandler
);

router.get(
  '/shop/:walletId/transactions',
  shopDependencies.authMiddleware.authenticate as RequestHandler,
  walletDependencies.walletController.getTransactionHistory.bind(walletDependencies.walletController) as RequestHandler
);

// Admin wallet routes
router.post(
  '/admin/create',
  adminDependencies.authMiddleware.authenticate as RequestHandler,
  walletDependencies.walletController.createWallet.bind(walletDependencies.walletController) as RequestHandler
);

router.get(
  '/admin/owner/:ownerId/:ownerType',
  adminDependencies.authMiddleware.authenticate as RequestHandler,
  walletDependencies.walletController.getWalletByOwner.bind(walletDependencies.walletController) as RequestHandler
);

router.get(
  '/admin/:walletId',
  adminDependencies.authMiddleware.authenticate as RequestHandler,
  walletDependencies.walletController.getWalletById.bind(walletDependencies.walletController) as RequestHandler
);

router.get(
  '/admin/:walletId/transactions',
  adminDependencies.authMiddleware.authenticate as RequestHandler,
  walletDependencies.walletController.getTransactionHistory.bind(walletDependencies.walletController) as RequestHandler
);

// Backward compatibility: Default routes use shop authentication for now
// You can change this based on your requirements
router.post(
  '/',
  shopDependencies.authMiddleware.authenticate as RequestHandler,
  walletDependencies.walletController.createWallet.bind(walletDependencies.walletController) as RequestHandler
);

router.get(
  '/owner/:ownerId/:ownerType',
  shopDependencies.authMiddleware.authenticate as RequestHandler,
  walletDependencies.walletController.getWalletByOwner.bind(walletDependencies.walletController) as RequestHandler
);

router.get(
  '/:walletId',
  shopDependencies.authMiddleware.authenticate as RequestHandler,
  walletDependencies.walletController.getWalletById.bind(walletDependencies.walletController) as RequestHandler
);

router.get(
  '/:walletId/transactions',
  shopDependencies.authMiddleware.authenticate as RequestHandler,
  walletDependencies.walletController.getTransactionHistory.bind(walletDependencies.walletController) as RequestHandler
);

// Payment routes
router.post(
  '/payment',
  userDependencies.authMiddleware.authenticate as RequestHandler,
  walletDependencies.walletController.processPayment.bind(walletDependencies.walletController) as RequestHandler
);

router.post(
  '/refund',
  adminDependencies.authMiddleware.authenticate as RequestHandler,
  walletDependencies.walletController.refundPayment.bind(walletDependencies.walletController) as RequestHandler
);

export default router;