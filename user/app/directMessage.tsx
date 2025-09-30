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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView, Platform } from "react-native";
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
  
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);
  
  // Get params from navigation
  const conversationId = parseInt(params.conversationId as string) || 0;
  const participantName = params.participantName as string || "Service Provider";
  const participantPhoto = params.participantPhoto as string;

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

    // Debug WebSocket URL before setup
    const messageAPI = MessageService.getInstance();
    if (messageAPI) {
      console.log('=== Pre-WebSocket Debug ===');
      MessageAPI.getDebugInfo();
      console.log('==========================');
    }

    loadMessages();
    setupSocketIO();

    // Set up periodic message refresh as fallback for Socket.IO
    const messageRefreshInterval = setInterval(() => {
      // Only refresh if Socket.IO is not connected
      if (!socketRef.current || !socketRef.current.connected) {
        console.log('Socket.IO not available, refreshing messages manually');
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

  const loadMessages = async (pageNum: number = 1) => {
    try {
      const messageAPI = MessageService.getInstance();
      if (!messageAPI) {
        Alert.alert('Error', 'Message service not initialized');
        return;
      }

      const result = await messageAPI.getMessages(conversationId, pageNum, 50);
      
      console.log('📥 Load messages result:', result);
      
      if (result.success) {
        const response = result as MessagesResponse;
        console.log(`📦 Loaded ${response.messages.length} messages for page ${pageNum}`);
        
        // Debug: Check message dates
        if (response.messages.length > 0) {
          console.log('📅 Sample message dates:');
          response.messages.slice(0, 3).forEach(msg => {
            console.log(`  - Message ${msg.message_id}: ${msg.created_at}`);
          });
        }
        
        if (pageNum === 1) {
          console.log('🔄 Refreshing messages (page 1)');
          // Sort messages by created_at to ensure proper chronological order (oldest first, newest last)
          const sortedMessages = response.messages.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          
          console.log('📊 Message order after sorting:');
          sortedMessages.slice(0, 3).forEach((msg, idx) => {
            console.log(`  ${idx + 1}. Message ${msg.message_id}: ${msg.created_at}`);
          });
          if (sortedMessages.length > 3) {
            console.log('  ... and', sortedMessages.length - 3, 'more messages');
            const lastMsg = sortedMessages[sortedMessages.length - 1];
            console.log(`  Last: Message ${lastMsg.message_id}: ${lastMsg.created_at}`);
          }
          
          setMessages(sortedMessages);
          // Use setTimeout to ensure scroll happens after render
          setTimeout(() => scrollToBottom(), 100);
        } else {
          console.log('📜 Loading more messages (pagination)');
          // For pagination, add older messages to the beginning
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
          console.log(`👁️ Marking ${unreadMessages.length} messages as read`);
          markAsRead(unreadMessages.map(msg => msg.message_id));
        }
      } else {
        const error = result as ApiErrorResponse;
        console.error('❌ Failed to load messages:', error);
        Alert.alert('Error', error.message);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const setupSocketIO = () => {
    try {
      const messageAPI = MessageService.getInstance();
      if (!messageAPI || !userId || !userType) {
        console.log('Cannot setup Socket.IO - missing dependencies:', { 
          messageAPI: !!messageAPI, 
          userId: !!userId, 
          userType: !!userType 
        });
        return;
      }

      // Close existing connection if any
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.disconnect();
      }

      try {
        console.log('=== About to create Socket.IO connection ===');
        console.log('MessageAPI instance exists:', !!messageAPI);
        socketRef.current = messageAPI.createWebSocket(); // This now returns Socket
        console.log('Socket.IO created successfully');
        console.log('Socket ID:', socketRef.current?.id);
        console.log('===========================================');
      } catch (socketError) {
        console.error('Failed to create Socket.IO connection, app will work without real-time updates:', socketError);
        return;
      }
      
      // Socket.IO event handlers
      socketRef.current.on('connect', () => {
        console.log('🔗 Socket.IO connected successfully');
        // Don't join conversation immediately - wait for authentication first
      });

      socketRef.current.on('authenticated', (data) => {
        console.log('✅ Socket.IO authentication successful:', data);
        // Now that we're authenticated, join the conversation
        if (socketRef.current && userId && userType) {
          console.log('🚪 Authentication complete, now joining conversation...');
          messageAPI.joinConversation(socketRef.current, conversationId, userId, userType);
        }
      });

      socketRef.current.on('authentication_failed', (error) => {
        console.warn('🔐 Socket.IO authentication failed - continuing without real-time updates');
        console.error('Authentication error details:', error);
        // Continue with manual refresh fallback
      });

      socketRef.current.on('joined_conversation', (data) => {
        console.log('✅ Successfully joined conversation room:', data.roomName);
        console.log('Conversation ID:', data.conversationId);
        console.log('🎉 Real-time messaging is now active!');
      });

      socketRef.current.on('join_conversation_failed', (error) => {
        console.warn('🚪 Failed to join conversation - continuing without real-time updates');
        console.error('Join error details:', error);
        console.log('📱 App will use manual refresh for message updates');
      });

      socketRef.current.on('new_message', (data) => {
        console.log('📨 Received new message via Socket.IO:', data);
        if (data.message) {
          // Add new message in chronological order
          addMessageInOrder(data.message);
          scrollToBottom();
          
          // Mark message as read if not from current user
          if (userType && data.message.sender_type !== userType) {
            markAsRead([data.message.message_id]);
          }
        }
      });

      socketRef.current.on('message_read', (data) => {
        console.log('Message read update:', data);
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
        console.log('Socket.IO disconnected:', reason);
        // Don't automatically reconnect - let the app work with manual refresh
      });

      socketRef.current.on('error', (error) => {
        console.warn('Socket.IO error - continuing without real-time updates');
        console.log('Error details:', error);
      });

      socketRef.current.on('connect_error', (error) => {
        console.warn('Socket.IO connection failed - continuing without real-time updates');
        console.log('Socket.IO error details (for debugging):', {
          connected: socketRef.current?.connected,
          id: socketRef.current?.id,
          error: error
        });
      });

      socketRef.current.on('error', (error) => {
        console.warn('Socket.IO error - continuing without real-time updates');
        console.log('Error details:', error);
      });
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
  };

  const handleSend = async () => {
    if (message.trim() === "" || sending) return;

    const messageContent = message.trim();
    setMessage(""); // Clear input immediately for better UX
    setSending(true);

    console.log('📤 Sending message...');
    console.log('Message content:', messageContent);
    console.log('Conversation ID:', conversationId);
    console.log('User Type:', userType);
    console.log('Socket.IO connected:', socketRef.current?.connected);

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

      console.log('📤 Send message API result:', result);

      if (!result.success) {
        const error = result as ApiErrorResponse;
        Alert.alert('Error', error.message);
        setMessage(messageContent); // Restore message if failed
      } else {
        // Success! Add the message immediately to UI for instant feedback
        const successResult = result as SendMessageResponse;
        console.log('✅ Message sent successfully:', successResult.data);
        console.log('📝 Message ID:', successResult.data.message_id);
        console.log('📅 Message created at:', successResult.data.created_at);
        
        // Add the sent message to the messages list immediately for instant UI update
        addMessageInOrder(successResult.data);
        scrollToBottom();
        
        // Always do a backup refresh after a short delay to ensure consistency
        // This helps if Socket.IO real-time updates aren't working properly
        setTimeout(() => {
          console.log('🔄 Doing backup message refresh for consistency');
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
      console.error('Error marking messages as read:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadMessages(1);
  }, []);

  const onRefreshMessages = useCallback(() => {
    console.log('Manual refresh triggered');
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
    setMessages(prev => {
      // Check if message already exists
      const messageExists = prev.some(msg => msg.message_id === newMessage.message_id);
      if (messageExists) {
        console.log('💡 Message already exists, not adding duplicate');
        return prev;
      }

      // Add message and sort to maintain chronological order
      const updatedMessages = [...prev, newMessage].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      console.log('✅ Added message in chronological order');
      return updatedMessages;
    });
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
            {socketRef.current?.connected && (
              <Text style={{ fontSize: 12, color: "#4caf50" }}>Online</Text>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* CHAT */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
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

        {/* Input Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderTopWidth: 0.5,
            borderTopColor: "#b2d7d7",
            paddingBottom: 14,
            paddingTop: 12,
            paddingHorizontal: 10,
            backgroundColor: "#fff"
          }}
        >
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
              paddingVertical: 14,
              fontSize: 14,
              borderWidth: 1,
              borderColor: "#b2d7d7",
              maxHeight: 100
            }}
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
      </KeyboardAvoidingView>
    </View>
  );
};

export default DirectMessage;
