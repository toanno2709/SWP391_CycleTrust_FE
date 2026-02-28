import { apiClient } from './api';
import type { ApiResponse, Brand, BikeCategory, SizeOption } from '../types';

export const catalogService = {
  async getBrands(): Promise<Brand[]> {
    const response = await apiClient.get<ApiResponse<Brand[]>>('/catalog/brands');
    return response.data || [];
  },

  async getCategories(): Promise<BikeCategory[]> {
    const response = await apiClient.get<ApiResponse<BikeCategory[]>>('/catalog/categories');
    return response.data || [];
  },

  async getSizes(): Promise<SizeOption[]> {
    const response = await apiClient.get<ApiResponse<SizeOption[]>>('/catalog/sizes');
    return response.data || [];
  },

  async createBrand(name: string): Promise<Brand> {
    const response = await apiClient.post<ApiResponse<Brand>>('/catalog/brands', { name });
    if (!response.data) throw new Error('Failed to create brand');
    return response.data;
  },

  async createCategory(name: string): Promise<BikeCategory> {
    const response = await apiClient.post<ApiResponse<BikeCategory>>('/catalog/categories', { name });
    if (!response.data) throw new Error('Failed to create category');
    return response.data;
  },

  async createSize(label: string): Promise<SizeOption> {
    const response = await apiClient.post<ApiResponse<SizeOption>>('/catalog/sizes', { label });
    if (!response.data) throw new Error('Failed to create size');
    return response.data;
  },
};
