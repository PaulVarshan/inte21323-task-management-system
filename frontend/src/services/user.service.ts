import axios from 'axios';

const envApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';
const API_URL = envApiUrl.replace(/\/auth\/?$/, '');

const userApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface UserRole {
  role: {
    role_id: number;
    role_name: string;
  }
}

export interface User {
  user_id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  user_roles: UserRole[];
}

export const getAllUsers = async () => {
  const response = await userApi.get('/users');
  return response.data.data as User[];
};

export const getUserById = async (id: number) => {
  const response = await userApi.get(`/users/${id}`);
  return response.data.data as User;
};

export const updateUserDetails = async (id: number, data: { username: string; email: string }) => {
  const response = await userApi.put(`/users/${id}`, data);
  return response.data.data as User;
};

export const changeUserRole = async (id: number, role: string) => {
  const response = await userApi.put(`/users/${id}/role`, { role });
  return response.data.data as User;
};

export const changeUserStatus = async (id: number, is_active: boolean) => {
  const response = await userApi.put(`/users/${id}/status`, { is_active });
  return response.data.data as User;
};
