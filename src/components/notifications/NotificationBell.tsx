import React, { useState, useEffect, useRef } from 'react';
import { Badge, Dropdown, Spin } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Notification, NotificationSummary } from '../../types';
import { notificationService } from '../../services/notification';
import { signalRService } from '../../services/signalr';
import { useNavigate } from 'react-router-dom';
import { getNotificationIcon } from '../../utils/notification';

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const hasRegisteredHandler = useRef(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [summaryData, notificationList] = await Promise.all([
        notificationService.getSummary(),
        notificationService.getNotifications(10)
      ]);
      setSummary(summaryData);
      setNotifications(notificationList);
      console.log('✅ Loaded notifications from API:', notificationList.length);
    } catch (error) {
      console.error('Lỗi tải thông báo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownOpenChange = (visible: boolean) => {
    setDropdownVisible(visible);
    if (visible) {
      console.log('🔄 Bell clicked - loading fresh notifications...');
      loadNotifications();
    }
  };

  useEffect(() => {
    loadNotifications();

    if (hasRegisteredHandler.current) return;
    hasRegisteredHandler.current = true;

    const setupHandler = () => {
      const conn = signalRService.getNotificationConnection();
      if (!conn || conn.state !== 'Connected') {
        console.log('NotificationBell: Connection not ready, retrying in 500ms...');
        setTimeout(setupHandler, 500);
        return;
      }

      const handleNewNotification = (notification: Notification) => {
        console.log('NotificationBell: handleNewNotification called', notification);
        setNotifications(prev => [notification, ...prev.slice(0, 9)]);
        setSummary(prev => prev ? {
          ...prev,
          unreadCount: prev.unreadCount + 1,
          recentNotifications: [notification, ...prev.recentNotifications.slice(0, 4)]
        } : null);
      };

      signalRService.onNotificationReceived(handleNewNotification);
    };

    setupHandler();
  }, []);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      setSummary(prev => prev ? {
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1)
      } : null);
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setSummary(prev => prev ? { ...prev, unreadCount: 0 } : null);
    } catch (error) {
      console.error('Lỗi đánh dấu tất cả đã đọc:', error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      loadNotifications();
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
      setDropdownVisible(false);
    }
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now.getTime() - notifDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 30) return `${days} ngày trước`;
    return notifDate.toLocaleDateString('vi-VN');
  };

  const menu = (
    <div className="w-96 bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold">Thông báo</h3>
        {summary && summary.unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            <CheckOutlined />
            Đánh dấu tất cả
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <BellOutlined style={{ fontSize: '48px', marginBottom: '8px' }} />
            <p>Chưa có thông báo</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`px-4 py-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                !notification.isRead ? 'bg-green-50 dark:bg-green-900/10' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 text-slate-600 dark:text-slate-400">{getNotificationIcon(notification.type)}</span>
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <p className="font-medium text-sm mb-1">{notification.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{notification.message}</p>
                  <p className="text-xs text-slate-400">{formatRelativeTime(notification.createdAt)}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      className="text-green-600 hover:text-green-700"
                      title="Đánh dấu đã đọc"
                    >
                      <CheckOutlined style={{ fontSize: '14px' }} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification.id);
                    }}
                    className="text-red-500 hover:text-red-600"
                    title="Xóa"
                  >
                    <DeleteOutlined style={{ fontSize: '14px' }} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div 
          className="px-4 py-3 text-center border-t border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
          onClick={() => {
            navigate('/notifications');
            setDropdownVisible(false);
          }}
        >
          <span className="text-sm text-green-600 hover:text-green-700 font-medium">
            Xem tất cả thông báo
          </span>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => menu}
      trigger={['click']}
      placement="bottomRight"
      open={dropdownVisible}
      onOpenChange={handleDropdownOpenChange}
    >
      <div className="relative cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors">
        <Badge count={summary?.unreadCount || 0} overflowCount={99}>
          <BellOutlined style={{ fontSize: '20px' }} className="text-slate-700 dark:text-slate-300" />
        </Badge>
      </div>
    </Dropdown>
  );
};
