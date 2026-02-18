/**
 * Signal Protocol Key/Session Storage
 * 
 * IndexedDB-based storage for Signal Protocol keys and sessions.
 * Implements the store interfaces required by libsignal-client.
 */

import Dexie, { type Table } from 'dexie';
import type {
  SignalIdentityKeyPair,
  SignalSignedPreKey,
  SignalOneTimePreKey,
  SignalSessionRecord,
  SignalIdentityRecord,
} from '@/types';

// ============================================================================
// Database Schema Types
// ============================================================================

export interface StoredIdentityKey {
  id: string;              // 'local' for own key, or `${userId}:${deviceId}` for others
  userId?: string;
  deviceId?: string;
  publicKey: string;       // Base64 encoded
  privateKey?: string;     // Base64 encoded (only for local key, encrypted)
  registrationId?: number;
  trusted?: boolean;
  verified?: boolean;
  firstSeen?: number;
  createdAt: number;
  updatedAt: number;
}

export interface StoredSignedPreKey {
  id: number;              // keyId
  publicKey: string;       // Base64 encoded
  privateKey: string;      // Base64 encoded (encrypted)
  signature: string;       // Base64 encoded
  timestamp: number;
  createdAt: number;
}

export interface StoredOneTimePreKey {
  id: number;              // keyId
  publicKey: string;       // Base64 encoded
  privateKey: string;      // Base64 encoded (encrypted)
  createdAt: number;
  used?: boolean;          // Mark as used locally before server confirms deletion
}

export interface StoredSession {
  id: string;              // `${addressName}:${deviceId}`
  addressName: string;     // Usually recipientId
  deviceId: string;
  sessionData: string;     // Base64 encoded serialized session
  createdAt: number;
  updatedAt: number;
}

export interface StoredSenderKey {
  id: string;              // `${distributionId}:${addressName}:${deviceId}`
  distributionId: string;
  addressName: string;
  deviceId: string;
  senderKeyData: string;   // Base64 encoded
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// Dexie Database Definition
// ============================================================================

class SignalDatabase extends Dexie {
  identityKeys!: Table<StoredIdentityKey>;
  signedPreKeys!: Table<StoredSignedPreKey>;
  oneTimePreKeys!: Table<StoredOneTimePreKey>;
  sessions!: Table<StoredSession>;
  senderKeys!: Table<StoredSenderKey>;

  constructor() {
    super('CampoSocialSignal');
    
    this.version(1).stores({
      identityKeys: 'id, userId, deviceId',
      signedPreKeys: 'id, timestamp',
      oneTimePreKeys: 'id, used',
      sessions: 'id, addressName, deviceId, updatedAt',
      senderKeys: 'id, distributionId, addressName, deviceId',
    });
  }
}

// Singleton database instance
let db: SignalDatabase | null = null;

function getDb(): SignalDatabase {
  if (!db) {
    db = new SignalDatabase();
  }
  return db;
}

// ============================================================================
// Signal Key Store Implementation
// ============================================================================

export class SignalKeyStore {
  private encryptionKey: CryptoKey | null = null;

  /**
   * Initialize the key store with an encryption key for protecting private keys
   * @param password - Password to derive encryption key from
   * @param salt - Salt for key derivation (should be stored/retrieved consistently)
   */
  async initialize(password: string, salt: Uint8Array): Promise<void> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    this.encryptionKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Check if the store is initialized
   */
  isInitialized(): boolean {
    return this.encryptionKey !== null;
  }

  /**
   * Encrypt a private key for storage
   */
  private async encryptPrivateKey(privateKey: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Key store not initialized');
    }

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = Buffer.from(privateKey, 'base64');
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      data
    );

