/**
 * Signal Protocol Crypto Core
 * 
 * Key generation and cryptographic operations using @signalapp/libsignal-client.
 * This module handles identity keys, signed pre-keys, and one-time pre-keys.
 */

import type {
  SignalIdentityKeyPair,
  SignalSignedPreKey,
  SignalOneTimePreKey,
  SignalLocalKeys,
  SignalPreKeyBundle,
} from '@/types';

// Dynamic import of libsignal to avoid SSR issues
let libsignal: typeof import('@signalapp/libsignal-client') | null = null;

/**
 * Initialize the Signal library (must be called on client-side only)
 */
export async function initSignal(): Promise<typeof import('@signalapp/libsignal-client')> {
  if (typeof window === 'undefined') {
    throw new Error('Signal library can only be used on client-side');
  }
  
  if (!libsignal) {
    libsignal = await import('@signalapp/libsignal-client');
  }
  
  return libsignal;
}

/**
 * Check if Signal library is initialized
 */
export function isSignalInitialized(): boolean {
  return libsignal !== null;
}

/**
 * Generate a new identity key pair
 * This is the long-term key used for identity verification
 */
export async function generateIdentityKeyPair(): Promise<SignalIdentityKeyPair> {
  const signal = await initSignal();
  const keyPair = signal.PrivateKey.generate();
  
  return {
    publicKey: Buffer.from(keyPair.getPublicKey().serialize()).toString('base64'),
    privateKey: Buffer.from(keyPair.serialize()).toString('base64'),
  };
}

/**
 * Generate a registration ID (random 14-bit integer)
 * Used to identify this installation of the app
 */
export async function generateRegistrationId(): Promise<number> {
  // Registration ID should be a random 14-bit number (0 to 16383)
  const randomBytes = new Uint8Array(2);
  crypto.getRandomValues(randomBytes);
  return ((randomBytes[0] << 8) | randomBytes[1]) & 0x3FFF;
}

/**
 * Generate a signed pre-key signed by the identity key
 * @param identityKeyPair - The identity key pair to sign with
 * @param keyId - The key ID for this signed pre-key
 */
export async function generateSignedPreKey(
  identityKeyPair: SignalIdentityKeyPair,
  keyId: number
): Promise<SignalSignedPreKey> {
  const signal = await initSignal();
  
  // Deserialize identity private key
  const identityPrivateKey = signal.PrivateKey.deserialize(
    Buffer.from(identityKeyPair.privateKey, 'base64')
  );
  
  // Generate the signed pre-key pair
  const signedPreKeyPair = signal.PrivateKey.generate();
  const signedPreKeyPublic = signedPreKeyPair.getPublicKey();
  
  // Sign the public key with identity key
  const signature = identityPrivateKey.sign(signedPreKeyPublic.serialize());
  
  return {
    keyId,
    publicKey: Buffer.from(signedPreKeyPublic.serialize()).toString('base64'),
    privateKey: Buffer.from(signedPreKeyPair.serialize()).toString('base64'),
    signature: Buffer.from(signature).toString('base64'),
    timestamp: Date.now(),
  };
}

/**
 * Generate a batch of one-time pre-keys
 * @param startId - Starting key ID
 * @param count - Number of keys to generate
 */
export async function generateOneTimePreKeys(
  startId: number,
  count: number
): Promise<SignalOneTimePreKey[]> {
  const signal = await initSignal();
  const keys: SignalOneTimePreKey[] = [];
  
  for (let i = 0; i < count; i++) {
    const keyPair = signal.PrivateKey.generate();
    
    keys.push({
      keyId: startId + i,
      publicKey: Buffer.from(keyPair.getPublicKey().serialize()).toString('base64'),
      privateKey: Buffer.from(keyPair.serialize()).toString('base64'),
    });
  }
  
  return keys;
}

