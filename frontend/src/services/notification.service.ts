import axios from 'axios';

const envApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';
const API_URL = envApiUrl.replace(/\/auth\/?$/, '');

const notificationApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Notification {
  notification_id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export const getNotifications = async () => {
  const response = await notificationApi.get('/notifications');
  return response.data.data as Notification[];
};

export const getUnreadCount = async () => {
  const response = await notificationApi.get('/notifications/unread-count');
  return response.data.data.count as number;
};

export const markAsRead = async (id: number) => {
  const response = await notificationApi.put(`/notifications/${id}/read`);
  return response.data.data as Notification;
};

export const markAllAsRead = async () => {
  const response = await notificationApi.put('/notifications/read-all');
  return response.data.data;
};
