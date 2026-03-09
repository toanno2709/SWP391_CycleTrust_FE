import { apiClient } from './api';
import type { Notification, NotificationSummary, ApiResponse } from '../types';

export const notificationService = {
  async getNotifications(limit: number = 20): Promise<Notification[]> {
    const response = await apiClient.get<ApiResponse<Notification[]>>(
      `/notifications?limit=${limit}`
    );
    return response.data || [];
  },

  async getSummary(): Promise<NotificationSummary> {
    const response = await apiClient.get<ApiResponse<NotificationSummary>>(
      '/notifications/summary'
    );
    return response.data || { unreadCount: 0, recentNotifications: [] };
  },

  async markAsRead(notificationId: number): Promise<Notification> {
    const response = await apiClient.put<ApiResponse<Notification>>(
      `/notifications/${notificationId}/read`
    );
    if (!response.data) throw new Error('Failed to mark notification as read');
    return response.data;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.put('/notifications/read-all');
  },

  async deleteNotification(notificationId: number): Promise<void> {
    await apiClient.delete(`/notifications/${notificationId}`);
  }
};
