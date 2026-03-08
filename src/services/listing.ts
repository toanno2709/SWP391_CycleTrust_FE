import { apiClient } from './api';
import type {
  ApiResponse, 
  Listing, 
  CreateListingRequest,
  ListingStatus,
  CreateInspectionRequest,
  Inspection
} from '../types';

export const listingService = {
  async getAll(params?: {
    status?: ListingStatus;
    brandId?: number;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<Listing[]> {
    const response = await apiClient.get<ApiResponse<Listing[]>>('/listings', { params });
    return response.data || [];
  },

  async getById(id: number): Promise<Listing> {
    const response = await apiClient.get<ApiResponse<Listing>>(`/listings/${id}`);
    if (!response.data) throw new Error('Listing not found');
    return response.data;
  },

  async getMyListings(): Promise<Listing[]> {
    const response = await apiClient.get<ApiResponse<Listing[]>>('/listings/my');
    return response.data || [];
  },

  async create(data: CreateListingRequest): Promise<Listing> {
    const response = await apiClient.post<ApiResponse<Listing>>('/listings', data);
    if (!response.data) throw new Error('Failed to create listing');
    return response.data;
  },

  async update(id: number, data: Partial<CreateListingRequest>): Promise<Listing> {
    const response = await apiClient.put<ApiResponse<Listing>>(`/listings/${id}`, data);
    if (!response.data) throw new Error('Failed to update listing');
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/listings/${id}`);
  },

  async submit(id: number): Promise<Listing> {
    const response = await apiClient.post<ApiResponse<Listing>>(`/listings/${id}/submit`);
    if (!response.data) throw new Error('Failed to submit listing');
    return response.data;
  },

  async approve(id: number, reason?: string): Promise<Listing> {
    const response = await apiClient.post<ApiResponse<Listing>>(`/listings/${id}/approve`, { 
      approved: true,
      reason 
    });
    if (!response.data) throw new Error('Failed to approve listing');
    return response.data;
  },

  async reject(id: number, reason: string): Promise<Listing> {
    const response = await apiClient.post<ApiResponse<Listing>>(`/listings/${id}/approve`, { 
      approved: false,
      reason 
    });
    if (!response.data) throw new Error('Failed to reject listing');
    return response.data;
  },

  async createInspection(listingId: number, data: CreateInspectionRequest): Promise<Inspection> {
    const response = await apiClient.post<ApiResponse<Inspection>>(`/listings/${listingId}/inspection`, data);
    if (!response.data) throw new Error('Failed to create inspection');
    return response.data;
  },
};
