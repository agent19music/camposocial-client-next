/**
 * Signal Protocol E2EE Hook
 * 
 * React hook that provides Signal Protocol encryption/decryption
 * for the chat system. Handles key initialization, session management,
 * and message encryption/decryption.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { getOrCreateDeviceId } from '@/lib/deviceManager';
import type {
  SignalLocalKeys,
  SignalEncryptedMessage,
  SignalKeyStatus,
  PreKeyBundleResponse,
} from '@/types';

// Lazy load Signal modules to avoid SSR issues
let signalModules: Awaited<ReturnType<typeof loadSignalModules>> | null = null;

async function loadSignalModules() {
  const [crypto, stores, session] = await Promise.all([
    import('@/lib/signal/signalCrypto'),
    import('@/lib/signal/signalStores'),
    import('@/lib/signal/signalSession'),
  ]);
  return { crypto, stores, session };
}

export interface SignalE2EEState {
  keyStatus: SignalKeyStatus;
  isReady: boolean;
  deviceId: string | null;
  oneTimePreKeyCount: number;
  error: string | null;
}

export interface UseSignalE2EEOptions {
  apiEndpoint: string;
  authToken: string | null;
  userId: string | null;
  onKeysReady?: () => void;
}

export interface UseSignalE2EEReturn {
  state: SignalE2EEState;
  initialize: (password: string) => Promise<boolean>;
  encrypt: (recipientId: string, deviceId: string, plaintext: string) => Promise<SignalEncryptedMessage | null>;
  encryptForAllDevices: (recipientId: string, plaintext: string) => Promise<Record<string, SignalEncryptedMessage>>;
  decrypt: (senderId: string, senderDeviceId: string, message: SignalEncryptedMessage) => Promise<string | null>;
  getRecipientDevices: (userId: string) => Promise<string[]>;
  uploadPreKeyBundle: () => Promise<boolean>;
  replenishPreKeys: () => Promise<boolean>;
  clearKeys: () => Promise<void>;
}

export function useSignalE2EE(options: UseSignalE2EEOptions): UseSignalE2EEReturn {
  const { apiEndpoint, authToken, userId, onKeysReady } = options;
  
  const [state, setState] = useState<SignalE2EEState>({
    keyStatus: 'unavailable',
    isReady: false,
    deviceId: null,
    oneTimePreKeyCount: 0,
    error: null,
  });

  // Refs for stable access in callbacks
  const sessionManagerRef = useRef<any>(null);
  const keyStoreRef = useRef<any>(null);
  const localKeysRef = useRef<SignalLocalKeys | null>(null);
  const isInitializingRef = useRef(false);
  
  // Get device ID on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const deviceId = getOrCreateDeviceId();
      setState(s => ({ ...s, deviceId }));
    }
  }, []);

  // Update auth token in session manager
  useEffect(() => {
    if (sessionManagerRef.current && authToken) {
      sessionManagerRef.current.setAuthToken(authToken);
    }
  }, [authToken]);

  /**
   * Initialize Signal E2EE with user's password
   * Generates keys if needed and uploads prekey bundle
   */
  const initialize = useCallback(async (password: string): Promise<boolean> => {
    if (isInitializingRef.current) {
      console.log('[Signal] Already initializing');
      return false;
    }

    if (!userId) {
      console.error('[Signal] No user ID');
      return false;
    }

    isInitializingRef.current = true;
    setState(s => ({ ...s, keyStatus: 'generating', error: null }));

    try {
      // Load Signal modules
      if (!signalModules) {
        signalModules = await loadSignalModules();
      }
      const { crypto, stores, session } = signalModules;

      // Derive encryption salt from user ID
      const encoder = new TextEncoder();
      const salt = new Uint8Array(
        await window.crypto.subtle.digest(
          'SHA-256',
          encoder.encode(`camposocial-signal-${userId}`)
        )
      ).slice(0, 16);

      // Initialize key store
      keyStoreRef.current = stores.signalKeyStore;
      await keyStoreRef.current.initialize(password, salt);

      const deviceId = getOrCreateDeviceId();

      // Check if we have existing keys
      const hasKeys = await keyStoreRef.current.hasLocalIdentityKey();
      
      if (hasKeys) {
        console.log('[Signal] Loading existing keys');
        // Keys exist, just verify we can access them
        const localIdentity = await keyStoreRef.current.getLocalIdentityKey();
        if (!localIdentity) {
          throw new Error('Failed to load identity key');
        }
        
        // Get current signed prekey
        const signedPreKey = await keyStoreRef.current.getCurrentSignedPreKey();
        if (!signedPreKey) {
          console.log('[Signal] No signed prekey, generating new one');
          const identity = await keyStoreRef.current.getLocalIdentityKey();
          if (identity) {
            const newSignedPreKey = await crypto.generateSignedPreKey(identity.keyPair, Date.now());
            await keyStoreRef.current.storeSignedPreKey(newSignedPreKey);
          }
        }

        // Get remaining one-time prekey count
        const otkCount = await keyStoreRef.current.getOneTimePreKeyCount();
        
        // Construct local keys object
        const storedSignedPreKey = await keyStoreRef.current.getCurrentSignedPreKey();
        localKeysRef.current = {
          identityKeyPair: localIdentity.keyPair,
          registrationId: localIdentity.registrationId,
          signedPreKey: storedSignedPreKey!,
          oneTimePreKeys: [], // We don't need private keys for existing prekeys
        };

        setState(s => ({
          ...s,
          keyStatus: 'available',
          isReady: true,
          oneTimePreKeyCount: otkCount,
        }));
      } else {
        console.log('[Signal] Generating new keys');
        setState(s => ({ ...s, keyStatus: 'generating' }));

        // Generate all keys
        const newKeys = await crypto.generateAllKeys(100);
        localKeysRef.current = newKeys;

        // Store keys
        await keyStoreRef.current.storeLocalIdentityKey(
          newKeys.identityKeyPair,
          newKeys.registrationId
        );
        await keyStoreRef.current.storeSignedPreKey(newKeys.signedPreKey);
        await keyStoreRef.current.storeOneTimePreKeys(newKeys.oneTimePreKeys);

        setState(s => ({
          ...s,
          keyStatus: 'uploading',
          oneTimePreKeyCount: newKeys.oneTimePreKeys.length,
        }));

        // Upload prekey bundle to server
        if (authToken) {
          const bundle = crypto.createPreKeyBundle(newKeys, deviceId, true);
          
          const response = await fetch(`${apiEndpoint}/signal/keys`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              registrationId: bundle.registrationId,
              deviceId: bundle.deviceId,
              identityKey: bundle.identityKey,
              signedPreKey: {
                keyId: bundle.signedPreKeyId,
                publicKey: bundle.signedPreKey,
                signature: bundle.signedPreKeySignature,
              },
              oneTimePreKeys: bundle.allOneTimePreKeys,
            }),
          });

          if (!response.ok) {
            console.error('[Signal] Failed to upload prekey bundle:', response.status);
          }
        }

        setState(s => ({
          ...s,
          keyStatus: 'available',
          isReady: true,
        }));
      }

      // Initialize session manager
      sessionManagerRef.current = session.getSignalSessionManager(deviceId, apiEndpoint);
      if (authToken) {
        sessionManagerRef.current.setAuthToken(authToken);
      }

      isInitializingRef.current = false;
      onKeysReady?.();
      return true;
    } catch (error) {
      console.error('[Signal] Initialization failed:', error);
      setState(s => ({
        ...s,
        keyStatus: 'error',
        isReady: false,
        error: error instanceof Error ? error.message : 'Initialization failed',
      }));
      isInitializingRef.current = false;
      return false;
    }
  }, [userId, authToken, apiEndpoint, onKeysReady]);

  /**
   * Encrypt a message for a specific recipient device
   */
  const encrypt = useCallback(async (
    recipientId: string,
    deviceId: string,
    plaintext: string
  ): Promise<SignalEncryptedMessage | null> => {
    if (!sessionManagerRef.current || !state.isReady) {
      console.error('[Signal] Not ready for encryption');
      return null;
    }

    const result = await sessionManagerRef.current.encrypt(recipientId, deviceId, plaintext);
    
    if (!result.success) {
      console.error('[Signal] Encryption failed:', result.error);
      return null;
    }

    return result.message;
  }, [state.isReady]);

  /**
   * Get all device IDs for a user
   */
  const getRecipientDevices = useCallback(async (userId: string): Promise<string[]> => {
    if (!authToken) return [];

    try {
      const response = await fetch(`${apiEndpoint}/signal/keys/${userId}/devices`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        console.error('[Signal] Failed to get recipient devices:', response.status);
        return [];
      }

      const data = await response.json();
      return data.devices.map((d: any) => d.deviceId);
    } catch (error) {
      console.error('[Signal] Error fetching recipient devices:', error);
      return [];
    }
  }, [authToken, apiEndpoint]);

  /**
   * Encrypt a message for all devices of a recipient (and own devices)
   */
  const encryptForAllDevices = useCallback(async (
    recipientId: string,
    plaintext: string
  ): Promise<Record<string, SignalEncryptedMessage>> => {
    if (!sessionManagerRef.current || !state.isReady) {
      console.error('[Signal] Not ready for encryption');
      return {};
    }

    // Get all recipient devices
    const recipientDevices = await getRecipientDevices(recipientId);
    
    // Also encrypt for own devices (so we can read our own messages)
    const ownDevices = userId ? await getRecipientDevices(userId) : [];
    
    // Combine and dedupe
    const allDevices = new Map<string, string>();
    recipientDevices.forEach(d => allDevices.set(`${recipientId}:${d}`, d));
    ownDevices.forEach(d => allDevices.set(`${userId}:${d}`, d));

    const results: Record<string, SignalEncryptedMessage> = {};

    // Encrypt for each device
    for (const [key, deviceId] of allDevices) {
      const targetUserId = key.split(':')[0];
      const message = await encrypt(targetUserId, deviceId, plaintext);
      if (message) {
        results[deviceId] = message;
      }
    }

    return results;
  }, [state.isReady, userId, getRecipientDevices, encrypt]);

  /**
   * Decrypt a message from a sender
   */
  const decrypt = useCallback(async (
    senderId: string,
    senderDeviceId: string,
    message: SignalEncryptedMessage
  ): Promise<string | null> => {
    if (!sessionManagerRef.current || !state.isReady) {
      console.error('[Signal] Not ready for decryption');
      return null;
    }

    const result = await sessionManagerRef.current.decrypt(senderId, senderDeviceId, message);
    
    if (!result.success) {
      console.error('[Signal] Decryption failed:', result.error);
      return null;
    }

    return result.plaintext;
  }, [state.isReady]);

  /**
   * Upload/refresh prekey bundle
   */
  const uploadPreKeyBundle = useCallback(async (): Promise<boolean> => {
    if (!localKeysRef.current || !authToken || !state.deviceId) {
      return false;
    }

    if (!signalModules) {
      signalModules = await loadSignalModules();
    }
    const { crypto } = signalModules;

    try {
      const bundle = crypto.createPreKeyBundle(localKeysRef.current, state.deviceId, true);
      
      const response = await fetch(`${apiEndpoint}/signal/keys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId: bundle.registrationId,
          deviceId: bundle.deviceId,
          identityKey: bundle.identityKey,
          signedPreKey: {
            keyId: bundle.signedPreKeyId,
            publicKey: bundle.signedPreKey,
            signature: bundle.signedPreKeySignature,
          },
          oneTimePreKeys: bundle.allOneTimePreKeys || [],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('[Signal] Failed to upload prekey bundle:', error);
      return false;
    }
  }, [authToken, apiEndpoint, state.deviceId]);

  /**
   * Replenish one-time prekeys when low
   */
  const replenishPreKeys = useCallback(async (): Promise<boolean> => {
    if (!keyStoreRef.current || !authToken || !state.deviceId) {
      return false;
    }

    if (!signalModules) {
      signalModules = await loadSignalModules();
    }
    const { crypto } = signalModules;

    try {
      // Get current max key ID
      const maxId = await keyStoreRef.current.getMaxOneTimePreKeyId();
      
      // Generate 50 new keys
      const newKeys = await crypto.generateOneTimePreKeys(maxId + 1, 50);
      
      // Store locally
      await keyStoreRef.current.storeOneTimePreKeys(newKeys);
      
      // Upload to server
      const response = await fetch(`${apiEndpoint}/signal/keys/replenish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: state.deviceId,
          oneTimePreKeys: newKeys.map(k => ({
            keyId: k.keyId,
            publicKey: k.publicKey,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setState(s => ({ ...s, oneTimePreKeyCount: data.totalCount }));
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Signal] Failed to replenish prekeys:', error);
      return false;
    }
  }, [authToken, apiEndpoint, state.deviceId]);

  /**
   * Clear all local keys (logout)
   */
  const clearKeys = useCallback(async (): Promise<void> => {
    if (keyStoreRef.current) {
      await keyStoreRef.current.clearAll();
    }
    localKeysRef.current = null;
    sessionManagerRef.current = null;
    
    setState({
      keyStatus: 'unavailable',
      isReady: false,
      deviceId: getOrCreateDeviceId(),
      oneTimePreKeyCount: 0,
      error: null,
    });
  }, []);

  // Check prekey count periodically and replenish if needed
  useEffect(() => {
    if (!state.isReady || !authToken || state.oneTimePreKeyCount >= 20) {
      return;
    }

    const checkAndReplenish = async () => {
      console.log(`[Signal] Low prekey count (${state.oneTimePreKeyCount}), replenishing...`);
      await replenishPreKeys();
    };

    checkAndReplenish();
  }, [state.isReady, state.oneTimePreKeyCount, authToken, replenishPreKeys]);

  return {
    state,
    initialize,
    encrypt,
    encryptForAllDevices,
    decrypt,
    getRecipientDevices,
    uploadPreKeyBundle,
    replenishPreKeys,
    clearKeys,
  };
}
