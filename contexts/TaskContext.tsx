import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { categoriesAPI, tasksAPI } from '@/services/api';
import { Category, Task, TaskFormData } from '@/types';

interface TaskState {
  tasks: Task[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

interface TaskContextType extends TaskState {
  fetchTasks: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createTask: (taskData: TaskFormData) => Promise<void>;
  updateTask: (id: string, taskData: Partial<TaskFormData>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  createCategory: (categoryData: { name: string; color: string }) => Promise<void>;
  updateCategory: (id: string, categoryData: Partial<{ name: string; color: string }>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

type TaskAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id ? action.payload : category
        ),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState: TaskState = {
  tasks: [],
  categories: [],
  isLoading: false,
  error: null,
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const fetchTasks = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await tasksAPI.getAll();
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_TASKS', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to fetch tasks' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch tasks' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoriesAPI.getAll();
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_CATEGORIES', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to fetch categories' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch categories' });
    }
  }, []);

  const createTask = async (taskData: TaskFormData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await tasksAPI.create(taskData);
      
      if (response.success && response.data) {
        dispatch({ type: 'ADD_TASK', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to create task' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create task' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateTask = async (id: string, taskData: Partial<TaskFormData>) => {
    try {
      const response = await tasksAPI.update(id, taskData);
      
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_TASK', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to update task' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update task' });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const response = await tasksAPI.delete(id);
      
      if (response.success) {
        dispatch({ type: 'DELETE_TASK', payload: id });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to delete task' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete task' });
    }
  };

  const toggleTaskComplete = async (id: string) => {
    try {
      const response = await tasksAPI.toggleComplete(id);
      
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_TASK', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to toggle task' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to toggle task' });
    }
  };

  const createCategory = async (categoryData: { name: string; color: string }) => {
    try {
      const response = await categoriesAPI.create(categoryData);
      
      if (response.success && response.data) {
        dispatch({ type: 'ADD_CATEGORY', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to create category' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create category' });
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<{ name: string; color: string }>) => {
    try {
      const response = await categoriesAPI.update(id, categoryData);
      
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_CATEGORY', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to update category' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update category' });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const response = await categoriesAPI.delete(id);
      
      if (response.success) {
        dispatch({ type: 'DELETE_CATEGORY', payload: id });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to delete category' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete category' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  useEffect(() => {
    // Only fetch on mount, not on every render
    const initializeData = async () => {
      await fetchTasks();
      await fetchCategories();
    };
    initializeData();
  }, []);

  const value: TaskContextType = {
    ...state,
    fetchTasks,
    fetchCategories,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}; 