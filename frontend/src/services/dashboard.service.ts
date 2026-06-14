import axios from 'axios';

const envApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';
const API_URL = envApiUrl.replace(/\/auth\/?$/, '');

const dashboardApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface OverviewStats {
  total_projects: number;
  active_projects: number;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
}

export interface ProjectProgressData {
  project_id: number;
  project_name: string;
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
}

export interface TaskStatusCounts {
  TODO: number;
  IN_PROGRESS: number;
  REVIEW: number;
  DONE: number;
}

export interface OverdueTaskData {
  task_id: number;
  title: string;
  project_name: string;
  due_date: string;
  status: string;
  priority: string;
  assignees: string[];
}

export interface UpcomingDeadlinesData {
  today: { task_id: number; title: string; project_name: string; due_date: string }[];
  next3Days: { task_id: number; title: string; project_name: string; due_date: string }[];
  next7Days: { task_id: number; title: string; project_name: string; due_date: string }[];
}

export interface TeamWorkloadData {
  user_id: number;
  username: string;
  email: string;
  assigned_tasks_count: number;
}

export interface RecentTaskData {
  task_id: number;
  title: string;
  project_name: string;
  status: string;
  updated_at: string;
  assignees: string[];
}

export const getOverview = async () => {
  const response = await dashboardApi.get('/dashboard/overview');
  return response.data.data as OverviewStats;
};

export const getProjectProgress = async () => {
  const response = await dashboardApi.get('/dashboard/project-progress');
  return response.data.data as ProjectProgressData[];
};

export const getTaskStatus = async () => {
  const response = await dashboardApi.get('/dashboard/task-status');
  return response.data.data as TaskStatusCounts;
};

export const getOverdueTasks = async () => {
  const response = await dashboardApi.get('/dashboard/overdue-tasks');
  return response.data.data as OverdueTaskData[];
};

export const getUpcomingDeadlines = async () => {
  const response = await dashboardApi.get('/dashboard/upcoming-deadlines');
  return response.data.data as UpcomingDeadlinesData;
};

export const getTeamWorkload = async () => {
  const response = await dashboardApi.get('/dashboard/team-workload');
  return response.data.data as TeamWorkloadData[];
};

export const getRecentTasks = async () => {
  const response = await dashboardApi.get('/dashboard/recent-tasks');
  return response.data.data as RecentTaskData[];
};
