import { apiClient } from './api';
import type { ApiResponse, User, UserRole } from '../types';

export interface CreateUserRequest {
  email?: string;
  phone?: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  email?: string;
  phone?: string;
  fullName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export const userService = {
  /**
   * Get all users (Admin only)
   */
  async getAll(params?: UserListParams): Promise<UserListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.search) queryParams.append('search', params.search);

    const response = await apiClient.get<ApiResponse<UserListResponse>>(
      `/admin/users?${queryParams.toString()}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch users');
  },

  /**
   * Get user by ID (Admin only)
   */
  async getById(id: number): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch user');
  },

  /**
   * Create new user (Admin only)
   */
  async create(data: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/admin/users', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to create user');
  },

  /**
   * Update user (Admin only)
   */
  async update(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}`, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update user');
  },

  /**
   * Delete user (Admin only)
   */
  async delete(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/users/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete user');
    }
  },

  /**
   * Approve seller registration (Admin only)
   */
  async approveSeller(id: number): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>(`/admin/users/${id}/approve`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to approve seller');
  },

  /**
   * Reject seller registration (Admin only)
   */
  async rejectSeller(id: number, reason?: string): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>(`/admin/users/${id}/reject`, { reason });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to reject seller');
  },

  /**
   * Toggle user active status (Admin only)
   */
  async toggleActive(id: number): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/toggle-active`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to toggle user status');
  },

  /**
   * Get pending seller approvals (Admin only)
   */
  async getPendingSellers(): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<User[]>>('/admin/users/pending-sellers');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch pending sellers');
  },
};
