# Mobile App Integration Guide: Penalty Score Page

## Overview
Complete guide to integrate the penalty system UI in your React Native mobile app for **both Users and Service Providers**.

---

## 📱 Features to Display

### For Both User & Provider:
1. **Current Penalty Points** (0-100 scale)
2. **Account Status** (Good Standing, At Risk, Limited, Restricted, Deactivated)
3. **Points History** (Violations & Rewards)
4. **Appeal System** (Submit appeals for violations)
5. **Reward Stats** (How to earn points back)
6. **Warning Messages** (Based on point level)
7. **Booking/Slot Limits** (Based on tier)

---

## 🎯 5-Tier Restriction System

### Tier 1: Good Standing (100-81 points)
- ✅ **Status:** Good Standing
- ✅ **Color:** Green (#10B981)
- ✅ **Restrictions:** None
- ✅ **User:** Unlimited bookings
- ✅ **Provider:** Unlimited slots per day
- 📱 **Message:** "Keep up the good work!"

### Tier 2: At Risk (80-71 points)
- ⚠️ **Status:** At Risk
- ⚠️ **Color:** Yellow (#F59E0B)
- ⚠️ **Restrictions:** None (Warning only)
- ✅ **User:** Unlimited bookings
- ✅ **Provider:** Unlimited slots per day
- 📱 **Message:** "⚠️ Your score is dropping. Maintain good behavior to avoid restrictions."
- 🔔 **Notification:** Auto-sent when dropping below 80

### Tier 3: Limited Privileges (70-61 points)
- 🟠 **Status:** Limited
- 🟠 **Color:** Orange (#FB923C)
- 🔴 **Restrictions:** Booking/Slot limits apply
- 📊 **User:** Maximum 2 appointments at a time
- 📊 **Provider:** Maximum 3 service slots per day
- 📱 **Message:** "⚠️ Limited access. You can book up to 2 appointments. Improve your score to lift restrictions."
- 🔔 **Notification:** Alert sent about limited access

### Tier 4: Heavily Restricted (60-51 points)
- 🔴 **Status:** Restricted
- 🔴 **Color:** Red (#EF4444)
- 🚫 **Restrictions:** Severe limits
- 📊 **User:** Maximum 1 appointment at a time
- 📊 **Provider:** Maximum 2 service slots per day
- 📱 **Message:** "🚫 Heavily restricted. Only 1 booking allowed. Further violations may suspend your account."
- 🔔 **Notification:** Strong warning sent

### Tier 5: Deactivated (50 or below)
- ⛔ **Status:** DEACTIVATED
- ⛔ **Color:** Dark Red (#DC2626)
- 🔒 **Restrictions:** Account deactivated
- ❌ **User:** Cannot book any appointments
- ❌ **Provider:** Cannot create any slots
- 📱 **Message:** "🔒 Your account is deactivated. Contact admin support for review and reactivation."
- 🔔 **Notification:** Immediate deactivation notice
- 📞 **Action Required:** Must contact admin to appeal

---

## 🎨 UI Components

### 1. Penalty Score Card (Main Display)

```jsx
// PenaltyScoreCard.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const PenaltyScoreCard = ({ points, isSuspended, userType }) => {
  const getStatusColor = () => {
    if (isSuspended || points <= 50) return ['#DC2626', '#991B1B']; // Dark Red - Deactivated
    if (points >= 81) return ['#10B981', '#059669']; // Green - Good Standing
    if (points >= 71) return ['#F59E0B', '#D97706']; // Yellow - At Risk
    if (points >= 61) return ['#FB923C', '#EA580C']; // Orange - Limited
    return ['#EF4444', '#DC2626']; // Red - Restricted
  };

  const getStatusText = () => {
    if (isSuspended || points <= 50) return 'DEACTIVATED';
    if (points >= 81) return 'GOOD STANDING';
    if (points >= 71) return 'AT RISK';
    if (points >= 61) return 'LIMITED';
    return 'RESTRICTED';
  };

  const getStatusMessage = () => {
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

  const getBookingLimit = () => {
    if (points <= 50) return 0;
    if (points >= 71) return null; // No limit
    if (points >= 61) return userType === 'customer' ? 2 : 3;
    return userType === 'customer' ? 1 : 2;
  };

  const bookingLimit = getBookingLimit();

  return (
    <LinearGradient
      colors={getStatusColor()}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.cardContent}>
        <Text style={styles.label}>Your Penalty Score</Text>
        <Text style={styles.points}>{points}</Text>
        <View style={styles.maxPoints}>
          <Text style={styles.maxPointsText}>/ 100</Text>
        </View>
        
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>

        <Text style={styles.message}>{getStatusMessage()}</Text>

        {/* Show booking/slot limits */}
        {bookingLimit !== null && bookingLimit > 0 && (
          <View style={styles.limitBanner}>
            <Text style={styles.limitText}>
              {userType === 'customer' 
                ? `📊 Limit: ${bookingLimit} appointment${bookingLimit > 1 ? 's' : ''} at a time`
                : `📊 Limit: ${bookingLimit} slot${bookingLimit > 1 ? 's' : ''} per day`}
            </Text>
          </View>
        )}

        {/* Show contact admin for deactivated accounts */}
        {points <= 50 && (
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>📞 Contact Admin</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 24,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardContent: {
    alignItems: 'center',
  },
  label: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  points: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  maxPoints: {
    marginTop: -16,
  },
  maxPointsText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 20,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  message: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  restrictionBanner: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  restrictionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  limitBanner: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  limitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  contactButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PenaltyScoreCard;
```

---

## 📊 API Integration

### Base Configuration

```javascript
// api/penaltyService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://your-api-url.com/api/penalty';

// Get auth token
const getAuthToken = async () => {
  return await AsyncStorage.getItem('authToken');
};

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Add auth interceptor
apiClient.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

---

### Helper Functions

#### Check Booking/Slot Limits

```javascript
// utils/penaltyLimits.js

/**
 * Get booking/slot limits based on penalty points
 */
export const getBookingLimit = (points, userType) => {
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
export const canCreateBooking = async (points, userType, currentCount) => {
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
export const getTierInfo = (points) => {
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
```

---

### API Endpoints

#### 1. Get Current Penalty Info

```javascript
// api/penaltyService.js

export const getPenaltyInfo = async () => {
  try {
    const response = await apiClient.get('/my-info');
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch penalty info',
    };
  }
};

// Response format:
// {
//   penalty_points: 85,
//   is_suspended: false,
//   suspended_at: null,
//   suspended_until: null,
//   stats: {
//     total_violations: 2,
//     total_points_deducted: 15,
//     active_violations: 1,
//     pending_appeals: 0
//   }
// }
```

#### 2. Get Violation History

```javascript
export const getViolationHistory = async (status = null, limit = 20, offset = 0) => {
  try {
    const params = { limit, offset };
    if (status) params.status = status;

    const response = await apiClient.get('/my-violations', { params });
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch violations',
    };
  }
};

// Response format:
// {
//   violations: [
//     {
//       violation_id: 123,
//       violation_type: {
//         violation_code: "USER_LATE_CANCEL",
//         violation_name: "Late Cancellation",
//         penalty_points: 10
//       },
//       penalty_points_deducted: 10,
//       violation_details: "Cancelled 2 hours before appointment",
//       status: "active",
//       appeal_status: null,
//       created_at: "2025-10-29T10:00:00Z"
//     }
//   ],
//   total: 2
// }
```

#### 3. Submit Appeal

```javascript
export const submitAppeal = async (violationId, appealReason) => {
  try {
    const response = await apiClient.post(`/appeal/${violationId}`, {
      appealReason,
    });
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to submit appeal',
    };
  }
};

// Response:
// {
//   success: true,
//   message: "Appeal submitted successfully",
//   data: { ... }
// }
```

#### 4. Get Reward Stats (User & Provider)

```javascript
export const getRewardStats = async () => {
  try {
    const response = await apiClient.get('/my-rewards');
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch reward stats',
    };
  }
};

// Response format:
// {
//   total_points_earned: 45,
//   from_bookings: 30,  // User: 5pts each, Provider: 10pts each
//   from_ratings: 15,   // 2-5 pts per rating
//   completed_bookings: 6,
//   ratings_received: 5,
//   last_reward_date: "2025-10-28T15:00:00Z"
// }
```

---

## 📱 Complete Penalty Page Component

### Full Page with All Features

```jsx
// screens/PenaltyScorePage.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import PenaltyScoreCard from '../components/PenaltyScoreCard';
import {
  getPenaltyInfo,
  getViolationHistory,
  getRewardStats,
  submitAppeal,
} from '../api/penaltyService';

const PenaltyScorePage = ({ userType }) => {
  const [penaltyInfo, setPenaltyInfo] = useState(null);
  const [violations, setViolations] = useState([]);
  const [rewardStats, setRewardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appealModalVisible, setAppealModalVisible] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [appealReason, setAppealReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [infoRes, violationsRes, rewardsRes] = await Promise.all([
        getPenaltyInfo(),
        getViolationHistory(),
        getRewardStats(),
      ]);

      if (infoRes.success) setPenaltyInfo(infoRes.data);
      if (violationsRes.success) setViolations(violationsRes.data.violations || []);
      if (rewardsRes.success) setRewardStats(rewardsRes.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load penalty information');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAppealSubmit = async () => {
    if (appealReason.trim().length < 10) {
      Alert.alert('Error', 'Appeal reason must be at least 10 characters');
      return;
    }

    const result = await submitAppeal(selectedViolation.violation_id, appealReason);
    
    if (result.success) {
      Alert.alert('Success', 'Appeal submitted successfully');
      setAppealModalVisible(false);
      setAppealReason('');
      handleRefresh();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading penalty information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Score Card */}
        {penaltyInfo && (
          <PenaltyScoreCard
            points={penaltyInfo.penalty_points}
            isSuspended={penaltyInfo.is_suspended}
            userType={userType}
          />
        )}

        {/* Statistics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard
              label="Total Violations"
              value={penaltyInfo?.stats?.total_violations || 0}
              color="#EF4444"
            />
            <StatCard
              label="Points Deducted"
              value={penaltyInfo?.stats?.total_points_deducted || 0}
              color="#F59E0B"
            />
            <StatCard
              label="Active Violations"
              value={penaltyInfo?.stats?.active_violations || 0}
              color="#DC2626"
            />
            <StatCard
              label="Pending Appeals"
              value={penaltyInfo?.stats?.pending_appeals || 0}
              color="#3B82F6"
            />
          </View>
        </View>

        {/* Rewards Section */}
        {rewardStats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎁 Rewards Earned</Text>
            <View style={styles.rewardCard}>
              <Text style={styles.rewardPoints}>+{rewardStats.total_points_earned}</Text>
              <Text style={styles.rewardLabel}>Total Points Earned</Text>
              
              <View style={styles.rewardBreakdown}>
                <RewardItem
                  icon="📦"
                  label="From Completed Bookings"
                  value={`${rewardStats.completed_bookings} bookings`}
                  points={rewardStats.from_bookings}
                />
                <RewardItem
                  icon="⭐"
                  label="From Good Ratings"
                  value={`${rewardStats.ratings_received} ratings`}
                  points={rewardStats.from_ratings}
                />
              </View>

              <Text style={styles.rewardTip}>
                {userType === 'customer'
                  ? '💡 Tip: Complete bookings to earn +5 points each!'
                  : '💡 Tip: Complete bookings (+10 pts) and get 5-star ratings (+5 pts)!'}
              </Text>
            </View>
          </View>
        )}

        {/* Violation History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Violation History</Text>
          {violations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>✨ No violations found</Text>
              <Text style={styles.emptyStateSubtext}>Keep up the good work!</Text>
            </View>
          ) : (
            violations.map((violation) => (
              <ViolationCard
                key={violation.violation_id}
                violation={violation}
                onAppeal={() => {
                  setSelectedViolation(violation);
                  setAppealModalVisible(true);
                }}
              />
            ))
          )}
        </View>

        {/* How to Improve Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💪 How to Improve Your Score</Text>
          <View style={styles.tipsCard}>
            {userType === 'customer' ? (
              <>
                <TipItem text="Complete bookings to earn +5 points each" />
                <TipItem text="Leave 5-star ratings to earn +5 points" />
                <TipItem text="Don't cancel appointments late (< 24 hours)" />
                <TipItem text="Show up to scheduled appointments" />
                <TipItem text="Be respectful to service providers" />
              </>
            ) : (
              <>
                <TipItem text="Complete bookings to earn +10 points each" />
                <TipItem text="Maintain 5-star ratings (+5 points per review)" />
                <TipItem text="Respond to messages within 2 hours" />
                <TipItem text="Show up to scheduled appointments" />
                <TipItem text="Provide quality service consistently" />
              </>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Appeal Modal */}
      <Modal
        visible={appealModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAppealModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Submit Appeal</Text>
            <Text style={styles.modalSubtitle}>
              Violation: {selectedViolation?.violation_type?.violation_name}
            </Text>

            <TextInput
              style={styles.appealInput}
              placeholder="Explain why this violation should be reversed... (min 10 characters)"
              multiline
              numberOfLines={6}
              value={appealReason}
              onChangeText={setAppealReason}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setAppealModalVisible(false);
                  setAppealReason('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAppealSubmit}
              >
                <Text style={styles.submitButtonText}>Submit Appeal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Helper Components
const StatCard = ({ label, value, color }) => (
  <View style={styles.statCard}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const RewardItem = ({ icon, label, value, points }) => (
  <View style={styles.rewardItem}>
    <Text style={styles.rewardIcon}>{icon}</Text>
    <View style={styles.rewardItemContent}>
      <Text style={styles.rewardItemLabel}>{label}</Text>
      <Text style={styles.rewardItemValue}>{value}</Text>
    </View>
    <Text style={styles.rewardItemPoints}>+{points}</Text>
  </View>
);

const ViolationCard = ({ violation, onAppeal }) => {
  const canAppeal =
    violation.status === 'active' &&
    (!violation.appeal_status || violation.appeal_status === 'rejected');

  return (
    <View style={styles.violationCard}>
      <View style={styles.violationHeader}>
        <View style={styles.violationTitleRow}>
          <Text style={styles.violationName}>
            {violation.violation_type?.violation_name}
          </Text>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsBadgeText}>
              -{violation.penalty_points_deducted}
            </Text>
          </View>
        </View>
        <Text style={styles.violationDate}>
          {new Date(violation.created_at).toLocaleDateString()}
        </Text>
      </View>

      {violation.violation_details && (
        <Text style={styles.violationDetails}>{violation.violation_details}</Text>
      )}

      <View style={styles.violationFooter}>
        <Text style={[styles.violationStatus, getStatusStyle(violation.status)]}>
          {violation.status.toUpperCase()}
        </Text>
        
        {violation.appeal_status && (
          <Text style={styles.appealStatus}>
            Appeal: {violation.appeal_status}
          </Text>
        )}

        {canAppeal && (
          <TouchableOpacity style={styles.appealButton} onPress={onAppeal}>
            <Text style={styles.appealButtonText}>Appeal</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const TipItem = ({ text }) => (
  <View style={styles.tipItem}>
    <Text style={styles.tipBullet}>•</Text>
    <Text style={styles.tipText}>{text}</Text>
  </View>
);

const getStatusStyle = (status) => {
  switch (status) {
    case 'active':
      return { color: '#DC2626' };
    case 'reversed':
      return { color: '#10B981' };
    case 'expired':
      return { color: '#6B7280' };
    default:
      return { color: '#3B82F6' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  rewardCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  rewardPoints: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
  },
  rewardLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  rewardBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardIcon: {
    fontSize: 24,
  },
  rewardItemContent: {
    flex: 1,
  },
  rewardItemLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  rewardItemValue: {
    fontSize: 12,
    color: '#6B7280',
  },
  rewardItemPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  rewardTip: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    fontSize: 13,
    color: '#92400E',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  violationCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  violationHeader: {
    marginBottom: 12,
  },
  violationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  violationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  pointsBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsBadgeText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: 'bold',
  },
  violationDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  violationDetails: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  violationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  violationStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  appealStatus: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  appealButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  appealButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  tipBullet: {
    fontSize: 20,
    color: '#3B82F6',
    marginRight: 8,
    marginTop: -2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  appealInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PenaltyScorePage;
```

---

## 🚀 Navigation Setup

### Add to Navigation Stack

```javascript
// navigation/AppNavigator.js
import PenaltyScorePage from '../screens/PenaltyScorePage';

// For User Tab Navigator
<Tab.Screen
  name="PenaltyScore"
  component={PenaltyScorePage}
  initialParams={{ userType: 'customer' }}
  options={{
    tabBarLabel: 'Score',
    tabBarIcon: ({ color, size }) => (
      <Icon name="star" size={size} color={color} />
    ),
  }}
/>

// For Provider Tab Navigator
<Tab.Screen
  name="PenaltyScore"
  component={PenaltyScorePage}
  initialParams={{ userType: 'provider' }}
  options={{
    tabBarLabel: 'Score',
    tabBarIcon: ({ color, size }) => (
      <Icon name="star" size={size} color={color} />
    ),
  }}
/>
```

---

## � Handling Booking/Slot Creation with Restrictions

### Check Before Booking (Customer)

```javascript
// screens/BookingScreen.jsx
import { canCreateBooking, getTierInfo } from '../utils/penaltyLimits';
import { getPenaltyInfo } from '../api/penaltyService';

const BookingScreen = () => {
  const [penaltyData, setPenaltyData] = useState(null);
  const [activeBookings, setActiveBookings] = useState(0);

  const handleBookNow = async () => {
    // Get current penalty info
    const penaltyResult = await getPenaltyInfo();
    if (!penaltyResult.success) {
      Alert.alert('Error', 'Failed to check penalty status');
      return;
    }

    const { penalty_points } = penaltyResult.data;
    
    // Check if user can book
    const bookingCheck = await canCreateBooking(
      penalty_points,
      'customer',
      activeBookings
    );

    if (!bookingCheck.allowed) {
      if (bookingCheck.reason === 'deactivated') {
        Alert.alert(
          'Account Deactivated',
          bookingCheck.message,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Contact Admin', onPress: () => navigation.navigate('Support') }
          ]
        );
      } else {
        Alert.alert(
          'Booking Limit Reached',
          bookingCheck.message,
          [{ text: 'OK' }]
        );
      }
      return;
    }

    // Proceed with booking
    navigation.navigate('ServiceSelection');
  };

  return (
    <View>
      {/* Show tier badge */}
      {penaltyData && (
        <TierBadge points={penaltyData.penalty_points} userType="customer" />
      )}
      
      <TouchableOpacity 
        style={styles.bookButton}
        onPress={handleBookNow}
      >
        <Text style={styles.bookButtonText}>Book Service</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Check Before Creating Slots (Provider)

```javascript
// screens/AvailabilityScreen.jsx
import { canCreateBooking, getTierInfo } from '../utils/penaltyLimits';
import { getPenaltyInfo } from '../api/penaltyService';

const AvailabilityScreen = () => {
  const [penaltyData, setPenaltyData] = useState(null);
  const [todaySlots, setTodaySlots] = useState(0);

  const handleCreateSlot = async () => {
    const penaltyResult = await getPenaltyInfo();
    if (!penaltyResult.success) {
      Alert.alert('Error', 'Failed to check penalty status');
      return;
    }

    const { penalty_points } = penaltyResult.data;
    
    // Check if provider can create slot
    const slotCheck = await canCreateBooking(
      penalty_points,
      'provider',
      todaySlots
    );

    if (!slotCheck.allowed) {
      if (slotCheck.reason === 'deactivated') {
        Alert.alert(
          'Account Deactivated',
          slotCheck.message,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Contact Admin', onPress: () => navigation.navigate('Support') }
          ]
        );
      } else {
        Alert.alert(
          'Slot Limit Reached',
          `${slotCheck.message}\n\nCurrent slots today: ${slotCheck.currentCount}/${slotCheck.limit}`,
          [{ text: 'OK' }]
        );
      }
      return;
    }

    // Proceed with slot creation
    navigation.navigate('CreateSlot');
  };

  return (
    <View>
      {penaltyData && (
        <TierBadge points={penaltyData.penalty_points} userType="provider" />
      )}
      
      <TouchableOpacity 
        style={styles.createButton}
        onPress={handleCreateSlot}
      >
        <Text style={styles.createButtonText}>Create Slot</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Tier Badge Component

```javascript
// components/TierBadge.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getTierInfo, getBookingLimit } from '../utils/penaltyLimits';

const TierBadge = ({ points, userType }) => {
  const tierInfo = getTierInfo(points);
  const limit = getBookingLimit(points, userType);

  return (
    <View style={[styles.badge, { backgroundColor: tierInfo.color }]}>
      <Text style={styles.badgeIcon}>{tierInfo.icon}</Text>
      <View style={styles.badgeContent}>
        <Text style={styles.badgeName}>{tierInfo.name}</Text>
        <Text style={styles.badgeDesc}>{tierInfo.description}</Text>
        {limit !== null && limit > 0 && (
          <Text style={styles.badgeLimit}>
            {userType === 'customer'
              ? `Max: ${limit} booking${limit > 1 ? 's' : ''} at a time`
              : `Max: ${limit} slot${limit > 1 ? 's' : ''}/day`}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  badgeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  badgeContent: {
    flex: 1,
  },
  badgeName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  badgeDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 2,
  },
  badgeLimit: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
});

export default TierBadge;
```

---

## �🔔 Push Notifications Integration

### Show penalty warnings via push notifications

```javascript
// services/notificationService.js
import * as Notifications from 'expo-notifications';
import { getTierInfo } from '../utils/penaltyLimits';

export const showPenaltyWarning = async (points, userType) => {
  const tierInfo = getTierInfo(points);
  
  // Tier 2: At Risk (80-71)
  if (points >= 71 && points <= 80) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Penalty Warning',
        body: 'Your score is dropping. Maintain good behavior to avoid restrictions.',
        data: { type: 'penalty_warning', tier: 2, points },
      },
      trigger: null,
    });
  }
  
  // Tier 3: Limited (70-61)
  if (points >= 61 && points <= 70) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🟠 Limited Access',
        body: userType === 'customer'
          ? 'You can now only book 2 appointments at a time.'
          : 'You can now only create 3 slots per day.',
        data: { type: 'penalty_limited', tier: 3, points },
      },
      trigger: null,
    });
  }
  
  // Tier 4: Restricted (60-51)
  if (points >= 51 && points <= 60) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔴 Heavily Restricted',
        body: userType === 'customer'
          ? 'Only 1 booking allowed. Further violations may suspend your account.'
          : 'Only 2 slots allowed per day. Further violations may suspend your account.',
        data: { type: 'penalty_restricted', tier: 4, points },
      },
      trigger: null,
    });
  }
  
  // Tier 5: Deactivated (50 or below)
  if (points <= 50) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⛔ Account Deactivated',
        body: 'Your account has been deactivated. Contact admin support for review.',
        data: { type: 'penalty_deactivated', tier: 5, points },
      },
      trigger: null,
    });
  }
};
```

---

## 📲 Real-time Updates (WebSocket)

### Listen for penalty updates

```javascript
// hooks/usePenaltyUpdates.js
import { useEffect } from 'react';
import io from 'socket.io-client';
import { Alert } from 'react-native';

