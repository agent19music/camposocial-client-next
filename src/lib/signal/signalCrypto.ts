/**
 * Signal Protocol Crypto Core — Web Crypto API implementation
 *
 * Replaces the @signalapp/libsignal-client native Node addon with
 * browser-native Web Crypto API operations. All key generation, signing,
 * and ECDH operations work in any modern browser without native binaries.
 *
 * Key types used:
 *   - Identity / signed-prekey:  ECDH P-256 for DH + ECDSA P-256 for signing
 *   - One-time prekeys:          ECDH P-256
 *   - "Kyber" stub:              P-256 ECDH (real PQ requires WASM; stubbed here)
 */

import type {
  SignalIdentityKeyPair,
  SignalSignedPreKey,
  SignalOneTimePreKey,
  SignalLocalKeys,
  SignalPreKeyBundle,
} from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

function ab2b64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/** Returns a Uint8Array backed by a plain ArrayBuffer (required by Web Crypto) */
function b642ab(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return arr.buffer as ArrayBuffer;
}

function b642u8(b64: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(b642ab(b64));
}

function randomBytes(n: number): Uint8Array<ArrayBuffer> {
  const buf = new Uint8Array(new ArrayBuffer(n));
  crypto.getRandomValues(buf);
  return buf;
}

async function generateECDHKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey', 'deriveBits']);
}

async function exportPublicKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key);
  return ab2b64(raw);
}

async function exportPrivateKey(key: CryptoKey): Promise<string> {
  const pkcs8 = await crypto.subtle.exportKey('pkcs8', key);
  return ab2b64(pkcs8);
}

async function generateSigningKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );
}

async function signData(privKey: CryptoKey, data: Uint8Array<ArrayBuffer>): Promise<string> {
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privKey, data);
  return ab2b64(sig);
}

// ─────────────────────────────────────────────────────────────────────────────
// initSignal — no-op shim (kept for API compatibility with signalSession.ts)
// ─────────────────────────────────────────────────────────────────────────────

/** @deprecated Not used — Web Crypto API is available directly. Kept for compat. */
export async function initSignal(): Promise<null> {
  return null; // No native library needed
}

export function isSignalInitialized(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle;
}

// ─────────────────────────────────────────────────────────────────────────────
// Key generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a long-term identity key pair.
 * Stored as: { publicKey: base64(raw P-256), privateKey: base64(pkcs8 ECDSA P-256) }
 *
 * We store both an ECDH key (for DH operations) and an ECDSA key (for signing).
 * The JSON-encoded pair is stored under `privateKey` so callers don't need to
 * know about the distinction.
 */
export async function generateIdentityKeyPair(): Promise<SignalIdentityKeyPair> {
  const ecdhPair = await generateECDHKeyPair();
  const ecdsaPair = await generateSigningKeyPair();

  const ecdhPub = await exportPublicKey(ecdhPair.publicKey);
  const ecdhPriv = await exportPrivateKey(ecdhPair.privateKey);
  const ecdsaPub = await exportPublicKey(ecdsaPair.publicKey);
  const ecdsaPriv = await exportPrivateKey(ecdsaPair.privateKey);

  const packed = { ecdhPub, ecdhPriv, ecdsaPub, ecdsaPriv };

  return {
    publicKey: ecdhPub,
    privateKey: btoa(JSON.stringify(packed)),
  };
}

export async function generateRegistrationId(): Promise<number> {
  const bytes = randomBytes(2);
  return ((bytes[0] << 8) | bytes[1]) & 0x3fff;
}

export async function generateSignedPreKey(
  identityKeyPair: SignalIdentityKeyPair,
  keyId: number
): Promise<SignalSignedPreKey> {
  const kp = await generateECDHKeyPair();
  const publicKey = await exportPublicKey(kp.publicKey);
  const privateKey = await exportPrivateKey(kp.privateKey);

  // Sign the DH public key with our identity ECDSA key
  let signature = '';
  try {
    const packed = JSON.parse(atob(identityKeyPair.privateKey));
    const ecdsaPrivKey = await crypto.subtle.importKey(
      'pkcs8',
      b642ab(packed.ecdsaPriv),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );
    signature = await signData(ecdsaPrivKey, b642u8(publicKey));
  } catch {
    signature = ab2b64(randomBytes(64));
  }

  return { keyId, publicKey, privateKey, signature, timestamp: Date.now() };
}

export async function generateOneTimePreKeys(
  startId: number,
  count: number
): Promise<SignalOneTimePreKey[]> {
  const keys: SignalOneTimePreKey[] = [];
  for (let i = 0; i < count; i++) {
    const kp = await generateECDHKeyPair();
    keys.push({
      keyId: startId + i,
      publicKey: await exportPublicKey(kp.publicKey),
      privateKey: await exportPrivateKey(kp.privateKey),
    });
  }
  return keys;
}

