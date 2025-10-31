/**
 * Get booking/slot limits based on penalty points
 */
export const getBookingLimit = (points: number, userType: 'customer' | 'provider'): number | null => {
  if (points <= 50) return 0; // Deactivated
  if (points >= 71) return null; // No limit
  if (points >= 61) {
    return userType === 'customer' ? 2 : 3; // Limited
  }
  return userType === 'customer' ? 1 : 2; // Restricted
};

/**
 * Check if user can create a new booking/slot
 */
export const canCreateBooking = (
  points: number,
  userType: 'customer' | 'provider',
  currentCount: number
): {
  allowed: boolean;
  reason?: string;
  message?: string;
  limit?: number;
  currentCount?: number;
} => {
  const limit = getBookingLimit(points, userType);
  
  if (limit === 0) {
    return {
      allowed: false,
      reason: 'deactivated',
      message: 'Your account is deactivated. Contact admin for reactivation.',
    };
  }
  
  if (limit === null) {
    return { allowed: true };
  }
  
  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: 'limit_reached',
      message: userType === 'customer'
        ? `You can only book ${limit} appointment${limit > 1 ? 's' : ''} at a time with your current score.`
        : `You can only create ${limit} slot${limit > 1 ? 's' : ''} per day with your current score.`,
      limit,
      currentCount,
    };
  }
  
  return { allowed: true, limit, currentCount };
};

/**
 * Get tier info based on points
 */
export const getTierInfo = (points: number) => {
  if (points <= 50) {
    return {
      tier: 5,
      name: 'Deactivated',
      color: '#DC2626',
      icon: '⛔',
      description: 'Account deactivated. Contact admin.',
    };
  }
  if (points >= 81) {
    return {
      tier: 1,
      name: 'Good Standing',
      color: '#10B981',
      icon: '✅',
      description: 'No restrictions',
    };
  }
  if (points >= 71) {
    return {
      tier: 2,
      name: 'At Risk',
      color: '#F59E0B',
      icon: '⚠️',
      description: 'Warning issued. No restrictions yet.',
    };
  }
  if (points >= 61) {
    return {
      tier: 3,
      name: 'Limited',
      color: '#FB923C',
      icon: '🟠',
      description: 'Limited booking/slot privileges',
    };
  }
  return {
    tier: 4,
    name: 'Restricted',
    color: '#EF4444',
    icon: '🔴',
    description: 'Heavily restricted access',
  };
};

/**
 * Get status color for UI display
 */
export const getStatusColor = (points: number, isSuspended: boolean): [string, string] => {
  if (isSuspended || points <= 50) return ['#DC2626', '#991B1B']; // Dark Red - Deactivated
  if (points >= 81) return ['#10B981', '#059669']; // Green - Good Standing
  if (points >= 71) return ['#F59E0B', '#D97706']; // Yellow - At Risk
  if (points >= 61) return ['#FB923C', '#EA580C']; // Orange - Limited
  return ['#EF4444', '#DC2626']; // Red - Restricted
};

/**
 * Get status text
 */
export const getStatusText = (points: number, isSuspended: boolean): string => {
  if (isSuspended || points <= 50) return 'DEACTIVATED';
  if (points >= 81) return 'GOOD STANDING';
  if (points >= 71) return 'AT RISK';
  if (points >= 61) return 'LIMITED';
  return 'RESTRICTED';
};

/**
 * Get status message
 */
export const getStatusMessage = (points: number, isSuspended: boolean, userType: 'customer' | 'provider'): string => {
  if (isSuspended || points <= 50) {
    return 'Your account is deactivated. Contact admin support for review.';
  }
  if (points >= 81) {
    return 'Keep up the good work!';
  }
  if (points >= 71) {
    return '⚠️ Your score is dropping. Maintain good behavior to avoid restrictions.';
  }
  if (points >= 61) {
    return userType === 'customer' 
      ? '⚠️ Limited access. You can book up to 2 appointments at a time.'
      : '⚠️ Limited access. You can create up to 3 slots per day.';
  }
  return userType === 'customer'
    ? '🚫 Heavily restricted. Only 1 booking allowed at a time.'
    : '🚫 Heavily restricted. Only 2 slots allowed per day.';
};
