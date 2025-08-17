import React, { useState } from 'react';
import { Plus, Minus, Download, CreditCard, TrendingUp, Settings } from 'lucide-react';

interface WalletActionButtonsProps {
  role: "user" | "shop" | "admin";
  onAction: (actionType: string, data?: any) => void;
}

export function WalletActionButtons({ role, onAction }: WalletActionButtonsProps) {
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState('');

  const handleAddMoney = () => {
    if (amount && parseFloat(amount) > 0) {
      onAction('add_money', { amount: parseFloat(amount) });
      setAmount('');
      setIsAddMoneyOpen(false);
    }
  };

  const handleWithdraw = () => {
    if (amount && parseFloat(amount) > 0) {
      onAction('withdraw', { amount: parseFloat(amount) });
      setAmount('');
      setIsWithdrawOpen(false);
    }
  };

  const userActions = [
    {
      label: 'Add Money',
      icon: Plus,
      onClick: () => setIsAddMoneyOpen(true),
      className: 'bg-green-600 hover:bg-green-700 text-white'
    },
    {
      label: 'Withdraw',
      icon: Minus,
      onClick: () => setIsWithdrawOpen(true),
      className: 'bg-red-600 hover:bg-red-700 text-white'
    },
    {
      label: 'Download Statement',
      icon: Download,
      onClick: () => onAction('download_statement'),
      className: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  ];

  const shopActions = [
    {
      label: 'Withdraw Earnings',
      icon: Minus,
      onClick: () => setIsWithdrawOpen(true),
      className: 'bg-green-600 hover:bg-green-700 text-white'
    },
    {
      label: 'View Earnings Report',
      icon: TrendingUp,
      onClick: () => onAction('earnings_report'),
      className: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    {
      label: 'Download Statement',
      icon: Download,
      onClick: () => onAction('download_statement'),
      className: 'bg-gray-600 hover:bg-gray-700 text-white'
    }
  ];

  const adminActions = [
    {
      label: 'Adjust Balance',
      icon: Settings,
      onClick: () => onAction('adjust_balance'),
      className: 'bg-purple-600 hover:bg-purple-700 text-white'
    },
    {
      label: 'Manual Credit',
      icon: Plus,
      onClick: () => setIsAddMoneyOpen(true),
      className: 'bg-green-600 hover:bg-green-700 text-white'
    },
    {
      label: 'Manual Debit',
      icon: Minus,
      onClick: () => setIsWithdrawOpen(true),
      className: 'bg-red-600 hover:bg-red-700 text-white'
    },
    {
      label: 'Commission Reports',
      icon: TrendingUp,
      onClick: () => onAction('commission_reports'),
      className: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    {
      label: 'Download All Statements',
      icon: Download,
      onClick: () => onAction('download_all_statements'),
      className: 'bg-gray-600 hover:bg-gray-700 text-white'
    }
  ];

  const getActionsForRole = () => {
    switch (role) {
      case 'user':
        return userActions;
      case 'shop':
        return shopActions;
      case 'admin':
        return adminActions;
      default:
        return [];
    }
  };

  const actions = getActionsForRole();

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg ${action.className}`}
          >
            <action.icon className="h-5 w-5" />
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Add Money Modal */}
      {isAddMoneyOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {role === 'admin' ? 'Manual Credit' : 'Add Money'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddMoney}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  {role === 'admin' ? 'Credit' : 'Add Money'}
                </button>
                <button
                  onClick={() => {
                    setIsAddMoneyOpen(false);
                    setAmount('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {role === 'admin' ? 'Manual Debit' : role === 'shop' ? 'Withdraw Earnings' : 'Withdraw Money'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleWithdraw}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                >
                  {role === 'admin' ? 'Debit' : 'Withdraw'}
                </button>
                <button
                  onClick={() => {
                    setIsWithdrawOpen(false);
                    setAmount('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}