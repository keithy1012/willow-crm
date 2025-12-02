import { User, UserSearchResult } from './user.types';

export interface Participant {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  role: string;
  publicKey?: string; // Add for E2EE
}

export interface EncryptedContent {
  ciphertext: string;
  ephemeralPublicKey: string;
  nonce: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: Participant;
  content: string; // Decrypted content for display
  encryptedContent?: EncryptedContent; // Raw encrypted data
  timestamp: string;
  read: boolean;
  delivered?: boolean;
}

export interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage?: {
    content: string;
    timestamp: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
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