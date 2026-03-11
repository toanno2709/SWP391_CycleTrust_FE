import { apiClient } from './api';
import type { 
  ApiResponse, 
  Order, 
  CreateOrderRequest,
  OrderStatus
} from '../types';

export const orderService = {
  async getMyOrders(): Promise<Order[]> {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders');
    return response.data || [];
  },

  async getAllForAdmin(filters?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<Order[]> {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders/admin/all', {
      params: filters
    });
    return response.data || [];
  },

  async getById(id: number): Promise<Order> {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    if (!response.data) throw new Error('Order not found');
    return response.data;
  },

  async create(data: CreateOrderRequest): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', data);
    if (!response.data) throw new Error('Failed to create order');
    return response.data;
  },

  async payDeposit(orderId: number): Promise<{ paymentUrl: string }> {
    const response = await apiClient.post<ApiResponse<{ paymentUrl: string }>>(
      `/orders/${orderId}/payment/deposit`
    );
    if (!response.data) throw new Error('Failed to initiate deposit payment');
    return response.data;
  },

  async payFull(orderId: number): Promise<{ paymentUrl: string }> {
    const response = await apiClient.post<ApiResponse<{ paymentUrl: string }>>(
      `/orders/${orderId}/payment/full`
    );
    if (!response.data) throw new Error('Failed to initiate full payment');
    return response.data;
  },

  async payRemaining(orderId: number): Promise<{ paymentUrl: string }> {
    const response = await apiClient.post<ApiResponse<{ paymentUrl: string }>>(
      `/orders/${orderId}/payment/remaining`
    );
    if (!response.data) throw new Error('Failed to initiate remaining payment');
    return response.data;
  },

  async updateStatus(orderId: number, status: OrderStatus, note?: string): Promise<Order> {
    const response = await apiClient.put<ApiResponse<Order>>(
      `/orders/${orderId}/status`,
      { status, note }
    );
    if (!response.data) throw new Error('Failed to update order status');
    return response.data;
  },

  async cancel(orderId: number, reason: string): Promise<Order> {
    const response = await apiClient.put<ApiResponse<Order>>(
      `/orders/${orderId}/status`,
      { status: 'CANCELED', note: reason }
    );
    if (!response.data) throw new Error('Failed to cancel order');
    return response.data;
  },
};
