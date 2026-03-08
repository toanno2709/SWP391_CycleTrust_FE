import { apiClient } from './api';
import type { ApiResponse } from '../types';

export interface WishlistItem {
  listingId: number;
  title: string;
  priceAmount: number;
  currency: string;
  mainImageUrl?: string;
  status: string;
  addedAt: string;
}

export const wishlistService = {
  async getMyWishlist(): Promise<WishlistItem[]> {
    const response = await apiClient.get<ApiResponse<WishlistItem[]>>('/wishlist');
    return response.data || [];
  },

  async add(listingId: number): Promise<boolean> {
    const response = await apiClient.post<ApiResponse<boolean>>(`/wishlist/${listingId}`);
    return response.data || false;
  },

  async remove(listingId: number): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/wishlist/${listingId}`);
    return response.data || false;
  },

  async check(listingId: number): Promise<boolean> {
    const response = await apiClient.get<ApiResponse<boolean>>(`/wishlist/check/${listingId}`);
    return response.data || false;
  },
};