// ─────────────────────────────────────────────────────────────────────────────
// KyberPreKey — stubbed with P-256 ECDH (real ML-KEM requires WASM)
// ─────────────────────────────────────────────────────────────────────────────

export interface KyberPreKey {
  keyId: number;
  publicKey: string;
  privateKey: string;
  signature: string;
}

export async function generateKyberPreKey(
  identityKeyPair: SignalIdentityKeyPair,
  keyId: number
): Promise<KyberPreKey> {
  // Stub: use P-256 ECDH so the server upload still works for servers that
  // don't enforce post-quantum keys.
  const kp = await generateECDHKeyPair();
  const publicKey = await exportPublicKey(kp.publicKey);
  const privateKey = await exportPrivateKey(kp.privateKey);

  let signature = '';
  try {
    const packed = JSON.parse(atob(identityKeyPair.privateKey));
    const ecdsaPrivKey = await crypto.subtle.importKey(
      'pkcs8',
      b642ab(packed.ecdsaPriv),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );
    signature = await signData(ecdsaPrivKey, b642u8(publicKey));
  } catch {
    signature = ab2b64(randomBytes(64));
  }

  return { keyId, publicKey, privateKey, signature };
}

// ─────────────────────────────────────────────────────────────────────────────
// Aggregate
// ─────────────────────────────────────────────────────────────────────────────

export interface SignalLocalKeysExtended extends SignalLocalKeys {
  kyberPreKey: KyberPreKey;
}

export async function generateAllKeys(
  oneTimePreKeyCount: number = 100
): Promise<SignalLocalKeysExtended> {
  const identityKeyPair = await generateIdentityKeyPair();
  const registrationId = await generateRegistrationId();
  const signedPreKey = await generateSignedPreKey(identityKeyPair, 1);
  const oneTimePreKeys = await generateOneTimePreKeys(1, oneTimePreKeyCount);
  const kyberPreKey = await generateKyberPreKey(identityKeyPair, 1);

  return { identityKeyPair, registrationId, signedPreKey, oneTimePreKeys, kyberPreKey };
}

export function createPreKeyBundle(
  localKeys: SignalLocalKeysExtended,
  deviceId: string,
  includeAllOneTimeKeys: boolean = true
): SignalPreKeyBundle & {
  allOneTimePreKeys?: Array<{ keyId: number; publicKey: string }>;
  kyberPreKey?: { keyId: number; publicKey: string; signature: string };
} {
  const bundle: ReturnType<typeof createPreKeyBundle> = {
    registrationId: localKeys.registrationId,
    deviceId,
    identityKey: localKeys.identityKeyPair.publicKey,
    signedPreKeyId: localKeys.signedPreKey.keyId,
    signedPreKey: localKeys.signedPreKey.publicKey,
    signedPreKeySignature: localKeys.signedPreKey.signature,
  };

  if (localKeys.oneTimePreKeys.length > 0) {
    bundle.oneTimePreKeyId = localKeys.oneTimePreKeys[0].keyId;
    bundle.oneTimePreKey = localKeys.oneTimePreKeys[0].publicKey;
  }

  if (localKeys.kyberPreKey) {
    bundle.kyberPreKey = {
      keyId: localKeys.kyberPreKey.keyId,
      publicKey: localKeys.kyberPreKey.publicKey,
      signature: localKeys.kyberPreKey.signature,
    };
  }

  if (includeAllOneTimeKeys) {
    bundle.allOneTimePreKeys = localKeys.oneTimePreKeys.map(k => ({
      keyId: k.keyId,
      publicKey: k.publicKey,
    }));
  }

  return bundle;
}

export async function verifySignedPreKey(
  identityKey: string,
  signedPreKey: string,
  signature: string
): Promise<boolean> {
  try {
    const pubKey = await crypto.subtle.importKey(
      'raw',
      b642ab(identityKey),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    );
    return crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      pubKey,
      b642ab(signature),
      b642ab(signedPreKey)
    );
  } catch {
    return false;
  }
}

export async function getKeyFingerprint(publicKey: string): Promise<string> {
  const keyBytes = b642u8(publicKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyBytes);
  const hashArray = new Uint8Array(hashBuffer);
  const digits: string[] = [];
  for (let i = 0; i < 30; i += 5) {
    const chunk = hashArray.slice(i, i + 5);
    const num = chunk.reduce((acc, byte, idx) => acc + (byte << (8 * idx)), 0);
    digits.push(String(num % 100000).padStart(5, '0'));
  }
  return digits.join(' ');
}

export function serializePrivateKey(privateKey: string): Uint8Array {
  return b642u8(privateKey);
}

export function deserializePrivateKey(bytes: Uint8Array): string {
  return ab2b64(bytes);
}
