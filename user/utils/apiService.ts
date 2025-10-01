// Global API Wrapper with comprehensive error handling
import { ApiErrorHandler } from './apiErrorHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class ApiService {
  /**
   * Make an API request with comprehensive error handling
   * @param endpoint - API endpoint (e.g., '/auth/customer-profile')
   * @param options - Fetch options
   * @param requiresAuth - Whether the request requires authentication
   * @param context - Context for error logging
   */
  static async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = true,
    context?: string
  ): Promise<ApiResponse<T>> {
    try {
      // Check internet connection
      const hasInternet = await ApiErrorHandler.checkInternetConnection();
      if (!hasInternet) {
        ApiErrorHandler.handleNoInternet();
        return {
          success: false,
          error: 'No internet connection'
        };
      }

      // Get token if authentication is required
      let token: string | null = null;
      if (requiresAuth) {
        token = await AsyncStorage.getItem('token');
        if (!token) {
          return {
            success: false,
            error: 'Authentication required'
          };
        }

        // Validate token
        const isValid = await ApiErrorHandler.isTokenValid(token, BACKEND_URL);
        if (!isValid) {
          return {
            success: false,
            error: 'Token expired'
          };
        }
      }

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Make the request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_URL}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 - token expired
      if (response.status === 401) {
        await ApiErrorHandler.handleError(response, context);
        return {
          success: false,
          error: 'Session expired'
        };
      }

      // Handle other error status codes
      if (!response.ok) {
        await ApiErrorHandler.handleError(response, context);
        
        let errorMessage = `HTTP ${response.status} error`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Ignore JSON parse errors
        }

        return {
          success: false,
          error: errorMessage
        };
      }

      // Parse successful response
      const data = await response.json();
      
      return {
        success: true,
        data: data.data || data,
        message: data.message
      };

    } catch (error) {
      console.error(`API Error in ${context || 'request'}:`, error);
      await ApiErrorHandler.handleError(error, context);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * GET request
   */
  static async get<T = any>(
    endpoint: string,
    requiresAuth: boolean = true,
    context?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, requiresAuth, context);
  }

  /**
   * POST request
   */
  static async post<T = any>(
    endpoint: string,
    body: any,
    requiresAuth: boolean = true,
    context?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(body)
      },
      requiresAuth,
      context
    );
  }

  /**
   * PUT request
   */
  static async put<T = any>(
    endpoint: string,
    body: any,
    requiresAuth: boolean = true,
    context?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(body)
      },
      requiresAuth,
      context
    );
  }

  /**
   * DELETE request
   */
  static async delete<T = any>(
    endpoint: string,
    requiresAuth: boolean = true,
    context?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, requiresAuth, context);
  }

  /**
   * PATCH request
   */
  static async patch<T = any>(
    endpoint: string,
    body: any,
    requiresAuth: boolean = true,
    context?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: JSON.stringify(body)
      },
      requiresAuth,
      context
    );
  }
}

export default ApiService;
