// import { Request, Response, NextFunction } from 'express';
// import { User } from '../models/userModel';
// import { Shop } from '../models/shopModel';

// export const checkEntityActive = (entity: 'user' | 'shop') => {
//   return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       if (entity === 'user') {
//         const userId = (req as any).user?.id;
//         if (!userId) {
//           res.status(401).json({ message: 'Unauthorized: No user found in request.' });
//           return;
//         }

//         const user = await User.findById(userId).select('isActive');
//         if (!user) {
//           res.status(404).json({ message: 'User not found.' });
//           return;
//         }

//         if (!user.isActive) {
//           res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
//           return;
//         }
//       }

//       if (entity === 'shop') {
//         const shopId = (req as any).shop?.id;
//         if (!shopId) {
//           res.status(401).json({ message: 'Unauthorized: No shop found in request.' });
//           return;
//         }

//         const shop = await Shop.findById(shopId).select('isActive');
//         if (!shop) {
//           res.status(404).json({ message: 'Shop not found.' });
//           return;
//         }

//         if (!shop.isActive) {
//           res.status(403).json({ message: 'Your shop is inactive. Please contact support.' });
//           return;
//         }
//       }

//       next();
//     } catch (error) {
//       console.error('[checkEntityActive] Error:', error);
//       res.status(500).json({ message: 'Server error while checking active status.' });
//     }
//   };
// };