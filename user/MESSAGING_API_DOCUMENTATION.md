# 💬 Message API Documentation

## Overview
This comprehensive guide covers the messaging system for the Fixmo app. The messaging system enables real-time communication between customers and service providers, with warranty-based conversation management and WebSocket support for instant messaging.

## Base URL
```
/api/messages
```

## Authentication
All endpoints require JWT authentication:
```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

**Note**: The token automatically provides `userId` and `userType` ('customer' or 'provider')

---

## Table of Contents
1. [Get Conversations](#1-get-conversations)
2. [Create Conversation](#2-create-conversation)
3. [Get Conversation Details](#3-get-conversation-details)
4. [Get Messages](#4-get-messages)
5. [Send Message](#5-send-message)
6. [Upload File Message](#6-upload-file-message)
7. [Mark Messages as Read](#7-mark-messages-as-read)
8. [Archive Conversation](#8-archive-conversation)
9. [Search Messages](#9-search-messages)
10. [WebSocket Integration](#websocket-integration)
11. [Error Codes](#error-codes)
12. [React Native Examples](#react-native-examples)

---

## 1. Get Conversations

Get all conversations for the authenticated user (customer or provider).

### Endpoint
```
GET /api/messages/conversations
```

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| userType | string | Yes* | - | 'customer' or 'provider' (*if not in token) |
| page | number | No | 1 | Page number for pagination |
| limit | number | No | 20 | Number of conversations per page |
| includeCompleted | boolean | No | false | Include closed/completed conversations |

### Example Request
```javascript
const getConversations = async (userType) => {
  const token = await AsyncStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api/messages/conversations?userType=${userType}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};

// Usage
const conversations = await getConversations('customer');
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "conversation_id": 1,
        "customer_id": 10,
        "provider_id": 5,
        "appointment_id": 25,
        "status": "active",
        "created_at": "2025-10-01T10:00:00Z",
        "updated_at": "2025-10-04T15:30:00Z",
        "customer": {
          "user_id": 10,
          "first_name": "John",
          "last_name": "Doe",
          "profile_photo": "https://cloudinary.com/..."
        },
        "provider": {
          "provider_id": 5,
          "provider_first_name": "Jane",
          "provider_last_name": "Smith",
          "provider_profile_photo": "https://cloudinary.com/..."
        },
        "lastMessage": {
          "message_id": 150,
          "content": "I'll be there in 10 minutes",
          "sender_type": "provider",
          "created_at": "2025-10-04T15:30:00Z",
          "is_read": false
        },
        "unreadCount": 2,
        "warranty_expiry": "2025-11-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### Error Responses

**400 - Missing User Type**
```json
{
  "error": "User type not specified. Please include userType in request body, query, or ensure token contains userType."
}
```

**400 - Invalid User Type**
```json
{
  "error": "Invalid user type. Must be either 'customer' or 'provider'."
}
```

---

## 2. Create Conversation

Create a new conversation between a customer and provider. This is typically done automatically when a customer books an appointment, but can also be manually initiated.

### Endpoint
```
POST /api/messages/conversations
```

### Request Body
```typescript
{
  "otherUserId": number,        // The ID of the other user (provider or customer)
  "otherUserType": string,      // 'customer' or 'provider'
  "appointmentId": number       // The appointment ID linking this conversation
}
```

### Example Request
```javascript
const createConversation = async (providerId, appointmentId) => {
  const token = await AsyncStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api/messages/conversations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      otherUserId: providerId,
      otherUserType: 'provider',
      appointmentId: appointmentId
    })
  });

  return await response.json();
};
```

### Success Response (201)
```json
{
  "success": true,
  "message": "Conversation created successfully",
  "conversation": {
    "conversation_id": 1,
    "customer_id": 10,
    "provider_id": 5,
    "appointment_id": 25,
    "status": "active",
    "created_at": "2025-10-04T16:00:00Z",
    "warranty_expiry": "2025-11-04T16:00:00Z"
  }
}
```

### Success Response - Existing Conversation (200)
```json
{
  "success": true,
  "message": "Conversation already exists",
  "conversation": {
    "conversation_id": 1,
    "customer_id": 10,
    "provider_id": 5,
    "appointment_id": 25,
    "status": "active",
    "created_at": "2025-10-01T10:00:00Z"
  }
}
```

### Error Responses

**400 - Missing Fields**
```json
{
  "success": false,
  "message": "Other user ID, type, and appointment ID are required"
}
```

**403 - Appointment Not Allowed**
```json
{
  "success": false,
  "message": "Cannot create conversation - appointment is cancelled or completed"
}
```

