import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  Linking,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView, Platform } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import homeStyles from "./components/homeStyles";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MessageService, MessageAPI } from '../utils/messageAPI';
import { Message as ApiMessage, MessagesResponse, SendMessageResponse, ApiErrorResponse, WebSocketMessage } from '../types/message.types';
import { useAuth } from '../utils/authService';
import { Socket } from 'socket.io-client';

const DirectMessage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userType, token, userId, isAuthenticated, isLoading } = useAuth();
  
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // New states for enhanced features
  const [providerPhone, setProviderPhone] = useState<string>("");
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);
  
  // Get params from navigation
  const conversationId = parseInt(params.conversationId as string) || 0;
  const participantName = params.participantName as string || "Service Provider";
  const participantPhoto = params.participantPhoto as string;
  const participantPhone = params.participantPhone as string;
  const isReadOnly = params.isReadOnly === 'true';

  useEffect(() => {
    if (!conversationId) {
      Alert.alert('Error', 'Invalid conversation');
      router.back();
      return;
    }

    if (isLoading) return; // Wait for auth state to be determined

    if (!isAuthenticated || !token || !userType || !userId) {
      Alert.alert('Authentication Required', 'Please log in to view messages');
      router.back();
      return;
    }

    // Initialize MessageService if needed
    if (!MessageService.getInstance()) {
      MessageService.initialize(token);
    }

    loadMessages();
    loadConversationDetails();
    setupSocketIO();

    // Set up periodic message refresh as fallback for Socket.IO
    const messageRefreshInterval = setInterval(() => {
      if (!socketRef.current || !socketRef.current.connected) {
        loadMessages(1);
      }
    }, 10000); // Refresh every 10 seconds if Socket.IO isn't working

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      clearInterval(messageRefreshInterval);
    };
  }, [conversationId, isAuthenticated, token, userType, userId, isLoading]);

  const loadConversationDetails = async () => {
    try {
      const messageAPI = MessageService.getInstance();
      if (!messageAPI) return;

      const result = await messageAPI.getConversationDetails(conversationId, userType as 'customer' | 'provider');
      
      if (result.success) {
        const conversation = result.data;
        
        // Extract provider phone from conversation details or navigation params
        let phoneNumber = participantPhone;
        
        if (!phoneNumber) {
          if (userType === 'customer' && conversation.provider?.provider_phone_number) {
            phoneNumber = conversation.provider.provider_phone_number;
          } else if (userType === 'provider' && conversation.customer?.phone_number) {
            phoneNumber = conversation.customer.phone_number;
          }
        }
        
        if (phoneNumber) {
          setProviderPhone(phoneNumber);
        }
      }
    } catch (error) {
      // Error loading conversation details
    }
  };

  const loadMessages = async (pageNum: number = 1) => {
    try {
      const messageAPI = MessageService.getInstance();
      if (!messageAPI) {
        Alert.alert('Error', 'Message service not initialized');
        return;
      }

      const result = await messageAPI.getMessages(conversationId, pageNum, 50);
      
      if (result.success) {
        const response = result as MessagesResponse;
        
        if (pageNum === 1) {
          const sortedMessages = response.messages.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          
          setMessages(sortedMessages);
          // Multiple scroll attempts to ensure it works after render
          setTimeout(() => scrollToBottom(), 100);
          setTimeout(() => scrollToBottom(), 300);
          setTimeout(() => scrollToBottom(), 500);
        } else {
          const sortedOlderMessages = response.messages.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          setMessages(prev => [...sortedOlderMessages, ...prev]);
        }
        setHasMore(response.pagination.has_more);
        
        // Mark messages as read
        const unreadMessages = response.messages.filter(msg => 
          !msg.is_read && userType && msg.sender_type !== userType
        );
        if (unreadMessages.length > 0) {
          markAsRead(unreadMessages.map(msg => msg.message_id));
        }
      } else {
        const error = result as ApiErrorResponse;
        Alert.alert('Error', error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const setupSocketIO = () => {
    // Don't set up Socket.IO for read-only conversations
    if (isReadOnly) {
      return;
    }

    try {
      const messageAPI = MessageService.getInstance();
      if (!messageAPI || !userId || !userType) {
        return;
      }

      // Close existing connection if any
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.disconnect();
      }

      try {
        socketRef.current = messageAPI.createWebSocket();
      } catch (socketError) {
        return;
      }
      
      // Socket.IO event handlers
      socketRef.current.on('connect', () => {
        // Don't join conversation immediately - wait for authentication first
      });

      socketRef.current.on('authenticated', (data) => {
        // Now that we're authenticated, join the conversation
        if (socketRef.current && userId && userType) {
          messageAPI.joinConversation(socketRef.current, conversationId, userId, userType);
        }
      });

      socketRef.current.on('authentication_failed', (error) => {
        // Continue with manual refresh fallback
      });

      socketRef.current.on('joined_conversation', (data) => {
        setIsSocketConnected(true);
      });

      socketRef.current.on('join_conversation_failed', (error) => {
        // Continue with manual refresh fallback
      });

      socketRef.current.on('new_message', (data) => {
        // Handle different possible data structures
        let messageToAdd = null;
        
        if (data && data.message) {
          messageToAdd = data.message;
        } else if (data && data.message_id) {
          messageToAdd = data;
        } else if (data && typeof data === 'object') {
          const hasMessageProps = data.content || data.conversation_id || data.sender_type;
          if (hasMessageProps) {
            messageToAdd = data;
          }
        }
        
        if (messageToAdd) {
          // Add new message in chronological order
          addMessageInOrder(messageToAdd);
          
          // Auto-scroll to bottom for new messages
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
          
          // Mark message as read if not from current user
          if (userType && messageToAdd.sender_type !== userType) {
            markAsRead([messageToAdd.message_id]);
          }
        }
      });

      socketRef.current.on('message_read', (data) => {
        if (data.messageId) {
          setMessages(prev => 
            prev.map(msg => 
              msg.message_id === data.messageId 
                ? { ...msg, is_read: true }
                : msg
            )
          );
        }
      });

      socketRef.current.on('disconnect', (reason) => {
        setIsSocketConnected(false);
      });

      socketRef.current.on('error', (error) => {
        // Socket.IO error - continue with manual refresh
      });

      socketRef.current.on('connect_error', (error) => {
        // Socket.IO connection failed - continue with manual refresh
      });
    } catch (error) {
      // Error setting up WebSocket - continue with manual refresh
    }
  };

  const handleSend = async () => {
    if (message.trim() === "" || sending) return;

    const messageContent = message.trim();
    setMessage("");
    setSending(true);

    try {
      const messageAPI = MessageService.getInstance();
      if (!messageAPI) {
        Alert.alert('Error', 'Message service not initialized');
        return;
      }

      const result = await messageAPI.sendMessage(
        conversationId,
        messageContent,
        'text',
        undefined,
        undefined,
        userType || undefined
      );

      if (!result.success) {
        const error = result as ApiErrorResponse;
        Alert.alert('Error', error.message);
        setMessage(messageContent);
      } else {
        const successResult = result as SendMessageResponse;
        
        // Add the sent message to the messages list immediately for instant UI update
        addMessageInOrder(successResult.data);
        scrollToBottom();
        
        // Backup refresh after a short delay to ensure consistency
        setTimeout(() => {
          loadMessages(1);
        }, 1500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      setMessage(messageContent); // Restore message if failed
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageIds: number[]) => {
    try {
      const messageAPI = MessageService.getInstance();
      if (!messageAPI) return;

      await messageAPI.markAsRead(conversationId, messageIds);
    } catch (error) {
      // Error marking messages as read
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadMessages(1);
  }, []);

  const onRefreshMessages = useCallback(() => {
    loadMessages(1);
  }, []);

  const loadMore = () => {
    if (hasMore && !loading && !refreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(nextPage);
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  // Helper function to add a message while maintaining chronological order
  const addMessageInOrder = (newMessage: ApiMessage) => {
    console.log('🔄 [ADD_MESSAGE] Attempting to add message:', newMessage.message_id);
    console.log('📝 [ADD_MESSAGE] Message content preview:', newMessage.content?.substring(0, 30) + '...');
    console.log('👤 [ADD_MESSAGE] Sender type:', newMessage.sender_type);
    console.log('📅 [ADD_MESSAGE] Created at:', newMessage.created_at);
    
    setMessages(prev => {
      console.log('📊 [ADD_MESSAGE] Current messages count before add:', prev.length);
      
      // Check if message already exists
      const messageExists = prev.some(msg => msg.message_id === newMessage.message_id);
      if (messageExists) {
        console.log('💡 [ADD_MESSAGE] Message already exists, not adding duplicate');
        return prev;
      }

      // Add message and sort to maintain chronological order
      const updatedMessages = [...prev, newMessage].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      console.log('✅ [ADD_MESSAGE] Successfully added message in chronological order');
      console.log('📊 [ADD_MESSAGE] New messages count after add:', updatedMessages.length);
      console.log('🕐 [ADD_MESSAGE] UI should update now at:', new Date().toISOString());
      
      return updatedMessages;
    });
  };

  // Phone call functionality
  const handlePhoneCall = async () => {
    if (!providerPhone) {
      Alert.alert('No Phone Number', 'Phone number not available for this provider.');
      return;
    }

    console.log('📞 Original phone number:', providerPhone);
    
    // Clean and format phone number - keep only digits and + sign
    let cleanNumber = providerPhone.replace(/[^\d+]/g, '');
    
    // Ensure the number starts with + for international format
    if (!cleanNumber.startsWith('+')) {
      // If it starts with 0, replace with +63 (Philippines)
      if (cleanNumber.startsWith('0')) {
        cleanNumber = '+63' + cleanNumber.substring(1);
      } else if (cleanNumber.length === 10) {
        // US format - add +1
        cleanNumber = '+1' + cleanNumber;
      } else if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {
        // US format with leading 1 - add +
        cleanNumber = '+' + cleanNumber;
      } else {
        // Default to Philippines format if no country code
        cleanNumber = '+63' + cleanNumber;
      }
    }
    
    const phoneUrl = `tel:${cleanNumber}`;
    console.log('📞 Formatted phone URL:', phoneUrl);

    try {
      // Android specific fix: Use platform detection and direct call
      const { Platform } = require('react-native');
      
      console.log('📞 Platform:', Platform.OS);
      console.log('📞 Phone URL:', phoneUrl);
      
      if (Platform.OS === 'android') {
        // On Android, directly show the confirmation and call
        Alert.alert(
          'Make Phone Call',
          `Call ${participantName}?\n${cleanNumber}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Call', 
              onPress: async () => {
                try {
                  console.log('📞 Android: Opening phone dialer with:', phoneUrl);
                  await Linking.openURL(phoneUrl);
                } catch (error) {
                  console.error('Android phone call failed:', error);
                  Alert.alert('Error', 'Failed to open phone dialer. Please check if the phone number is correct.');
                }
              }
            }
          ]
        );
      } else {
        // iOS - use canOpenURL check
        const canOpen = await Linking.canOpenURL(phoneUrl);
        console.log('📞 iOS - Can open phone URL:', canOpen);
        
        if (canOpen) {
          Alert.alert(
            'Make Phone Call',
            `Call ${participantName}?\n${cleanNumber}`,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Call', 
                onPress: async () => {
                  try {
                    await Linking.openURL(phoneUrl);
                  } catch (error) {
                    console.error('iOS phone call failed:', error);
                    Alert.alert('Error', 'Failed to open phone dialer. Please check if the phone number is correct.');
                  }
                }
              }
            ]
          );
        } else {
          Alert.alert(
            'Phone Call Not Available',
            `Cannot make phone calls on this device.\n\nProvider Number: ${cleanNumber}`,
            [
              { text: 'Copy Number', onPress: () => {
                console.log('Number to copy:', cleanNumber);
              }},
              { text: 'OK', style: 'default' }
            ]
          );
        }
      }
    } catch (error) {
      Alert.alert(
        'Phone Call Error', 
        `Error initiating phone call.\n\nProvider Number: ${cleanNumber}`,
        [{ text: 'OK' }]
      );
    }
  };

  // Image picker functionality
  const handleImagePicker = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to send images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await sendImageMessage(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image.');
    }
  };

  // Send image message
  const sendImageMessage = async (imageUri: string) => {
    if (sending) return;

    setSending(true);

    try {
      const messageAPI = MessageService.getInstance();
      if (!messageAPI) {
        Alert.alert('Error', 'Message service not initialized');
        return;
      }

      // Use the uploadFile method from the API
      const fileExtension = imageUri.split('.').pop() || 'jpg';
      
      // Create a file-like object for React Native
      const imageFile = {
        uri: imageUri,
        type: `image/${fileExtension}`,
        name: `image_${Date.now()}.${fileExtension}`,
      } as any;

      const result = await messageAPI.uploadFile(
        conversationId,
        imageFile,
        userType as 'customer' | 'provider'
      );
      
      console.log('📸 Image upload result:', result);

      if (result.success) {
        // Add message immediately to UI
        addMessageInOrder(result.data);
        scrollToBottom();
        
        // Backup refresh
        setTimeout(() => {
          console.log('🔄 Backup refresh after image send');
          loadMessages(1);
        }, 1500);
      } else {
        Alert.alert('Error', result.message || 'Failed to send image');
      }
    } catch (error) {
      console.error('Error sending image:', error);
      Alert.alert('Error', 'Failed to send image');
    } finally {
      setSending(false);
    }
  };

  // Image viewer functionality
  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Invalid date';
      }
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // If message is from today, show only time
    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If message is from yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.getTime() === yesterday.getTime()) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If message is older, show date and time
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  const formatDateSeparator = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }
    
    // For older dates, show full date
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    } catch (error) {
      console.error('Error formatting date separator:', error);
      return 'Invalid date';
    }
  };

  const shouldShowDateSeparator = (currentMessage: ApiMessage, previousMessage: ApiMessage | null) => {
    try {
      if (!previousMessage) return true;
      
      const currentDate = new Date(currentMessage.created_at);
      const prevDate = new Date(previousMessage.created_at);
      
      // Check if dates are valid
      if (isNaN(currentDate.getTime()) || isNaN(prevDate.getTime())) {
        return false;
      }
      
      // Show separator if messages are from different days
      return currentDate.toDateString() !== prevDate.toDateString();
    } catch (error) {
      console.error('Error checking date separator:', error);
      return false;
    }
  };

  const renderMessage = ({ item, index }: { item: ApiMessage; index: number }) => {
    const isMyMessage = userType && item.sender_type === userType;
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showDateSeparator = shouldShowDateSeparator(item, previousMessage);
    
    return (
      <View>
        {/* Date Separator */}
        {showDateSeparator && (
          <View style={{
            alignItems: 'center',
            marginVertical: 20
          }}>
            <View style={{
              backgroundColor: 'rgba(0, 128, 128, 0.1)',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(0, 128, 128, 0.2)'
            }}>
              <Text style={{
                fontSize: 13,
                color: '#008080',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                {formatDateSeparator(item.created_at)}
              </Text>
            </View>
          </View>
        )}
        
        {/* Message */}
        <View style={{ marginVertical: 4 }}>
          <View
            style={{
              alignSelf: isMyMessage ? "flex-end" : "flex-start",
              backgroundColor: isMyMessage ? "#008080" : "#e7ecec",
              padding: 12,
              borderRadius: 20,
              maxWidth: "75%",
              marginHorizontal: 10,
            }}
          >
          {item.replied_to && (
            <View style={{
              backgroundColor: isMyMessage ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
              padding: 8,
              borderRadius: 8,
              marginBottom: 8
            }}>
              <Text style={{
                fontSize: 12,
                color: isMyMessage ? "rgba(255,255,255,0.8)" : "#666",
                fontStyle: 'italic'
              }}>
                Reply to: {item.replied_to.content}
              </Text>
            </View>
          )}
          
          {item.message_type === 'image' && item.attachment_url && (
            <TouchableOpacity
              onPress={() => {
                if (item.attachment_url) {
                  setSelectedImage(item.attachment_url);
                  setImageModalVisible(true);
                }
              }}
            >
              <Image
                source={{ uri: item.attachment_url }}
                style={{
                  width: 200,
                  height: 150,
                  borderRadius: 10,
                  marginBottom: 8
                }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          
          <Text style={{ 
            color: isMyMessage ? "#fff" : "#333", 
            fontSize: 14 
          }}>
            {item.content}
          </Text>
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 4
          }}>
            <Text style={{
              fontSize: 11,
              color: isMyMessage ? "rgba(255,255,255,0.8)" : "#777",
              fontWeight: '500'
            }}>
              {formatTime(item.created_at)}
            </Text>
            
            {isMyMessage && (
              <Text style={{
                fontSize: 10,
                color: item.is_read ? "#4caf50" : "rgba(255,255,255,0.7)"
              }}>
                {item.is_read ? "✓✓" : "✓"}
              </Text>
            )}
          </View>
        </View>
      </View>
      </View>
    );
  };

  if (isLoading || (loading && messages.length === 0)) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <SafeAreaView style={[homeStyles.safeAreaHeader]}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
              <Ionicons name="arrow-back" size={24} color="#008080" />
            </TouchableOpacity>
            <Text style={[homeStyles.headerText]}>{participantName}</Text>
          </View>
        </SafeAreaView>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#008080" />
          <Text style={{ marginTop: 10, color: 'gray' }}>
            {isLoading ? 'Loading...' : 'Loading messages...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER */}
      <SafeAreaView style={[homeStyles.safeAreaHeader]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#008080" />
          </TouchableOpacity>
          
          {participantPhoto && (
            <Image
              source={{ uri: participantPhoto }}
              defaultSource={require("../assets/images/service-provider.jpg")}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                marginRight: 10
              }}
            />
          )}
          
          <View style={{ flex: 1 }}>
            <Text style={[homeStyles.headerText]}>{participantName}</Text>
          </View>
          
          {/* Call Button - Only show for active conversations */}
          {!isReadOnly && (
            <TouchableOpacity 
              onPress={handlePhoneCall} 
              style={{ 
                marginLeft: 8,
                padding: 8,
                borderRadius: 20,
                backgroundColor: 'rgba(0,128,128,0.1)'
              }}
            >
              <Ionicons name="call-outline" size={20} color="#008080" />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {/* Read-Only Banner */}
      {isReadOnly && (
        <View style={{
          backgroundColor: '#fff3cd',
          borderBottomWidth: 1,
          borderBottomColor: '#ffc107',
          paddingVertical: 12,
          paddingHorizontal: 16,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="lock-closed" size={16} color="#856404" style={{ marginRight: 8 }} />
            <Text style={{
              color: '#856404',
              fontSize: 14,
              fontWeight: '600',
              textAlign: 'center',
            }}>
              This conversation is read-only (Job completed)
            </Text>
          </View>
        </View>
      )}

      {/* CHAT */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 20}
        enabled={true}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.message_id.toString()}
          renderItem={({ item, index }) => renderMessage({ item, index })}
          contentContainerStyle={{ paddingVertical: 10 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#008080']}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={() => 
            loading && messages.length > 0 ? (
              <View style={{ padding: 10, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#008080" />
              </View>
            ) : null
          }
          ListEmptyComponent={() => 
            !loading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
                <Text style={{ fontSize: 16, color: 'gray', textAlign: 'center' }}>
                  No messages yet{'\n'}Start the conversation!
                </Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />

        {/* Input Bar - Conditional based on read-only status */}
        {isReadOnly ? (
          /* Read-Only Message Bar */
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderTopWidth: 0.5,
              borderTopColor: "#dee2e6",
              paddingVertical: 16,
              paddingHorizontal: 20,
              backgroundColor: "#f8f9fa"
            }}
          >
            <Ionicons name="lock-closed-outline" size={18} color="#6c757d" style={{ marginRight: 8 }} />
            <Text style={{
              color: "#6c757d",
              fontSize: 14,
              fontStyle: 'italic',
            }}>
              Messaging disabled for completed jobs
            </Text>
          </View>
        ) : (
          /* Active Input Bar */
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderTopWidth: 0.5,
              borderTopColor: "#b2d7d7",
              paddingBottom: Platform.OS === "ios" ? Math.max(insets.bottom, 12) : 14,
              paddingTop: 12,
              paddingHorizontal: 10,
              backgroundColor: "#fff"
            }}
          >
          {/* Image Button */}
          <TouchableOpacity
            onPress={handleImagePicker}
            style={{
              marginRight: 10,
              padding: 8,
              borderRadius: 20,
              backgroundColor: "#f0f0f0"
            }}
          >
            <Ionicons name="camera-outline" size={20} color="#008080" />
          </TouchableOpacity>
          
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            multiline
            maxLength={1000}
            style={{
              flex: 1,
              backgroundColor: "#e7ecec",
              borderRadius: 20,
              paddingHorizontal: 15,
              paddingVertical: Platform.OS === "ios" ? 14 : 12,
              fontSize: 14,
              borderWidth: 1,
              borderColor: "#b2d7d7",
              maxHeight: 100,
              minHeight: Platform.OS === "android" ? 40 : 36,
            }}
            textAlignVertical="top"
          />
          
          <TouchableOpacity
            onPress={handleSend}
            disabled={sending || message.trim() === ""}
            style={{
              marginLeft: 10,
              alignItems: "center",
              justifyContent: "center",
              opacity: (sending || message.trim() === "") ? 0.5 : 1
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#008080" />
            ) : (
              <Ionicons name="send" size={30} color="#008080" />
            )}
          </TouchableOpacity>
        </View>
        )}
      </KeyboardAvoidingView>
      
      {/* Image Viewing Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.9)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 50,
              right: 20,
              zIndex: 1,
              backgroundColor: 'rgba(255,255,255,0.3)',
              borderRadius: 20,
              padding: 10
            }}
            onPress={() => setImageModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{
                width: Dimensions.get('window').width * 0.9,
                height: Dimensions.get('window').height * 0.7
              }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default DirectMessage;
