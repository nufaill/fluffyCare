import { Schema, model } from "mongoose";
import { ISubscription } from "../types/subscription.type";

const subscriptionSchema = new Schema<ISubscription>(
    {
        plan: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true, min: 0, default: 0 },
        profitPercentage: { type: Number, required: true, min: 0, max: 99 },
        durationInDays: { type: Number, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const SubscriptionModel = model<ISubscription>(
    "Subscription",
    subscriptionSchema
);
