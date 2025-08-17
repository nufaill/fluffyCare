import React, { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Calendar, Search, Filter } from 'lucide-react';

interface IWalletTransaction {
  _id?: string;
  type: "credit" | "debit";
  amount: number;
  currency: string;
  description: string;
  referenceId?: string;
  createdAt: Date;
}

interface TransactionTableProps {
  transactions: IWalletTransaction[];
  currency: string;
  role: "user" | "shop" | "admin";
}

export function TransactionTable({ transactions, currency, role }: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  // Filter and search transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.referenceId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const getTransactionIcon = (type: 'credit' | 'debit') => {
    return type === 'credit' ? 
      <ArrowUpCircle className="h-5 w-5 text-green-500" /> : 
      <ArrowDownCircle className="h-5 w-5 text-red-500" />;
  };

  const getTransactionColor = (type: 'credit' | 'debit') => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Transaction History</h3>
            <p className="text-gray-600 text-sm mt-1">
              {role === 'admin' ? 'All platform transactions' : 'Your recent transactions'}
            </p>
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'credit' | 'debit')}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="all">All Types</option>
                <option value="credit">Credits</option>
                <option value="debit">Debits</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="p-6">
        {paginatedTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h4>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Your transactions will appear here once you start using your wallet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedTransactions.map((transaction, index) => (
              <div
                key={transaction._id || index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {transaction.description}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </p>
                      {transaction.referenceId && (
                        <p className="text-xs text-gray-400">
                          Ref: {transaction.referenceId.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-lg font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {transaction.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">
                {currentPage}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}