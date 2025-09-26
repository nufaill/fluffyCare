import { Types, FilterQuery } from "mongoose";
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

    async validatePlanName(plan: string, excludeId?: string): Promise<void> {
        const planRegex = /^[a-zA-Z0-9]{3,20}$/;
        if (!planRegex.test(plan)) {
            throw new Error("Plan name must be 3-20 characters, alphanumeric only, no spaces or special characters");
        }

        const existing = await this._subscriptionRepository.findByPlanName(plan);
        if (existing && (!excludeId || existing._id.toString() !== excludeId)) {
            throw new Error("Plan name already exists");
        }
    }

    async createSubscription(dto: CreateSubscriptionDTO): Promise<ServiceResponse<SubscriptionResponseDTO>> {
        try {
            await this.validatePlanName(dto.plan);

            const subscriptionData: Partial<ISubscription> = {
                ...dto
            };
            const subscription = await this._subscriptionRepository.createSubscription(subscriptionData);
            return {
                success: true,
                data: new SubscriptionResponseDTO(subscription),
                message: "Subscription created successfully",
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to create subscription",
            };
        }
    }

    async updateSubscription(subscriptionId: string, dto: UpdateSubscriptionDTO): Promise<ServiceResponse<SubscriptionResponseDTO>> {
        try {
            if (!Types.ObjectId.isValid(subscriptionId)) {
                throw new Error("Invalid subscription ID");
            }
            if (dto.plan) {
                await this.validatePlanName(dto.plan, subscriptionId);
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
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to update subscription",
            };
        }
    }

    async getAllSubscriptions(query: {
        plan?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<ServiceResponse<{
        subscriptions: SubscriptionResponseDTO[];
        total: number;
        page: number;
        limit: number;
    }>> {
        try {
            const filter: FilterQuery<ISubscription> = {};
            if (query.plan) filter.plan = query.plan;
            if (query.search) {
                filter.$or = [
                    { plan: { $regex: query.search, $options: 'i' } },
                    { description: { $regex: query.search, $options: 'i' } }
                ];
            }

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
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to retrieve subscriptions",
            };
        }
    }

    async getAllActiveSubscriptions(query: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<ServiceResponse<{
        subscriptions: SubscriptionResponseDTO[];
        total: number;
        page: number;
        limit: number;
    }>> {
        try {
            const page = query.page || 1;
            const limit = query.limit || 10;

            const filter: FilterQuery<ISubscription> = { isActive: true };
            if (query.search) {
                filter.$or = [
                    { plan: { $regex: query.search, $options: 'i' } },
                    { description: { $regex: query.search, $options: 'i' } }
                ];
            }

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
                message: `Retrieved ${result.total} active subscriptions`,
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to retrieve active subscriptions",
            };
        }
    }
}