export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  categoryId?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface TaskFormData {
  title: string;
  description?: string;
  categoryId?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface CategoryFormData {
  name: string;
  color: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
} 