import React, { useState, useEffect, useRef } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Spin, Empty, Badge } from 'antd';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Notification } from '../../types';
import { notificationService } from '../../services/notification';
import { signalRService } from '../../services/signalr';
import { useNavigate } from 'react-router-dom';
import { getNotificationIcon } from '../../utils/notification';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const hasRegisteredHandler = useRef(false);

  useEffect(() => {
    loadNotifications();

    if (hasRegisteredHandler.current) return;
    hasRegisteredHandler.current = true;

    const setupHandler = () => {
      const conn = signalRService.getNotificationConnection();
      if (!conn || conn.state !== 'Connected') {
        console.log('NotificationsPage: Connection not ready, retrying in 500ms...');
        setTimeout(setupHandler, 500);
        return;
      }

      const handleNewNotification = (notification: Notification) => {
        console.log('NotificationsPage: New notification received', notification);
        setNotifications(prev => [notification, ...prev]);
      };

      signalRService.onNotificationReceived(handleNewNotification);
    };

    setupHandler();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(100);
      setNotifications(data);
    } catch (error) {
      console.error('Lỗi tải thông báo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Lỗi xóa thông báo:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Thông báo</h1>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={async () => {
                await notificationService.markAllAsRead();
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
              }}
              className="text-sm text-green-600 hover:text-green-700 flex items-center gap-2 px-4 py-2 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
            >
              <CheckOutlined />
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Empty description="Chưa có thông báo" />
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-5 rounded-lg border transition-all ${
                  !notification.isRead
                    ? 'bg-green-50 dark:bg-green-900/10 border-green-200'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-slate-600 dark:text-slate-400">{getNotificationIcon(notification.type, { style: { fontSize: '28px' } })}</span>
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{notification.title}</h3>
                      {!notification.isRead && (
                        <Badge status="processing" />
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-2">{notification.message}</p>
                    <p className="text-sm text-slate-400">{formatDateTime(notification.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Đánh dấu đã đọc"
                      >
                        <CheckOutlined style={{ fontSize: '18px' }} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <DeleteOutlined style={{ fontSize: '18px' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
