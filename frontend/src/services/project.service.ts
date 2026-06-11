import axios from 'axios';

const envApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';
const API_URL = envApiUrl.replace(/\/auth\/?$/, '');

const projectApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Project {
  project_id: number;
  project_name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: string;
  created_by: number;
  created_at: string;
  creator?: {
    user_id: number;
    username: string;
    email: string;
  };
  team_members?: ProjectMember[];
}

export interface ProjectMember {
  project_team_id: number;
  project_id: number;
  user_id: number;
  project_role: string;
  joined_at: string;
  project?: {
    project_name: string;
  };
  user: {
    user_id: number;
    username: string;
    email: string;
  };
}

export interface User {
  user_id: number;
  username: string;
  email: string;
  role?: string;
}

export const getProjects = async () => {
  const response = await projectApi.get('/projects');
  return response.data.data as Project[];
};

export const getProjectById = async (id: number) => {
  const response = await projectApi.get(`/projects/${id}`);
  return response.data.data as Project;
};

export const createProject = async (data: Partial<Project>) => {
  const response = await projectApi.post('/projects', data);
  return response.data.data as Project;
};

export const updateProject = async (id: number, data: Partial<Project>) => {
  const response = await projectApi.put(`/projects/${id}`, data);
  return response.data.data as Project;
};

export const deleteProject = async (id: number) => {
  const response = await projectApi.delete(`/projects/${id}`);
  return response.data.data;
};

// Team Management
export const getProjectMembers = async (id: number) => {
  const response = await projectApi.get(`/projects/${id}/members`);
  return response.data.data as ProjectMember[];
};

export const getAllTeamMembers = async () => {
  const response = await projectApi.get('/projects/all/members');
  return response.data.data as ProjectMember[];
};

export const addMemberToProject = async (id: number, user_id: number, project_role: string) => {
  const response = await projectApi.post(`/projects/${id}/members`, { user_id, project_role });
  return response.data.data as ProjectMember;
};

export const removeMemberFromProject = async (id: number, userId: number) => {
  const response = await projectApi.delete(`/projects/${id}/members/${userId}`);
  return response.data.data;
};

// Users (for dropdown)
export const getAllUsers = async () => {
  const response = await projectApi.get('/auth/users');
  return response.data.data as User[];
};