**404 - Appointment Not Found**
```json
{
  "success": false,
  "message": "Appointment not found or access denied"
}
```

---

## 3. Get Conversation Details

Get detailed information about a specific conversation including participant info and warranty status.

### Endpoint
```
GET /api/messages/conversations/:conversationId
```

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| conversationId | number | Yes | The conversation ID |

### Example Request
```javascript
const getConversationDetails = async (conversationId) => {
  const token = await AsyncStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api/messages/conversations/${conversationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};
```

### Success Response (200)
```json
{
  "success": true,
  "conversation": {
    "conversation_id": 1,
    "customer_id": 10,
    "provider_id": 5,
    "appointment_id": 25,
    "status": "active",
    "created_at": "2025-10-01T10:00:00Z",
    "updated_at": "2025-10-04T15:30:00Z",
    "warranty_expiry": "2025-11-01T10:00:00Z",
    "customer": {
      "user_id": 10,
      "first_name": "John",
      "last_name": "Doe",
      "profile_photo": "https://cloudinary.com/...",
      "phone_number": "+1234567890",
      "exact_location": "123 Main St, City"
    },
    "provider": {
      "provider_id": 5,
      "provider_first_name": "Jane",
      "provider_last_name": "Smith",
      "provider_profile_photo": "https://cloudinary.com/...",
      "provider_phone_number": "+0987654321",
      "provider_exact_location": "456 Service Rd, City",
      "provider_rating": 4.8
    },
    "appointment": {
      "appointment_id": 25,
      "appointment_status": "in_progress",
      "scheduled_date": "2025-10-01T14:00:00Z",
      "service": {
        "service_title": "Plumbing Repair"
      }
    },
    "messageCount": 45,
    "lastMessage": {
      "message_id": 150,
      "content": "I'll be there in 10 minutes",
      "sender_type": "provider",
      "created_at": "2025-10-04T15:30:00Z"
    }
  }
}
```

### Error Responses

**404 - Not Found**
```json
{
  "success": false,
  "message": "Conversation not found or access denied"
}
```

---

## 4. Get Messages

Retrieve all messages in a conversation with pagination support.

### Endpoint
```
GET /api/messages/conversations/:conversationId/messages
```

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| conversationId | number | Yes | The conversation ID |

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number |
| limit | number | No | 50 | Messages per page |

### Example Request
```javascript
const getMessages = async (conversationId, page = 1) => {
  const token = await AsyncStorage.getItem('token');
  
  const response = await fetch(
    `${API_URL}/api/messages/conversations/${conversationId}/messages?page=${page}&limit=50`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
};
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "message_id": 150,
        "conversation_id": 1,
        "sender_id": 5,
        "sender_type": "provider",
        "content": "I'll be there in 10 minutes",
        "message_type": "text",
        "attachment_url": null,
        "is_read": false,
        "replied_to_id": null,
        "created_at": "2025-10-04T15:30:00Z",
        "replied_to": null
      },
      {
        "message_id": 149,
        "conversation_id": 1,
        "sender_id": 10,
        "sender_type": "customer",
        "content": "When will you arrive?",
        "message_type": "text",
        "attachment_url": null,
        "is_read": true,
        "replied_to_id": null,
        "created_at": "2025-10-04T15:25:00Z",
        "replied_to": null
      },
      {
        "message_id": 148,
        "conversation_id": 1,
        "sender_id": 5,
        "sender_type": "provider",
        "content": "Here's the photo of the issue",
        "message_type": "image",
        "attachment_url": "https://cloudinary.com/image123.jpg",
        "is_read": true,
        "replied_to_id": 145,
        "created_at": "2025-10-04T14:00:00Z",
        "replied_to": {
          "message_id": 145,
          "content": "Can you send a photo?",
          "sender_type": "customer",
          "created_at": "2025-10-04T13:55:00Z"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
}
```

### Error Responses

**404 - Not Found**
```json
{
  "success": false,
  "message": "Conversation not found or access denied"
}
```

---

## 5. Send Message

Send a text or image message in a conversation.

### Endpoint
```
POST /api/messages/conversations/:conversationId/messages
```

### Content-Type
`multipart/form-data` (for file uploads) or `application/json` (for text only)

### Request Body (Form Data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | Yes | Message text content |
| messageType | string | No | 'text', 'image', 'document' (default: 'text') |
| replyToId | number | No | ID of message being replied to |
| attachment | file | No | Image or document file (max 5MB) |
| userType | string | Conditional | 'customer' or 'provider' (if not in token) |

