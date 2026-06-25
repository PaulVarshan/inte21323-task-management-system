import axios from 'axios';

const envApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';
const API_URL = envApiUrl.replace(/\/auth\/?$/, '');

const attachmentApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export interface Attachment {
  attachment_id: number;
  file_name: string;
  uploaded_by_user_id: number;
  task_id: number;
  uploaded_at: string;
  file_url: string;
  user: {
    user_id: number;
    username: string;
    email: string;
  };
}

export const getTaskAttachments = async (taskId: number) => {
  const response = await attachmentApi.get(`/tasks/${taskId}/attachments`);
  return response.data.data as Attachment[];
};

export const uploadAttachment = async (taskId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await attachmentApi.post(`/tasks/${taskId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data as Attachment;
};

export const deleteAttachment = async (attachmentId: number) => {
  const response = await attachmentApi.delete(`/attachments/${attachmentId}`);
  return response.data;
};

export interface GlobalAttachment {
  attachment_id: number;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  uploaded_by: string;
  task_name: string;
  project_name: string;
}

export const getAllAttachments = async () => {
  const response = await attachmentApi.get(`/attachments`);
  return response.data.data as GlobalAttachment[];
};
