import { Types } from "mongoose";
import { IReview } from "../../types/Review.types";

export interface IRatingBreakdown {
    [rating: number]: number;
}

export interface IRatingSummary {
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: IRatingBreakdown;
}

export interface IPaginatedReviews {
    reviews: IReview[];
    totalCount: number;
}

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

export interface IReviewRepository {
    getAllShopsRatingSummaries(page: number, limit: number): Promise<IPaginatedShopRatings>;
    createReview(reviewData: Partial<IReview>): Promise<IReview>;
    updateReview(reviewId: Types.ObjectId, userId: Types.ObjectId, updateData: Partial<IReview>): Promise<IReview | null>;
    adminUpdateReview(reviewId: Types.ObjectId, updateData: Partial<IReview>): Promise<IReview | null>;
    deleteReview(reviewId: Types.ObjectId): Promise<boolean>;
    getReviewById(reviewId: Types.ObjectId): Promise<IReview | null>;
    getReviewsByShop(shopId: Types.ObjectId, page: number, limit: number): Promise<IPaginatedReviews>;
    getAverageRatingByShop(shopId: Types.ObjectId): Promise<IRatingSummary>;
    getAllReviews(page: number, limit: number): Promise<IPaginatedReviews>;
    checkUserReviewExists(shopId: Types.ObjectId, userId: Types.ObjectId): Promise<IReview | null>;
}