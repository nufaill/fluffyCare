import { Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface WalletBalanceCardProps {
  role: "user" | "shop" | "admin"
  balance: number
  currency: string
  isLoading?: boolean
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case "user":
      return "Your Wallet"
    case "shop":
      return "Shop Wallet"
    case "admin":
      return "Admin Wallet"
    default:
      return "Wallet"
  }
}

export function WalletBalanceCard({ role, balance, currency, isLoading }: WalletBalanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <Card className="bg-black border-gray-800 rounded-2xl shadow-2xl w-full">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-white/10 rounded-xl">
              <Wallet className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-white text-base sm:text-lg font-semibold">{getRoleLabel(role)}</h2>
              <p className="text-gray-400 text-xs sm:text-sm">Available Balance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {balance >= 0 ? (
              <TrendingUp className="h-4 sm:h-5 w-4 sm:w-5 text-green-400" />
            ) : (
              <TrendingDown className="h-4 sm:h-5 w-4 sm:h-5 text-red-400" />
            )}
          </div>
        </div>

        <div className="text-center">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-10 sm:h-12 bg-gray-700 rounded-lg mb-2"></div>
              <div className="h-3 sm:h-4 bg-gray-700 rounded w-20 sm:w-24 mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{formatCurrency(balance)}</div>
              <p className="text-gray-400 text-xs sm:text-sm">{balance >= 0 ? "Available for use" : "Negative balance"}</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}