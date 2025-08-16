import { authAPI } from '@/services/api';
import { AuthState, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_TOKEN'; payload: string }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, error: null };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const checkAuth = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = await AsyncStorage.getItem('authToken');
      
      if (token) {
        dispatch({ type: 'SET_TOKEN', payload: token });
        const response = await authAPI.getCurrentUser();
        
        if (response.success && response.data) {
          dispatch({ type: 'SET_USER', payload: response.data });
        } else {
          // Clear token and user data directly instead of calling logout
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear token and user data directly instead of calling logout
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      const response = await authAPI.login(email, password);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        
        dispatch({ type: 'SET_TOKEN', payload: token });
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        const errorMessage = response.message || 'Login failed';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
              dispatch({ type: 'CLEAR_ERROR' });
      const response = await authAPI.register(email, username, password);
      
      if (response.success && response.data) {
        // After registration, automatically log in
        await login(email, password);
      } else {
        const errorMessage = response.message || 'Registration failed';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  useEffect(() => {
    // Only check auth on mount, not on every render
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const token = await AsyncStorage.getItem('authToken');
        
        if (token) {
          dispatch({ type: 'SET_TOKEN', payload: token });
          const response = await authAPI.getCurrentUser();
          
          if (response.success && response.data) {
            dispatch({ type: 'SET_USER', payload: response.data });
          } else {
            // Clear token and user data directly
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');
            dispatch({ type: 'LOGOUT' });
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear token and user data directly
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    initializeAuth();
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    checkAuth,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 