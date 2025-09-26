import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type BookingDetailsModalProps = {
  visible: boolean;
  onClose: () => void;
  booking: {
    id: number;
    name: string;
    service: string;
    price: string;
    address?: string;
    date?: string;
    followup?: boolean;
  } | null;
  followupReasons?: string[];
};

const BookingDetailsModal = ({ visible, onClose, booking, followupReasons }: BookingDetailsModalProps) => {
  const router = useRouter();

  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showFollowup, setShowFollowup] = useState(false);
  const [followupReason, setFollowupReason] = useState('');
  const [otherText, setOtherText] = useState('');
  const cancelReasons = [
    'Change of plans',
    'Found another provider',
    'Service no longer needed',
    'Price too high',
    'Other',
  ];

  if (!booking) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* X icon close button */}
          <TouchableOpacity onPress={onClose} style={styles.closeIcon} accessibilityLabel="Close">
            <Ionicons name="close" size={30} color="#008080" />
          </TouchableOpacity>
          <Text style={styles.title}>Booking Summary</Text>
          <View style={styles.row}><Text style={styles.label}>Service Provider:</Text><Text style={styles.value}>{booking.name}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Booking ID:</Text><Text style={styles.value}>{booking.id}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Service:</Text><Text style={styles.value}>{booking.service}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Address:</Text><Text style={styles.value}>{booking.address || 'N/A'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Date:</Text><Text style={styles.value}>{booking.date || 'N/A'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Price:</Text><Text style={[styles.value, { color: '#008080', fontWeight: 'bold' }]}>{booking.price}</Text></View>
          <View style={{ flexDirection: 'row-reverse', marginTop: 8 }}>
            <Text style={{ fontSize: 10, color: 'gray' }}>*Additional Charges may apply.</Text>
          </View>


          {/* Follow-up Repair Button for In Warranty */}
          {booking?.followup && !showFollowup && (
            <TouchableOpacity onPress={() => setShowFollowup(true)} style={[styles.button, { backgroundColor: '#008080', marginTop: 10 }]}> 
              <Text style={[styles.buttonText, { color: 'white' }]}>Submit Follow-up Repair</Text>
            </TouchableOpacity>
          )}

          {/* Combo box for follow-up reasons */}
          {booking?.followup && showFollowup && (
            <View style={{ marginTop: 16, width: '100%' }}>
              <Text style={{ marginBottom: 8, fontWeight: 'bold', color: '#008080' }}>Select a reason for follow-up repair:</Text>
              <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fafafa' }}>
                <Picker
                  selectedValue={followupReason}
                  onValueChange={(itemValue) => setFollowupReason(itemValue)}
                  style={{ width: '100%' }}
                >
                  <Picker.Item label="Select reason..." value="" />
                  {(followupReasons || []).map((reason) => (
                    <Picker.Item key={reason} label={reason} value={reason} />
                  ))}
                </Picker>
              </View>
              {/* Show text box if 'Other' is selected */}
              {followupReason === 'Other (please specify)' && (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontSize: 12, marginBottom: 4 }}>Please specify:</Text>
                  <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff', padding: 6 }}>
                    <TextInput
                      style={{ minHeight: 32, fontSize: 14 }}
                      numberOfLines={2}
                      multiline
                      onChangeText={setOtherText}
                      value={otherText}
                      placeholder="Enter details..."
                    />
                  </View>
                </View>
              )}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#008080', marginTop: 12 }]}
                onPress={() => {
                  // Handle follow-up repair logic here
                  setShowFollowup(false);
                  setFollowupReason('');
                  setOtherText('');
                  onClose();
                }}
                disabled={!followupReason || (followupReason === 'Other (please specify)' && !otherText)}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#ccc', marginTop: 8 }]}
                onPress={() => setShowFollowup(false)}
              >
                <Text style={[styles.buttonText, { color: '#333' }]}>Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Cancel Button (for other statuses) */}
          {!booking?.followup && !showCancel && (
            <TouchableOpacity onPress={() => setShowCancel(true)} style={[styles.button, { backgroundColor: '#a20021', marginTop: 10 }]}> 
              <Text style={[styles.buttonText, { color: 'white' }]}>Cancel Booking</Text>
            </TouchableOpacity>
          )}

          {/* Combo box for cancel reasons */}
          {!booking?.followup && showCancel && (
            <View style={{ marginTop: 16, width: '100%' }}>
              <Text style={{ marginBottom: 8, fontWeight: 'bold', color: '#a20021' }}>Select a reason for cancellation:</Text>
              <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fafafa' }}>
                <Picker
                  selectedValue={cancelReason}
                  onValueChange={(itemValue) => setCancelReason(itemValue)}
                  style={{ width: '100%' }}
                >
                  <Picker.Item label="Select reason..." value="" />
                  {cancelReasons.map((reason) => (
                    <Picker.Item key={reason} label={reason} value={reason} />
                  ))}
                </Picker>
              </View>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#a20021', marginTop: 12 }]}
                onPress={() => {
                  // Here you would handle the cancellation logic
                  setShowCancel(false);
                  setCancelReason('');
                  onClose();
                }}
                disabled={!cancelReason}
              >
                <Text style={styles.buttonText}>Confirm Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#ccc', marginTop: 8 }]}
                onPress={() => setShowCancel(false)}
              >
                <Text style={[styles.buttonText, { color: '#333' }]}>Back</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  closeIcon: {
    position: 'absolute',
    top: 5,
    right: 10,
    zIndex: 10,
    padding: 3,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderColor: '#b2d7d7',
    marginTop: 10,
  },
  title: {
    marginBottom: 10,
    fontWeight: 'bold',
    fontSize: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    color: 'gray',
    fontWeight: '500',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#008080',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default BookingDetailsModal;
