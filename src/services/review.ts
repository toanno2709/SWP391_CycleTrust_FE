import { apiClient } from './api';
import type { ApiResponse } from '../types';

export interface Review {
  id: number;
  orderId: number;
  buyerId: number;
  buyerName: string;
  sellerId: number;
  sellerName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  orderId: number;
  rating: number;
  comment?: string;
}

export interface SellerRating {
  sellerId: number;
  averageRating: number;
  totalReviews: number;
}

export const reviewService = {
  async create(data: CreateReviewRequest): Promise<Review> {
    const response = await apiClient.post<ApiResponse<Review>>('/reviews', data);
    if (!response.data) throw new Error('Failed to create review');
    return response.data;
  },

  async getSellerReviews(sellerId: number): Promise<Review[]> {
    const response = await apiClient.get<ApiResponse<Review[]>>(`/reviews/seller/${sellerId}`);
    return response.data || [];
  },

  async getSellerRating(sellerId: number): Promise<SellerRating> {
    const response = await apiClient.get<ApiResponse<SellerRating>>(`/reviews/seller/${sellerId}/rating`);
    if (!response.data) throw new Error('Failed to get seller rating');
    return response.data;
  },
};
