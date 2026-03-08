import { apiClient } from './api';
import type { ApiResponse } from '../types';

export interface DisputeEvent {
  id: number;
  actorId?: number;
  actorName?: string;
  message: string;
  createdAt: string;
}

export interface Dispute {
  id: number;
  orderId: number;
  openedBy: number;
  openedByName: string;
  status: string;
  assignedInspectorId?: number;
  assignedInspectorName?: string;
  assignedAdminId?: number;
  assignedAdminName?: string;
  summary: string;
  resolution?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  events: DisputeEvent[];
}

export interface CreateDisputeRequest {
  orderId: number;
  summary: string;
}

export interface AssignDisputeRequest {
  inspectorId?: number;
  adminId?: number;
}

export interface ResolveDisputeRequest {
  resolution: string;
}

export interface AddDisputeEventRequest {
  message: string;
}

export const disputeService = {
  async create(data: CreateDisputeRequest): Promise<Dispute> {
    const response = await apiClient.post<ApiResponse<Dispute>>('/disputes', data);
    if (!response.data) throw new Error('Failed to create dispute');
    return response.data;
  },

  async getMyDisputes(): Promise<Dispute[]> {
    const response = await apiClient.get<ApiResponse<Dispute[]>>('/disputes/my');
    return response.data || [];
  },

  async getAll(status?: string): Promise<Dispute[]> {
    const params = status ? { status } : {};
    const response = await apiClient.get<ApiResponse<Dispute[]>>('/disputes', { params });
    return response.data || [];
  },

  async getById(id: number): Promise<Dispute> {
    const response = await apiClient.get<ApiResponse<Dispute>>(`/disputes/${id}`);
    if (!response.data) throw new Error('Dispute not found');
    return response.data;
  },

  async assign(id: number, data: AssignDisputeRequest): Promise<Dispute> {
    const response = await apiClient.post<ApiResponse<Dispute>>(`/disputes/${id}/assign`, data);
    if (!response.data) throw new Error('Failed to assign dispute');
    return response.data;
  },

  async resolve(id: number, data: ResolveDisputeRequest): Promise<Dispute> {
    const response = await apiClient.post<ApiResponse<Dispute>>(`/disputes/${id}/resolve`, data);
    if (!response.data) throw new Error('Failed to resolve dispute');
    return response.data;
  },

  async addEvent(id: number, data: AddDisputeEventRequest): Promise<DisputeEvent> {
    const response = await apiClient.post<ApiResponse<DisputeEvent>>(`/disputes/${id}/events`, data);
    if (!response.data) throw new Error('Failed to add event');
    return response.data;
  },
};
