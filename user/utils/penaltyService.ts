import AsyncStorage from '@react-native-async-storage/async-storage';

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

    const response = await fetch(`${BACKEND_URL}/api/penalty/my-violations?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: data.data,
      };
    } else {
      return {
        success: false,
        error: data.message || 'Failed to fetch violations',
      };
    }
  } catch (error: any) {
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

    const response = await fetch(`${BACKEND_URL}/api/penalty/appeal/${violationId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ appealReason }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: data.data,
      };
    } else {
      return {
        success: false,
        error: data.message || 'Failed to submit appeal',
      };
    }
  } catch (error: any) {
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
