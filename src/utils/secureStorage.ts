import Dexie, { Table } from 'dexie';

export interface KeyPair {
  id: string;
  userId: string;
  publicKey: string;
  privateKey: string;
  createdAt: Date;
  lastRotated?: Date;
}

export interface CachedMessage {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  timestamp: Date;
  encrypted: boolean;
  isSent?: boolean;
  isRead?: boolean;
  isDelivered?: boolean;
  reactions?: Array<{ userId: string; type: string }>;
  replyTo?: string;
}

export interface CachedConversation {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatar: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isOnline?: boolean;
  lastSyncTime?: Date;
}

export interface PendingMessage {
  id: string;
  conversationId: string;
  content: string;
  encrypted: boolean;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

export interface CachedConversationPreview {
  id: string;  // conversation ID
visibleContent: string;  // decrypted preview text
  lastMessageId: string;
  updatedAt: Date;
}

class SecureDatabase extends Dexie {
  keyPairs!: Table<KeyPair>;
  messages!: Table<CachedMessage>;
  conversations!: Table<CachedConversation>;
  pendingMessages!: Table<PendingMessage>;
  conversationPreviews!: Table<CachedConversationPreview>;

  constructor() {
    super('CampoSocialSecure');
    
    // Version 2 adds conversationPreviews table
    this.version(2).stores({
      keyPairs: 'id, userId, createdAt',
      messages: 'id, conversationId, timestamp, senderId, [conversationId+timestamp]',
      conversations: 'id, friendId, lastMessageTime',
      pendingMessages: 'id, conversationId, timestamp',
      conversationPreviews: 'id, updatedAt'
    });
    
    // Keep version 1 for backwards compatibility
    this.version(1).stores({
      keyPairs: 'id, userId, createdAt',
      messages: 'id, conversationId, timestamp, senderId, [conversationId+timestamp]',
      conversations: 'id, friendId, lastMessageTime',
      pendingMessages: 'id, conversationId, timestamp'
    });
  }

  async storeKeyPair(userId: string, publicKey: string, privateKey: string): Promise<KeyPair> {
    const keyPair: KeyPair = {
      id: `keypair_${userId}_${Date.now()}`,
      userId,
      publicKey,
      privateKey,
      createdAt: new Date()
    };
    
    await this.keyPairs.add(keyPair);
    return keyPair;
  }

  async getLatestKeyPair(userId: string): Promise<KeyPair | undefined> {
    return this.keyPairs
      .where('userId')
      .equals(userId)
      .reverse()
      .first();
  }

  async rotateKeyPair(userId: string, newPublicKey: string, newPrivateKey: string): Promise<KeyPair> {
    // Mark old key as rotated
    const oldKey = await this.getLatestKeyPair(userId);
    if (oldKey) {
      oldKey.lastRotated = new Date();
      await this.keyPairs.update(oldKey.id, oldKey);
    }

    // Store new key
    return this.storeKeyPair(userId, newPublicKey, newPrivateKey);
  }

  async cacheMessage(message: CachedMessage): Promise<void> {
    // Use put instead of add to avoid ConstraintError when message already exists
    await this.messages.put(message);
  }

  async cacheMessages(messages: CachedMessage[]): Promise<void> {
    // Use bulkPut instead of bulkAdd to avoid ConstraintError for existing messages
    await this.messages.bulkPut(messages);
  }

  async getCachedMessages(
    conversationId: string, 
    limit = 50,
    beforeTimestamp?: Date
  ): Promise<CachedMessage[]> {
    let query = this.messages
      .where('[conversationId+timestamp]')
      .between(
        [conversationId, new Date(0)],
        [conversationId, beforeTimestamp || new Date()],
        true,
        true
      );

    return query
      .reverse()
      .limit(limit)
      .toArray()
      .then(messages => messages.reverse());
  }

  async updateMessageStatus(
    messageId: string, 
    status: { isSent?: boolean; isDelivered?: boolean; isRead?: boolean }
  ): Promise<void> {
    await this.messages.update(messageId, status);
  }

  async getConversation(conversationId: string): Promise<CachedConversation | undefined> {
    return this.conversations.get(conversationId);
  }

  async updateConversation(conversation: Partial<CachedConversation> & { id: string }): Promise<void> {
    const existing = await this.conversations.get(conversation.id);
    if (existing) {
      await this.conversations.update(conversation.id, conversation);
    } else {
      await this.conversations.add(conversation as CachedConversation);
    }
  }

  async getAllConversations(): Promise<CachedConversation[]> {
    return this.conversations
      .orderBy('lastMessageTime')
      .reverse()
      .toArray();
  }

  async addPendingMessage(message: Omit<PendingMessage, 'id' | 'retryCount' | 'maxRetries'>): Promise<void> {
    const pendingMessage: PendingMessage = {
      ...message,
      id: `pending_${Date.now()}_${Math.random()}`,
      retryCount: 0,
      maxRetries: 3
    };
    await this.pendingMessages.add(pendingMessage);
  }

  async getPendingMessages(): Promise<PendingMessage[]> {
    return this.pendingMessages.toArray();
  }

  async removePendingMessage(messageId: string): Promise<void> {
    await this.pendingMessages.delete(messageId);
  }

  async incrementRetryCount(messageId: string): Promise<boolean> {
    const message = await this.pendingMessages.get(messageId);
    if (message) {
      message.retryCount++;
      if (message.retryCount >= message.maxRetries) {
        await this.pendingMessages.delete(messageId);
        return false; // Max retries reached
      }
      await this.pendingMessages.update(messageId, { retryCount: message.retryCount });
      return true; // Can retry
    }
    return false;
  }

  async clearConversationCache(conversationId: string): Promise<void> {
    await this.messages
      .where('conversationId')
      .equals(conversationId)
      .delete();
  }

  async clearAllCache(): Promise<void> {
    await this.messages.clear();
    await this.conversations.clear();
    await this.pendingMessages.clear();
  }

  async getMessageCount(conversationId: string): Promise<number> {
    return this.messages
      .where('conversationId')
      .equals(conversationId)
      .count();
  }

  async searchMessages(conversationId: string, searchTerm: string): Promise<CachedMessage[]> {
    return this.messages
      .where('conversationId')
      .equals(conversationId)
      .filter(message => 
        message.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .toArray();
  }

  // Conversation preview caching for decrypted message previews
  async cacheConversationPreview(
    conversationId: string,
    decryptedContent: string,
    lastMessageId: string
  ): Promise<void> {
    await this.conversationPreviews.put({
      id: conversationId,
      visibleContent: decryptedContent,
      lastMessageId,
      updatedAt: new Date()
    });
  }

  async getConversationPreview(conversationId: string): Promise<CachedConversationPreview | undefined> {
    return this.conversationPreviews.get(conversationId);
  }

  async getAllConversationPreviews(): Promise<CachedConversationPreview[]> {
    return this.conversationPreviews.toArray();
  }

  async clearConversationPreviews(): Promise<void> {
    await this.conversationPreviews.clear();
  }
}

export const secureDB = new SecureDatabase();
