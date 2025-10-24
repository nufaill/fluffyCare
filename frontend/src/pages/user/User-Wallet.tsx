import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { Wallet, Loader2, Menu } from 'lucide-react';
import { walletService } from '@/services/walletService';
import { WalletComponent } from '../../components/wallet/WalletComponent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/user/Header';
import Footer from '@/components/user/Footer';
import { ModernSidebar } from '@/components/user/AppSidebar';
import io from 'socket.io-client';
import { useMobile } from '@/hooks/chat/use-mobile';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();
  const user = useSelector((state: RootState) => state.user.userDatas);

  const userId = user?.id;

  const createWallet = async () => {
    if (!userId) {
      setError('User ID missing, cannot create wallet');
      return;
    }

    try {
      setIsCreating(true);
      const walletData = await walletService.createUserWallet({
        ownerId: userId,
        ownerType: 'user',
        currency: 'INR',
      });
      setWallet(walletService.formatWalletData(walletData));
      setError(null);
    } catch (error: any) {
      console.error('Create wallet error:', error);
      let errorMessage = 'Failed to create wallet';
      if (error.message) {
        errorMessage = error.message;
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
      const walletData = await walletService.getUserWallet(userId, 'user');
      setWallet(walletService.formatWalletData(walletData));
    } catch (error: any) {
      console.error('Wallet fetch error:', error);
      let errorMessage = 'Failed to fetch wallet';
      if (error.message) {
        errorMessage = error.message;
        if (error.message.includes('Wallet not found') || error.message.includes('404')) {
          await createWallet();
          return;
        }
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
    socket.on('walletUpdated', (data) => {
      if (data.walletId === wallet?._id) {
        fetchWallet();
      }
    });

    return () => {
      socket.off('walletUpdated');
    };
  }, [userId, wallet?._id]);

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!userId) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-black">
        <Header />
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm max-w-md w-full">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-full">
                  <Wallet className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Please Log In
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You need to be logged in to view your wallet.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-black">
        <Header />
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm max-w-md w-full">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-gray-900 dark:text-white" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Creating Your Wallet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we set up your wallet...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !wallet) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-black">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          {!isMobile && <ModernSidebar />}
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm max-w-md w-full">
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-full">
                    <Wallet className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Set Up Your Wallet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Let's create your digital wallet to manage your funds securely.
                    </p>
                    <Button
                      onClick={createWallet}
                      className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold"
                    >
                      Create My Wallet
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && wallet) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-black">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          {!isMobile && <ModernSidebar />}
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm max-w-md w-full">
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-red-100 dark:bg-red-900 rounded-full">
                    <Wallet className="h-8 w-8 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Wallet Error
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {error}
                    </p>
                    <Button
                      onClick={fetchWallet}
                      className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        {!isMobile && <ModernSidebar />}
        
        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 md:hidden">
              <ModernSidebar />
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Page Header */}
          <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 sm:gap-4 border-b border-gray-200 dark:border-gray-800 px-3 sm:px-4 lg:px-6 bg-white dark:bg-black w-full">
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="shrink-0"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  My Wallet
                </h1>
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
            <div className="flex flex-col gap-4 sm:gap-6 p-3 sm:p-4 lg:p-6">
              <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white font-bold">
                    Wallet Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <WalletComponent
                    role="user"
                    balance={wallet?.balance ?? 0}
                    currency={wallet?.currency ?? 'INR'}
                    transactions={wallet?.transactions ?? []}
                    onAction={handleAction}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}