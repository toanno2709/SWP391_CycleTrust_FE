import { apiClient } from './api';
import type { ApiResponse } from '../types';

export interface DepositPolicy {
  id: number;
  isActive: boolean;
  policyName: string;
  mode: 'PERCENT' | 'FIXED';
  percentValue?: number;
  fixedAmount?: number;
  minAmount: number;
  maxAmount?: number;
  note?: string;
  createdAt: string;
}

export interface CreateDepositPolicyRequest {
  policyName: string;
  mode: 'PERCENT' | 'FIXED';
  percentValue?: number;
  fixedAmount?: number;
  minAmount: number;
  maxAmount?: number;
  note?: string;
}

export interface UpdateDepositPolicyRequest {
  policyName: string;
  mode: 'PERCENT' | 'FIXED';
  percentValue?: number;
  fixedAmount?: number;
  minAmount: number;
  maxAmount?: number;
  note?: string;
}

export const depositPolicyService = {
  async getActive(): Promise<DepositPolicy | null> {
    const response = await apiClient.get<ApiResponse<DepositPolicy | null>>('/depositpolicies/active');
    return response.data || null;
  },

  async getAll(): Promise<DepositPolicy[]> {
    const response = await apiClient.get<ApiResponse<DepositPolicy[]>>('/depositpolicies');
    return response.data || [];
  },

  async create(data: CreateDepositPolicyRequest): Promise<DepositPolicy> {
    const response = await apiClient.post<ApiResponse<DepositPolicy>>('/depositpolicies', data);
    if (!response.data) throw new Error('Failed to create policy');
    return response.data;
  },

  async update(id: number, data: UpdateDepositPolicyRequest): Promise<DepositPolicy> {
    const response = await apiClient.put<ApiResponse<DepositPolicy>>(`/depositpolicies/${id}`, data);
    if (!response.data) throw new Error('Failed to update policy');
    return response.data;
  },

  async setActive(id: number, isActive: boolean): Promise<DepositPolicy> {
    const response = await apiClient.patch<ApiResponse<DepositPolicy>>(
      `/depositpolicies/${id}/active?isActive=${isActive}`
    );
    if (!response.data) throw new Error('Failed to set active status');
    return response.data;
  },
};
