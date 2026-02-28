import { apiClient } from './api';
import type { 
  ApiResponse, 
  Order, 
  CreateOrderRequest,
  OrderStatus
} from '../types';

export const orderService = {
  async getMyOrders(): Promise<Order[]> {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders/my');
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

  async updateStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>(
      `/orders/${orderId}/status`,
      { status }
    );
    if (!response.data) throw new Error('Failed to update order status');
    return response.data;
  },

  async cancel(orderId: number, reason: string): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>(
      `/orders/${orderId}/cancel`,
      { reason }
    );
    if (!response.data) throw new Error('Failed to cancel order');
    return response.data;
  },
};
