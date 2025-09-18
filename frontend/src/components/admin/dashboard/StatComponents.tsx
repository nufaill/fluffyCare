import React from "react";
import { BarChart3, ChevronDown, ChevronUp } from "lucide-react";

export interface Stat {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface ShopRatingSummary {
  shopId: string;
  shopName: string;
  shopLogo?: string;
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

export interface PaginatedShopRatings {
  shopRatings: ShopRatingSummary[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface CustomerAnalytics {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  chartData: Array<{ month: string; total: number; new: number; active: number }>;
  demographics?: {
    ageGroups: Array<{ range: string; count: number }>;
    genderBreakdown: { male: number; female: number; other: number };
    locationBreakdown: Array<{ city: string; count: number }>;
  };
  engagement?: {
    avgBookingsPerCustomer: number;
    repeatCustomers: number;
    churnRate: number;
  };
}

export const StatCard: React.FC<{
  stat: Stat;
  index: number;
  onToggleGraph?: () => void;
  showGraph?: boolean;
}> = ({ stat, index, onToggleGraph, showGraph }) => {
  const Icon = stat.icon;
  return (
    <div
      className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2 group-hover:scale-105 transition-transform duration-200">
            {stat.value}
          </p>
          <p className="text-xs text-gray-500">{stat.change}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div
            className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-200`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          {onToggleGraph && (
            <button
              onClick={onToggleGraph}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-600 transition-colors"
            >
              <BarChart3 className="h-3 w-3" />
              <span>Graph</span>
              {showGraph ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};