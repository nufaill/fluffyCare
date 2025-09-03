"use client"

import { useState, useEffect } from "react"
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { Wallet } from 'lucide-react';
import { walletService } from '@/services/walletService';
import { WalletComponent } from "@/components/wallet/WalletComponent"
import Navbar from "@/components/admin/Navbar"
import Sidebar from "@/components/admin/sidebar"
import Footer from "@/components/user/Footer"
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

interface IWalletTransaction {
  _id?: string
  type: "credit" | "debit"
  amount: number
  currency: string
  description: string
  referenceId?: string
  createdAt: Date
}

interface WalletData {
  _id: string
  balance: number
  currency: string
  transactions: IWalletTransaction[]
}

export default function AdminWalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const admin = useSelector((state: RootState) => state.admin.adminDatas);

  const adminId = admin?._id;

  const createWallet = async () => {
    if (!adminId) {
      setError('Admin ID missing, cannot create wallet');
      return;
    }

    try {
      setIsCreating(true);
      console.log('Creating admin wallet...');
      
      const walletData = await walletService.createAdminWallet({
        ownerId: adminId,
        ownerType: 'admin',
        currency: 'INR',
      });

      console.log('Wallet created successfully!');
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
    if (!adminId) {
      setError('Missing admin ID');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching admin wallet...');
      
      const walletData = await walletService.getAdminWallet(adminId, 'admin');
      setWallet(walletService.formatWalletData(walletData));
    } catch (error: any) {
      console.error('Wallet fetch error:', error);
      
      let errorMessage = 'Failed to fetch wallet';
      
      if (error.message) {
        errorMessage = error.message;
        
        // If wallet doesn't exist, try to create it
        if (error.message.includes('Wallet not found') || error.message.includes('404')) {
          console.log('Wallet not found, attempting to create...');
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
    if (adminId) {
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
  }, [adminId]);

  const handleAction = (actionType: string, data?: any) => {
    console.log("Admin action triggered:", actionType, data);
    
    // Implement admin-specific actions
    switch (actionType) {
      case 'adjust_balance':
        console.log('Adjusting balance:', data);
        break;
      case 'manual_credit':
        console.log('Manual credit:', data);
        break;
      case 'manual_debit':
        console.log('Manual debit:', data);
        break;
      case 'commission_reports':
        console.log('Generating commission reports');
        break;
      case 'download_statement':
        generateStatement();
        break;
      default:
        console.log("Unknown action:", actionType, data);
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
    link.download = `admin-wallet-statement-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // If no admin ID, show login message
  if (!adminId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar userName="NUFAIL" />
        </div>
        <div className="flex flex-1 pt-16">
          <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-40">
            <Sidebar />
          </div>
          <div className="flex-1 ml-64 min-h-[calc(100vh-4rem)] pb-16 flex items-center justify-center">
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
              <p className="text-gray-600 mb-4">You need to be logged in as admin to view the wallet.</p>
            </div>
          </div>
        </div>
        <div className="ml-64">
          <Footer />
        </div>
      </div>
    );
  }

  // If creating wallet, show loading
  if (isCreating) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar userName="Admin" />
        </div>
        <div className="flex flex-1 pt-16">
          <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-40">
            <Sidebar />
          </div>
          <div className="flex-1 ml-64 min-h-[calc(100vh-4rem)] pb-16 flex items-center justify-center">
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-blue-600 mb-4">Creating Admin Wallet</h1>
              <p className="text-gray-600">Please wait while we set up the admin wallet...</p>
            </div>
          </div>
        </div>
        <div className="ml-64">
          <Footer />
        </div>
      </div>
    );
  }

  // If error and no wallet, show clean create option
  if (error && !wallet) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar userName="Admin" />
        </div>
        <div className="flex flex-1 pt-16">
          <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-40">
            <Sidebar />
          </div>
          <div className="flex-1 ml-64 min-h-[calc(100vh-4rem)] pb-16 flex items-center justify-center">
            <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md mx-4">
              <Wallet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Set Up Admin Wallet</h1>
              <p className="text-gray-600 mb-6">Let's create the admin wallet to manage system funds and commissions.</p>
              <button
                onClick={createWallet}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Admin Wallet
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

  // If error but wallet exists, show error with retry
  if (error && wallet) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar userName="Admin" />
        </div>
        <div className="flex flex-1 pt-16">
          <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-40">
            <Sidebar />
          </div>
          <div className="flex-1 ml-64 min-h-[calc(100vh-4rem)] pb-16 p-4 md:p-6">
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
        </div>
        <div className="ml-64">
          <Footer />
        </div>
      </div>
    );
  }

  // Main admin wallet view
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar userName="Admin" />
      </div>
      <div className="flex flex-1 pt-16">
        <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-40">
          <Sidebar />
        </div>
        <div className="flex-1 ml-64 min-h-[calc(100vh-4rem)] pb-16">
          <WalletComponent
            role="admin"
            balance={wallet?.balance ?? 0}
            currency={wallet?.currency ?? 'INR'}
            transactions={wallet?.transactions ?? []}
            onAction={handleAction}
            isLoading={isLoading}
          />
        </div>
      </div>
      <div className="ml-64">
        <Footer />
      </div>
    </div>
  )
}