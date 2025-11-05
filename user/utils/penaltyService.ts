import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiErrorHandler } from './apiErrorHandler';

// Get backend URL from environment variables
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

/**
 * Get current penalty info for the logged-in user
 */
export const getPenaltyInfo = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found',
      };
    }

    const response = await fetch(`${BACKEND_URL}/api/penalty/my-info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Check for 401 - token expired
    if (response.status === 401) {
      console.log('🔐 Token expired in getPenaltyInfo');
      await ApiErrorHandler.handleTokenExpiration();
      return {
        success: false,
        error: 'Session expired',
      };
    }

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: data.data,
      };
    } else {
      return {
        success: false,
        error: data.message || 'Failed to fetch penalty info',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error while fetching penalty info',
    };
  }
};

/**
 * Get violation history
 */
export const getViolationHistory = async (status: string | null = null, limit = 20, offset = 0) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.error('❌ No token found for getViolationHistory');
      return {
        success: false,
        error: 'No authentication token found',
      };
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (status) params.append('status', status);

    const url = `${BACKEND_URL}/api/penalty/my-violations?${params.toString()}`;
    console.log('🔍 Fetching violations from:', url);
    console.log('🔍 Using token:', token ? 'Token exists' : 'No token');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🔍 Violations API response status:', response.status);
    
    // Check for 401 - token expired
    if (response.status === 401) {
      console.log('🔐 Token expired in getViolationHistory');
      await ApiErrorHandler.handleTokenExpiration();
      return {
        success: false,
        error: 'Session expired',
      };
    }
    
    const data = await response.json();
    console.log('🔍 Violations API response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      return {
        success: true,
        data: data.data,
      };
    } else {
      console.error('❌ Violations API error:', data.message || data.error);
      return {
        success: false,
        error: data.message || 'Failed to fetch violations',
      };
    }
  } catch (error: any) {
    console.error('❌ Network error fetching violations:', error);
    return {
      success: false,
      error: error.message || 'Network error while fetching violations',
    };
  }
};

/**
 * Submit an appeal for a violation
 */
export const submitAppeal = async (violationId: number, appealReason: string) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found',
      };
    }

    console.log('🔍 Submitting appeal for violation:', violationId);
    console.log('🔍 Appeal URL:', `${BACKEND_URL}/api/penalty/appeal/${violationId}`);

    const response = await fetch(`${BACKEND_URL}/api/penalty/appeal/${violationId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ appealReason }),
    });

    console.log('🔍 Appeal Response Status:', response.status);
    
    // Check for 401 - token expired
    if (response.status === 401) {
      console.log('🔐 Token expired in submitAppeal');
      await ApiErrorHandler.handleTokenExpiration();
      return {
        success: false,
        error: 'Session expired',
      };
    }
    
    const data = await response.json();
    console.log('🔍 Appeal Response Data:', data);

    if (response.ok) {
      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } else {
      return {
        success: false,
        error: data.message || data.error || 'Failed to submit appeal',
      };
    }
  } catch (error: any) {
    console.error('❌ Appeal submission error:', error);
    return {
      success: false,
      error: error.message || 'Network error while submitting appeal',
    };
  }
};

/**
 * Get reward statistics
 */
export const getRewardStats = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found',
      };
    }

    const response = await fetch(`${BACKEND_URL}/api/penalty/my-rewards`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Check for 401 - token expired
    if (response.status === 401) {
      console.log('🔐 Token expired in getRewardStats');
      await ApiErrorHandler.handleTokenExpiration();
      return {
        success: false,
        error: 'Session expired',
      };
    }

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: data.data,
      };
    } else {
      return {
        success: false,
        error: data.message || 'Failed to fetch reward stats',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error while fetching reward stats',
    };
  }
};

/**
 * Get restoration history (points added back) from PenaltyAdjustment table
 */
export const getRestorationHistory = async (limit = 50, offset = 0) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found',
      };
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    // Fetch penalty adjustments (points restoration records)
    const response = await fetch(`${BACKEND_URL}/api/penalty/my-adjustments?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🔍 Adjustments API Response Status:', response.status);
    
    // Check for 401 - token expired
    if (response.status === 401) {
      console.log('🔐 Token expired in getRestorationHistory');
      await ApiErrorHandler.handleTokenExpiration();
      return {
        success: false,
        error: 'Session expired',
      };
    }
    
    const data = await response.json();
    console.log('🔍 Adjustments API Response Data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('🔍 Raw data object:', data);
      console.log('🔍 data.adjustments exists?', !!data.adjustments);
      console.log('🔍 data.data exists?', !!data.data);
      console.log('🔍 data.data.adjustments exists?', !!(data.data && data.data.adjustments));
      
      // Get adjustments array - check nested structure first
      let adjustmentsList = [];
      if (data.data && data.data.adjustments && Array.isArray(data.data.adjustments)) {
        // Standard API response: data.data.adjustments
        adjustmentsList = data.data.adjustments;
      } else if (data.adjustments && Array.isArray(data.adjustments)) {
        // Flat structure: data.adjustments
        adjustmentsList = data.adjustments;
      } else if (data.data && Array.isArray(data.data)) {
        // Array directly in data: data.data
        adjustmentsList = data.data;
      } else if (Array.isArray(data)) {
        // Direct array: data
        adjustmentsList = data;
      }
      
      console.log('🔍 Adjustments list length:', adjustmentsList.length);
      console.log('🔍 First adjustment sample:', adjustmentsList.length > 0 ? adjustmentsList[0] : 'none');
      
      // Filter for positive adjustments only (restorations)
      const restorations = adjustmentsList.filter((adj: any) => {
        return adj.points_adjusted > 0;
      });
      
      console.log('🔍 Filtered restorations count:', restorations.length);
      
      return {
        success: true,
        data: restorations,
      };
    } else {
      console.log('❌ Adjustments API failed:', response.status, data);
      return {
        success: false,
        error: data.message || 'Failed to fetch restoration history',
        data: [], // Return empty array if endpoint doesn't exist
      };
    }
  } catch (error: any) {
    console.log('❌ Adjustments API error:', error);
    return {
      success: false,
      error: error.message || 'Network error while fetching restoration history',
      data: [], // Return empty array on error
    };
  }
};
