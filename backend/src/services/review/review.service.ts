import { Types } from "mongoose";
import { IReviewService } from "../../interfaces/serviceInterfaces/IReviewService";
import { IRatingBreakdown, IReviewRepository } from "../../interfaces/repositoryInterfaces/IReviewRepository";
import {
    CreateReviewDTO,
    UpdateReviewDTO,
    ReviewResponseDTO,
    PaginatedReviewsResponseDTO,
    RatingSummaryDTO,
    PaginatedShopRatingsResponseDTO,
    ShopRatingSummaryDTO
} from "../../dto/review.dto";
import { CustomError } from '../../util/CustomerError';
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
export class ReviewService implements IReviewService {
    constructor(private _reviewRepository: IReviewRepository) { }

    async createReview(reviewData: CreateReviewDTO): Promise<ReviewResponseDTO> {
        if (reviewData.rating < 1 || reviewData.rating > 5) {
            throw new CustomError("Rating must be between 1 and 5");
        }

        const shopObjectId = new Types.ObjectId(reviewData.shopId);
        const userObjectId = new Types.ObjectId(reviewData.userId);

        const existingReview = await this._reviewRepository.checkUserReviewExists(
            shopObjectId,
            userObjectId
        );

        // if (existingReview) {
        //     throw new CustomError("User has already reviewed this shop");
        // }

        const review = await this._reviewRepository.createReview({
            shopId: shopObjectId,
            userId: userObjectId,
            rating: reviewData.rating,
            comment: reviewData.comment?.trim()
        });

        return new ReviewResponseDTO(review);
    }

    async updateReview(reviewId: string, userId: string, updateData: UpdateReviewDTO): Promise<ReviewResponseDTO> {
        if (updateData.rating !== undefined && (updateData.rating < 1 || updateData.rating > 5)) {
            throw new CustomError("Rating must be between 1 and 5");
        }

        const reviewObjectId = new Types.ObjectId(reviewId);
        const userObjectId = new Types.ObjectId(userId);

        const updatePayload: any = {};
        if (updateData.rating !== undefined) updatePayload.rating = updateData.rating;
        if (updateData.comment !== undefined) updatePayload.comment = updateData.comment?.trim();

        const updatedReview = await this._reviewRepository.updateReview(
            reviewObjectId,
            userObjectId,
            updatePayload
        );

        if (!updatedReview) {
            throw new CustomError("Review not found or you are not authorized to update it", 404);
        }

        return new ReviewResponseDTO(updatedReview);
    }

    async adminUpdateReview(reviewId: string, updateData: UpdateReviewDTO): Promise<ReviewResponseDTO> {
        if (updateData.rating !== undefined && (updateData.rating < 1 || updateData.rating > 5)) {
            throw new CustomError("Rating must be between 1 and 5");
        }

        const reviewObjectId = new Types.ObjectId(reviewId);

        const updatePayload: any = {};
        if (updateData.rating !== undefined) updatePayload.rating = updateData.rating;
        if (updateData.comment !== undefined) updatePayload.comment = updateData.comment?.trim();

        const updatedReview = await this._reviewRepository.adminUpdateReview(reviewObjectId, updatePayload);

        if (!updatedReview) {
            throw new CustomError("Review not found", 404);
        }

        return new ReviewResponseDTO(updatedReview);
    }

    async deleteReview(reviewId: string): Promise<void> {
        const reviewObjectId = new Types.ObjectId(reviewId);

        const deleted = await this._reviewRepository.deleteReview(reviewObjectId);
        if (!deleted) {
            throw new CustomError("Review not found", 404);
        }
    }

    async getReviewsByShop(
        shopId: string,
        page: number,
        limit: number
    ): Promise<PaginatedReviewsResponseDTO> {
        if (!Types.ObjectId.isValid(shopId)) {
            throw new CustomError("Invalid shop ID");
        }

        if (page < 1) page = 1;
        if (limit < 1) limit = 10;
        if (limit > 100) limit = 100;

        const shopObjectId = new Types.ObjectId(shopId);
        const { reviews, totalCount } = await this._reviewRepository.getReviewsByShop(
            shopObjectId,
            page,
            limit
        );

        const reviewDTOs = reviews.map(review => new ReviewResponseDTO(review));
        const totalPages = Math.ceil(totalCount / limit);

        return new PaginatedReviewsResponseDTO({
            reviews: reviewDTOs,
            currentPage: page,
            totalPages,
            totalCount,
            limit
        });
    }

    async getShopRatingSummary(shopId: string): Promise<RatingSummaryDTO> {
        if (!Types.ObjectId.isValid(shopId)) {
            throw new CustomError("Invalid shop ID");
        }

        const shopObjectId = new Types.ObjectId(shopId);
        const summary = await this._reviewRepository.getAverageRatingByShop(shopObjectId);

        return new RatingSummaryDTO(summary);
    }

    async getAllReviews(page: number, limit: number): Promise<PaginatedReviewsResponseDTO> {
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;
        if (limit > 100) limit = 100; 

        const { reviews, totalCount } = await this._reviewRepository.getAllReviews(page, limit);

        const reviewDTOs = reviews.map(review => new ReviewResponseDTO(review));
        const totalPages = Math.ceil(totalCount / limit);

        return new PaginatedReviewsResponseDTO({
            reviews: reviewDTOs,
            currentPage: page,
            totalPages,
            totalCount,
            limit
        });
    }


    async getAllShopsRatingSummaries(
        page: number,
        limit: number
    ): Promise<PaginatedShopRatingsResponseDTO> {
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;
        if (limit > 100) limit = 100;

        const { shopRatings, totalCount } = await this._reviewRepository.getAllShopsRatingSummaries(
            page,
            limit
        );

        const shopRatingDTOs = shopRatings.map(
            (rating: IShopRatingSummary) => new ShopRatingSummaryDTO(rating)
        );
        const totalPages = Math.ceil(totalCount / limit);

        return new PaginatedShopRatingsResponseDTO({
            shopRatings: shopRatingDTOs,
            currentPage: page,
            totalPages,
            totalCount,
            limit,
        });
    }
}