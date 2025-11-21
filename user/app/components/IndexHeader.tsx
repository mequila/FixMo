
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import homeStyles from './homeStyles';

interface IndexHeaderProps {
	title: string;
	avatarUri?: string;
	subtitle?: string;
	showNotifications?: boolean;
	onNotificationPress?: () => void;
}

const IndexHeader: React.FC<IndexHeaderProps> = ({ title, avatarUri, subtitle, showNotifications, onNotificationPress }) => {
	const router = useRouter();

	return (
		<SafeAreaView style={[homeStyles.safeArea]}>
			<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
				<View style={{ flexDirection: 'row', alignItems: 'center',  }}>
					<TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={{ marginRight: 10, paddingLeft: 10, paddingBottom: 5 }}>
						{avatarUri ? (
							<Image source={{ uri: avatarUri }} style={{ width: 70, height: 70, borderRadius: 35 }} />
						) : (
							<Ionicons name="person-circle" size={48} color="#008080" />
						)}
					</TouchableOpacity>

								<View>
									{typeof title === 'string' ? (
										// support a newline-delimited title (greeting on first line, name on second)
										(() => {
											const parts = title.split('\n');
											return (
												<>
													<Text style={[homeStyles.headerText]}>{parts[0]}</Text>
													{parts[1] ? (
														<Text style={[homeStyles.headerText, homeStyles.headerName]}>{parts[1]}</Text>
													) : null}
												</>
											);
										})()
									) : (
										<Text style={[homeStyles.headerText]}>{String(title)}</Text>
									)}

									{subtitle ? <Text style={{ color: '#666', marginTop: 2 }}>{subtitle}</Text> : null}
								</View>
				</View>

				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					{showNotifications && (
						<TouchableOpacity
							onPress={() => (onNotificationPress ? onNotificationPress() : router.push('/components/notification'))}
							style={{ marginRight: 18 }}
						>
							<Ionicons name="notifications" size={26} color="#008080" />
						</TouchableOpacity>
					)}
				</View>
			</View>
		</SafeAreaView>
	);
};

export default IndexHeader;
