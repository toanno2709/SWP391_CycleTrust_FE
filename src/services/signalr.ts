import * as signalR from '@microsoft/signalr';
import { authService } from './auth';
import { API_BASE_URL } from '../config/constants';

const HUB_BASE_URL = API_BASE_URL.replace('/api', '');

class SignalRService {
  private notificationConnection: signalR.HubConnection | null = null;
  private chatConnection: signalR.HubConnection | null = null;

  async startNotificationConnection() {
    const token = authService.getToken();
    if (!token) return;

    // If already connected, don't create new connection
    if (this.notificationConnection?.state === signalR.HubConnectionState.Connected) {
      console.log('✅ Notification Hub already connected');
      return;
    }

    // If connection exists but disconnected, stop it first
    if (this.notificationConnection) {
      await this.notificationConnection.stop();
    }

    this.notificationConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_BASE_URL}/hubs/notification`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    try {
      await this.notificationConnection.start();
      console.log('✅ Notification Hub connected successfully');
      console.log('Connection State:', this.notificationConnection.state);
    } catch (err) {
      console.error('❌ Error connecting to Notification Hub:', err);
    }
  }

  async startChatConnection() {
    const token = authService.getToken();
    if (!token) return;

    // If already connected, don't create new connection
    if (this.chatConnection?.state === signalR.HubConnectionState.Connected) {
      console.log('✅ Chat Hub already connected');
      return;
    }

    // If connection exists but disconnected, stop it first
    if (this.chatConnection) {
      await this.chatConnection.stop();
    }

    this.chatConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_BASE_URL}/hubs/chat`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    try {
      await this.chatConnection.start();
      console.log('✅ Chat Hub connected successfully');
      console.log('Connection State:', this.chatConnection.state);
    } catch (err) {
      console.error('❌ Error connecting to Chat Hub:', err);
    }
  }

  onNotificationReceived(callback: (notification: any) => void) {
    if (!this.notificationConnection) {
      console.warn('⚠️ Notification connection not ready');
      return;
    }
    
    // SignalR natively supports multiple handlers - just add it
    // Don't call .off() - that removes ALL handlers
    this.notificationConnection.on('ReceiveNotification', (notification) => {
      console.log('📢 ReceiveNotification event for a callback');
      callback(notification);
    });
    console.log('✅ Registered notification handler');
  }

  offNotificationReceived() {
    this.notificationConnection?.off('ReceiveNotification');
  }

  onMessageReceived(callback: (message: any) => void) {
    if (!this.chatConnection) {
      console.warn('⚠️ Chat connection not ready');
      return;
    }
    
    // SignalR natively supports multiple handlers - just add it
    // Don't call .off() - that removes ALL handlers
    this.chatConnection.on('ReceiveMessage', (message) => {
      console.log('💬 ReceiveMessage event for a callback');
      callback(message);
    });
    console.log('✅ Registered message handler');
  }

  offMessageReceived() {
    this.chatConnection?.off('ReceiveMessage');
  }

  onNewMessageNotification(callback: (data: any) => void) {
    this.chatConnection?.on('NewMessageNotification', callback);
  }

  offNewMessageNotification() {
    this.chatConnection?.off('NewMessageNotification');
  }

  onMessagesRead(callback: (data: any) => void) {
    this.chatConnection?.on('MessagesRead', callback);
  }

  offMessagesRead() {
    this.chatConnection?.off('MessagesRead');
  }

  onUserTyping(callback: (data: any) => void) {
    this.chatConnection?.on('UserTyping', callback);
  }

  offUserTyping() {
    this.chatConnection?.off('UserTyping');
  }

  async joinConversation(conversationId: number) {
    if (this.chatConnection?.state === signalR.HubConnectionState.Connected) {
      console.log('🔗 Joining conversation:', conversationId);
      await this.chatConnection.invoke('JoinConversation', conversationId.toString());
    } else {
      console.error('❌ Cannot join conversation - Chat Hub not connected');
    }
  }

  async leaveConversation(conversationId: number) {
    if (this.chatConnection?.state === signalR.HubConnectionState.Connected) {
      await this.chatConnection.invoke('LeaveConversation', conversationId.toString());
    }
  }

  async sendTyping(conversationId: number) {
    if (this.chatConnection?.state === signalR.HubConnectionState.Connected) {
      await this.chatConnection.invoke('SendTyping', conversationId.toString());
    }
  }

  async stopAllConnections() {
    await this.notificationConnection?.stop();
    await this.chatConnection?.stop();
  }

  getNotificationConnection() {
    return this.notificationConnection;
  }

  getChatConnection() {
    return this.chatConnection;
  }
}

export const signalRService = new SignalRService();
