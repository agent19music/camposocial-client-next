/**
 * Signal Protocol Session Manager
 * 
 * Handles session establishment (X3DH) and message encryption/decryption (Double Ratchet).
 * This is the main interface for encrypting and decrypting messages.
 */

import type {
  SignalEncryptedMessage,
  SignalMessageType,
  PreKeyBundleResponse,
  SignalSessionStatus,
} from '@/types';
import { initSignal } from './signalCrypto';
import { SignalKeyStore, signalKeyStore } from './signalStores';

// ============================================================================
// Types
// ============================================================================

export interface EncryptResult {
  success: boolean;
  message?: SignalEncryptedMessage;
  error?: string;
}

export interface DecryptResult {
  success: boolean;
  plaintext?: string;
  error?: string;
  senderChanged?: boolean; // True if sender's identity key changed
}

interface SessionInfo {
  status: SignalSessionStatus;
  hasSession: boolean;
  lastUpdated?: number;
}

// ============================================================================
// Signal Session Manager
// ============================================================================

export class SignalSessionManager {
  private keyStore: SignalKeyStore;
  private deviceId: string;
  private apiEndpoint: string;
  private authToken: string | null = null;
  
  // Cache of session states to avoid repeated DB lookups
  private sessionCache = new Map<string, SessionInfo>();

