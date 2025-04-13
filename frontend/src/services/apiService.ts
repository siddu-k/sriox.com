import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse } from '../types';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        if (refreshResponse.status === 200) {
          // If token refresh was successful, retry the original request
          const newToken = refreshResponse.data.token;
          localStorage.setItem('token', newToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token is also expired, logout the user
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper methods for common API operations
const apiService = {
  // Generic GET request
  get: async <T>(url: string, params?: object): Promise<T> => {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await api.get(url, { params });
      return response.data.data as T;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  // Generic POST request
  post: async <T>(url: string, data?: any): Promise<T> => {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await api.post(url, data);
      return response.data.data as T;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  // Generic PUT request
  put: async <T>(url: string, data?: any): Promise<T> => {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await api.put(url, data);
      return response.data.data as T;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  // Generic PATCH request
  patch: async <T>(url: string, data?: any): Promise<T> => {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await api.patch(url, data);
      return response.data.data as T;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  // Generic DELETE request
  delete: async <T>(url: string): Promise<T> => {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await api.delete(url);
      return response.data.data as T;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  // File upload with progress tracking
  upload: async <T>(url: string, file: File, onProgress?: (percentage: number) => void): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      });

      return response.data.data as T;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },
};

// Helper function to handle API errors
const handleApiError = (error: AxiosError<ApiResponse<any>>) => {
  if (error.response) {
    // Server responded with an error status
    const errorData = error.response.data;
    console.error('API Error:', errorData);
    
    // Handle specific error codes if needed
    switch (error.response.status) {
      case 400: // Bad Request
        break;
      case 401: // Unauthorized
        break;
      case 403: // Forbidden
        break;
      case 404: // Not Found
        break;
      case 422: // Validation Error
        break;
      case 500: // Server Error
        break;
      default:
        // Handle other status codes
        break;
    }
  } else if (error.request) {
    // Request was made but no response was received
    console.error('Network Error:', error.message);
  } else {
    // Something happened in setting up the request
    console.error('Request Error:', error.message);
  }
};

export default apiService;