// TypeScript interfaces for the Message API
export interface CustomerProfile {
  user_id: number;
  first_name: string;
  last_name: string;
  profile_photo?: string;
  phone_number?: string;
}

export interface ProviderProfile {
  provider_id: number;
  provider_first_name: string;
  provider_last_name: string;
  provider_profile_photo?: string;
  provider_phone_number?: string;
  provider_rating?: number;
}

export interface Message {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  sender_type: 'customer' | 'provider';
  content: string;
  message_type: 'text' | 'image' | 'document';
  attachment_url?: string;
  is_read: boolean;
  replied_to_id?: number;
  created_at: string;
  updated_at: string;
  replied_to?: {
    message_id: number;
    content: string;
    sender_type: 'customer' | 'provider';
    created_at: string;
  };
}

export interface Conversation {
  conversation_id: number;
  customer_id: number;
  provider_id: number;
  status: 'active' | 'closed' | 'archived';
  warranty_expires?: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  participant: ProviderProfile | CustomerProfile;
  last_message?: Message;
  unread_count: number;
  is_warranty_active: boolean;
  appointment_status: string;
  customer?: CustomerProfile;
  provider?: ProviderProfile;
  messages?: Message[];
  _count?: {
    messages: number;
  };
}

export interface ConversationResponse {
  success: boolean;
  conversations: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ConversationDetailsResponse {
  success: boolean;
  data: Conversation;
}

export interface MessagesResponse {
  success: boolean;
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    has_more: boolean;
  };
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: Message;
}

export interface CreateConversationResponse {
  success: boolean;
  message: string;
  data: Conversation;
}

export interface SearchMessagesResponse {
  success: boolean;
  messages: Array<Message & { conversation: Conversation }>;
  pagination: {
    page: number;
    limit: number;
    has_more: boolean;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export interface WebSocketMessage {
  type: 'new_message' | 'message_read' | 'conversation_closed' | 'join_conversation';
  message?: Message;
  messageId?: number;
  conversationId?: number;
  userId?: number;
  userType?: 'customer' | 'provider';
}