export const usePenaltyUpdates = (userId, userType, onUpdate) => {
  useEffect(() => {
    const socket = io('http://your-api-url.com');

    socket.on('connect', () => {
      console.log('Connected to penalty updates');
    });

    socket.on('penalty_update', (data) => {
      if (
        (userType === 'customer' && data.user_id === userId) ||
        (userType === 'provider' && data.provider_id === userId)
      ) {
        Alert.alert(
          'Penalty Update',
          data.message,
          [{ text: 'OK', onPress: onUpdate }]
        );
      }
    });

    return () => socket.disconnect();
  }, [userId, userType, onUpdate]);
};

// Usage in PenaltyScorePage:
// usePenaltyUpdates(currentUserId, userType, handleRefresh);
```

---

## 🎨 Design Recommendations

### Color Palette (5-Tier System)

```javascript
const PENALTY_COLORS = {
  // Tier 1: Good Standing (100-81)
  goodStanding: '#10B981',
  
  // Tier 2: At Risk (80-71)
  atRisk: '#F59E0B',
  
  // Tier 3: Limited (70-61)
  limited: '#FB923C',
  
  // Tier 4: Restricted (60-51)
  restricted: '#EF4444',
  
  // Tier 5: Deactivated (50 or below)
  deactivated: '#DC2626',
};
```

### Status Icons

```javascript
const STATUS_ICONS = {
  tier1: '✅', // Good Standing
  tier2: '⚠️', // At Risk
  tier3: '🟠', // Limited
  tier4: '🔴', // Restricted
  tier5: '⛔', // Deactivated
};
```

### Tier-Based Gradients

```javascript
const getTierGradient = (points) => {
  if (points <= 50) return ['#DC2626', '#991B1B']; // Deactivated
  if (points >= 81) return ['#10B981', '#059669']; // Good Standing
  if (points >= 71) return ['#F59E0B', '#D97706']; // At Risk
  if (points >= 61) return ['#FB923C', '#EA580C']; // Limited
  return ['#EF4444', '#DC2626']; // Restricted
};
```

---

## ✅ Testing Checklist

### User Flow Testing:
- [ ] View current penalty score
- [ ] See correct tier badge (1-5)
- [ ] See violation history
- [ ] Submit appeal for violation
- [ ] View reward statistics
- [ ] **Tier 1 (100-81):** No restrictions shown
- [ ] **Tier 2 (80-71):** Warning notification received
- [ ] **Tier 3 (70-61):** Can only book 2 appointments
- [ ] **Tier 4 (60-51):** Can only book 1 appointment
- [ ] **Tier 5 (≤50):** Cannot book, see contact admin button
- [ ] Booking limit enforced properly
- [ ] Refresh penalty data
- [ ] Navigate back to home

### Provider Flow Testing:
- [ ] View current penalty score
- [ ] See correct tier badge (1-5)
- [ ] See provider-specific violations
- [ ] View provider rewards (+10 per booking)
- [ ] Submit appeals
- [ ] **Tier 1 (100-81):** No restrictions shown
- [ ] **Tier 2 (80-71):** Warning notification received
- [ ] **Tier 3 (70-61):** Can only create 3 slots/day
- [ ] **Tier 4 (60-51):** Can only create 2 slots/day
- [ ] **Tier 5 (≤50):** Cannot create slots, see contact admin
- [ ] Slot limit enforced properly
- [ ] See provider tips for improvement

### Notification Testing:
- [ ] Tier 2 warning notification shows
- [ ] Tier 3 limited access alert shows
- [ ] Tier 4 heavy restriction warning shows
- [ ] Tier 5 deactivation notice shows immediately

### Edge Cases:
- [ ] Points exactly at 81 (boundary test)
- [ ] Points exactly at 71 (boundary test)
- [ ] Points exactly at 61 (boundary test)
- [ ] Points exactly at 51 (boundary test)
- [ ] Points exactly at 50 (boundary test)
- [ ] Active bookings count correct
- [ ] Slot count per day accurate

---

## 🔄 State Management (Optional)

### Using Redux/Context

```javascript
// context/PenaltyContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getPenaltyInfo } from '../api/penaltyService';