### Allowed File Types
- **Images**: JPG, JPEG, PNG, GIF, WebP
- **Documents**: PDF, DOC, DOCX, TXT
- **Max Size**: 5MB per file

### Example Request - Text Only
```javascript
const sendTextMessage = async (conversationId, content) => {
  const token = await AsyncStorage.getItem('token');
  
  const response = await fetch(
    `${API_URL}/api/messages/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: content,
        messageType: 'text'
      })
    }
  );

  return await response.json();
};
```

### Example Request - With Image Attachment
```javascript
const sendImageMessage = async (conversationId, content, imageUri) => {
  const token = await AsyncStorage.getItem('token');
  
  const formData = new FormData();
  formData.append('content', content);
  formData.append('messageType', 'image');
  formData.append('attachment', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'photo.jpg'
  });

  const response = await fetch(
    `${API_URL}/api/messages/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      body: formData
    }
  );

  return await response.json();
};
```

### Example Request - Reply to Message
```javascript
const replyToMessage = async (conversationId, content, replyToMessageId) => {
  const token = await AsyncStorage.getItem('token');
  
  const response = await fetch(
    `${API_URL}/api/messages/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: content,
        messageType: 'text',
        replyToId: replyToMessageId
      })
    }
  );

  return await response.json();
};
```

### Success Response (201)
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message_id": 151,
    "conversation_id": 1,
    "sender_id": 10,
    "sender_type": "customer",
    "content": "Thank you!",
    "message_type": "text",
    "attachment_url": null,
    "is_read": false,
    "replied_to_id": null,
    "created_at": "2025-10-04T16:00:00Z",
    "replied_to": null
  }
}
```

### Error Responses

**400 - Missing Content**
```json
{
  "success": false,
  "message": "Message content is required"
}
```

**403 - Conversation Closed**
```json
{
  "success": false,
  "message": "This conversation has been closed"
}
```

**403 - Appointment Invalid**
```json
{
  "success": false,
  "message": "This conversation has been closed - appointment is cancelled or completed"
}
```

**404 - Not Found**
```json
{
  "success": false,
  "message": "Conversation not found or access denied"
}
```

**500 - Upload Error**
```json
{
  "success": false,
  "message": "Error uploading attachment. Please try again."
}
```

---

## 6. Upload File Message

Alternative endpoint specifically for uploading files/images as messages.

### Endpoint
```
POST /api/messages/upload
```

### Request Body (Form Data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | Image or document file |
| conversationId | number | Yes | Conversation ID |
| content | string | No | Optional message text |

### Example Request
```javascript
const uploadFileMessage = async (conversationId, fileUri, caption = '') => {
  const token = await AsyncStorage.getItem('token');
  
  const formData = new FormData();
  formData.append('conversationId', conversationId);
  formData.append('content', caption);
  formData.append('file', {
    uri: fileUri,
    type: 'image/jpeg',
    name: 'attachment.jpg'
  });

  const response = await fetch(`${API_URL}/api/messages/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    },
    body: formData
  });

  return await response.json();
};
```

### Success Response (201)
```json
{
  "success": true,
  "message": "File uploaded and message sent successfully",
  "data": {
    "message_id": 152,
    "conversation_id": 1,
    "sender_id": 10,
    "sender_type": "customer",
    "content": "Here's the issue",
    "message_type": "image",
    "attachment_url": "https://res.cloudinary.com/fixmo/image/upload/v1234567890/fixmo/message-attachments/msg_10_1696435200000.jpg",
    "is_read": false,
    "created_at": "2025-10-04T16:05:00Z"
  }
}
```

---

## 7. Mark Messages as Read

Mark all messages in a conversation as read.

### Endpoint
```
PUT /api/messages/conversations/:conversationId/messages/read
```

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| conversationId | number | Yes | The conversation ID |

### Example Request
```javascript
const markMessagesAsRead = async (conversationId) => {
  const token = await AsyncStorage.getItem('token');
  
  const response = await fetch(
    `${API_URL}/api/messages/conversations/${conversationId}/messages/read`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
};
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Messages marked as read",
  "data": {
    "updatedCount": 5
  }
}
```

### Error Responses

**404 - Not Found**
```json
{
  "success": false,
  "message": "Conversation not found or access denied"
}
```

---

## 8. Archive Conversation

Archive (close) a conversation. Archived conversations won't appear in the default conversation list.

### Endpoint
```
PUT /api/messages/conversations/:conversationId/archive
```

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| conversationId | number | Yes | The conversation ID |

### Example Request
```javascript
const archiveConversation = async (conversationId) => {
  const token = await AsyncStorage.getItem('token');
  
  const response = await fetch(
    `${API_URL}/api/messages/conversations/${conversationId}/archive`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
};
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Conversation archived successfully",
  "conversation": {
    "conversation_id": 1,
    "status": "closed",
    "updated_at": "2025-10-04T16:10:00Z"
  }
}
```

### Error Responses

**404 - Not Found**
```json
{
  "success": false,
  "message": "Conversation not found or access denied"
}
```

---

## 9. Search Messages

Search for messages across all conversations.

### Endpoint
```
GET /api/messages/search
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query text |
| conversationId | number | No | Limit search to specific conversation |
| page | number | No | Page number (default: 1) |
| limit | number | No | Results per page (default: 20) |

