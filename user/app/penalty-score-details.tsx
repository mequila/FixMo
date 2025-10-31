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
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AnimatedScoreCircle from './components/AnimatedScoreCircle';
import {
  getPenaltyInfo,
  getViolationHistory,
  getRewardStats,
  submitAppeal,
} from '../utils/penaltyService';
import { useRouter } from 'expo-router';
import { getStatusText, getStatusColor } from '../utils/penaltyHelpers';

const PenaltyScorePage = () => {
  const router = useRouter();
  const [penaltyInfo, setPenaltyInfo] = useState<any>(null);
  const [violations, setViolations] = useState<any[]>([]);
  const [filteredViolations, setFilteredViolations] = useState<any[]>([]);
  const [rewardStats, setRewardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appealModalVisible, setAppealModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<any>(null);
  const [appealReason, setAppealReason] = useState('');
  const [submittingAppeal, setSubmittingAppeal] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days' | '90days'>('all');

  const userType = 'customer'; // This could come from user context/profile

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterViolationsByDate();
  }, [violations, dateFilter]);

  const filterViolationsByDate = () => {
    if (dateFilter === 'all') {
      setFilteredViolations(violations);
      return;
    }

    const now = new Date();
    let daysAgo = 0;

    switch (dateFilter) {
      case '7days':
        daysAgo = 7;
        break;
      case '30days':
        daysAgo = 30;
        break;
      case '90days':
        daysAgo = 90;
        break;
    }

    const cutoffDate = new Date(now.setDate(now.getDate() - daysAgo));
    const filtered = violations.filter(v => new Date(v.created_at) >= cutoffDate);
    setFilteredViolations(filtered);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [infoRes, violationsRes, rewardsRes] = await Promise.all([
        getPenaltyInfo(),
        getViolationHistory(),
        getRewardStats(),
      ]);

      console.log('Penalty Info Response:', infoRes);
      if (infoRes.success) {
        setPenaltyInfo(infoRes.data);
        console.log('Penalty Info Set:', infoRes.data);
      }
      if (violationsRes.success) setViolations(violationsRes.data.violations || []);
      if (rewardsRes.success) setRewardStats(rewardsRes.data);
    } catch (error) {
      console.error('Error loading penalty data:', error);
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

    setSubmittingAppeal(true);
    const result = await submitAppeal(selectedViolation.violation_id, appealReason);
    setSubmittingAppeal(false);
    
    if (result.success) {
      Alert.alert('Success', 'Appeal submitted successfully');
      setAppealModalVisible(false);
      setAppealReason('');
      handleRefresh();
    } else {
      Alert.alert('Error', result.error || 'Failed to submit appeal');
    }
  };

  const handleContactAdmin = () => {
    Alert.alert(
      'Contact Admin',
      'Please contact our support team for account reactivation.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go to Support', onPress: () => router.push('/contactUs') }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#399d9d" />
        <Text style={styles.loadingText}>Loading penalty information...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#e7ecec" />
      <SafeAreaView style={{ flex: 0, backgroundColor: '#e7ecec' }} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#399d9d" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fix-Score</Text>
          <TouchableOpacity onPress={() => setInfoModalVisible(true)} style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={24} color="#399d9d" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Animated Score Circle Section */}
          <View style={styles.scoreSection}>
            <View style={styles.circleContainer}>
              <AnimatedScoreCircle score={penaltyInfo?.penalty_points || 100} />
            </View>
            <Text style={styles.scoreLabel}>Your Fix-Score</Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status: </Text>
              <Text style={[styles.statusValue, { color: getStatusColor(penaltyInfo?.penalty_points || 100, penaltyInfo?.is_suspended || false)[0] }]}>
                {getStatusText(penaltyInfo?.penalty_points || 100, penaltyInfo?.is_suspended || false)}
              </Text>
            </View>
            {penaltyInfo?.last_updated && (
              <Text style={styles.lastUpdated}>
                Last updated: {new Date(penaltyInfo.last_updated).toLocaleDateString()}
              </Text>
            )}
            {penaltyInfo?.is_suspended && (
              <View style={styles.suspendedBanner}>
                <Ionicons name="warning" size={20} color="#DC2626" />
                <Text style={styles.suspendedText}>Account Suspended</Text>
              </View>
            )}
          </View>

          {/* Violation History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Violation History</Text>
            
            {/* Date Filter Buttons */}
            <View style={styles.filterContainer}>
              <TouchableOpacity 
                style={[styles.filterButton, dateFilter === 'all' && styles.filterButtonActive]}
                onPress={() => setDateFilter('all')}
              >
                <Text style={[styles.filterButtonText, dateFilter === 'all' && styles.filterButtonTextActive]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, dateFilter === '7days' && styles.filterButtonActive]}
                onPress={() => setDateFilter('7days')}
              >
                <Text style={[styles.filterButtonText, dateFilter === '7days' && styles.filterButtonTextActive]}>7 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, dateFilter === '30days' && styles.filterButtonActive]}
                onPress={() => setDateFilter('30days')}
              >
                <Text style={[styles.filterButtonText, dateFilter === '30days' && styles.filterButtonTextActive]}>30 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, dateFilter === '90days' && styles.filterButtonActive]}
                onPress={() => setDateFilter('90days')}
              >
                <Text style={[styles.filterButtonText, dateFilter === '90days' && styles.filterButtonTextActive]}>90 Days</Text>
              </TouchableOpacity>
            </View>

            {filteredViolations.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>✨ No violations found</Text>
                <Text style={styles.emptyStateSubtext}>
                  {dateFilter === 'all' ? 'Keep up the good work!' : 'No violations in this period'}
                </Text>
              </View>
            ) : (
              filteredViolations.map((violation) => (
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
              <TipItem text="Complete bookings to earn +5 points each" />
              <TipItem text="Leave 5-star ratings to earn +5 points" />
              <TipItem text="Don't cancel appointments late (< 24 hours)" />
              <TipItem text="Show up to scheduled appointments" />
              <TipItem text="Be respectful to service providers" />
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
                  disabled={submittingAppeal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleAppealSubmit}
                  disabled={submittingAppeal}
                >
                  {submittingAppeal ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Appeal</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Fix-Score Info Modal */}
        <Modal
          visible={infoModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setInfoModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.infoModalContent}>
              <View style={styles.infoModalHeader}>
                <Text style={styles.infoModalTitle}>How Fix-Score Works</Text>
                <TouchableOpacity onPress={() => setInfoModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Good Standing Tier */}
                <View style={styles.tierCard}>
                  <View style={[styles.tierBadge, { backgroundColor: '#D1FAE5' }]}>
                    <Text style={[styles.tierBadgeText, { color: '#065F46' }]}>100-81 Points</Text>
                  </View>
                  <Text style={styles.tierTitle}>✅ Good Standing</Text>
                  <Text style={styles.tierDescription}>
                    Your account is in excellent condition. You have full access to all booking features without any restrictions. Keep up the good work!
                  </Text>
                  <Text style={styles.tierRestriction}>• No booking limits</Text>
                  <Text style={styles.tierRestriction}>• Full platform access</Text>
                </View>

                {/* At Risk Tier */}
                <View style={styles.tierCard}>
                  <View style={[styles.tierBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.tierBadgeText, { color: '#92400E' }]}>80-71 Points</Text>
                  </View>
                  <Text style={styles.tierTitle}>⚠️ At Risk</Text>
                  <Text style={styles.tierDescription}>
                    Your account has entered the warning level. You'll receive notifications reminding you to avoid late cancellations or no-shows.
                  </Text>
                  <Text style={styles.tierRestriction}>• No restrictions yet</Text>
                  <Text style={styles.tierRestriction}>• Marked as "At Risk" for admin</Text>
                </View>

                {/* Limited Tier */}
                <View style={styles.tierCard}>
                  <View style={[styles.tierBadge, { backgroundColor: '#FED7AA' }]}>
                    <Text style={[styles.tierBadgeText, { color: '#9A3412' }]}>70-61 Points</Text>
                  </View>
                  <Text style={styles.tierTitle}>🔶 Limited Access</Text>
                  <Text style={styles.tierDescription}>
                    Your privileges are now limited due to repeated violations. Improve your score to regain full access.
                  </Text>
                  <Text style={styles.tierRestriction}>• Maximum 2 bookings at a time</Text>
                  <Text style={styles.tierRestriction}>• Booking restrictions active</Text>
                </View>

                {/* Restricted Tier */}
                <View style={styles.tierCard}>
                  <View style={[styles.tierBadge, { backgroundColor: '#FECACA' }]}>
                    <Text style={[styles.tierBadgeText, { color: '#991B1B' }]}>60-51 Points</Text>
                  </View>
                  <Text style={styles.tierTitle}>🚫 Restricted</Text>
                  <Text style={styles.tierDescription}>
                    Serious warning! Your booking access is severely limited. Continued violations may result in account suspension.
                  </Text>
                  <Text style={styles.tierRestriction}>• Maximum 1 booking at a time</Text>
                  <Text style={styles.tierRestriction}>• Last warning before deactivation</Text>
                </View>

                {/* Deactivated Tier */}
                <View style={styles.tierCard}>
                  <View style={[styles.tierBadge, { backgroundColor: '#FEE2E2' }]}>
                    <Text style={[styles.tierBadgeText, { color: '#7F1D1D' }]}>≤50 Points</Text>
                  </View>
                  <Text style={styles.tierTitle}>❌ Account Deactivated</Text>
                  <Text style={styles.tierDescription}>
                    Your account has been automatically deactivated. You must contact the admin for review or appeal before reactivation.
                  </Text>
                  <Text style={styles.tierRestriction}>• No booking access</Text>
                  <Text style={styles.tierRestriction}>• Contact admin required</Text>
                </View>

                <View style={styles.infoTipsBox}>
                  <Text style={styles.infoTipsTitle}>💡 How to Improve Your Score:</Text>
                  <Text style={styles.infoTip}>• Complete bookings on time (+5 points each)</Text>
                  <Text style={styles.infoTip}>• Receive good ratings (+5 points per 5-star)</Text>
                  <Text style={styles.infoTip}>• Avoid late cancellations (&lt; 24 hours)</Text>
                  <Text style={styles.infoTip}>• Show up to scheduled appointments</Text>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.infoModalCloseButton}
                onPress={() => setInfoModalVisible(false)}
              >
                <Text style={styles.infoModalCloseButtonText}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

// Helper Components
const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <View style={styles.statCard}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const RewardItem = ({ icon, label, value, points }: any) => (
  <View style={styles.rewardItem}>
    <Text style={styles.rewardIcon}>{icon}</Text>
    <View style={styles.rewardItemContent}>
      <Text style={styles.rewardItemLabel}>{label}</Text>
      <Text style={styles.rewardItemValue}>{value}</Text>
    </View>
    <Text style={styles.rewardItemPoints}>+{points}</Text>
  </View>
);

const ViolationCard = ({ violation, onAppeal }: any) => {
  const canAppeal =
    violation.status === 'active' &&
    (!violation.appeal_status || violation.appeal_status === 'rejected');

  const getStatusStyle = (status: string) => {
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

  // Get points deducted - try multiple possible field names
  const pointsDeducted = violation.penalty_points_deducted || 
                        violation.points_deducted || 
                        violation.penalty_points || 
                        violation.points || 0;

  return (
    <View style={styles.violationCard}>
      <View style={styles.violationHeader}>
        <View style={styles.violationTitleRow}>
          <Text style={styles.violationName}>
            {violation.violation_type?.violation_name || violation.violation_name || 'Violation'}
          </Text>
          <View style={styles.badgeContainer}>
            {violation.status === 'confirmed' && (
              <View style={styles.confirmedBadge}>
                <Text style={styles.confirmedBadgeText}>Confirmed</Text>
              </View>
            )}
            {violation.status === 'reversed' && (
              <View style={styles.reversedBadge}>
                <Text style={styles.reversedBadgeText}>Reversed</Text>
              </View>
            )}
            {violation.status === 'expired' && (
              <View style={styles.expiredBadge}>
                <Text style={styles.expiredBadgeText}>Expired</Text>
              </View>
            )}
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>
                -{pointsDeducted} pts
              </Text>
            </View>
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

const TipItem = ({ text }: { text: string }) => (
  <View style={styles.tipItem}>
    <Text style={styles.tipBullet}>•</Text>
    <Text style={styles.tipText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#e7ecec',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 5,
  },
  infoButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
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
  scoreSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  circleContainer: {
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  suspendedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  suspendedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginLeft: 8,
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
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#008080',
    borderColor: '#008080',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  confirmedBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confirmedBadgeText: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '600',
  },
  reversedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reversedBadgeText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '600',
  },
  expiredBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiredBadgeText: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '600',
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
    color: '#399d9d',
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
    backgroundColor: '#399d9d',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Info Modal Styles
  infoModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 0,
    width: '90%',
    maxHeight: '85%',
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  tierCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  tierDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  tierRestriction: {
    fontSize: 13,
    color: '#374151',
    marginLeft: 8,
    marginTop: 4,
  },
  infoTipsBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  infoTipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 12,
  },
  infoTip: {
    fontSize: 14,
    color: '#1E40AF',
    marginTop: 6,
  },
  infoModalCloseButton: {
    backgroundColor: '#008080',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    margin: 20,
    marginTop: 0,
  },
  infoModalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PenaltyScorePage;