/**
 * Generate a complete set of Signal keys for a new device
 * @param oneTimePreKeyCount - Number of one-time pre-keys to generate (default: 100)
 */
export async function generateAllKeys(oneTimePreKeyCount: number = 100): Promise<SignalLocalKeys> {
  const identityKeyPair = await generateIdentityKeyPair();
  const registrationId = await generateRegistrationId();
  const signedPreKey = await generateSignedPreKey(identityKeyPair, 1);
  const oneTimePreKeys = await generateOneTimePreKeys(1, oneTimePreKeyCount);
  
  return {
    identityKeyPair,
    registrationId,
    signedPreKey,
    oneTimePreKeys,
  };
}

/**
 * Create a pre-key bundle for uploading to server
 * Contains only public keys and signature
 */
export function createPreKeyBundle(
  localKeys: SignalLocalKeys,
  deviceId: string,
  includeAllOneTimeKeys: boolean = true
): SignalPreKeyBundle & { allOneTimePreKeys?: Array<{ keyId: number; publicKey: string }> } {
  const bundle: SignalPreKeyBundle & { allOneTimePreKeys?: Array<{ keyId: number; publicKey: string }> } = {
    registrationId: localKeys.registrationId,
    deviceId,
    identityKey: localKeys.identityKeyPair.publicKey,
    signedPreKeyId: localKeys.signedPreKey.keyId,
    signedPreKey: localKeys.signedPreKey.publicKey,
    signedPreKeySignature: localKeys.signedPreKey.signature,
  };
  
  // Include the first one-time pre-key if available
  if (localKeys.oneTimePreKeys.length > 0) {
    bundle.oneTimePreKeyId = localKeys.oneTimePreKeys[0].keyId;
    bundle.oneTimePreKey = localKeys.oneTimePreKeys[0].publicKey;
  }
  
  // Include all one-time pre-keys for bulk upload
  if (includeAllOneTimeKeys) {
    bundle.allOneTimePreKeys = localKeys.oneTimePreKeys.map(k => ({
      keyId: k.keyId,
      publicKey: k.publicKey,
    }));
  }
  
  return bundle;
}

/**
 * Verify a signed pre-key signature
 * @param identityKey - Base64 encoded identity public key
 * @param signedPreKey - Base64 encoded signed pre-key public key
 * @param signature - Base64 encoded signature
 */
export async function verifySignedPreKey(
  identityKey: string,
  signedPreKey: string,
  signature: string
): Promise<boolean> {
  const signal = await initSignal();
  
  try {
    const identityPubKey = signal.PublicKey.deserialize(
      Buffer.from(identityKey, 'base64')
    );
    const signedPreKeyBytes = Buffer.from(signedPreKey, 'base64');
    const signatureBytes = Buffer.from(signature, 'base64');
    
    return identityPubKey.verify(signedPreKeyBytes, signatureBytes);
  } catch (error) {
    console.error('[Signal] Failed to verify signed pre-key:', error);
    return false;
  }
}

/**
 * Get public key fingerprint for identity verification
 * @param publicKey - Base64 encoded public key
 */
export async function getKeyFingerprint(publicKey: string): Promise<string> {
  const keyBytes = Buffer.from(publicKey, 'base64');
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyBytes);
  const hashArray = new Uint8Array(hashBuffer);
  
  // Format as groups of 5 digits for readability
  const digits: string[] = [];
  for (let i = 0; i < 30; i += 5) {
    const chunk = hashArray.slice(i, i + 5);
    const num = chunk.reduce((acc, byte, idx) => acc + (byte << (8 * idx)), 0);
    digits.push(String(num % 100000).padStart(5, '0'));
  }
  
  return digits.join(' ');
}

/**
 * Serialize private key for encrypted storage
 */
export function serializePrivateKey(privateKey: string): Uint8Array {
  return Buffer.from(privateKey, 'base64');
}

/**
 * Deserialize private key from encrypted storage
 */
export function deserializePrivateKey(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}
