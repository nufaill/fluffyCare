import { CreateSubscriptionDTO, UpdateSubscriptionDTO, SubscriptionResponseDTO } from "../../dto/subscription.dto";

export interface ISubscriptionService {
  createSubscription(dto: CreateSubscriptionDTO): Promise<{
    success: boolean;
    data?: SubscriptionResponseDTO;
    message?: string;
  }>;
  updateSubscription(
    subscriptionId: string,
    dto: UpdateSubscriptionDTO
  ): Promise<{
    success: boolean;
    data?: SubscriptionResponseDTO;
    message?: string;
  }>;
  getAllSubscriptions(query: {
    plan?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data?: {
      subscriptions: SubscriptionResponseDTO[];
      total: number;
      page: number;
      limit: number;
    };
    message?: string;
  }>;
  getAllActiveSubscriptions(query: {
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data?: {
      subscriptions: SubscriptionResponseDTO[];
      total: number;
      page: number;
      limit: number;
    };
    message?: string;
  }>;
}