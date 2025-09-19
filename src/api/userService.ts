import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';

export interface User {
  _id: string;
  email: string;
  username: string;
  full_name: string;
  role?: string;
  is_active: boolean;
  created_at: string;
  last_login: string;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    count: number;
  };
}

export const getUsers = async (): Promise<UsersResponse> => {
  const response = await apiClient.get<UsersResponse>('/api/users');
  return response.data;
};
