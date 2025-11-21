import React from 'react';
import { useWindowDimensions } from 'react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import homeStyles from './homeStyles';

interface PageHeaderProps {
  title: string;
  backRoute?: string;
  onBack?: () => void;
  onSave?: () => void;
  showSave?: boolean;
  rightIcon?: string;
  onRightPress?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, backRoute, onBack, onSave, showSave, rightIcon, onRightPress }) => {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const handleBack = () => {
    if (onBack) return onBack();
    if (backRoute) return router.push(backRoute);
    return router.back();
  };

  // Compute a responsive font size so long titles shrink to fit instead of ellipsizing
  const BASE_FONT = (homeStyles.headerText && (homeStyles as any).headerText?.fontSize) || 20;
  const maxCharsEstimate = Math.max(10, Math.floor(width / 10)); // rough chars that fit at base font
  let titleFontSize = BASE_FONT;
  if (title && title.length > maxCharsEstimate) {
    const ratio = maxCharsEstimate / title.length;
    titleFontSize = Math.max(12, Math.floor(BASE_FONT * ratio));
  }

  return (
    <SafeAreaView style={[homeStyles.safeAreaHeader]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={handleBack} style={{ marginRight: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#008080" />
          </TouchableOpacity>
          <Text style={[homeStyles.headerText, { fontSize: titleFontSize, flexShrink: 1 }]} numberOfLines={1}>{title}</Text>
        </View>
        
        {rightIcon ? (
          <TouchableOpacity onPress={onRightPress} style={{ marginRight: 10 }}>
            <Ionicons name={rightIcon as any} size={24} color="#008080" />
          </TouchableOpacity>
        ) : showSave && (
          <TouchableOpacity onPress={onSave} style={{ marginRight: 10, paddingHorizontal: 12 }}>
            <Text style={{ color: '#008080', fontWeight: 'bold', fontSize: 20 }}>Save</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default PageHeader;
