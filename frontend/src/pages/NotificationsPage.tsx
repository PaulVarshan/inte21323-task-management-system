import React, { useEffect, useState } from 'react';
import { getNotifications, markAsRead, markAllAsRead, type Notification } from '../services/notification.service';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../components/ui/Button';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading notifications...</div>;
  if (error) return <div style={{ padding: '2rem', color: '#e74c3c' }}>{error}</div>;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationColor = (type: string) => {
    if (type === 'TASK_REVIEW' || type === 'TASK_APPROVED') {
      return { r: 34, g: 197, b: 94 }; // Green
    }
    if (type === 'TASK_REJECTED') {
      return { r: 239, g: 68, b: 68 }; // Red
    }
    return { r: 59, g: 130, b: 246 }; // Blue (default)
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="header-actions" style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Notifications</h1>
        {unreadCount > 0 && (
          <div>
            <Button onClick={handleMarkAllAsRead} style={{ whiteSpace: 'nowrap' }}>Mark all as read</Button>
          </div>
        )}
      </div>

      <div className="glass-panel">
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            You have no notifications.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map(notification => {
              const { r, g, b } = getNotificationColor(notification.notification_type || '');
              return (
              <div 
                key={notification.notification_id}
                onClick={() => !notification.is_read && handleMarkAsRead(notification.notification_id)}
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  background: notification.is_read ? 'var(--bg-gradient)' : `rgba(${r}, ${g}, ${b}, 0.08)`,
                  border: notification.is_read ? '1px solid var(--surface-border)' : `1px solid rgba(${r}, ${g}, ${b}, 0.4)`,
                  boxShadow: notification.is_read ? 'none' : `0 4px 12px rgba(${r}, ${g}, ${b}, 0.1)`,
                  cursor: notification.is_read ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: '1 1 250px', minWidth: 0 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {!notification.is_read && <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: `rgb(${r}, ${g}, ${b})`, flexShrink: 0, boxShadow: `0 0 8px rgb(${r}, ${g}, ${b})` }} />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notification.title}</span>
                  </h3>
                  <p style={{ margin: '0', color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>
                    {notification.message}
                  </p>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap', fontWeight: 500 }}>
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
