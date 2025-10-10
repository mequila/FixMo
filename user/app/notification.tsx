import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View } from "react-native";
import PageHeader from "./components/PageHeader";

type Notif = {
  id: string;
  title: string;
  body: string;
  date: string; // ISO
  unread?: boolean;
};

const mockNotifications: Notif[] = [
  {
    id: '1',
    title: 'Your Service Provider is on the way!',
    body: 'Your assigned provider is arriving in approx. 15 minutes. Be ready to receive them at the scheduled address.',
    date: new Date().toISOString(),
    unread: true,
  },
  {
    id: '2',
    title: 'Service Completed Successfully',
    body: 'Thank you for trusting FixMo! Your transaction is now completed. Please rate your provider.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    unread: false,
  },
  {
    id: '3',
    title: 'Payment Received',
    body: 'We’ve received your payment of ₱850 for the plumbing service. Your receipt is now available.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    unread: false,
  },
  {
    id: '4',
    title: 'New Service Added: Appliance Repair',
    body: 'We just added appliance repair to our service list. Check it out on the Services page.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    unread: true,
  },
  {
    id: '5',
    title: 'Reminder: Schedule Your Next Maintenance',
    body: 'It’s been 3 months since your last service. Regular maintenance keeps your home safe!',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    unread: false,
  },
  {
    id: '6',
    title: 'Promo Alert: 10% Off Electrical Services!',
    body: 'Enjoy a 10% discount on all electrical services booked this week.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    unread: true,
  },
  {
    id: '7',
    title: 'Safety Reminder',
    body: 'Always verify the provider’s TESDA certification before confirming your booking.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    unread: false,
  },
  {
    id: '8',
    title: 'FixMo App Update Available!',
    body: 'Download the latest version of FixMo for improved booking and payment performance.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    unread: true,
  },
];

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
};

const Notification = () => {
  return (
    <View style={styles.container}>
      <PageHeader title="Notifications" backRoute="/" />
      <LinearGradient
        colors={["#b2d7d7", "#ffffff", "#ffffff", "#b2d7d7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.content}>
            {mockNotifications.map((n) => (
              <View
                key={n.id}
                style={[styles.card, n.unread && styles.unreadCard]} // highlight unread
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{n.title}</Text>
                  <Text style={styles.timestamp}>{formatTime(n.date)}</Text>
                </View>

                <Text style={styles.cardBody}>{n.body}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  content: { 
    marginHorizontal: 20, 
    marginBottom: 20, 
    marginTop: 20 
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e6eded',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  // subtle highlight for unread
  unreadCard: {
    backgroundColor: '#e9fafa',
    borderColor: '#b2d7d7',
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 6 
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#222', 
    maxWidth: '80%' 
  },
  cardBody: { 
    color: '#555', 
    fontSize: 14, 
    lineHeight: 20 
  },
  timestamp: { 
    color: '#888', 
    fontSize: 12 
  },
});

export default Notification;
