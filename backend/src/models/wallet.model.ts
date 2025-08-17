import mongoose, { Schema } from "mongoose";
import { IWallet, IWalletTransaction } from "../types/Wallet.types";

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    description: { type: String, required: true },
    referenceId: { type: Schema.Types.ObjectId, refPath: "transactions.refModel" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const WalletSchema = new Schema<IWallet>(
  {
    ownerId: { type: Schema.Types.ObjectId, required: true },
    ownerType: { type: String, enum: ["user", "shop", "admin"], required: true },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    transactions: [WalletTransactionSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IWallet>("Wallet", WalletSchema);
