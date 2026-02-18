/**
 * Signal Protocol E2EE Module
 * 
 * Exports all Signal Protocol functionality for the chat system.
 */

// Core crypto operations
export {
  initSignal,
  isSignalInitialized,
  generateIdentityKeyPair,
  generateRegistrationId,
  generateSignedPreKey,
  generateOneTimePreKeys,
  generateAllKeys,
  createPreKeyBundle,
  verifySignedPreKey,
  getKeyFingerprint,
  serializePrivateKey,
  deserializePrivateKey,
} from './signalCrypto';

// Signal stores for key/session persistence
export {
  SignalKeyStore,
  type StoredIdentityKey,
  type StoredSignedPreKey,
  type StoredOneTimePreKey,
} from './signalStores';

// Session management and message encryption
export {
  SignalSessionManager,
  type EncryptResult,
  type DecryptResult,
} from './signalSession';
