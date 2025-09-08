import {
    CreateReviewDTO,
    UpdateReviewDTO,
    ReviewResponseDTO,
    PaginatedReviewsResponseDTO,
    RatingSummaryDTO
} from "../../dto/review.dto";

export interface IReviewService {
    createReview(reviewData: CreateReviewDTO): Promise<ReviewResponseDTO>;
    updateReview(reviewId: string, userId: string, updateData: UpdateReviewDTO): Promise<ReviewResponseDTO>;
    adminUpdateReview(reviewId: string, updateData: UpdateReviewDTO): Promise<ReviewResponseDTO>;
    deleteReview(reviewId: string): Promise<void>;
    getReviewsByShop(shopId: string, page: number, limit: number): Promise<PaginatedReviewsResponseDTO>;
    getShopRatingSummary(shopId: string): Promise<RatingSummaryDTO>;
    getAllReviews(page: number, limit: number): Promise<PaginatedReviewsResponseDTO>;
}