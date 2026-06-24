import React, { useEffect, useState } from 'react';
import { getNotifications, markAsRead, markAllAsRead, Notification } from '../services/notification.service';
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

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Notifications</h1>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead}>Mark all as read</Button>
        )}
      </div>

      <div className="glass-panel">
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            You have no notifications.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map(notification => (
              <div 
                key={notification.notification_id}
                onClick={() => !notification.is_read && handleMarkAsRead(notification.notification_id)}
                style={{
                  padding: '1.5rem',
                  borderRadius: '8px',
                  background: notification.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(74, 144, 226, 0.1)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  cursor: notification.is_read ? 'default' : 'pointer',
                  transition: 'transform 0.2s, background 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {!notification.is_read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)' }} />}
                    {notification.title}
                  </h3>
                  <p style={{ margin: '0', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {notification.message}
                  </p>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
