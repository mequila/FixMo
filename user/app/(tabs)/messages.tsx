import { View, Text, Image, TouchableOpacity, FlatList, RefreshControl, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import homeStyles from '../components/homeStyles'
import React, { useState, useEffect, useCallback } from 'react'
import { MessageService } from '../../utils/messageAPI'
import { Conversation, ConversationResponse, ApiErrorResponse } from '../../types/message.types'
import { useAuth } from '../../utils/authService'
import NetworkHelper from '../../utils/networkHelper'

const messages = () => {
  const router = useRouter()
  const { userType, token, isAuthenticated, isLoading } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  useEffect(() => {
    if (isLoading) return; // Don't do anything while still loading auth state

    if (!isAuthenticated || !token || !userType) {
      console.log('Authentication check failed:', { isAuthenticated, token: !!token, userType });
      setLoading(false);
      return;
    }

    // Run network diagnostics for debugging
    NetworkHelper.printDiagnostics();

    // Initialize MessageService - you should do this in your app startup
    if (!MessageService.getInstance()) {
      MessageService.initialize(token)
    }
    loadConversations()
  }, [isAuthenticated, token, userType, isLoading])

  // Add focus listener for React Navigation
  useEffect(() => {
    const focusListener = () => {
      if (isAuthenticated && token && userType) {
        console.log('Messages tab focused - refreshing conversations');
        onRefresh();
      }
    };

    // Set up initial load and periodic refresh
    focusListener();
    
    // Optional: Set up periodic refresh every 30 seconds when tab is active
    const interval = setInterval(() => {
      if (isAuthenticated && token && userType && !loading) {
        loadConversations(1);
      }
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated, token, userType])

  const loadConversations = async (pageNum: number = 1) => {
    try {
      if (!userType) {
        Alert.alert('Error', 'User type not available')
        return
      }

      const messageAPI = MessageService.getInstance()
      if (!messageAPI) {
        Alert.alert('Error', 'Message service not initialized')
        return
      }

      console.log('Loading conversations for user type:', userType, 'page:', pageNum)
      const result = await messageAPI.getConversations(userType, pageNum, 20)
      
      if (result.success) {
        const response = result as ConversationResponse
        if (pageNum === 1) {
          setConversations(response.conversations)
        } else {
          setConversations(prev => [...prev, ...response.conversations])
        }
        setHasMore(response.conversations.length === 20) // Assuming 20 is the limit
      } else {
        const error = result as ApiErrorResponse
        console.error('API Error loading conversations:', error)
        Alert.alert('Network Error', error.message)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
      Alert.alert('Network Error', 'Failed to load conversations. Please check your internet connection.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setPage(1)
    loadConversations(1)
  }, [])

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      loadConversations(nextPage)
    }
  }

  const openConversation = (conversation: Conversation) => {
    const getParticipantName = () => {
      if (userType === 'customer') {
        const provider = conversation.provider || conversation.participant as any
        return `${provider.provider_first_name || provider.first_name || ''} ${provider.provider_last_name || provider.last_name || ''}`
      } else {
        const customer = conversation.customer || conversation.participant as any
        return `${customer.first_name || ''} ${customer.last_name || ''}`
      }
    }

    const getParticipantPhoto = () => {
      if (userType === 'customer') {
        const provider = conversation.provider || conversation.participant as any
        return provider.provider_profile_photo || provider.profile_photo
      } else {
        const customer = conversation.customer || conversation.participant as any
        return customer.profile_photo
      }
    }

    router.push({
      pathname: '/directMessage',
      params: {
        conversationId: conversation.conversation_id,
        participantName: getParticipantName(),
        participantPhoto: getParticipantPhoto()
      }
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity onPress={() => openConversation(item)}>
      <View style={[homeStyles.messagesContainer, { paddingVertical: 12 }]}>
        <View style={{ position: 'relative' }}>
          <Image
            source={{
              uri: userType === 'customer' 
                ? (item.provider?.provider_profile_photo || (item.participant as any).provider_profile_photo)
                : (item.customer?.profile_photo || (item.participant as any).profile_photo)
            }}
            defaultSource={require("../../assets/images/service-provider.jpg")}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30
            }}
          />
          {item.unread_count > 0 && (
            <View style={{
              position: 'absolute',
              top: -5,
              right: -5,
              backgroundColor: '#008080',
              borderRadius: 10,
              minWidth: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                {item.unread_count > 99 ? '99+' : item.unread_count}
              </Text>
            </View>
          )}
        </View>

        <View style={{ marginLeft: 15, flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontWeight: '600', fontSize: 16 }}>
              {userType === 'customer' 
                ? `${(item.provider?.provider_first_name || (item.participant as any).provider_first_name || '')} ${(item.provider?.provider_last_name || (item.participant as any).provider_last_name || '')}`
                : `${(item.customer?.first_name || (item.participant as any).first_name || '')} ${(item.customer?.last_name || (item.participant as any).last_name || '')}`
              }
            </Text>
            {item.last_message && (
              <Text style={{ color: "gray", fontSize: 12 }}>
                {formatTime(item.last_message.created_at)}
              </Text>
            )}
          </View>

          <Text
            style={{
              color: "gray",
              fontSize: 14,
              marginTop: 4,
            }}
            numberOfLines={2}>
            {item.last_message?.content || 'No messages yet'}
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <View style={{
              backgroundColor: item.is_warranty_active ? '#e8f5e8' : '#fee8e8',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 10
            }}>
              <Text style={{
                fontSize: 10,
                color: item.is_warranty_active ? '#2e7d32' : '#c62828'
              }}>
                {item.is_warranty_active ? '🛡️ Warranty Active' : '❌ Expired'}
              </Text>
            </View>
            {item.last_message && item.last_message.sender_type === userType && (
              <Text style={{ color: item.last_message.is_read ? '#008080' : 'gray', fontSize: 12 }}>
                {item.last_message.is_read ? '✓✓' : '✓'}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  // Show loading while auth is being determined
  if (isLoading || (loading && conversations.length === 0)) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff", justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#008080" />
        <Text style={{ marginTop: 10, color: 'gray' }}>
          {isLoading ? 'Loading...' : 'Loading conversations...'}
        </Text>
      </View>
    )
  }

  // Show authentication required message only if not loading and not authenticated
  if (!isLoading && (!isAuthenticated || !token || !userType)) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff", justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="chatbubble-outline" size={64} color="#ccc" />
        <Text style={{ marginTop: 20, fontSize: 18, color: 'gray', textAlign: 'center' }}>
          Authentication Required
        </Text>
        <Text style={{ marginTop: 10, fontSize: 14, color: 'gray', textAlign: 'center', paddingHorizontal: 40 }}>
          Please log in to view your messages
        </Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ marginHorizontal: 20, marginTop: 20, flex: 1 }}>
        <Text style={{
          fontWeight: '600', 
          fontSize: 20,
          marginBottom: 20
        }}>
          Messages
        </Text>

        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.conversation_id.toString()}
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
            loading && conversations.length > 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#008080" />
              </View>
            ) : null
          }
          ListEmptyComponent={() => 
            !loading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
                <Text style={{ fontSize: 16, color: 'gray', textAlign: 'center' }}>
                  No conversations yet{'\n'}Start a conversation with a service provider
                </Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  )
}

export default messages