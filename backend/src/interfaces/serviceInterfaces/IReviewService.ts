import {
    CreateReviewDTO,
    UpdateReviewDTO,
    ReviewResponseDTO,
    PaginatedReviewsResponseDTO,
    RatingSummaryDTO,
    PaginatedShopRatingsResponseDTO
} from "../../dto/review.dto";

export interface IReviewService {
    createReview(reviewData: CreateReviewDTO): Promise<ReviewResponseDTO>;
    updateReview(reviewId: string, userId: string, updateData: UpdateReviewDTO): Promise<ReviewResponseDTO>;
    adminUpdateReview(reviewId: string, updateData: UpdateReviewDTO): Promise<ReviewResponseDTO>;
    deleteReview(reviewId: string): Promise<void>;
    getReviewsByShop(shopId: string, page: number, limit: number): Promise<PaginatedReviewsResponseDTO>;
    getShopRatingSummary(shopId: string): Promise<RatingSummaryDTO>;
    getAllReviews(  page: number,
        limit: number,
        filters: {
            searchTerm?: string;
            rating?: number;
            shopId?: string;
            sortBy?: string;
            sortOrder?: 'asc' | 'desc';
        }): Promise<PaginatedReviewsResponseDTO>;
    getAllShopsRatingSummaries(page: number, limit: number): Promise<PaginatedShopRatingsResponseDTO>;
}