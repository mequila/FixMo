import { 
  ConversationResponse, 
  ConversationDetailsResponse, 
  MessagesResponse, 
  SendMessageResponse, 
  CreateConversationResponse, 
  SearchMessagesResponse,
  ApiErrorResponse,
  WebSocketMessage
} from '../types/message.types';
import { io, Socket } from 'socket.io-client';

// Get backend URL from environment variables (same as your existing app)
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

export class MessageAPI {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string = `${BACKEND_URL}/api`, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  // Static method to debug Socket.IO URL
  static getDebugInfo() {
    console.log('=== MessageAPI Debug Info ===');
    console.log('BACKEND_URL from env:', BACKEND_URL);
    console.log('Socket.IO URL (same as backend):', BACKEND_URL);
    console.log('Transport: Socket.IO (not raw WebSocket)');
    console.log('============================');
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T | ApiErrorResponse> {
    const fullUrl = `${this.baseUrl}${endpoint}`;
    
    try {
      console.log(`Making API request to: ${fullUrl}`);
      console.log(`Request options:`, {
        method: options.method || 'GET',
        headers: {
          'Authorization': this.token ? 'Bearer ***' : 'Not provided',
          ...options.headers,
        }
      });

      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          ...options.headers,
        },
      });

      console.log(`Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = {
            success: false,
            message: `HTTP ${response.status}: ${response.statusText}`
          };
        }
        console.error('API Error Response:', errorData);
        return errorData as ApiErrorResponse;
      }

      const data = await response.json() as T;
      console.log('API Success Response:', data);
      return data;
    } catch (error) {
      const err = error as Error;
      console.error('API Request failed:', {
        url: fullUrl,
        error: err.message || String(error),
        stack: err.stack
      });
      
      // Determine the type of error for better user feedback
      let errorMessage = 'Network error occurred';
      if (err.message?.includes('Network request failed')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
      } else if (err.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      }
      
      return {
        success: false,
        message: errorMessage
      } as ApiErrorResponse;
    }
  }

  // Conversation Management
  async getConversations(
    userType: 'customer' | 'provider', 
    page = 1, 
    limit = 20
  ): Promise<ConversationResponse | ApiErrorResponse> {
    return this.makeRequest<ConversationResponse>(
      `/messages/conversations?userType=${userType}&page=${page}&limit=${limit}`
    );
  }

  async createConversation(
    customerId: number, 
    providerId: number, 
    userType: 'customer' | 'provider'
  ): Promise<CreateConversationResponse | ApiErrorResponse> {
    return this.makeRequest<CreateConversationResponse>('/messages/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId, providerId, userType })
    });
  }

  async getConversationDetails(
    conversationId: number, 
    userType?: 'customer' | 'provider'
  ): Promise<ConversationDetailsResponse | ApiErrorResponse> {
    const query = userType ? `?userType=${userType}` : '';
    return this.makeRequest<ConversationDetailsResponse>(
      `/messages/conversations/${conversationId}${query}`
    );
  }

  async archiveConversation(conversationId: number): Promise<{ success: boolean; message: string } | ApiErrorResponse> {
    return this.makeRequest<{ success: boolean; message: string }>(
      `/messages/conversations/${conversationId}/archive`,
      { method: 'PUT' }
    );
  }

  // Message Operations
  async getMessages(
    conversationId: number, 
    page = 1, 
    limit = 50
  ): Promise<MessagesResponse | ApiErrorResponse> {
    return this.makeRequest<MessagesResponse>(
      `/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
  }