    // Prepend IV to ciphertext
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encrypted), iv.length);
    
    return Buffer.from(result).toString('base64');
  }

  /**
   * Decrypt a private key from storage
   */
  private async decryptPrivateKey(encryptedKey: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Key store not initialized');
    }

    const data = Buffer.from(encryptedKey, 'base64');
    const iv = data.slice(0, 12);
    const ciphertext = data.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      ciphertext
    );

    return Buffer.from(decrypted).toString('base64');
  }

  // ==========================================================================
  // Identity Key Operations
  // ==========================================================================

  /**
   * Store the local identity key pair
   */
  async storeLocalIdentityKey(
    identityKeyPair: SignalIdentityKeyPair,
    registrationId: number
  ): Promise<void> {
    const now = Date.now();
    const encryptedPrivate = await this.encryptPrivateKey(identityKeyPair.privateKey);

    await getDb().identityKeys.put({
      id: 'local',
      publicKey: identityKeyPair.publicKey,
      privateKey: encryptedPrivate,
      registrationId,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Get the local identity key pair
   */
  async getLocalIdentityKey(): Promise<{ keyPair: SignalIdentityKeyPair; registrationId: number } | null> {
    const stored = await getDb().identityKeys.get('local');
    if (!stored || !stored.privateKey) return null;

    const privateKey = await this.decryptPrivateKey(stored.privateKey);
    
    return {
      keyPair: {
        publicKey: stored.publicKey,
        privateKey,
      },
      registrationId: stored.registrationId || 0,
    };
  }

  /**
   * Check if local identity key exists
   */
  async hasLocalIdentityKey(): Promise<boolean> {
    const stored = await getDb().identityKeys.get('local');
    return stored !== undefined && stored.privateKey !== undefined;
  }

  /**
   * Store a remote identity key (for a contact)
   */
  async storeRemoteIdentityKey(
    userId: string,
    deviceId: string,
    identityKey: string,
    trusted: boolean = true
  ): Promise<boolean> {
    const id = `${userId}:${deviceId}`;
    const existing = await getDb().identityKeys.get(id);
    const now = Date.now();

    if (existing) {
      // Check if identity key changed (potential MITM)
      if (existing.publicKey !== identityKey) {
        console.warn(`[Signal] Identity key changed for ${id}`);
        // Update with new key but mark as untrusted until verified
        await getDb().identityKeys.update(id, {
          publicKey: identityKey,
          trusted: false,
          verified: false,
          updatedAt: now,
        });
        return false; // Identity changed
      }
      return true; // Same identity
    }

    // New identity
    await getDb().identityKeys.put({
      id,
      userId,
      deviceId,
      publicKey: identityKey,
      trusted,
      verified: false,
      firstSeen: now,
      createdAt: now,
      updatedAt: now,
    });

    return true;
  }

  /**
   * Get a remote identity key
   */
  async getRemoteIdentityKey(userId: string, deviceId: string): Promise<string | null> {
    const stored = await getDb().identityKeys.get(`${userId}:${deviceId}`);
    return stored?.publicKey || null;
  }

  /**
   * Check if identity is trusted
   */
  async isIdentityTrusted(userId: string, deviceId: string): Promise<boolean> {
    const stored = await getDb().identityKeys.get(`${userId}:${deviceId}`);
    return stored?.trusted ?? false;
  }

  // ==========================================================================
  // Signed Pre-Key Operations
  // ==========================================================================

  /**
   * Store a signed pre-key
   */
  async storeSignedPreKey(signedPreKey: SignalSignedPreKey): Promise<void> {
    const encryptedPrivate = await this.encryptPrivateKey(signedPreKey.privateKey);
    
    await getDb().signedPreKeys.put({
      id: signedPreKey.keyId,
      publicKey: signedPreKey.publicKey,
      privateKey: encryptedPrivate,
      signature: signedPreKey.signature,
      timestamp: signedPreKey.timestamp,
      createdAt: Date.now(),
    });
  }

  /**
   * Get a signed pre-key by ID
   */
  async getSignedPreKey(keyId: number): Promise<SignalSignedPreKey | null> {
    const stored = await getDb().signedPreKeys.get(keyId);
    if (!stored) return null;

    const privateKey = await this.decryptPrivateKey(stored.privateKey);
    
    return {
      keyId: stored.id,
      publicKey: stored.publicKey,
      privateKey,
      signature: stored.signature,
      timestamp: stored.timestamp,
    };
  }

  /**
   * Get the most recent signed pre-key
   */
  async getCurrentSignedPreKey(): Promise<SignalSignedPreKey | null> {
    const stored = await getDb().signedPreKeys.orderBy('timestamp').last();
    if (!stored) return null;

    const privateKey = await this.decryptPrivateKey(stored.privateKey);
    
    return {
      keyId: stored.id,
      publicKey: stored.publicKey,
      privateKey,
      signature: stored.signature,
      timestamp: stored.timestamp,
    };
  }

  /**
   * Remove old signed pre-keys (keep last N)
   */
  async pruneSignedPreKeys(keepCount: number = 3): Promise<void> {
    const all = await getDb().signedPreKeys.orderBy('timestamp').toArray();
    if (all.length <= keepCount) return;

    const toDelete = all.slice(0, all.length - keepCount);
    await getDb().signedPreKeys.bulkDelete(toDelete.map(k => k.id));
  }

  // ==========================================================================
  // One-Time Pre-Key Operations
  // ==========================================================================

  /**
   * Store one-time pre-keys
   */
  async storeOneTimePreKeys(preKeys: SignalOneTimePreKey[]): Promise<void> {
    const now = Date.now();
    const toStore: StoredOneTimePreKey[] = [];

    for (const pk of preKeys) {
      const encryptedPrivate = await this.encryptPrivateKey(pk.privateKey);
      toStore.push({
        id: pk.keyId,
        publicKey: pk.publicKey,
        privateKey: encryptedPrivate,
        createdAt: now,
        used: false,
      });
    }

    await getDb().oneTimePreKeys.bulkPut(toStore);
  }

  /**
   * Get a one-time pre-key by ID and mark as used
   */
  async getOneTimePreKey(keyId: number): Promise<SignalOneTimePreKey | null> {
    const stored = await getDb().oneTimePreKeys.get(keyId);
    if (!stored) return null;

    // Mark as used
    await getDb().oneTimePreKeys.update(keyId, { used: true });

    const privateKey = await this.decryptPrivateKey(stored.privateKey);
    
    return {
      keyId: stored.id,
      publicKey: stored.publicKey,
      privateKey,
    };
  }

  /**
   * Get count of unused one-time pre-keys
   */
  async getOneTimePreKeyCount(): Promise<number> {
    return await getDb().oneTimePreKeys.where('used').equals(0).count();
  }

  /**
   * Get the highest one-time pre-key ID (for generating new keys)
   */
  async getMaxOneTimePreKeyId(): Promise<number> {
    const last = await getDb().oneTimePreKeys.orderBy('id').last();
    return last?.id || 0;
  }

  /**
   * Remove used one-time pre-keys
   */
  async pruneUsedOneTimePreKeys(): Promise<void> {
    await getDb().oneTimePreKeys.where('used').equals(1).delete();
  }

  // ==========================================================================
  // Session Operations
  // ==========================================================================

  /**
   * Store a session
   */
  async storeSession(
    addressName: string,
    deviceId: string,
    sessionData: string
  ): Promise<void> {
    const id = `${addressName}:${deviceId}`;
    const now = Date.now();
    
    await getDb().sessions.put({
      id,
      addressName,
      deviceId,
      sessionData,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Get a session
   */
  async getSession(addressName: string, deviceId: string): Promise<string | null> {
    const stored = await getDb().sessions.get(`${addressName}:${deviceId}`);
    return stored?.sessionData || null;
  }

  /**
   * Check if session exists
   */
  async hasSession(addressName: string, deviceId: string): Promise<boolean> {
    const stored = await getDb().sessions.get(`${addressName}:${deviceId}`);
    return stored !== undefined;
  }

  /**
   * Get all sessions for an address (user)
   */
  async getAllSessions(addressName: string): Promise<Array<{ deviceId: string; sessionData: string }>> {
    const sessions = await getDb().sessions.where('addressName').equals(addressName).toArray();
    return sessions.map(s => ({
      deviceId: s.deviceId,
      sessionData: s.sessionData,
    }));
  }

  /**
   * Delete a session
   */
  async deleteSession(addressName: string, deviceId: string): Promise<void> {
    await getDb().sessions.delete(`${addressName}:${deviceId}`);
  }

  /**
   * Delete all sessions for an address
   */
  async deleteAllSessions(addressName: string): Promise<void> {
    await getDb().sessions.where('addressName').equals(addressName).delete();
  }

  // ==========================================================================
  // Sender Key Operations (for future group messaging)
  // ==========================================================================

  /**
   * Store a sender key
   */
  async storeSenderKey(
    distributionId: string,
    addressName: string,
    deviceId: string,
    senderKeyData: string
  ): Promise<void> {
    const id = `${distributionId}:${addressName}:${deviceId}`;
    const now = Date.now();
    
    await getDb().senderKeys.put({
      id,
      distributionId,
      addressName,
      deviceId,
      senderKeyData,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Get a sender key
   */
  async getSenderKey(
    distributionId: string,
    addressName: string,
    deviceId: string
  ): Promise<string | null> {
    const stored = await getDb().senderKeys.get(`${distributionId}:${addressName}:${deviceId}`);
    return stored?.senderKeyData || null;
  }

  // ==========================================================================
  // Utility Operations
  // ==========================================================================

  /**
   * Clear all data (use with caution!)
   */
  async clearAll(): Promise<void> {
    await Promise.all([
      getDb().identityKeys.clear(),
      getDb().signedPreKeys.clear(),
      getDb().oneTimePreKeys.clear(),
      getDb().sessions.clear(),
      getDb().senderKeys.clear(),
    ]);
  }

  /**
   * Export all public keys for backup (no private keys!)
   */
  async exportPublicKeys(): Promise<{
    identityKey: string | null;
    registrationId: number | null;
  }> {
    const local = await getDb().identityKeys.get('local');
    return {
      identityKey: local?.publicKey || null,
      registrationId: local?.registrationId || null,
    };
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    hasIdentityKey: boolean;
    signedPreKeyCount: number;
    oneTimePreKeyCount: number;
    sessionCount: number;
  }> {
    const [hasId, signedCount, otpCount, sessCount] = await Promise.all([
      this.hasLocalIdentityKey(),
      getDb().signedPreKeys.count(),
      this.getOneTimePreKeyCount(),
      getDb().sessions.count(),
    ]);

    return {
      hasIdentityKey: hasId,
      signedPreKeyCount: signedCount,
      oneTimePreKeyCount: otpCount,
      sessionCount: sessCount,
    };
  }
}

// Export singleton instance
export const signalKeyStore = new SignalKeyStore();
