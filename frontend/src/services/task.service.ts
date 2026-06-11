import axios from 'axios';

const envApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';
const API_URL = envApiUrl.replace(/\/auth\/?$/, '');

const taskApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Task {
  task_id: number;
  project_id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  project?: {
    project_name: string;
  };
  creator?: {
    user_id: number;
    username: string;
    email: string;
  };
  assignees?: {
    task_assigned_id: number;
    user_id: number;
    user: {
      user_id: number;
      username: string;
      email: string;
    }
  }[];
}

export const getTasks = async () => {
  const response = await taskApi.get('/tasks');
  return response.data.data as Task[];
};

export const getTaskById = async (id: number) => {
  const response = await taskApi.get(`/tasks/${id}`);
  return response.data.data as Task;
};

export const createTask = async (data: Omit<Partial<Task>, 'assignees'> & { assignees?: number[] }) => {
  const response = await taskApi.post('/tasks', data);
  return response.data.data as Task;
};

export const updateTask = async (id: number, data: Omit<Partial<Task>, 'assignees'> & { assignees?: number[] }) => {
  const response = await taskApi.put(`/tasks/${id}`, data);
  return response.data.data as Task;
};

export const deleteTask = async (id: number) => {
  const response = await taskApi.delete(`/tasks/${id}`);
  return response.data.data;
};
