import React, { useState, useEffect, useRef } from 'react';
import { Input, Avatar, Badge, Spin, Empty } from 'antd';
import { SendOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';
import type { ChatConversation, ChatMessage, SendMessageRequest } from '../../types';
import { chatService } from '../../services/chat';
import { signalRService } from '../../services/signalr';
import { useChatStore } from '../../store/chat';
import { useAuthStore } from '../../store/auth';

interface ChatWindowProps {
  onClose: () => void;
  onUnreadCountChange: (count: number) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose: _onClose, onUnreadCountChange }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { pendingListingId, pendingSellerId, clearPending, selectConversation } = useChatStore();
  const currentUserId = user?.id || 0;
  const hasRegisteredHandler = useRef(false);
  const selectedConversationRef = useRef(selectedConversation);

  // Keep ref in sync with state
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (pendingListingId && pendingSellerId) {
      handleOpenWithListing(pendingListingId, pendingSellerId);
    }
  }, [pendingListingId, pendingSellerId]);

  useEffect(() => {
    // Only register handler once
    if (hasRegisteredHandler.current) return;
    hasRegisteredHandler.current = true;

    // Wait for connection to be ready then register handler
    const setupHandler = () => {
      const conn = signalRService.getChatConnection();
      if (!conn || conn.state !== 'Connected') {
        console.log('ChatWindow: Connection not ready, retrying in 500ms...');
        setTimeout(setupHandler, 500);
        return;
      }

      const handleNewMessage = (message: ChatMessage) => {
        console.log('ChatWindow: handleNewMessage called', message);
        console.log('Selected conversation:', selectedConversationRef.current?.id);
        console.log('Message conversation:', message.conversationId);
        
        const currentConversation = selectedConversationRef.current;
        
        if (currentConversation && message.conversationId === currentConversation.id) {
          setMessages(prev => {
            if (prev.some(m => m.id === message.id)) {
              console.log('Duplicate message detected, skipping');
              return prev;
            }
            console.log('Adding new message to state');
            return [...prev, message];
          });
          scrollToBottom();
          
          // Mark as read if not sent by current user
          if (message.senderId !== currentUserId) {
            chatService.markAsRead(message.conversationId);
          }
        } else {
          console.log('Message for different conversation, reloading list');
        }
        
        // Always reload conversations to update last message and unread counts
        loadConversations();
      };

      signalRService.onMessageReceived(handleNewMessage);
    };

    setupHandler();
    // No cleanup - keep handler always active
  }, []);

  const handleOpenWithListing = async (listingId: number, sellerId: number) => {
    try {
      const conversation = await chatService.getOrCreateConversation(listingId, sellerId);
      const allConversations = await chatService.getConversations();
      setConversations(allConversations);
      const found = allConversations.find(c => c.id === conversation.id);
      if (found) {
        handleSelectConversation(found);
      }
      clearPending();
    } catch (error) {
      console.error('Lỗi mở chat với người bán:', error);
      clearPending();
    }
  };

  const loadConversations = async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
      updateUnreadCount(data);
    } catch (error) {
      console.error('Lỗi tải danh sách cuộc trò chuyện:', error);
    }
  };

  const updateUnreadCount = (convs: ChatConversation[]) => {
    const total = convs.reduce((sum, conv) => {
      const isSeller = currentUserId === conv.sellerId;
      return sum + (isSeller ? conv.unreadCountSeller : conv.unreadCountBuyer);
    }, 0);
    onUnreadCountChange(total);
  };

  const loadMessages = async (conversationId: number) => {
    try {
      setLoading(true);
      const data = await chatService.getMessages(conversationId);
      setMessages(data);
      scrollToBottom();
      await chatService.markAsRead(conversationId);
      await signalRService.joinConversation(conversationId);
      loadConversations();
    } catch (error) {
      console.error('Lỗi tải tin nhắn:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation: ChatConversation) => {
    if (selectedConversation) {
      signalRService.leaveConversation(selectedConversation.id);
    }
    setSelectedConversation(conversation);
    selectConversation(conversation.id);
    loadMessages(conversation.id);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      const otherUser = getOtherUser(selectedConversation);
      const request: SendMessageRequest = {
        conversationId: selectedConversation.id,
        receiverId: otherUser.id,
        content: messageInput.trim()
      };
      
      // Don't add message to state here - wait for SignalR ReceiveMessage event
      // This prevents duplicate messages
      await chatService.sendMessage(request);
      setMessageInput('');
      
      // Update conversations list to reflect new last message
      loadConversations();
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    
    // Handle different date formats from backend
    let date: Date;
    
    // If it already has 'T' (ISO format), parse directly
    if (dateStr.includes('T')) {
      date = new Date(dateStr);
    } else {
      // MySQL format without 'T', add 'Z' to treat as UTC
      date = new Date(dateStr + 'Z');
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh'
    });
  };

  const getOtherUser = (conversation: ChatConversation) => {
    return currentUserId === conversation.buyerId
      ? { id: conversation.sellerId, name: conversation.sellerName, avatar: conversation.sellerAvatar }
      : { id: conversation.buyerId, name: conversation.buyerName, avatar: conversation.buyerAvatar };
  };

  const getUnreadCount = (conversation: ChatConversation) => {
    const isSeller = currentUserId === conversation.sellerId;
    return isSeller ? conversation.unreadCountSeller : conversation.unreadCountBuyer;
  };

  return (
    <div className="fixed bottom-24 right-6 w-96 h-150 bg-white dark:bg-slate-800 rounded-lg shadow-2xl flex flex-col z-50 border border-slate-200 dark:border-slate-700">
      <div className="flex h-full">
        <div className="w-32 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-xs">Tin nhắn</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center">
                <Empty description="Chưa có tin nhắn" />
              </div>
            ) : (
              conversations.map(conv => {
                const otherUser = getOtherUser(conv);
                const unread = getUnreadCount(conv);
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 ${
                      selectedConversation?.id === conv.id ? 'bg-green-50 dark:bg-green-900/20' : ''
                    }`}
                  >
                    <Badge count={unread} size="small">
                      {otherUser.avatar ? (
                        <img src={otherUser.avatar} alt={otherUser.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <Avatar icon={<UserOutlined />} size={40} />
                      )}
                    </Badge>
                    <p className="text-xs mt-1 truncate font-medium">{otherUser.name}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <MessageOutlined style={{ fontSize: '48px', marginBottom: '8px' }} />
                <p>Chọn cuộc trò chuyện</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                {getOtherUser(selectedConversation).avatar ? (
                  <img 
                    src={getOtherUser(selectedConversation).avatar} 
                    alt={getOtherUser(selectedConversation).name} 
                    className="w-10 h-10 rounded-full object-cover" 
                  />
                ) : (
                  <Avatar icon={<UserOutlined />} size={40} />
                )}
                <div>
                  <p className="font-semibold text-sm">{getOtherUser(selectedConversation).name}</p>
                  <p className="text-xs text-slate-500">{selectedConversation.listingTitle}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <Spin />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <p className="text-sm">Chưa có tin nhắn</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.senderId === currentUserId;
                    return (
                      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] ${isOwn ? 'bg-green-600 text-white' : 'bg-slate-100 dark:bg-slate-700'} rounded-lg px-3 py-2`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-green-100' : 'text-slate-400'}`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  disabled={sending}
                  className="flex-1"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  <SendOutlined />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
