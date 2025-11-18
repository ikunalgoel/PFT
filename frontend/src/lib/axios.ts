import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { supabase } from '../config/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Helper to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to check if error is retryable
const isRetryableError = (error: AxiosError): boolean => {
  if (!error.response) {
    // Network errors are retryable
    return true;
  }
  
  return RETRY_STATUS_CODES.includes(error.response.status);
};

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and retry logic
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the session
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !session) {
          // If refresh fails, sign out user
          await supabase.auth.signOut();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        await supabase.auth.signOut();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // Retry logic for retryable errors
    const retryCount = originalRequest._retryCount || 0;
    
    if (isRetryableError(error) && retryCount < MAX_RETRIES) {
      originalRequest._retryCount = retryCount + 1;
      
      // Exponential backoff
      const delayTime = RETRY_DELAY * Math.pow(2, retryCount);
      
      console.log(
        `Retrying request (${originalRequest._retryCount}/${MAX_RETRIES}) after ${delayTime}ms...`
      );
      
      await delay(delayTime);
      
      return axiosInstance(originalRequest);
    }

    return Promise.reject(error);
  }
);

// Helper function to extract error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export default axiosInstance;
