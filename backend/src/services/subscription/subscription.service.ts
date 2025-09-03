import { Types } from "mongoose";
import { ISubscriptionRepository } from "../../interfaces/repositoryInterfaces/ISubscriptionRepository";
import { CreateSubscriptionDTO, UpdateSubscriptionDTO, SubscriptionResponseDTO } from "../../dto/subscription.dto";
import { ISubscription } from "../../types/subscription.type";
import { ISubscriptionService } from '../../interfaces/serviceInterfaces/ISubscriptionService';

interface ServiceResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

export class SubscriptionService implements ISubscriptionService {
    private readonly _subscriptionRepository: ISubscriptionRepository;

    constructor(subscriptionRepository: ISubscriptionRepository) {
        this._subscriptionRepository = subscriptionRepository;
    }

    async createSubscription(dto: CreateSubscriptionDTO): Promise<ServiceResponse<SubscriptionResponseDTO>> {
        try {
            const subscriptionData: Partial<ISubscription> = {
                ...dto
            };
            const subscription = await this._subscriptionRepository.createSubscription(subscriptionData);
            return {
                success: true,
                data: new SubscriptionResponseDTO(subscription),
                message: "Subscription created successfully",
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to create subscription",
            };
        }
    }

    async updateSubscription(subscriptionId: string, dto: UpdateSubscriptionDTO): Promise<ServiceResponse<SubscriptionResponseDTO>> {
        try {
            if (!Types.ObjectId.isValid(subscriptionId)) {
                throw new Error("Invalid subscription ID");
            }
            const updateData: Partial<ISubscription> = {
                ...dto,
            };
            const updatedSubscription = await this._subscriptionRepository.updateSubscription(
                new Types.ObjectId(subscriptionId),
                updateData
            );

            if (!updatedSubscription) {
                throw new Error("Subscription not found");
            }

            return {
                success: true,
                data: new SubscriptionResponseDTO(updatedSubscription),
                message: "Subscription updated successfully",
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to update subscription",
            };
        }
    }

    async getAllSubscriptions(query: {
        plan?: string;
        page?: number;
        limit?: number;
    }): Promise<ServiceResponse<{
        subscriptions: SubscriptionResponseDTO[];
        total: number;
        page: number;
        limit: number;
    }>> {
        try {
            const filter: any = {};
            if (query.plan) filter.plan = query.plan;

            const page = query.page || 1;
            const limit = query.limit || 10;

            const result = await this._subscriptionRepository.getAllSubscriptions(filter, page, limit);

            const subscriptionDTOs = result.subscriptions.map((sub) => new SubscriptionResponseDTO(sub));

            return {
                success: true,
                data: {
                    subscriptions: subscriptionDTOs,
                    total: result.total,
                    page,
                    limit
                },
                message: `Retrieved ${result.total} subscriptions`,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to retrieve subscriptions",
            };
        }
    }

    async getAllActiveSubscriptions(query: {
        page?: number;
        limit?: number;
    }): Promise<ServiceResponse<{
        subscriptions: SubscriptionResponseDTO[];
        total: number;
        page: number;
        limit: number;
    }>> {
        try {
            const page = query.page || 1;
            const limit = query.limit || 10;

            const result = await this._subscriptionRepository.getAllSubscriptions({ isActive: true }, page, limit);

            const subscriptionDTOs = result.subscriptions.map((sub) => new SubscriptionResponseDTO(sub));

            return {
                success: true,
                data: {
                    subscriptions: subscriptionDTOs,
                    total: result.total,
                    page,
                    limit
                },
                message: `Retrieved ${result.total} active subscriptions`,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to retrieve active subscriptions",
            };
        }
    }
}