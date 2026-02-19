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
  generateKyberPreKey,
  generateAllKeys,
  createPreKeyBundle,
  verifySignedPreKey,
  getKeyFingerprint,
  serializePrivateKey,
  deserializePrivateKey,
  type SignalLocalKeysExtended,
} from './signalCrypto';

// Signal stores for key/session persistence
export {
  SignalKeyStore,
  signalKeyStore,
  type StoredIdentityKey,
  type StoredSignedPreKey,
  type StoredOneTimePreKey,
} from './signalStores';

// Session management and message encryption
export {
  SignalSessionManager,
  getSignalSessionManager,
  clearSignalSessionManager,
  type EncryptResult,
  type DecryptResult,
  type ExtendedPreKeyBundleResponse,
} from './signalSession';
