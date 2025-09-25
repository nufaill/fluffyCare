import { Request, Response } from "express";
import { IReviewService } from "../../interfaces/serviceInterfaces/IReviewService";
import { CreateReviewDTO, UpdateReviewDTO } from "../../dto/review.dto";
import { CustomError } from '../../util/CustomerError';
import { Types } from "mongoose";

interface AuthenticatedRequest extends Request {
  user?: {
    [x: string]: string;
    id: string;
    role: string;
  };
}

export class ReviewController {
  constructor(private _reviewService: IReviewService) { }

  createReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shopId, rating, comment, userId } = req.body;

      if (!shopId || !rating || !userId) {
        res.status(400).json({
          success: false,
          message: "Shop ID, user ID, and rating are required"
        });
        return;
      }

      if (!Types.ObjectId.isValid(shopId) || !Types.ObjectId.isValid(userId)) {
        res.status(400).json({
          success: false,
          message: "Invalid shop ID or user ID format"
        });
        return;
      }

      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        res.status(400).json({
          success: false,
          message: "Rating must be an integer between 1 and 5"
        });
        return;
      }

      const createReviewDTO = new CreateReviewDTO({
        shopId,
        userId,
        rating,
        comment: comment?.trim() || undefined
      });

      const review = await this._reviewService.createReview(createReviewDTO);

      res.status(201).json({
        success: true,
        message: "Review created successfully",
        data: review
      });
    } catch (error) {
      console.error("Review Controller createError:", error);
      this._handleError(error, res);
    }
  };

  updateReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          message: "Authentication required or user ID missing"
        });
        return;
      }

      const { reviewId } = req.params;

      if (!reviewId) {
        res.status(400).json({
          success: false,
          message: "Review ID is required"
        });
        return;
      }

      if (!Types.ObjectId.isValid(reviewId)) {
        res.status(400).json({
          success: false,
          message: "Invalid review ID format"
        });
        return;
      }

      const { rating, comment } = req.body;

      if (rating === undefined && comment === undefined) {
        res.status(400).json({
          success: false,
          message: "At least one field (rating or comment) must be provided"
        });
        return;
      }

      if (rating !== undefined && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
        res.status(400).json({
          success: false,
          message: "Rating must be an integer between 1 and 5"
        });
        return;
      }

      const updateReviewDTO = new UpdateReviewDTO({
        rating,
        comment: comment?.trim()
      });

      const review = await this._reviewService.updateReview(reviewId, req.user.id, updateReviewDTO);

      res.status(200).json({
        success: true,
        message: "Review updated successfully",
        data: review
      });
    } catch (error) {
      this._handleError(error, res);
    }
  };

  adminUpdateReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { reviewId } = req.params;

      if (!reviewId) {
        res.status(400).json({
          success: false,
          message: "Review ID is required"
        });
        return;
      }

      if (!Types.ObjectId.isValid(reviewId)) {
        res.status(400).json({
          success: false,
          message: "Invalid review ID format"
        });
        return;
      }

      const { rating, comment } = req.body;

      if (rating === undefined && comment === undefined) {
        res.status(400).json({
          success: false,
          message: "At least one field (rating or comment) must be provided"
        });
        return;
      }

      if (rating !== undefined && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
        res.status(400).json({
          success: false,
          message: "Rating must be an integer between 1 and 5"
        });
        return;
      }

      const updateReviewDTO = new UpdateReviewDTO({
        rating,
        comment: comment?.trim()
      });

      const review = await this._reviewService.adminUpdateReview(reviewId, updateReviewDTO);

      res.status(200).json({
        success: true,
        message: "Review updated successfully by admin",
        data: review
      });
    } catch (error) {
      this._handleError(error, res);
    }
  };

  deleteReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { reviewId } = req.params;

      if (!reviewId || !Types.ObjectId.isValid(reviewId)) {
        res.status(400).json({
          success: false,
          message: "Valid review ID is required"
        });
        return;
      }

      await this._reviewService.deleteReview(reviewId);

      res.status(200).json({
        success: true,
        message: "Review deleted successfully"
      });
    } catch (error) {
      this._handleError(error, res);
    }
  };

  getReviewsByShop = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shopId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!Types.ObjectId.isValid(shopId)) {
        res.status(400).json({
          success: false,
          message: "Invalid shop ID format"
        });
        return;
      }

      const reviews = await this._reviewService.getReviewsByShop(shopId, page, limit);

      res.status(200).json({
        success: true,
        message: "Reviews retrieved successfully",
        data: reviews
      });
    } catch (error) {
      this._handleError(error, res);
    }
  };

  getShopRatingSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shopId } = req.params;

      if (!Types.ObjectId.isValid(shopId)) {
        res.status(400).json({
          success: false,
          message: "Invalid shop ID format"
        });
        return;
      }

      const summary = await this._reviewService.getShopRatingSummary(shopId);

      res.status(200).json({
        success: true,
        message: "Rating summary retrieved successfully",
        data: summary
      });
    } catch (error) {
      this._handleError(error, res);
    }
  };

  getAllReviews = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const searchTerm = req.query.searchTerm as string | undefined;
      const rating = req.query.rating ? parseInt(req.query.rating as string) : undefined;
      const shopId = req.query.shopId as string | undefined;
      const sortBy = req.query.sortBy as string | undefined;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;

      const filters = {
        searchTerm,
        rating,
        shopId,
        sortBy,
        sortOrder
      };

      const reviews = await this._reviewService.getAllReviews(page, limit, filters);

      res.status(200).json({
        success: true,
        message: "All reviews retrieved successfully",
        data: reviews
      });
    } catch (error) {
      this._handleError(error, res);
    }
  };

  private _handleError(error: any, res: Response): void {
    console.error("Review Controller Error:", error);

    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
      return;
    }

    if (error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(error.errors).map((err: any) => err.message)
      });
      return;
    }

    if (error.name === "CastError") {
      res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
      return;
    }

    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: "Duplicate entry detected"
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "An unexpected error occurred"
    });
  }

  getAllShopsRatingSummaries = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const shopRatings = await this._reviewService.getAllShopsRatingSummaries(page, limit);

      res.status(200).json({
        success: true,
        message: "Shop ratings overview retrieved successfully",
        data: shopRatings,
      });
    } catch (error) {
      this._handleError(error, res);
    }
  };
}