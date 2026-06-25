import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '../../services/notification.service';
import { useNavigate } from 'react-router-dom';

interface NotificationDropdownProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    onClose();
    // Assuming the current role layout is active, we can just navigate to the relative notifications path
    // But since it might be /admin, /pm, or /collab, we can extract the base path from window location
    const currentPath = window.location.pathname;
    const basePath = currentPath.split('/').slice(0, 2).join('/'); 
    navigate(`${basePath}/notifications`);
  };

  const getNotificationColor = (type: string) => {
    if (type === 'TASK_REVIEW' || type === 'TASK_APPROVED') return { r: 34, g: 197, b: 94 };
    if (type === 'TASK_REJECTED') return { r: 239, g: 68, b: 68 };
    return { r: 59, g: 130, b: 246 };
  };

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      right: '0',
      marginTop: '10px',
      width: '350px',
      maxHeight: '400px',
      overflowY: 'auto',
      background: 'var(--surface-color)',
      border: '1px solid var(--surface-border)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid var(--surface-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Notifications</h3>
        {notifications.some(n => !n.is_read) && (
          <button 
            onClick={onMarkAllAsRead}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-color)',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No notifications
          </div>
        ) : (
          notifications.slice(0, 5).map(notification => {
            const { r, g, b } = getNotificationColor(notification.notification_type || '');
            return (
            <div 
              key={notification.notification_id}
              onClick={() => !notification.is_read && onMarkAsRead(notification.notification_id)}
              style={{
                padding: '1rem',
                margin: '0.5rem',
                border: '1px solid var(--surface-border)',
                borderRadius: '8px',
                background: notification.is_read ? 'var(--surface-color)' : `rgba(${r}, ${g}, ${b}, 0.08)`,
                cursor: notification.is_read ? 'default' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <strong style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {!notification.is_read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: `rgb(${r}, ${g}, ${b})`, flexShrink: 0 }} />}
                  {notification.title}
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {notification.message}
              </p>
            </div>
            );
          })
        )}
      </div>

      {notifications.length > 0 && (
        <button 
          onClick={handleViewAll}
          style={{
            padding: '1rem',
            background: 'none',
            border: 'none',
            borderTop: '1px solid var(--surface-border)',
            color: 'var(--primary-color)',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          View All Notifications
        </button>
      )}
    </div>
  );
};
