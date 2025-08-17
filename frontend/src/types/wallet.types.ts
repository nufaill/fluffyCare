export interface IWalletTransaction {
  _id?: string
  type: "credit" | "debit"
  amount: number
  currency: string
  description: string
  referenceId?: string
  createdAt: Date
}

export interface IWallet {
  _id?: string
  ownerId: string
  ownerType: "user" | "shop" | "admin"
  balance: number
  currency: string
  transactions: IWalletTransaction[]
  createdAt?: Date
  updatedAt?: Date
}

export interface WalletProps {
  role: "user" | "shop" | "admin"
  balance: number
  currency: string
  transactions: IWalletTransaction[]
  onAction: (actionType: string, data?: any) => void
  isLoading?: boolean
}

export interface WalletActionButtonsProps {
  role: "user" | "shop" | "admin"
  onAction: (actionType: string, data?: any) => void
}

export interface TransactionTableProps {
  transactions: IWalletTransaction[]
  currency: string
  role: "user" | "shop" | "admin"
}
