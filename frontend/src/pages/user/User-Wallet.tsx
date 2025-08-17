import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { Wallet } from 'lucide-react';
import Walletaxios from '@/api/wallet.axios';
import { WalletComponent } from '../../components/wallet/WalletComponent';
import Navbar from '@/components/user/Header';
import Footer from '@/components/user/Footer';
import { ModernSidebar } from "@/components/user/App-sidebar"
import io from 'socket.io-client';

const socket = io("http://localhost:5000");

interface IWalletTransaction {
  _id?: string;
  type: "credit" | "debit";
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

export default function UserWalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const user = useSelector((state: RootState) => state.user.userDatas);

  const userId = user?.id;

  const createWallet = async () => {
    if (!userId) {
      setError('User ID missing, cannot create wallet');
      return;
    }

    try {
      setIsCreating(true);

      const response = await Walletaxios.post('/user/create', {
        ownerId: userId,
        ownerType: 'user',
        currency: 'INR',
      });

      if (response.data.success && response.data.data) {
        setWallet({
          _id: response.data.data._id,
          balance: response.data.data.balance,
          currency: response.data.data.currency,
          transactions: response.data.data.transactions?.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
          })) || [],
        });

        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to create wallet');
      }
    } catch (error: any) {
      console.error('Create wallet error:', error);

      let errorMessage = 'Failed to create wallet';

      if (error.response) {
        errorMessage = `Create Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;

        if (error.response.status === 401) {
          errorMessage += ' - Please ensure you are logged in';
        }
      } else if (error.request) {
        errorMessage = 'No response from server while creating wallet';
      } else {
        errorMessage = `Create request error: ${error.message}`;
      }

      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const fetchWallet = async () => {
    if (!userId) {
      setError('Missing user ID');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await Walletaxios.get(`/user/owner/${userId}/user`);

      const data = response.data;

      if (data.success && data.data) {
        setWallet({
          _id: data.data._id,
          balance: data.data.balance,
          currency: data.data.currency,
          transactions: data.data.transactions?.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
          })) || [],
        });
      } else {
        throw new Error(data.message || 'Failed to fetch wallet');
      }
    } catch (error: any) {
      console.error('Wallet fetch error:', error);

      let errorMessage = 'Failed to fetch wallet';

      if (error.response) {
        errorMessage = `Server Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;

        // If wallet doesn't exist (404), try to create it
        if (error.response.status === 404 || (error.response.data?.message && error.response.data.message.includes('Wallet not found'))) {
          await createWallet();
          return;
        }

        if (error.response.status === 401) {
          errorMessage += ' - Authentication failed. Please log in again.';
        }
      } else if (error.request) {
        errorMessage = 'No response from server - check if backend is running';
      } else {
        errorMessage = `Request error: ${error.message}`;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchWallet();
    }

    // Socket listeners for real-time updates
    socket.on('walletUpdated', (data) => {
      if (data.walletId === wallet?._id) {
        fetchWallet(); // Refresh wallet data
      }
    });

    return () => {
      socket.off('walletUpdated');
    };
  }, [userId]);

  const handleAction = async (actionType: string, data?: any) => {
    try {
      switch (actionType) {
        case 'add_money':
          await new Promise(resolve => setTimeout(resolve, 1000));
          await fetchWallet();
          break;

        case 'withdraw':
          await new Promise(resolve => setTimeout(resolve, 1000));
          await fetchWallet();
          break;

        case 'download_statement':
          generateStatement();
          break;

        default:
          console.log("Action triggered:", actionType, data);
      }
    } catch (error) {
      console.error('Action error:', error);
      setError(error instanceof Error ? error.message : 'Action failed');
    }
  };

  const generateStatement = () => {
    if (!wallet) return;

    const csvContent = [
      ['Date', 'Type', 'Description', 'Amount', 'Reference'],
      ...wallet.transactions.map(t => [
        new Date(t.createdAt).toLocaleDateString(),
        t.type,
        t.description,
        `${t.type === 'credit' ? '+' : '-'}${t.amount}`,
        t.referenceId || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wallet-statement-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // If no user ID, show login message
  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
            <p className="text-gray-600 mb-4">You need to be logged in to view your wallet.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If creating wallet, show loading
  if (isCreating) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-md">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-blue-600 mb-4">Creating Your Wallet</h1>
            <p className="text-gray-600">Please wait while we set up your wallet...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If error and no wallet, show clean create option
  if (error && !wallet) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md mx-4">
            <Wallet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Set Up Your Wallet</h1>
            <p className="text-gray-600 mb-6">Let's create your digital wallet to manage your funds securely.</p>
            <button
              onClick={createWallet}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create My Wallet
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If error but wallet exists, show error with retry
  if (error && wallet) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Wallet Error</h1>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchWallet}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Main wallet view
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="flex">
        <ModernSidebar />
        <div className="flex-1">
          <WalletComponent
            role="user"
            balance={wallet?.balance ?? 0}
            currency={wallet?.currency ?? 'INR'}
            transactions={wallet?.transactions ?? []}
            onAction={handleAction}
            isLoading={isLoading}
          />
        </div>
      </div>
        <Footer />
    </div>
  );
}