export interface ISubscription extends Document {
    _id: object | string;
    plan: string;                       // Plan name (set by admin)
    description: string;
    price: number;                      // Price for the plan
    profitPercentage: number;           // Admin profit from each booking
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}