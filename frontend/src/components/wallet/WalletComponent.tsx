import { WalletBalanceCard } from "./WalletBalanceCard"
import { WalletActionButtons } from "./WalletActionButtons"
import { TransactionTable } from "./TransactionTable"

interface IWalletTransaction {
  _id?: string
  type: "credit" | "debit"
  amount: number
  currency: string
  description: string
  referenceId?: string
  createdAt: Date
}

interface WalletProps {
  role: "user" | "shop" | "admin"
  balance: number
  currency: string
  transactions: IWalletTransaction[]
  onAction: (actionType: string, data?: any) => void
  isLoading?: boolean
}

export function WalletComponent({ role, balance, currency, transactions, onAction, isLoading = false }: WalletProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {role === "user" && "My Wallet"}
            {role === "shop" && "Shop Wallet"}
            {role === "admin" && "Admin Wallet Management"}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {role === "user" && "Manage your funds and view transaction history"}
            {role === "shop" && "Track your earnings and manage payouts"}
            {role === "admin" && "Oversee all wallet operations and transactions"}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <WalletBalanceCard role={role} balance={balance} currency={currency} isLoading={isLoading} />
            <TransactionTable transactions={transactions} currency={currency} role={role} />
          </div>
          <div className="lg:col-span-1">
            <WalletActionButtons role={role} onAction={onAction} />
          </div>
        </div>
      </div>
    </div>
  )
}