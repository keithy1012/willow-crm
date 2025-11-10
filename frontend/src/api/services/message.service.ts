import { apiClient } from '../client';
import {
  Conversation,
  Message,
  CreateConversationResponse,
  SendMessageResponse,
  UserSearchResponse,
  OnlineStatusResponse
} from '../types/message.types';

export const messageService = {
  // Conversation endpoints
  conversations: {
    getAll: () => 
      apiClient.get<Conversation[]>('/conversations'),
    
    getById: (conversationId: string) => 
      apiClient.get<Conversation>(`/conversations/${conversationId}`),
    
    create: (participantId: string) => 
      apiClient.post<CreateConversationResponse>('/conversations', { 
        participantId 
      }),
    
    delete: (conversationId: string) => 
      apiClient.delete(`/conversations/${conversationId}`),
    
    markAsRead: (conversationId: string) => 
      apiClient.patch(`/conversations/${conversationId}/read`, {}),
  },

  // Message endpoints
  messages: {
    getByConversation: (conversationId: string, limit = 50, offset = 0) => 
      apiClient.get<Message[]>(
        `/messages/conversation/${conversationId}?limit=${limit}&offset=${offset}`
      ),
    
    send: (conversationId: string, content: string, recipientId: string) => 
      apiClient.post<SendMessageResponse>('/messages', {
        conversationId,
        content,
        recipientId
      }),
    
    delete: (messageId: string) => 
      apiClient.delete(`/messages/${messageId}`),
    
    edit: (messageId: string, content: string) => 
      apiClient.patch(`/messages/${messageId}`, { content }),
  },

  // User search for starting conversations
  users: {
    search: (query: string) => 
      apiClient.get<UserSearchResponse>(`/users/search?query=${encodeURIComponent(query)}`),
    
    searchByRole: (role: string, query: string) => 
      apiClient.get<UserSearchResponse>(
        `/users/search/role?role=${role}&query=${encodeURIComponent(query)}`
      ),
    
    getOnlineStatus: (userIds: string[]) => 
      apiClient.post<OnlineStatusResponse[]>('/users/online-status', { userIds }),
  },

  // Typing indicators
  typing: {
    start: (conversationId: string, recipientId: string) => 
      apiClient.post('/typing/start', { conversationId, recipientId }),
    
    stop: (conversationId: string, recipientId: string) => 
      apiClient.post('/typing/stop', { conversationId, recipientId }),
  }
};