  async sendMessage(
    conversationId: number,
    content: string,
    messageType: 'text' | 'image' | 'document' = 'text',
    replyToId?: number,
    attachment?: File,
    userType?: 'customer' | 'provider'
  ): Promise<SendMessageResponse | ApiErrorResponse> {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('messageType', messageType);
    
    if (replyToId) {
      formData.append('replyToId', replyToId.toString());
    }
    
    if (attachment) {
      formData.append('attachment', attachment);
    }

    if (userType) {
      formData.append('userType', userType);
    }

    return this.makeRequest<SendMessageResponse>(
      `/messages/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        body: formData
      }
    );
  }

  async markAsRead(
    conversationId: number, 
    messageIds: number[]
  ): Promise<{ success: boolean; message: string } | ApiErrorResponse> {
    return this.makeRequest<{ success: boolean; message: string }>(
      `/messages/conversations/${conversationId}/messages/read`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageIds })
      }
    );
  }

  // File Handling
  async uploadFile(
    conversationId: number, 
    file: File, 
    senderType: 'customer' | 'provider'
  ): Promise<SendMessageResponse | ApiErrorResponse> {
    const formData = new FormData();
    formData.append('conversationId', conversationId.toString());
    formData.append('file', file);
    formData.append('senderType', senderType);

    return this.makeRequest<SendMessageResponse>('/messages/upload', {
      method: 'POST',
      body: formData
    });
  }

  // Search & Utilities
  async searchMessages(
    query: string, 
    conversationId?: number, 
    page = 1, 
    limit = 20,
    userType?: 'customer' | 'provider'
  ): Promise<SearchMessagesResponse | ApiErrorResponse> {
    let url = `/messages/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
    
    if (conversationId) {
      url += `&conversationId=${conversationId}`;
    }

    if (userType) {
      url += `&userType=${userType}`;
    }

    return this.makeRequest<SearchMessagesResponse>(url);
  }

  // Get Socket.IO URL helper method
  getSocketIOUrl(wsUrl?: string): string {
    if (wsUrl) return wsUrl;
    
    // For Socket.IO, we use the same base URL (no /ws path needed)
    return BACKEND_URL;
  }

  // Socket.IO Helper (replaces WebSocket)
  createSocketIOConnection(wsUrl?: string): Socket {
    const finalUrl = this.getSocketIOUrl(wsUrl);
    
    // Debug information
    console.log('=== Socket.IO Debug Information ===');
    console.log('BACKEND_URL:', BACKEND_URL);
    console.log('Socket.IO URL being used:', finalUrl);
    console.log('Custom wsUrl provided:', wsUrl || 'No');
    console.log('Token available:', this.token ? 'YES' : 'NO');
    console.log('Token length:', this.token ? this.token.length : 0);
    console.log('Token preview:', this.token ? `${this.token.substring(0, 20)}...` : 'NO TOKEN');
    console.log('====================================');
    
    try {
      const socket = io(finalUrl, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        forceNew: true,
        timeout: 10000,
        auth: {
          token: this.token
        },
        extraHeaders: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      // Add event listeners for debugging
      socket.on('connect', () => {
        console.log('=== Socket.IO Success ===');
        console.log('✅ Connected to:', finalUrl);
        console.log('Socket ID:', socket.id);
        console.log('========================');
        
        // STEP 1: Authenticate immediately after connection (as per new docs)
        console.log('🔐 Sending authentication...');
        console.log('📱 User type: customer (default for React Native app)');
        socket.emit('authenticate', {
          token: this.token,
          userType: 'customer' // Default to customer for this React Native app
        });
      });
      
      socket.on('authenticated', (data) => {
        console.log('=== Socket.IO Authenticated ===');
        console.log('✅ Authentication successful');
        console.log('Auth response:', data);
        console.log('User ID from auth:', data.userId);
        console.log('User Type from auth:', data.userType);
        console.log('Socket ID from auth:', data.socketId);
        console.log('==============================');
      });

      socket.on('authentication_failed', (error) => {
        console.error('=== Socket.IO Authentication Failed ===');
        console.error('❌ Authentication failed');
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Error message:', error?.message || 'No message');
        console.error('Token used:', this.token ? `${this.token.substring(0, 20)}...` : 'NO TOKEN');
        console.error('======================================');
      });

      socket.on('joined_conversation', (data) => {
        console.log('=== Successfully Joined Conversation ===');
        console.log('✅ Joined conversation:', data.conversationId);
        console.log('Room name:', data.roomName);
        console.log('Success message:', data.message);
        console.log('=======================================');
      });

      socket.on('join_conversation_failed', (error) => {
        console.error('=== Failed to Join Conversation ===');
        console.error('❌ Join failed');
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Error message:', error?.message || 'No message');
        console.error('==================================');
      });
      
      socket.on('connect_error', (error) => {
        console.error('=== Socket.IO Connection Error ===');
        console.error('Failed URL:', finalUrl);
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        console.error('=================================');
      });
      
      socket.on('disconnect', (reason) => {
        console.log('=== Socket.IO Disconnected ===');
        console.log('URL was:', finalUrl);
        console.log('Reason:', reason);
        console.log('==============================');
      });
      
      socket.on('error', (error) => {
        console.error('=== Socket.IO Error ===');
        console.error('Error:', error);
        console.error('======================');
      });
      
      return socket;
    } catch (error) {
      console.error('Failed to create Socket.IO connection:', error);
      throw error;
    }
  }

  // Legacy WebSocket method (now redirects to Socket.IO)
  createWebSocket(wsUrl?: string): Socket {
    console.log('WebSocket method called - redirecting to Socket.IO');
    return this.createSocketIOConnection(wsUrl);
  }

  // Socket.IO message helper
  joinConversation(
    socket: Socket, 
    conversationId: number, 
    userId: number, 
    userType: 'customer' | 'provider'
  ): void {
    console.log('=== Joining Conversation ===');
    console.log('Conversation ID:', conversationId);
    console.log('User ID:', userId);
    console.log('User Type:', userType);
    console.log('Socket connected:', socket.connected);
    console.log('Socket authenticated:', socket.auth);
    console.log('===========================');
    
    // Wait for authentication success before joining conversation (as per new docs)
    const attemptJoin = () => {
      console.log('🚪 Attempting to join conversation...');
      socket.emit('join_conversation', {
        conversationId: parseInt(conversationId.toString())
        // Note: userId and userType are now extracted from authenticated socket on server side
      });
    };

    if (!socket.connected) {
      console.warn('⏳ Socket not connected, waiting for connection...');
      socket.on('connect', () => {
        console.log('🔗 Socket connected, waiting for authentication...');
        // Don't join immediately - wait for authentication success
      });
    }

    // Listen for authentication success, then join conversation
    socket.on('authenticated', (data) => {
      console.log('🔐 Authentication successful, now joining conversation...');
      attemptJoin();
    });

    // If already connected and potentially authenticated, try to join
    if (socket.connected) {
      console.log('🔗 Socket already connected, attempting to join...');
      attemptJoin();
    }

    // These listeners should already be set up in createSocketIOConnection, but ensure they exist
    if (!socket.hasListeners('joined_conversation')) {
      socket.on('joined_conversation', (data) => {
        console.log('✅ Successfully joined conversation:', data);
      });
    }

    if (!socket.hasListeners('join_conversation_failed')) {
      socket.on('join_conversation_failed', (error) => {
        console.error('❌ Failed to join conversation:', error);
      });
    }
  }
}

// Create a singleton instance with token management
export class MessageService {
  private static instance: MessageAPI | null = null;

  static initialize(token: string, baseUrl?: string): MessageAPI {
    MessageService.instance = new MessageAPI(baseUrl, token);
    return MessageService.instance;
  }

  static getInstance(): MessageAPI | null {
    return MessageService.instance;
  }

  static updateToken(token: string): void {
    if (MessageService.instance) {
      // @ts-ignore - accessing private property for token update
      MessageService.instance.token = token;
    }
  }
}

export default MessageAPI;