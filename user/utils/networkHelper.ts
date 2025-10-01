// Network connectivity and API health checker
import * as Network from 'expo-network';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

export interface NetworkStatus {
  isConnected: boolean;
  apiAvailable: boolean;
  backendUrl: string;
  hasInternet: boolean;
  error?: string;
}

export class NetworkHelper {
  // Check if device has internet connection
  static async checkInternetConnection(): Promise<boolean> {
    try {
      const networkState = await Network.getNetworkStateAsync();
      return networkState.isConnected === true && networkState.isInternetReachable !== false;
    } catch (error) {
      console.error('Error checking internet connection:', error);
      return false;
    }
  }

  // Check if the backend API is reachable
  static async checkAPIHealth(): Promise<NetworkStatus> {
    const status: NetworkStatus = {
      isConnected: false,
      apiAvailable: false,
      backendUrl: BACKEND_URL,
      hasInternet: false
    };

    try {
      // First check basic internet connectivity
      status.hasInternet = await this.checkInternetConnection();
      
      if (!status.hasInternet) {
        status.error = 'No internet connection detected';
        return status;
      }

      console.log(`Checking API health at: ${BACKEND_URL}`);
      
      // Try to reach a simple health endpoint or any endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${BACKEND_URL}/api/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);
      
      if (response.ok || response.status === 404) {
        // Even 404 means we can reach the server
        status.isConnected = true;
        status.apiAvailable = true;
      } else {
        status.isConnected = true;
        status.apiAvailable = false;
        status.error = `Server responded with ${response.status}: ${response.statusText}`;
      }
      
    } catch (error) {
      const err = error as Error;
      console.error('Network health check failed:', err.message);
      
      // Distinguish between no internet and server issues
      if (status.hasInternet) {
        // Has internet but can't reach server
        if (err.message.includes('Network request failed')) {
          status.error = 'Cannot reach the server. Check if your backend is running.';
        } else if (err.message.includes('timeout') || err.name === 'AbortError') {
          status.error = 'Connection timeout. Server may be slow or unreachable.';
        } else {
          status.error = `Network error: ${err.message}`;
        }
      } else {
        status.error = 'No internet connection';
      }
    }

    return status;
  }

  // Get current backend configuration info
  static getBackendInfo() {
    return {
      backendUrl: BACKEND_URL,
      apiUrl: `${BACKEND_URL}/api`,
      wsUrl: BACKEND_URL.replace('http://', 'ws://').replace('https://', 'wss://'),
      environment: {
        EXPO_PUBLIC_BACKEND_LINK: process.env.EXPO_PUBLIC_BACKEND_LINK,
        BACKEND_LINK: process.env.BACKEND_LINK
      }
    };
  }

  // Test a specific API endpoint
  static async testEndpoint(endpoint: string, token?: string): Promise<boolean> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BACKEND_URL}/api${endpoint}`, {
        method: 'GET',
        headers,
      });

      return response.ok || response.status === 401; // 401 means endpoint exists but needs auth
    } catch (error) {
      console.error(`Test endpoint ${endpoint} failed:`, error);
      return false;
    }
  }

  // Print diagnostic information to console
  static async printDiagnostics() {
    console.log('=== Network Diagnostics ===');
    
    const backendInfo = this.getBackendInfo();
    console.log('Backend Configuration:', backendInfo);
    
    const healthStatus = await this.checkAPIHealth();
    console.log('Network Status:', healthStatus);
    
    // Test common endpoints
    const endpoints = ['/messages/conversations', '/appointments', '/users'];
    for (const endpoint of endpoints) {
      const available = await this.testEndpoint(endpoint);
      console.log(`Endpoint ${endpoint}:`, available ? '✅ Available' : '❌ Not available');
    }
    
    console.log('=== End Diagnostics ===');
    return { backendInfo, healthStatus };
  }
}

export default NetworkHelper;