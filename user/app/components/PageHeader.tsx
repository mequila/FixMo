import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import homeStyles from './homeStyles';


interface PageHeaderProps {
  title: string;
  backRoute?: string; // kept for compatibility but we no longer render arrow
  showBack?: boolean;
  onSave?: () => void;
  showSave?: boolean;
  // optional left-side avatar (user) and subtitle/greeting
  avatarUri?: string;
  subtitle?: string;
  // optional notification icon on the right
  showNotifications?: boolean;
  onNotificationPress?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  backRoute,
  showBack = true,
  onSave,
  showSave,
  avatarUri,
  subtitle,
  showNotifications,
  onNotificationPress,
}) => {
  const router = useRouter();

  return (
    <SafeAreaView style={[homeStyles.safeAreaHeader]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {showBack && (
            <TouchableOpacity
              onPress={() => (backRoute ? router.push(backRoute) : router.back())}
              style={{ marginRight: 8, padding: 6 }}
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={26} color="#008080" />
            </TouchableOpacity>
          )}

          {/* Title / Subtitle */}
          <View style={{ flexDirection: 'column' }}>
            <Text style={[homeStyles.headerText]}>{title}</Text>
            {subtitle ? <Text style={{ color: '#666', marginTop: 2 }}>{subtitle}</Text> : null}
          </View>
        </View>

        {/* Right: notifications / save */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {showNotifications && (
            <TouchableOpacity
              onPress={() => (onNotificationPress ? onNotificationPress() : router.push('/components/notification'))}
              style={{ marginRight: 12 }}
            >
              <Ionicons name="notifications" size={26} color="#008080" />
            </TouchableOpacity>
          )}

          {showSave && (
            <TouchableOpacity onPress={onSave} style={{ marginRight: 10, paddingHorizontal: 12 }}>
              <Text style={{ color: '#008080', fontWeight: 'bold', fontSize: 16 }}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PageHeader;
