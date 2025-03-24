
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Notification } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';

const NotificationMenu = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Lỗi khi tải thông báo');

      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
        // Count unread notifications
        setUnreadCount(data.data.filter((n: Notification) => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds: number[]) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/notifications/read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notification_ids: notificationIds })
      });

      if (!response.ok) throw new Error('Lỗi khi đánh dấu đã đọc');

      // Update the local state
      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          notificationIds.includes(n.notification_id) 
            ? { ...n, is_read: true } 
            : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Lỗi khi đánh dấu tất cả đã đọc');

      // Update all notifications to read
      setNotifications(prevNotifications => 
        prevNotifications.map(n => ({ ...n, is_read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Mark notifications as read when the popover is opened
  const handleOpenChange = (opened: boolean) => {
    setOpen(opened);
    if (opened) {
      const unreadNotifications = notifications
        .filter(n => !n.is_read)
        .map(n => n.notification_id);
      
      if (unreadNotifications.length > 0) {
        markAsRead(unreadNotifications);
      }
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications();
    
    // Set up polling every 60 seconds
    const intervalId = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-semibold">Thông báo</h3>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={markAllAsRead}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[400px]">
          {loading && <div className="p-4 text-center text-sm text-muted-foreground">Đang tải...</div>}
          
          {!loading && notifications.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Bạn chưa có thông báo nào</p>
            </div>
          )}
          
          {!loading && notifications.length > 0 && (
            <div>
              {notifications.map((notification) => (
                <Link 
                  to={`/blog/${notification.post_id}`} 
                  key={notification.notification_id} 
                  className="block"
                >
                  <div className={`flex p-4 hover:bg-accent ${!notification.is_read ? 'bg-accent/50' : ''}`}>
                    <div className="mr-3 h-10 w-10 overflow-hidden rounded-full">
                      {notification.from_avatar || (notification.from_user?.profile_picture) ? (
                        <img 
                          src={notification.from_avatar || notification.from_user?.profile_picture} 
                          alt={notification.from_username || notification.from_user?.username || 'User'} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                          {(notification.from_username || notification.from_user?.username || 'User').substring(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">{notification.from_fullname || notification.from_user?.full_name || notification.from_username || notification.from_user?.username}</span>{' '}
                        {notification.action_text || notification.message}
                      </p>
                      {notification.post_title && (
                        <p className="text-xs text-muted-foreground">"{notification.post_title}"</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { 
                          addSuffix: true,
                          locale: vi 
                        })}
                      </p>
                    </div>
                  </div>
                  <Separator />
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationMenu;
