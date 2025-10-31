import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getStatusColor, getStatusText, getStatusMessage, getBookingLimit } from '../../utils/penaltyHelpers';

interface PenaltyScoreCardProps {
  points: number;
  isSuspended: boolean;
  userType: 'customer' | 'provider';
  onContactAdmin?: () => void;
}

const PenaltyScoreCard: React.FC<PenaltyScoreCardProps> = ({ 
  points, 
  isSuspended, 
  userType,
  onContactAdmin 
}) => {
  const colors = getStatusColor(points, isSuspended);
  const statusText = getStatusText(points, isSuspended);
  const message = getStatusMessage(points, isSuspended, userType);
  const bookingLimit = getBookingLimit(points, userType);

  return (
    <LinearGradient
      colors={colors}
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
          <Text style={styles.statusText}>{statusText}</Text>
        </View>

        <Text style={styles.message}>{message}</Text>

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
          <TouchableOpacity style={styles.contactButton} onPress={onContactAdmin}>
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
