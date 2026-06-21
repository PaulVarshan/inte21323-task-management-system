import axios from 'axios';

const envApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';
const API_URL = envApiUrl.replace(/\/auth\/?$/, '');

const commentApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Comment {
  comment_id: number;
  user_id: number;
  task_id: number;
  created_at: string;
  comment_text: string;
  user: {
    user_id: number;
    username: string;
    email: string;
  };
}

export const getTaskComments = async (taskId: number) => {
  const response = await commentApi.get(`/tasks/${taskId}/comments`);
  return response.data.data as Comment[];
};

export const createComment = async (taskId: number, commentText: string) => {
  const response = await commentApi.post(`/tasks/${taskId}/comments`, { comment_text: commentText });
  return response.data.data as Comment;
};

export const updateComment = async (commentId: number, commentText: string) => {
  const response = await commentApi.put(`/comments/${commentId}`, { comment_text: commentText });
  return response.data.data as Comment;
};

export const deleteComment = async (commentId: number) => {
  const response = await commentApi.delete(`/comments/${commentId}`);
  return response.data;
};
