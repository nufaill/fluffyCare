import { Types } from "mongoose";
import Review from "../../models/review.model";
import { IReview } from "../../types/Review.types";
import {
    IReviewRepository,
    IRatingSummary,
    IPaginatedReviews,
    IRatingBreakdown
} from "../../interfaces/repositoryInterfaces/IReviewRepository";

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

    async getAllReviews(page: number, limit: number): Promise<IPaginatedReviews> {
        const skip = (page - 1) * limit;

        const [reviews, totalCount] = await Promise.all([
            Review.find({})
                .sort({ createdAt: -1 })
                .populate('userId', 'fullName profileImage')
                .populate('shopId', 'name logo')
                .skip(skip)
                .limit(limit)
                .lean(),
            Review.countDocuments({})
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
}