### Example Request
```javascript
const searchMessages = async (query, conversationId = null) => {
  const token = await AsyncStorage.getItem('token');
  
  let url = `${API_URL}/api/messages/search?q=${encodeURIComponent(query)}`;
  if (conversationId) {
    url += `&conversationId=${conversationId}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "message_id": 148,
        "conversation_id": 1,
        "sender_id": 5,
        "sender_type": "provider",
        "content": "Here's the photo of the plumbing issue",
        "message_type": "image",
        "attachment_url": "https://cloudinary.com/...",
        "created_at": "2025-10-04T14:00:00Z",
        "conversation": {
          "conversation_id": 1,
          "customer": {
            "first_name": "John",
            "last_name": "Doe"
          },
          "provider": {
            "provider_first_name": "Jane",
            "provider_last_name": "Smith"
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

### Error Responses

**400 - Missing Query**
```json
{
  "success": false,
  "message": "Search query is required"
}
```

---

## WebSocket Integration

The messaging system includes WebSocket support for real-time messaging.

### WebSocket Connection
```javascript
import { io } from 'socket.io-client';

const connectWebSocket = (token) => {
  const socket = io('ws://your-server.com', {
    auth: {
      token: token
    }
  });

  // Listen for new messages
  socket.on('new_message', (message) => {
    console.log('New message received:', message);
    // Update UI with new message
  });

  // Listen for read receipts
  socket.on('messages_read', (data) => {
    console.log('Messages marked as read:', data);
    // Update UI to show messages as read
  });

  // Join a conversation room
  socket.emit('join_conversation', conversationId);

  // Leave a conversation room
  socket.emit('leave_conversation', conversationId);

  return socket;
};
```

### WebSocket Events

**Client → Server:**
- `join_conversation`: Join a conversation room
- `leave_conversation`: Leave a conversation room

**Server → Client:**
- `new_message`: New message received in conversation
- `messages_read`: Messages marked as read
- `conversation_closed`: Conversation has been closed

---

## Error Codes

| Status Code | Meaning | Common Causes |
|-------------|---------|---------------|
| 400 | Bad Request | Missing required fields, invalid input |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Conversation closed, appointment invalid |
| 404 | Not Found | Conversation or message not found |
| 413 | Payload Too Large | File attachment exceeds 5MB |
| 500 | Internal Server Error | Server-side error, Cloudinary upload failure |

---

## React Native Examples

### Complete Chat Screen Component

```typescript
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { io } from 'socket.io-client';

const API_URL = 'http://your-api.com';

const ChatScreen = ({ route }) => {
  const { conversationId, otherUserName } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Initialize WebSocket
    initializeWebSocket();
    
    // Load messages
    loadMessages();
    
    // Mark messages as read
    markAsRead();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const initializeWebSocket = async () => {
    const token = await AsyncStorage.getItem('token');
    const ws = io(API_URL, {
      auth: { token }
    });

    ws.on('new_message', (message) => {
      if (message.conversation_id === conversationId) {
        setMessages(prev => [message, ...prev]);
        markAsRead();
      }
    });

    ws.emit('join_conversation', conversationId);
    setSocket(ws);
  };

  const loadMessages = async (page = 1) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/api/messages/conversations/${conversationId}/messages?page=${page}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const result = await response.json();
      if (result.success) {
        setMessages(result.data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(
        `${API_URL}/api/messages/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: inputText.trim(),
            messageType: 'text'
          })
        }
      );

      const result = await response.json();
      if (result.success) {
        setMessages(prev => [result.data, ...prev]);
        setInputText('');
      } else {
        alert(result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      sendImageMessage(result.assets[0].uri);
    }
  };

  const sendImageMessage = async (imageUri) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('content', 'Sent a photo');
      formData.append('messageType', 'image');
      formData.append('attachment', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg'
      });

      const response = await fetch(
        `${API_URL}/api/messages/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          body: formData
        }
      );

      const result = await response.json();
      if (result.success) {
        setMessages(prev => [result.data, ...prev]);
      }
    } catch (error) {
      console.error('Error sending image:', error);
      alert('Failed to send image');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(
        `${API_URL}/api/messages/conversations/${conversationId}/messages/read`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender_type === 'customer'; // Adjust based on userType

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.theirMessage
      ]}>
        {item.message_type === 'image' && item.attachment_url && (
          <Image 
            source={{ uri: item.attachment_url }} 
            style={styles.messageImage}
          />
        )}
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.created_at).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.message_id.toString()}
        inverted
        contentContainerStyle={styles.messageList}
      />
      
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.attachButton}>
          <Text>📎</Text>
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          multiline
          maxLength={1000}
        />
        
        <TouchableOpacity 
          onPress={sendMessage} 
          style={styles.sendButton}
          disabled={loading || !inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  messageList: {
    padding: 16
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    color: '#000'
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  attachButton: {
    padding: 8,
    justifyContent: 'center'
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center'
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600'
  }
});

export default ChatScreen;
```

### Conversation List Component

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://your-api.com';

const ConversationsScreen = ({ navigation, userType }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/api/messages/conversations?userType=${userType}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = await response.json();
      if (result.success) {
        setConversations(result.data.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderConversation = ({ item }) => {
    const otherUser = userType === 'customer' ? item.provider : item.customer;
    const otherUserName = userType === 'customer'
      ? `${otherUser.provider_first_name} ${otherUser.provider_last_name}`
      : `${otherUser.first_name} ${otherUser.last_name}`;
    const profilePhoto = userType === 'customer'
      ? otherUser.provider_profile_photo
      : otherUser.profile_photo;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => navigation.navigate('Chat', {
          conversationId: item.conversation_id,
          otherUserName
        })}
      >
        <Image
          source={{ uri: profilePhoto || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName}>{otherUserName}</Text>
            <Text style={styles.time}>
              {new Date(item.lastMessage?.created_at).toLocaleTimeString()}
            </Text>
          </View>
          
          <View style={styles.conversationFooter}>
            <Text 
              style={styles.lastMessage}
              numberOfLines={1}
            >
              {item.lastMessage?.content || 'No messages yet'}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.conversation_id.toString()}
        refreshing={loading}
        onRefresh={loadConversations}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No conversations yet</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12
  },
  conversationInfo: {
    flex: 1
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000'
  },
  time: {
    fontSize: 12,
    color: '#999'
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#666'
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999'
  }
});

export default ConversationsScreen;
```

---

## Important Notes

### Warranty System
- Conversations are linked to appointments and have a warranty period
- Messages can only be sent while:
  - Appointment is not cancelled or completed
  - Warranty period is still active (typically 30 days after completion)
- Conversations automatically close when warranty expires or appointment is cancelled/completed

### File Uploads
- Files are uploaded to Cloudinary automatically
- Maximum file size: 5MB
- Supported formats: Images (JPG, PNG, GIF, WebP), Documents (PDF, DOC, DOCX, TXT)
- Files are stored in the `fixmo/message-attachments` folder on Cloudinary

### Real-Time Features
- WebSocket support for instant messaging
- Automatic read receipts
- Online/offline status (if implemented)
- Push notifications for new messages

### Best Practices
1. Always mark messages as read when viewing a conversation
2. Handle file upload errors gracefully
3. Implement retry logic for failed message sends
4. Cache conversations locally for offline viewing
5. Show loading states during API calls
6. Handle WebSocket reconnection
7. Validate file size and type before upload

---

## Testing Checklist

- [ ] Get conversations list (customer)
- [ ] Get conversations list (provider)
- [ ] Create new conversation
- [ ] Get conversation details
- [ ] Load messages with pagination
- [ ] Send text message
- [ ] Send image message
- [ ] Reply to message
- [ ] Mark messages as read
- [ ] Archive conversation
- [ ] Search messages
- [ ] WebSocket connection
- [ ] Real-time message delivery
- [ ] File upload (< 5MB)
- [ ] File upload error (> 5MB)
- [ ] Closed conversation error
- [ ] Expired warranty error

---

## Support

For issues or questions about the messaging API, please refer to:
- Full API documentation
- WebSocket documentation
- Cloudinary integration guide
- Warranty system documentation
