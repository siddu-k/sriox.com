import apiService from './apiService';
import { User } from '../types';

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  CURRENT_USER: '/auth/me',
  REFRESH_TOKEN: '/auth/refresh',
};

// Services for handling authentication
const authService = {
  /**
   * Get the currently authenticated user
   */
  getCurrentUser: async (): Promise<User> => {
    return apiService.get<User>(AUTH_ENDPOINTS.CURRENT_USER);
  },

  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<User> => {
    const response = await apiService.post<{ user: User; token: string }>(AUTH_ENDPOINTS.LOGIN, {
      email,
      password,
    });
    
    // Store the JWT token in localStorage
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response.user;
  },

  /**
   * Register a new user account
   */
  register: async (username: string, email: string, password: string): Promise<User> => {
    const response = await apiService.post<{ user: User; token: string }>(AUTH_ENDPOINTS.REGISTER, {
      username,
      email,
      password,
    });
    
    // Store the JWT token in localStorage
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response.user;
  },

  /**
   * Logout the current user
   */
  logout: async (): Promise<void> => {
    await apiService.post(AUTH_ENDPOINTS.LOGOUT);
    localStorage.removeItem('token');
  },

  /**
   * Check if the user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    return !!token; // Returns true if token exists
  },

  /**
   * Refresh the authentication token
   */
  refreshToken: async (): Promise<string> => {
    const response = await apiService.post<{ token: string }>(AUTH_ENDPOINTS.REFRESH_TOKEN);
    
    // Store the new JWT token in localStorage
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response.token;
  },
};

export default authService;