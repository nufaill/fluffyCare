// review.dto.ts
import { Types } from "mongoose";

export class CreateReviewDTO {
  shopId: string;
  userId: string;
  rating: number;
  comment?: string;

  constructor(data: {
    shopId: string;
    userId: string;
    rating: number;
    comment?: string;
  }) {
    this.shopId = data.shopId;
    this.userId = data.userId;
    this.rating = data.rating;
    this.comment = data.comment;
  }
}

export class UpdateReviewDTO {
  rating?: number;
  comment?: string;

  constructor(data: {
    rating?: number;
    comment?: string;
  }) {
    this.rating = data.rating;
    this.comment = data.comment;
  }
}

export class ReviewResponseDTO {
  id: string;
  shopId: {
    id: string;
    name: string;
    logo?: string;
  };
  userId: {
    id: string;
    fullName: string;
    profileImage?: string;
  };
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: any) {
    if (!data) {
      // Handle null/undefined data gracefully
      this.id = '';
      this.shopId = { id: '', name: 'Unknown Shop' };
      this.userId = { id: '', fullName: 'Unknown User' };
      this.rating = 0;
      this.comment = undefined;
      this.createdAt = new Date();
      this.updatedAt = new Date();
      return;
    }

    this.id = data._id ? data._id.toString() : '';

    // Handle populated shopId
    if (data.shopId && typeof data.shopId === 'object' && data.shopId._id) {
      this.shopId = {
        id: data.shopId._id.toString(),
        name: data.shopId.name || 'Unknown Shop',
        logo: data.shopId.logo
      };
    } else {
      // Fallback for non-populated shopId
      this.shopId = {
        id: data.shopId?.toString() || '',
        name: 'Unknown Shop'
      };
    }

    // Handle populated userId
    if (data.userId && typeof data.userId === 'object' && data.userId._id) {
      this.userId = {
        id: data.userId._id.toString(),
        fullName: data.userId.fullName || 'Unknown User',
        profileImage: data.userId.profileImage
      };
    } else {
      // Fallback for non-populated userId
      this.userId = {
        id: data.userId?.toString() || '',
        fullName: 'Unknown User'
      };
    }

    this.rating = data.rating || 0;
    this.comment = data.comment;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}

export class PaginatedReviewsResponseDTO {
  reviews: ReviewResponseDTO[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };

  constructor(data: {
    reviews: ReviewResponseDTO[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  }) {
    this.reviews = data.reviews;
    this.pagination = {
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      totalCount: data.totalCount,
      limit: data.limit,
      hasNext: data.currentPage < data.totalPages,
      hasPrevious: data.currentPage > 1
    };
  }
}

export class RatingSummaryDTO {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };

  constructor(data: {
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: { [key: number]: number };
  }) {
    this.averageRating = Math.round(data.averageRating * 10) / 10; // Round to 1 decimal
    this.totalReviews = data.totalReviews;
    this.ratingBreakdown = {
      1: data.ratingBreakdown[1] || 0,
      2: data.ratingBreakdown[2] || 0,
      3: data.ratingBreakdown[3] || 0,
      4: data.ratingBreakdown[4] || 0,
      5: data.ratingBreakdown[5] || 0
    };
  }
}

export class ShopRatingSummaryDTO {
  shopId: string;
  shopName: string;
  shopLogo?: string;
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: { 1: number; 2: number; 3: number; 4: number; 5: number };

  constructor(data: {
    shopId: Types.ObjectId;
    shopName: string;
    shopLogo?: string;
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: { [key: number]: number };
  }) {
    this.shopId = data.shopId.toString();
    this.shopName = data.shopName || "Unknown Shop";
    this.shopLogo = data.shopLogo;
    this.averageRating = Math.round(data.averageRating * 10) / 10;
    this.totalReviews = data.totalReviews;
    this.ratingBreakdown = {
      1: data.ratingBreakdown[1] || 0,
      2: data.ratingBreakdown[2] || 0,
      3: data.ratingBreakdown[3] || 0,
      4: data.ratingBreakdown[4] || 0,
      5: data.ratingBreakdown[5] || 0,
    };
  }
}

export class PaginatedShopRatingsResponseDTO {
  shopRatings: ShopRatingSummaryDTO[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };

  constructor(data: {
    shopRatings: ShopRatingSummaryDTO[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  }) {
    this.shopRatings = data.shopRatings;
    this.pagination = {
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      totalCount: data.totalCount,
      limit: data.limit,
      hasNext: data.currentPage < data.totalPages,
      hasPrevious: data.currentPage > 1,
    };
  }
}