const PenaltyContext = createContext();

export const PenaltyProvider = ({ children }) => {
  const [penaltyData, setPenaltyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshPenalty = async () => {
    const result = await getPenaltyInfo();
    if (result.success) {
      setPenaltyData(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshPenalty();
  }, []);

  return (
    <PenaltyContext.Provider value={{ penaltyData, loading, refreshPenalty }}>
      {children}
    </PenaltyContext.Provider>
  );
};

export const usePenalty = () => useContext(PenaltyContext);

// Usage:
// const { penaltyData, refreshPenalty } = usePenalty();
```

---

## 📱 Additional Features

### 1. Badge on Tab Icon

```javascript
// Show penalty score as badge
<Tab.Screen
  name="PenaltyScore"
  component={PenaltyScorePage}
  options={{
    tabBarBadge: penaltyData?.penalty_points,
    tabBarBadgeStyle: {
      backgroundColor: penaltyData?.penalty_points < 60 ? '#DC2626' : '#10B981'
    }
  }}
/>
```

### 2. Home Screen Widget

```javascript
// components/PenaltyScoreWidget.jsx
const PenaltyScoreWidget = ({ points, onPress }) => (
  <TouchableOpacity style={styles.widget} onPress={onPress}>
    <Text style={styles.widgetLabel}>Your Score</Text>
    <Text style={styles.widgetPoints}>{points}</Text>
  </TouchableOpacity>
);
```

---

## 📖 Error Handling

```javascript
// utils/errorHandler.js
export const handlePenaltyError = (error) => {
  if (error.response?.status === 401) {
    // Redirect to login
    return 'Please log in again';
  }
  if (error.response?.status === 403) {
    return 'Access denied. Please contact support.';
  }
  return error.message || 'An error occurred';
};
```

---

## 🎯 Summary

### For Users:
- View penalty score (0-100)
- See violations and submit appeals
- Track rewards from bookings (+5 each) and ratings
- Get warnings when below 60 points
- Understand booking restrictions

### For Providers:
- View penalty score (0-100)
- See provider-specific violations
- Track rewards from bookings (+10 each) and ratings (+2-5)
- Monitor service quality metrics
- Understand booking restrictions

### Key Endpoints:
- `GET /api/penalty/my-info` - Current score
- `GET /api/penalty/my-violations` - History
- `POST /api/penalty/appeal/:id` - Submit appeal
- `GET /api/penalty/my-rewards` - Reward stats

---

**Ready to integrate! Both user and provider apps use the same endpoints with different UI context.** 🚀
