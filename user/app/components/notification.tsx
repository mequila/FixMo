import Ionicons from "@expo/vector-icons/Ionicons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PageHeader from "./PageHeader";

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
    title: 'New Service Added',
    body: 'We just added appliance repair to our service list. Check it out on the Services page.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    unread: false,
  }
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.content}>
          {/* Section title - Today */}
          <Text style={styles.sectionTitle}>Today</Text>

          {mockNotifications.map((n) => (
            <View key={n.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {n.unread && <View style={styles.unreadDot} />}
                  <Text style={styles.cardTitle}>{n.title}</Text>
                </View>
                <Text style={styles.timestamp}>{formatTime(n.date)}</Text>
              </View>

              <Text style={styles.cardBody}>{n.body}</Text>

              <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                <TouchableOpacity style={styles.actionButton} onPress={() => { /* navigate to detail */ }}>
                  <Text style={styles.actionText}>View</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.ghostButton} onPress={() => { /* mark read */ }}>
                  <Ionicons name="ellipsis-horizontal" size={18} color="#008080" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    marginBottom: 20 
  },

  sectionTitle: { 
    fontWeight: '600', 
    fontSize: 18, 
    marginBottom: 12, 
    color: '#333' 
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#b2d7d7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
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
    color: '#666', 
    fontSize: 14, 
    lineHeight: 20 
  },

  timestamp: { 
    color: '#999', 
    fontSize: 12 
  },

  unreadDot: { 
    width: 10, 
    height: 10, 
    borderRadius: 6, 
    backgroundColor: '#008080', 
    marginRight: 8 
  },

  actionButton: { 
    marginTop: 0, 
    alignSelf: 'flex-start', 
    backgroundColor: '#008080', 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 20 
  },

  actionText: { 
    color: '#fff', 
    fontWeight: '700' 
  },

  ghostButton: { 
    marginTop: 0, 
    alignSelf: 'flex-start', 
    backgroundColor: 'transparent', 
    paddingVertical: 8, 
    paddingHorizontal: 8, 
    borderRadius: 20 
  },
});

  export default Notification;
