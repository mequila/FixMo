import { View, Text, Image, TouchableOpacity, FlatList, RefreshControl, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import homeStyles from '../components/homeStyles'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { MessageService } from '../../utils/messageAPI'
import { Conversation, ConversationResponse, ApiErrorResponse, Message } from '../../types/message.types'
import { useAuth } from '../../utils/authService'
import NetworkHelper from '../../utils/networkHelper'
import { Socket } from 'socket.io-client'

const messages = () => {
  const router = useRouter()
  const { userType, token, isAuthenticated, isLoading } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  
  const socketRef = useRef<Socket | null>(null)
  
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
    setupSocketIO()
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

      const result = await messageAPI.getConversations(userType, pageNum, 20, true)
      
      if (result.success) {
        const response = result as ConversationResponse
        
        // Sort conversations: open/active chats first, then by latest message
        const sortedConversations = response.conversations.sort((a, b) => {
          // First, prioritize open/active conversations over closed ones
          const aIsClosed = a.status === 'closed' || a.status === 'archived' || 
                           a.appointment_status === 'completed' || a.appointment_status === 'cancelled'
          const bIsClosed = b.status === 'closed' || b.status === 'archived' || 
                           b.appointment_status === 'completed' || b.appointment_status === 'cancelled'
          
          if (aIsClosed !== bIsClosed) {
            return aIsClosed ? 1 : -1 // Open chats first
          }
          
          // Then sort by latest message time (most recent first)
          const aTime = new Date(a.last_message_at || a.updated_at || a.created_at).getTime()
          const bTime = new Date(b.last_message_at || b.updated_at || b.created_at).getTime()
          return bTime - aTime
        })
        
        if (pageNum === 1) {
          setConversations(sortedConversations)
        } else {
          setConversations(prev => [...prev, ...sortedConversations])
        }
        setHasMore(response.conversations.length === 20)
      } else {
        const error = result as ApiErrorResponse
        Alert.alert('Network Error', error.message)
      }
    } catch (error) {
      Alert.alert('Network Error', 'Failed to load conversations. Please check your internet connection.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const setupSocketIO = async () => {
    if (!isAuthenticated || !token || !userType) {
      return
    }

    try {
      const messageAPI = MessageService.getInstance()
      if (!messageAPI) {
        return
      }

      // Clean up existing connection
      if (socketRef.current) {
        socketRef.current.disconnect()
      }

      socketRef.current = await messageAPI.createSocketIOConnection()

      if (!socketRef.current) {
        return
      }

      // Socket event handlers
      socketRef.current.on('connect', () => {
        setIsSocketConnected(true)
      })

      socketRef.current.on('authenticated', (data) => {
        // No need to join specific conversation - listen for all conversations
      })

      socketRef.current.on('new_message', (data) => {
        
        // Update the conversation list to show new message
        let messageToProcess = null
        
        if (data && data.message) {
          messageToProcess = data.message
        } else if (data && data.message_id) {
          messageToProcess = data
        }
        
        if (messageToProcess) {
          updateConversationWithNewMessage(messageToProcess)
        }
      })

      socketRef.current.on('disconnect', () => {
        setIsSocketConnected(false)
      })

    } catch (error) {
      // Socket.IO setup failed silently
    }
  }

  const updateConversationWithNewMessage = (message: Message) => {
    setConversations(prev => {
      // Update the conversation with new message
      const updated = prev.map(conv => {
        if (conv.conversation_id === message.conversation_id) {
          return {
            ...conv,
            last_message: message,
            last_message_at: message.created_at,
            unread_count: message.sender_type !== userType ? conv.unread_count + 1 : conv.unread_count
          }
        }
        return conv
      })
      
      // Re-sort to maintain: open chats first, then by latest message
      return updated.sort((a, b) => {
        const aIsClosed = a.status === 'closed' || a.status === 'archived' || 
                         a.appointment_status === 'completed' || a.appointment_status === 'cancelled'
        const bIsClosed = b.status === 'closed' || b.status === 'archived' || 
                         b.appointment_status === 'completed' || b.appointment_status === 'cancelled'
        
        if (aIsClosed !== bIsClosed) {
          return aIsClosed ? 1 : -1
        }
        
        const aTime = new Date(a.last_message_at || a.updated_at || a.created_at).getTime()
        const bTime = new Date(b.last_message_at || b.updated_at || b.created_at).getTime()
        return bTime - aTime
      })
    })
  }

  // Cleanup Socket.IO on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

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

    // Determine if conversation is read-only (job completed/cancelled)
    const isReadOnly = conversation.status === 'closed' || 
                      conversation.status === 'archived' ||
                      conversation.appointment_status === 'completed' ||
                      conversation.appointment_status === 'cancelled'

    router.push({
      pathname: '/directMessage',
      params: {
        conversationId: conversation.conversation_id,
        participantName: getParticipantName(),
        participantPhoto: getParticipantPhoto(),
        isReadOnly: isReadOnly ? 'true' : 'false'
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
    <TouchableOpacity 
      onPress={() => openConversation(item)}
      style={{
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginVertical: 4,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <View style={[homeStyles.messagesContainer, { 
        paddingVertical: 16, 
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: 'transparent'
      }]}>
        <View style={{ position: 'relative' }}>
          <Image
            source={{
              uri: userType === 'customer' 
                ? (item.provider?.provider_profile_photo || (item.participant as any).provider_profile_photo)
                : (item.customer?.profile_photo || (item.participant as any).profile_photo)
            }}
            defaultSource={require("../../assets/images/service-provider.jpg")}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              borderWidth: 2,
              borderColor: '#f0f0f0',
            }}
          />
          {item.unread_count > 0 && (
            <View style={{
              position: 'absolute',
              top: -3,
              right: -3,
              backgroundColor: '#ff4757',
              borderRadius: 12,
              minWidth: 22,
              height: 22,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: 'white',
            }}>
              <Text style={{ 
                color: 'white', 
                fontSize: 11, 
                fontWeight: '700'
              }}>
                {item.unread_count > 99 ? '99+' : item.unread_count}
              </Text>
            </View>
          )}
          
          {/* Online status indicator */}
          <View style={{
            position: 'absolute',
            bottom: 0,
            right: 2,
            width: 14,
            height: 14,
            backgroundColor: '#4caf50',
            borderRadius: 7,
            borderWidth: 2,
            borderColor: 'white',
          }} />
        </View>

        <View style={{ marginLeft: 14, flex: 1 }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: 4
          }}>
            <Text style={{ 
              fontWeight: '700', 
              fontSize: 16,
              color: '#2c3e50',
              flex: 1,
              marginRight: 8
            }} numberOfLines={1}>
              {userType === 'customer' 
                ? `${(item.provider?.provider_first_name || (item.participant as any).provider_first_name || '')} ${(item.provider?.provider_last_name || (item.participant as any).provider_last_name || '')}`
                : `${(item.customer?.first_name || (item.participant as any).first_name || '')} ${(item.customer?.last_name || (item.participant as any).last_name || '')}`
              }
            </Text>
            {item.last_message && (
              <Text style={{ 
                color: "#7f8c8d", 
                fontSize: 11,
                fontWeight: '500'
              }}>
                {formatTime(item.last_message.created_at)}
              </Text>
            )}
          </View>

          <Text
            style={{
              color: "#7f8c8d",
              fontSize: 14,
              marginBottom: 8,
              lineHeight: 18,
            }}
            numberOfLines={2}>
            {item.last_message?.content || 'No messages yet'}
          </Text>

          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
          }}>
            {/* Show Completed/Archived status badge */}
            {(item.status === 'closed' || item.status === 'archived' || 
              item.appointment_status === 'completed' || item.appointment_status === 'cancelled') && (
              <View style={{
                backgroundColor: '#e9ecef',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 10,
              }}>
                <Text style={{
                  fontSize: 9,
                  fontWeight: '600',
                  color: '#6c757d'
                }}>
                  READ ONLY
                </Text>
              </View>
            )}
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' }}>
              {item.last_message && item.last_message.sender_type === userType && (
                <Text style={{ 
                  color: item.last_message.is_read ? '#00b894' : '#7f8c8d', 
                  fontSize: 14,
                  marginRight: 4
                }}>
                  {item.last_message.is_read ? '✓✓' : '✓'}
                </Text>
              )}
            </View>
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
    <View style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <SafeAreaView style={[homeStyles.safeAreaTabs]}>
        <Text style={[homeStyles.headerTabsText]}>
          Messages
        </Text>
      </SafeAreaView>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.conversation_id.toString()}
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingTop: 8,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00b894']}
            tintColor={'#00b894'}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={() => 
          loading && conversations.length > 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#00b894" />
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        ListEmptyComponent={() => 
          !loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
              <Ionicons name="chatbubbles-outline" size={64} color="#ddd" />
              <Text style={{ fontSize: 16, color: 'gray', textAlign: 'center', marginTop: 16 }}>
                No conversations yet{'\n'}Start a conversation with a service provider
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  )
}

export default messages