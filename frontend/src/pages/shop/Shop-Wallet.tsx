import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { walletService } from '@/services/walletService';
import { WalletComponent } from '../../components/wallet/WalletComponent';
import Footer from '@/components/user/Footer';
import { PetCareLayout } from '@/components/layout/PetCareLayout';
import { Wallet } from 'lucide-react';
import Navbar from '@/components/shop/Navbar';

interface IWalletTransaction {
  _id?: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  referenceId?: string;
  createdAt: Date;
}

interface WalletData {
  _id: string;
  balance: number;
  currency: string;
  transactions: IWalletTransaction[];
}

export default function ShopWalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const { shopData: shop } = useSelector((state: RootState) => state.shop);

  const shopId = shop?.id;

  const createWallet = async () => {
    if (!shopId) {
      setError('Shop ID missing, cannot create wallet');
      return;
    }

    try {
      setIsCreating(true);

      const walletData = await walletService.createShopWallet({
        ownerId: shopId,
        ownerType: 'shop',
        currency: 'INR',
      });

      setDebugInfo('✅ Wallet created successfully');
      setWallet(walletService.formatWalletData(walletData));
      setError(null);
    } catch (error: any) {
      console.error('Create wallet error:', error);

      let errorMessage = 'Failed to create wallet';

      if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setDebugInfo(`Create failed: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const fetchWallet = async () => {
    if (!shopId) {
      setError('Missing shop ID');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const walletData = await walletService.getShopWallet(shopId, 'shop');
      setWallet(walletService.formatWalletData(walletData));
      setDebugInfo('✅ Wallet fetched successfully');
    } catch (error: any) {
      console.error('=== WALLET FETCH ERROR ===');
      console.error('Error:', error);

      let errorMessage = 'Failed to fetch wallet';
      let debugDetails = '';

      if (error.message) {
        errorMessage = error.message;
        debugDetails = error.message;

        // If wallet doesn't exist, try to create it
        if (error.message.includes('Wallet not found') || error.message.includes('404')) {
          setDebugInfo('Wallet not found, creating new wallet...');
          await createWallet();
          return;
        }
      }

      setError(errorMessage);
      setDebugInfo(debugDetails);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) {
      fetchWallet();
    }
  }, [shopId]);

  // Enhanced debugging display
  if (!shopId) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Shop ID Missing</h1>
            <p className="text-red-600 mb-4">Please log in to view your wallet.</p>

            <div className="bg-gray-50 p-4 rounded text-sm">
              <h3 className="font-semibold mb-2">Debug Info:</h3>
              <pre className="whitespace-pre-wrap">{JSON.stringify(shop, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !wallet) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
        <div className="flex flex-1 pt-16">
          <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-40">
            <PetCareLayout children={undefined} />
          </div>
          <div className="flex-1 ml-64 min-h-[calc(100vh-4rem)] pb-16 flex items-center justify-center">
            <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md mx-4">
              <Wallet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Set Up Shop Wallet</h1>
              <p className="text-gray-600 mb-6">Let's create the Shop wallet to manage system funds and commissions.</p>
              <button
                onClick={createWallet}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Shop Wallet
              </button>
            </div>
          </div>
        </div>
        <div className="ml-64">
          <Footer />
        </div>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-blue-600 mb-4">Creating Your Wallet</h1>
              <p className="text-gray-600">Please wait while we set up your shop wallet...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PetCareLayout>
      <Navbar />
      <WalletComponent
        role="shop"
        balance={wallet?.balance ?? 0}
        currency={wallet?.currency ?? 'INR'}
        transactions={wallet?.transactions ?? []}
        onAction={(actionType, data) => {
          console.log(`Action: ${actionType}`, data);
        }}
        isLoading={isLoading}
      />
      <Footer/>
    </PetCareLayout>
  );
}