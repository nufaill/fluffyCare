import { PipelineStage, Types } from "mongoose";
import Review from "../../models/review.model";
import { IReview } from "../../types/Review.types";
import {
    IReviewRepository,
    IRatingSummary,
    IPaginatedReviews,
    IRatingBreakdown
} from "../../interfaces/repositoryInterfaces/IReviewRepository";

export interface IShopRatingSummary {
    shopId: Types.ObjectId;
    shopName: string;
    shopLogo?: string;
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: IRatingBreakdown;
}

export interface IPaginatedShopRatings {
    shopRatings: IShopRatingSummary[];
    totalCount: number;
}

export class ReviewRepository implements IReviewRepository {
    async createReview(reviewData: Partial<IReview>): Promise<IReview> {
        const review = new Review(reviewData);
        return await review.save();
    }

    async updateReview(
        reviewId: Types.ObjectId,
        userId: Types.ObjectId,
        updateData: Partial<IReview>
    ): Promise<IReview | null> {
        return await Review.findOneAndUpdate(
            { _id: reviewId, userId },
            updateData,
            { new: true, runValidators: true }
        );
    }

    async adminUpdateReview(
        reviewId: Types.ObjectId,
        updateData: Partial<IReview>
    ): Promise<IReview | null> {
        return await Review.findByIdAndUpdate(
            reviewId,
            updateData,
            { new: true, runValidators: true }
        );
    }

    async deleteReview(reviewId: Types.ObjectId): Promise<boolean> {
        const result = await Review.deleteOne({ _id: reviewId });
        return result.deletedCount > 0;
    }

    async getReviewById(reviewId: Types.ObjectId): Promise<IReview | null> {
        return await Review.findById(reviewId);
    }

    async getReviewsByShop(
        shopId: Types.ObjectId,
        page: number,
        limit: number
    ): Promise<IPaginatedReviews> {
        const skip = (page - 1) * limit;

        const [reviews, totalCount] = await Promise.all([
            Review.find({ shopId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'fullName profileImage')
                .lean(),
            Review.countDocuments({ shopId })
        ]);

        return {
            reviews: reviews as IReview[],
            totalCount
        };
    }

    async getAverageRatingByShop(shopId: Types.ObjectId): Promise<IRatingSummary> {
        const pipeline = [
            { $match: { shopId } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                    ratings: { $push: "$rating" }
                }
            }
        ];

        const result = await Review.aggregate(pipeline);

        if (!result.length) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            };
        }

        const { averageRating, totalReviews, ratings } = result[0];

        // Calculate rating breakdown
        const ratingBreakdown: IRatingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratings.forEach((rating: number) => {
            ratingBreakdown[rating] = (ratingBreakdown[rating] || 0) + 1;
        });

        return {
            averageRating: averageRating || 0,
            totalReviews,
            ratingBreakdown
        };
    }

    async getAllReviews(
        page: number,
        limit: number,
        filters: {
            searchTerm?: string;
            rating?: number;
            shopId?: Types.ObjectId;
            sortBy?: string;
            sortOrder?: 'asc' | 'desc';
        }
    ): Promise<IPaginatedReviews> {
        const skip = (page - 1) * limit;
        const query: any = {};

        if (filters.searchTerm) {
            query.$or = [
                { comment: { $regex: filters.searchTerm, $options: 'i' } },
                { 'userId.fullName': { $regex: filters.searchTerm, $options: 'i' } },
                { 'shopId.name': { $regex: filters.searchTerm, $options: 'i' } }
            ];
        }

        if (filters.rating) {
            query.rating = filters.rating;
        }

        if (filters.shopId) {
            query.shopId = filters.shopId;
        }

        const sortField = filters.sortBy || 'createdAt';
        const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
        const sort: any = { [sortField]: sortOrder };

        const [reviews, totalCount] = await Promise.all([
            Review.find(query)
                .sort(sort)
                .populate('userId', 'fullName profileImage')
                .populate('shopId', 'name logo')
                .skip(skip)
                .limit(limit)
                .lean(),
            Review.countDocuments(query)
        ]);

        return {
            reviews: reviews as IReview[],
            totalCount
        };
    }

    async checkUserReviewExists(
        shopId: Types.ObjectId,
        userId: Types.ObjectId
    ): Promise<IReview | null> {
        return await Review.findOne({ shopId, userId });
    }

    async getAllShopsRatingSummaries(
        page: number,
        limit: number
    ): Promise<IPaginatedShopRatings> {
        const skip = (page - 1) * limit;

        const pipeline: PipelineStage[] = [
            {
                $group: {
                    _id: "$shopId",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                    ratings: { $push: "$rating" },
                },
            },
            {
                $lookup: {
                    from: "shops",
                    localField: "_id",
                    foreignField: "_id",
                    as: "shop",
                },
            },
            {
                $unwind: "$shop",
            },
            {
                $project: {
                    shopId: "$_id",
                    shopName: "$shop.name",
                    shopLogo: "$shop.logo",
                    averageRating: 1,
                    totalReviews: 1,
                    ratings: 1,
                },
            },
            {
                $sort: { totalReviews: -1 },
            },
            {
                $facet: {
                    metadata: [{ $count: "totalCount" }],
                    data: [{ $skip: skip }, { $limit: limit }],
                },
            },
        ];

        const result = await Review.aggregate(pipeline);

        const totalCount = result[0]?.metadata[0]?.totalCount || 0;
        const shopRatings = result[0]?.data || [];

        const formattedRatings: IShopRatingSummary[] = shopRatings.map((item: any) => {
            const ratingBreakdown: IRatingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            item.ratings.forEach((rating: number) => {
                ratingBreakdown[rating] = (ratingBreakdown[rating] || 0) + 1;
            });

            return {
                shopId: item.shopId,
                shopName: item.shopName,
                shopLogo: item.shopLogo,
                averageRating: item.averageRating || 0,
                totalReviews: item.totalReviews,
                ratingBreakdown,
            };
        });

        return {
            shopRatings: formattedRatings,
            totalCount,
        };
    }
}