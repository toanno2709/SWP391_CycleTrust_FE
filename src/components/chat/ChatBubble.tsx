import React, { useState, useEffect, useRef } from 'react';
import { Badge } from 'antd';
import { MessageOutlined, CloseOutlined } from '@ant-design/icons';
import { chatService } from '../../services/chat';
import { signalRService } from '../../services/signalr';
import { ChatWindow } from './ChatWindow';
import { useChatStore } from '../../store/chat';
import { useAuthStore } from '../../store/auth';

export const ChatBubble: React.FC = () => {
  const { isOpen, openChat, closeChat } = useChatStore();
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const hasRegisteredHandler = useRef(false);

  useEffect(() => {
    loadUnreadCount();
    
    // Only register handler once
    if (hasRegisteredHandler.current) return;
    hasRegisteredHandler.current = true;

    // Wait for connection to be ready then register handler
    const setupHandler = () => {
      const conn = signalRService.getChatConnection();
      if (!conn || conn.state !== 'Connected') {
        console.log('ChatBubble: Connection not ready, retrying in 500ms...');
        setTimeout(setupHandler, 500);
        return;
      }

      // Reload unread count when receiving any new message
      const handleNewMessage = (message: any) => {
        console.log('ChatBubble: New message received, reloading count', message);
        loadUnreadCount();
      };

      signalRService.onMessageReceived(handleNewMessage);
    };

    setupHandler();
    // No cleanup - keep handler always active
  }, []);

  const loadUnreadCount = async () => {
    try {
      const conversations = await chatService.getConversations();
      const total = conversations.reduce((sum, conv) => {
        const isSeller = user?.id === conv.sellerId;
        return sum + (isSeller ? conv.unreadCountSeller : conv.unreadCountBuyer);
      }, 0);
      setUnreadCount(total);
    } catch (error) {
      console.error('Lỗi tải số tin nhắn chưa đọc:', error);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Badge count={unreadCount} overflowCount={99}>
          <button
            onClick={() => isOpen ? closeChat() : openChat()}
            className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110"
          >
            {isOpen ? (
              <CloseOutlined style={{ fontSize: '24px' }} />
            ) : (
              <MessageOutlined style={{ fontSize: '24px' }} />
            )}
          </button>
        </Badge>
      </div>

      {isOpen && (
        <ChatWindow
          onClose={closeChat}
          onUnreadCountChange={setUnreadCount}
        />
      )}
    </>
  );
};
