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
    <div className="min-h-screen bg-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {role === "user" && "My Wallet"}
            {role === "shop" && "Shop Wallet"}
            {role === "admin" && "Admin Wallet Management"}
          </h1>
          <p className="text-gray-600">
            {role === "user" && "Manage your funds and view transaction history"}
            {role === "shop" && "Track your earnings and manage payouts"}
            {role === "admin" && "Oversee all wallet operations and transactions"}
          </p>
        </div>

        {/* Balance Card */}
        <WalletBalanceCard role={role} balance={balance} currency={currency} isLoading={isLoading} />

        {/* Action Buttons */}
        <WalletActionButtons role={role} onAction={onAction} />

        {/* Transaction History */}
        <TransactionTable transactions={transactions} currency={currency} role={role} />
      </div>
    </div>
  )
}
