import { useState, useMemo, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Calendar, Search, Filter } from 'lucide-react';
import { Pagination } from '../ui/Pagination'; // Import the Pagination component

interface IWalletTransaction {
  _id?: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  referenceId?: string;
  createdAt: Date;
}

interface TransactionTableProps {
  transactions: IWalletTransaction[];
  currency: string;
  role: 'user' | 'shop' | 'admin';
}

export function TransactionTable({ transactions, currency, role }: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Now a state variable

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             transaction.referenceId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || transaction.type === filterType;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions, searchTerm, filterType]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getTransactionIcon = (type: 'credit' | 'debit') => {
    return type === 'credit' ? (
      <ArrowUpCircle className="h-5 w-5 text-green-500" />
    ) : (
      <ArrowDownCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getTransactionColor = (type: 'credit' | 'debit') => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  const handlePaginationChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize && pageSize !== itemsPerPage) {
      setItemsPerPage(pageSize);
      // Reset to first page when page size changes to avoid invalid page numbers
      setCurrentPage(1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full mx-auto">
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Transaction History</h3>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">
              {role === 'admin' ? 'All platform transactions' : 'Your recent transactions'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                aria-label="Search transactions"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'credit' | 'debit')}
                className="pl-8 pr-6 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-sm w-full sm:w-auto"
                aria-label="Filter transactions by type"
              >
                <option value="all">All Types</option>
                <option value="credit">Credits</option>
                <option value="debit">Debits</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {paginatedTransactions.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <h4 className="text-base font-medium text-gray-900 mb-1">No transactions found</h4>
            <p className="text-gray-600 text-xs sm:text-sm">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Your transactions will appear here once you start using your wallet'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {paginatedTransactions.map((transaction, index) => (
              <div
                key={transaction._id || index}
                className="flex flex-col p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{transaction.description}</h4>
                    <p className="text-xs text-gray-500 truncate">{formatDate(transaction.createdAt)}</p>
                    {transaction.referenceId && (
                      <p className="text-xs text-gray-400 truncate">Ref: {transaction.referenceId.slice(-8)}</p>
                    )}
                  </div>
                </div>
                <div className="text-right mt-1">
                  <p className={`text-base font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {filteredTransactions.length > 0 && (
        <Pagination
          current={currentPage}
          total={filteredTransactions.length}
          pageSize={itemsPerPage}
          onChange={handlePaginationChange}
          showSizeChanger={true}
          showQuickJumper={true}
          showTotal={(total, range) => (
            <span className="text-xs sm:text-sm text-gray-600">
              Showing {range[0]} to {range[1]} of {total} transactions
            </span>
          )}
          pageSizeOptions={[5, 10, 20, 50]}
          className="mt-3 pt-3 border-t border-gray-200 px-3 sm:px-4"
        />
      )}
    </div>
  );
}