import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { registerForPushNotificationsAsync } from '../utils/pushNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export default function TestPushNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
    console.log(message);
  };

  const testRegistration = async () => {
    try {
      setLogs([]);
      addLog('🧪 Starting push notification test...');
      
      // Check device
      addLog(`📱 Is Physical Device: ${Device.isDevice}`);
      addLog(`📱 Device Name: ${Device.deviceName}`);
      addLog(`📱 OS: ${Device.osName} ${Device.osVersion}`);
      
      // Check project ID
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
      addLog(`🔑 Project ID: ${projectId}`);
      
      // Check if user is logged in
      const userId = await AsyncStorage.getItem('userId');
      addLog(`👤 User ID: ${userId || 'Not logged in'}`);
      
      // Attempt registration
      addLog('📡 Attempting to register for push notifications...');
      const pushToken = await registerForPushNotificationsAsync();
      
      if (pushToken) {
        setToken(pushToken);
        addLog('✅ SUCCESS! Token obtained!');
        addLog(`📱 Token: ${pushToken}`);
        
        Alert.alert(
          'Success! 🎉',
          `Token obtained!\n\n${pushToken.substring(0, 30)}...`,
          [
            { text: 'Copy Token', onPress: () => copyToken(pushToken) },
            { text: 'OK' }
          ]
        );
      } else {
        addLog('❌ Failed to obtain token');
        addLog('ℹ️ Check the logs above for the reason');
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`);
      console.error('Test error:', error);
    }
  };

  const copyToken = (token: string) => {
    // On web, you can use navigator.clipboard
    // On mobile, you'll need expo-clipboard
    console.log('Token to copy:', token);
    Alert.alert('Token', token);
  };

  const checkStoredToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('expo_push_token');
      const isRegistered = await AsyncStorage.getItem('push_token_registered');
      
      addLog('📦 Checking stored data...');
      addLog(`Stored Token: ${storedToken ? storedToken.substring(0, 30) + '...' : 'None'}`);
      addLog(`Is Registered with Backend: ${isRegistered}`);
      
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      addLog(`❌ Error checking storage: ${error}`);
    }
  };

  const clearStoredData = async () => {
    try {
      await AsyncStorage.removeItem('expo_push_token');
      await AsyncStorage.removeItem('push_token_registered');
      addLog('🗑️ Cleared stored push notification data');
      setToken(null);
      Alert.alert('Cleared', 'Push notification data cleared. You can test registration again.');
    } catch (error) {
      addLog(`❌ Error clearing: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Push Notification Test</Text>
      <Text style={styles.subtitle}>Use this screen to test push notification registration</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testRegistration}>
          <Text style={styles.buttonText}>🧪 Test Registration</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={checkStoredToken}>
          <Text style={styles.buttonText}>📦 Check Stored Token</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={clearStoredData}>
          <Text style={styles.buttonText}>🗑️ Clear Stored Data</Text>
        </TouchableOpacity>
      </View>

      {token && (
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenLabel}>Current Token:</Text>
          <Text style={styles.tokenText} selectable>{token}</Text>
        </View>
      )}

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Logs:</Text>
        <ScrollView style={styles.logsScroll}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>{log}</Text>
          ))}
        </ScrollView>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ Important Notes:</Text>
        <Text style={styles.infoText}>• Push notifications only work on physical devices</Text>
        <Text style={styles.infoText}>• Emulators/simulators will always fail</Text>
        <Text style={styles.infoText}>• You must be logged in for full functionality</Text>
        <Text style={styles.infoText}>• Check console logs for detailed output</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#008080',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tokenContainer: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  tokenLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2e7d32',
  },
  tokenText: {
    fontSize: 12,
    color: '#1b5e20',
    fontFamily: 'monospace',
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  logsScroll: {
    flex: 1,
  },
  logText: {
    fontSize: 12,
    marginBottom: 4,
    color: '#555',
    fontFamily: 'monospace',
  },
  infoBox: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#856404',
  },
  infoText: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 4,
  },
});
