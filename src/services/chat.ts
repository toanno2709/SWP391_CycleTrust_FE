import { apiClient } from './api';
import type { ChatConversation, ChatMessage, SendMessageRequest, ApiResponse } from '../types';

export const chatService = {
  async getConversations(): Promise<ChatConversation[]> {
    const response = await apiClient.get<ApiResponse<ChatConversation[]>>(
      '/chats/conversations'
    );
    return response.data || [];
  },

  async getOrCreateConversation(
    listingId: number,
    sellerId: number
  ): Promise<ChatConversation> {
    const response = await apiClient.post<ApiResponse<ChatConversation>>(
      '/chats/conversations',
      { listingId, sellerId }
    );
    if (!response.data) throw new Error('Failed to create conversation');
    return response.data;
  },

  async getMessages(conversationId: number, limit: number = 50): Promise<ChatMessage[]> {
    const response = await apiClient.get<ApiResponse<ChatMessage[]>>(
      `/chats/conversations/${conversationId}/messages?limit=${limit}`
    );
    return response.data || [];
  },

  async sendMessage(request: SendMessageRequest): Promise<ChatMessage> {
    const response = await apiClient.post<ApiResponse<ChatMessage>>(
      '/chats/messages',
      request
    );
    if (!response.data) throw new Error('Failed to send message');
    return response.data;
  },

  async markAsRead(conversationId: number): Promise<void> {
    await apiClient.put(`/chats/conversations/${conversationId}/read`);
  }
};
