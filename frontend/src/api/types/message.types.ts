import { User, UserSearchResult } from './user.types';

export interface Participant {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  role?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: Participant;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage?: Message;
  updatedAt: string;
  createdAt: string;
  unreadCount: number;
}

export interface CreateConversationResponse {
  conversation: Conversation;
}

export interface SendMessageResponse {
  message: Message;
}

export interface UserSearchResponse {
  users: UserSearchResult[];
  count: number;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  name: string;
  isTyping: boolean;
}

export interface OnlineStatusResponse {
  userId: string;
  isOnline: boolean;
}