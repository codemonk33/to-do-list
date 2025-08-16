import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ApiResponse, Category, CategoryFormData, Task, TaskFormData, User } from '@/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (email: string, username: string, password: string): Promise<ApiResponse<User>> => {
    const response = await api.post('/auth/register', { email, username, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (): Promise<ApiResponse<Task[]>> => {
    const response = await api.get('/tasks');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Task>> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  create: async (taskData: TaskFormData): Promise<ApiResponse<Task>> => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  update: async (id: string, taskData: Partial<TaskFormData>): Promise<ApiResponse<Task>> => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  toggleComplete: async (id: string): Promise<ApiResponse<Task>> => {
    const response = await api.patch(`/tasks/${id}/complete`);
    return response.data;
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/categories');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (categoryData: CategoryFormData): Promise<ApiResponse<Category>> => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  update: async (id: string, categoryData: Partial<CategoryFormData>): Promise<ApiResponse<Category>> => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default api; 