  constructor(
    deviceId: string,
    apiEndpoint: string,
    keyStore: SignalKeyStore = signalKeyStore
  ) {
    this.keyStore = keyStore;
    this.deviceId = deviceId;
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * Set the auth token for API requests
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Get session status for a recipient device
   */
  async getSessionStatus(recipientId: string, deviceId: string): Promise<SignalSessionStatus> {
    const cacheKey = `${recipientId}:${deviceId}`;
    const cached = this.sessionCache.get(cacheKey);
    
    if (cached && Date.now() - (cached.lastUpdated || 0) < 5000) {
      return cached.status;
    }

    const hasSession = await this.keyStore.hasSession(recipientId, deviceId);
    const status: SignalSessionStatus = hasSession ? 'active' : 'none';
    
    this.sessionCache.set(cacheKey, {
      status,
      hasSession,
      lastUpdated: Date.now(),
    });

    return status;
  }

  /**
   * Fetch a pre-key bundle from the server
   */
  async fetchPreKeyBundle(userId: string, deviceId: string): Promise<PreKeyBundleResponse | null> {
    if (!this.authToken) {
      console.error('[Signal] No auth token for fetching pre-key bundle');
      return null;
    }

    try {
      const response = await fetch(
        `${this.apiEndpoint}/signal/keys/${userId}/${deviceId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('[Signal] Failed to fetch pre-key bundle:', response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('[Signal] Error fetching pre-key bundle:', error);
      return null;
    }
  }

  /**
   * Establish a session with a recipient using their pre-key bundle
   * Implements the X3DH key agreement protocol
   */
  async establishSession(
    recipientId: string,
    bundle: PreKeyBundleResponse
  ): Promise<boolean> {
    try {
      const signal = await initSignal();
      
      // Get our local identity key
      const localIdentity = await this.keyStore.getLocalIdentityKey();
      if (!localIdentity) {
        console.error('[Signal] No local identity key');
        return false;
      }

      // Deserialize the bundle keys
      const recipientIdentityKey = signal.PublicKey.deserialize(
        Buffer.from(bundle.identityKey, 'base64')
      );
      const signedPreKey = signal.PublicKey.deserialize(
        Buffer.from(bundle.signedPreKey, 'base64')
      );
      const signedPreKeySignature = Buffer.from(bundle.signedPreKeySignature, 'base64');
      
      // Verify the signed pre-key signature
      if (!recipientIdentityKey.verify(signedPreKey.serialize(), signedPreKeySignature)) {
        console.error('[Signal] Invalid signed pre-key signature');
        return false;
      }

      // Store/verify recipient identity
      const identityOk = await this.keyStore.storeRemoteIdentityKey(
        recipientId,
        bundle.deviceId,
        bundle.identityKey,
        true
      );
      
      if (!identityOk) {
        console.warn('[Signal] Recipient identity key changed - session will continue but flag raised');
      }

      // Create the prekey bundle for libsignal
      let oneTimePreKey: InstanceType<typeof signal.PublicKey> | null = null;
      if (bundle.oneTimePreKey) {
        oneTimePreKey = signal.PublicKey.deserialize(
          Buffer.from(bundle.oneTimePreKey, 'base64')
        );
      }

      // Create protocol address
      const address = signal.ProtocolAddress.new(recipientId, bundle.deviceId ? parseInt(bundle.deviceId) || 1 : 1);

      // Create the pre-key bundle object
      const preKeyBundle = signal.PreKeyBundle.new(
        bundle.registrationId,
        bundle.deviceId ? parseInt(bundle.deviceId) || 1 : 1,
        bundle.oneTimePreKeyId || null,
        oneTimePreKey,
        bundle.signedPreKeyId,
        signedPreKey,
        signedPreKeySignature,
        recipientIdentityKey
      );

      // Get our identity key pair
      const ourIdentityPrivate = signal.PrivateKey.deserialize(
        Buffer.from(localIdentity.keyPair.privateKey, 'base64')
      );
      const ourIdentityPublic = ourIdentityPrivate.getPublicKey();
      const ourIdentityKeyPair = signal.IdentityKeyPair.new(ourIdentityPublic, ourIdentityPrivate);

      // Create in-memory stores for the session builder
      // We'll persist the session after it's created
      const inMemorySession = new InMemorySessionStore();
      const inMemoryIdentity = new InMemoryIdentityKeyStore(ourIdentityKeyPair, localIdentity.registrationId);
      
      // Store the recipient's identity key
      await inMemoryIdentity.saveIdentity(address, recipientIdentityKey);

      // Process the pre-key bundle to establish a session
      await signal.processPreKeyBundle(
        preKeyBundle,
        address,
        inMemorySession,
        inMemoryIdentity
      );

      // Get the established session and persist it
      const sessionRecord = await inMemorySession.getSession(address);
      if (sessionRecord) {
        const serialized = sessionRecord.serialize();
        await this.keyStore.storeSession(
          recipientId,
          bundle.deviceId,
          Buffer.from(serialized).toString('base64')
        );
        
        // Update cache
        this.sessionCache.set(`${recipientId}:${bundle.deviceId}`, {
          status: 'active',
          hasSession: true,
          lastUpdated: Date.now(),
        });
      }

      console.log(`[Signal] Session established with ${recipientId}:${bundle.deviceId}`);
      return true;
    } catch (error) {
      console.error('[Signal] Failed to establish session:', error);
      return false;
    }
  }

  /**
   * Encrypt a message for a recipient
   * Will establish session if needed
   */
  async encrypt(
    recipientId: string,
    recipientDeviceId: string,
    plaintext: string
  ): Promise<EncryptResult> {
    try {
      const signal = await initSignal();

      // Check if we have a session
      let sessionData = await this.keyStore.getSession(recipientId, recipientDeviceId);
      
      // If no session, try to establish one
      if (!sessionData) {
        this.sessionCache.set(`${recipientId}:${recipientDeviceId}`, {
          status: 'establishing',
          hasSession: false,
          lastUpdated: Date.now(),
        });

        const bundle = await this.fetchPreKeyBundle(recipientId, recipientDeviceId);
        if (!bundle) {
          return { 
            success: false, 
            error: 'Failed to fetch recipient pre-key bundle' 
          };
        }

        const established = await this.establishSession(recipientId, bundle);
        if (!established) {
          return { 
            success: false, 
            error: 'Failed to establish session' 
          };
        }

        sessionData = await this.keyStore.getSession(recipientId, recipientDeviceId);
      }

      if (!sessionData) {
        return { success: false, error: 'No session available' };
      }

      // Get our identity key
      const localIdentity = await this.keyStore.getLocalIdentityKey();
      if (!localIdentity) {
        return { success: false, error: 'No local identity key' };
      }

      // Deserialize our keys
      const ourIdentityPrivate = signal.PrivateKey.deserialize(
        Buffer.from(localIdentity.keyPair.privateKey, 'base64')
      );
      const ourIdentityPublic = ourIdentityPrivate.getPublicKey();
      const ourIdentityKeyPair = signal.IdentityKeyPair.new(ourIdentityPublic, ourIdentityPrivate);

      // Create address and deserialize session
      const address = signal.ProtocolAddress.new(recipientId, parseInt(recipientDeviceId) || 1);
      const sessionRecord = signal.SessionRecord.deserialize(
        Buffer.from(sessionData, 'base64')
      );

      // Create in-memory stores
      const inMemorySession = new InMemorySessionStore();
      const inMemoryIdentity = new InMemoryIdentityKeyStore(ourIdentityKeyPair, localIdentity.registrationId);
      await inMemorySession.saveSession(address, sessionRecord);

      // Load recipient identity
      const recipientIdentityKey = await this.keyStore.getRemoteIdentityKey(recipientId, recipientDeviceId);
      if (recipientIdentityKey) {
        const recipientPubKey = signal.PublicKey.deserialize(Buffer.from(recipientIdentityKey, 'base64'));
        await inMemoryIdentity.saveIdentity(address, recipientPubKey);
      }

      // Encrypt the message
      const plaintextBytes = Buffer.from(plaintext, 'utf-8');
      const ciphertext = await signal.signalEncrypt(
        plaintextBytes,
        address,
        inMemorySession,
        inMemoryIdentity
      );

      // Persist updated session
      const updatedSession = await inMemorySession.getSession(address);
      if (updatedSession) {
        await this.keyStore.storeSession(
          recipientId,
          recipientDeviceId,
          Buffer.from(updatedSession.serialize()).toString('base64')
        );
      }

      // Determine message type
      const messageType: SignalMessageType = ciphertext.type() === 3 ? 'prekey' : 'whisper';

      return {
        success: true,
        message: {
          type: messageType,
          senderDeviceId: this.deviceId,
          senderRegistrationId: localIdentity.registrationId,
          ciphertext: Buffer.from(ciphertext.serialize()).toString('base64'),
        },
      };
    } catch (error) {
      console.error('[Signal] Encryption failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Encryption failed' 
      };
    }
  }

  /**
   * Decrypt a message from a sender
   */
  async decrypt(
    senderId: string,
    senderDeviceId: string,
    encryptedMessage: SignalEncryptedMessage
  ): Promise<DecryptResult> {
    try {
      const signal = await initSignal();

      // Get our identity key
      const localIdentity = await this.keyStore.getLocalIdentityKey();
      if (!localIdentity) {
        return { success: false, error: 'No local identity key' };
      }

      // Deserialize our keys
      const ourIdentityPrivate = signal.PrivateKey.deserialize(
        Buffer.from(localIdentity.keyPair.privateKey, 'base64')
      );
      const ourIdentityPublic = ourIdentityPrivate.getPublicKey();
      const ourIdentityKeyPair = signal.IdentityKeyPair.new(ourIdentityPublic, ourIdentityPrivate);

      // Create address
      const address = signal.ProtocolAddress.new(senderId, parseInt(senderDeviceId) || 1);

      // Create in-memory stores
      const inMemorySession = new InMemorySessionStore();
      const inMemoryIdentity = new InMemoryIdentityKeyStore(ourIdentityKeyPair, localIdentity.registrationId);
      const inMemoryPreKey = new InMemoryPreKeyStore(this.keyStore);
      const inMemorySignedPreKey = new InMemorySignedPreKeyStore(this.keyStore);

      // Load existing session if we have one
      const existingSession = await this.keyStore.getSession(senderId, senderDeviceId);
      if (existingSession) {
        const sessionRecord = signal.SessionRecord.deserialize(
          Buffer.from(existingSession, 'base64')
        );
        await inMemorySession.saveSession(address, sessionRecord);
      }

      // Load sender's identity if we have it
      const senderIdentityKey = await this.keyStore.getRemoteIdentityKey(senderId, senderDeviceId);
      if (senderIdentityKey) {
        const senderPubKey = signal.PublicKey.deserialize(Buffer.from(senderIdentityKey, 'base64'));
        await inMemoryIdentity.saveIdentity(address, senderPubKey);
      }

      // Deserialize the ciphertext
      const ciphertextBytes = Buffer.from(encryptedMessage.ciphertext, 'base64');
      let plaintext: Buffer;

      if (encryptedMessage.type === 'prekey') {
        // PreKey message - this is the first message establishing a session
        const preKeyMessage = signal.PreKeySignalMessage.deserialize(ciphertextBytes);
        
        plaintext = await signal.signalDecryptPreKey(
          preKeyMessage,
          address,
          inMemorySession,
          inMemoryIdentity,
          inMemoryPreKey,
          inMemorySignedPreKey
        );
      } else {
        // Regular whisper message
        const whisperMessage = signal.SignalMessage.deserialize(ciphertextBytes);
        
        plaintext = await signal.signalDecrypt(
          whisperMessage,
          address,
          inMemorySession,
          inMemoryIdentity
        );
      }

      // Persist updated session
      const updatedSession = await inMemorySession.getSession(address);
      if (updatedSession) {
        await this.keyStore.storeSession(
          senderId,
          senderDeviceId,
          Buffer.from(updatedSession.serialize()).toString('base64')
        );

        // Update cache
        this.sessionCache.set(`${senderId}:${senderDeviceId}`, {
          status: 'active',
          hasSession: true,
          lastUpdated: Date.now(),
        });
      }

      // Store sender's identity key if this was a prekey message
      // (it's included in the message)
      if (encryptedMessage.type === 'prekey') {
        const storedOk = await inMemoryIdentity.getIdentityKey(address);
        if (storedOk) {
          await this.keyStore.storeRemoteIdentityKey(
            senderId,
            senderDeviceId,
            Buffer.from(storedOk.serialize()).toString('base64'),
            true
          );
        }
      }

      return {
        success: true,
        plaintext: Buffer.from(plaintext).toString('utf-8'),
      };
    } catch (error) {
      console.error('[Signal] Decryption failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Decryption failed' 
      };
    }
  }

  /**
   * Encrypt a message for all devices of a recipient
   */
  async encryptForAllDevices(
    recipientId: string,
    deviceIds: string[],
    plaintext: string
  ): Promise<Record<string, SignalEncryptedMessage>> {
    const results: Record<string, SignalEncryptedMessage> = {};

    for (const deviceId of deviceIds) {
      const result = await this.encrypt(recipientId, deviceId, plaintext);
      if (result.success && result.message) {
        results[deviceId] = result.message;
      } else {
        console.warn(`[Signal] Failed to encrypt for device ${deviceId}:`, result.error);
      }
    }

    return results;
  }

  /**
   * Clear session cache
   */
  clearCache(): void {
    this.sessionCache.clear();
  }

  /**
   * Invalidate session for a recipient (e.g., after receiving identity change warning)
   */
  async invalidateSession(recipientId: string, deviceId: string): Promise<void> {
    await this.keyStore.deleteSession(recipientId, deviceId);
    this.sessionCache.delete(`${recipientId}:${deviceId}`);
  }
}

// ============================================================================
// In-Memory Store Implementations for libsignal
// These wrap our IndexedDB stores for use with the synchronous libsignal API
// ============================================================================

class InMemorySessionStore {
  private sessions = new Map<string, any>();

  async saveSession(address: any, record: any): Promise<void> {
    this.sessions.set(`${address.name()}:${address.deviceId()}`, record);
  }

  async getSession(address: any): Promise<any | null> {
    return this.sessions.get(`${address.name()}:${address.deviceId()}`) || null;
  }
}

class InMemoryIdentityKeyStore {
  private identityKeyPair: any;
  private registrationId: number;
  private identities = new Map<string, any>();

  constructor(identityKeyPair: any, registrationId: number) {
    this.identityKeyPair = identityKeyPair;
    this.registrationId = registrationId;
  }

  async getIdentityKey(): Promise<any> {
    return this.identityKeyPair.publicKey;
  }

  async getLocalRegistrationId(): Promise<number> {
    return this.registrationId;
  }

  async saveIdentity(address: any, identityKey: any): Promise<boolean> {
    const key = `${address.name()}:${address.deviceId()}`;
    const existing = this.identities.get(key);
    this.identities.set(key, identityKey);
    
    if (existing) {
      // Return true if identity changed
      return !existing.serialize().equals(identityKey.serialize());
    }
    return false;
  }

  async isTrustedIdentity(
    address: any,
    identityKey: any,
    _direction: any
  ): Promise<boolean> {
    // For now, trust all identities (TODO: implement proper TOFU)
    return true;
  }

  async getIdentity(address: any): Promise<any | null> {
    return this.identities.get(`${address.name()}:${address.deviceId()}`) || null;
  }

  // Alias for compatibility
  async getIdentityKey2(address: any): Promise<any | null> {
    return this.getIdentity(address);
  }
}

class InMemoryPreKeyStore {
  private keyStore: SignalKeyStore;

  constructor(keyStore: SignalKeyStore) {
    this.keyStore = keyStore;
  }

  async getPreKey(preKeyId: number): Promise<any> {
    const signal = await initSignal();
    const preKey = await this.keyStore.getOneTimePreKey(preKeyId);
    
    if (!preKey) {
      throw new Error(`PreKey ${preKeyId} not found`);
    }

    const privateKey = signal.PrivateKey.deserialize(
      Buffer.from(preKey.privateKey, 'base64')
    );
    const publicKey = privateKey.getPublicKey();

    return signal.PreKeyRecord.new(preKeyId, publicKey, privateKey);
  }

  async savePreKey(_preKeyId: number, _record: any): Promise<void> {
    // One-time pre-keys are stored during generation, not here
  }

  async removePreKey(preKeyId: number): Promise<void> {
    // Already marked as used in getOneTimePreKey
    console.log(`[Signal] Pre-key ${preKeyId} consumed`);
  }
}

class InMemorySignedPreKeyStore {
  private keyStore: SignalKeyStore;

  constructor(keyStore: SignalKeyStore) {
    this.keyStore = keyStore;
  }

  async getSignedPreKey(signedPreKeyId: number): Promise<any> {
    const signal = await initSignal();
    const signedPreKey = await this.keyStore.getSignedPreKey(signedPreKeyId);
    
    if (!signedPreKey) {
      throw new Error(`Signed pre-key ${signedPreKeyId} not found`);
    }

    const privateKey = signal.PrivateKey.deserialize(
      Buffer.from(signedPreKey.privateKey, 'base64')
    );
    const publicKey = privateKey.getPublicKey();
    const signature = Buffer.from(signedPreKey.signature, 'base64');

    return signal.SignedPreKeyRecord.new(
      signedPreKeyId,
      signedPreKey.timestamp,
      publicKey,
      privateKey,
      signature
    );
  }

  async saveSignedPreKey(_signedPreKeyId: number, _record: any): Promise<void> {
    // Signed pre-keys are stored during generation, not here
  }
}

// ============================================================================
// Factory function for creating session manager
// ============================================================================

let sessionManagerInstance: SignalSessionManager | null = null;

export function getSignalSessionManager(
  deviceId: string,
  apiEndpoint: string
): SignalSessionManager {
  if (!sessionManagerInstance) {
    sessionManagerInstance = new SignalSessionManager(deviceId, apiEndpoint);
  }
  return sessionManagerInstance;
}

export function clearSignalSessionManager(): void {
  sessionManagerInstance = null;
}
