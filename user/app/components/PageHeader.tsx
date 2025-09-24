import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import homeStyles from './homeStyles';


interface PageHeaderProps {
  title: string;
  backRoute: string;
  onSave?: () => void;
  showSave?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, backRoute, onSave, showSave }) => {
  const router = useRouter();
  return (
    <SafeAreaView style={[homeStyles.safeAreaHeader]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.push(backRoute)} style={{ marginRight: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#008080" />
          </TouchableOpacity>
          <Text style={[homeStyles.headerText]}>{title}</Text>
        </View>
        {showSave && (
          <TouchableOpacity onPress={onSave} style={{ marginRight: 10, paddingHorizontal: 12 }}>
            <Text style={{ color: '#008080', fontWeight: 'bold', fontSize: 20 }}>Save</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default PageHeader;
