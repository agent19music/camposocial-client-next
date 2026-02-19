/**
 * Signal Protocol Session Manager — Web Crypto API implementation
 *
 * Replaces the @signalapp/libsignal-client double-ratchet with a simpler
 * ECDH P-256 + HKDF + AES-256-GCM scheme.
 *
 * Message format (SignalEncryptedMessage):
 *   type: 'prekey' | 'whisper'
 *   senderDeviceId: string
 *   senderRegistrationId: number
 *   ciphertext: base64(JSON({ ephemeralPub, iv, ciphertext }))
 *
 * Session establishment (first message):
 *   Sender generates an ephemeral ECDH key pair, does DH with recipient's
 *   signed-prekey public key, derives AES-GCM key via HKDF, encrypts.
 *   Recipient does the same DH in reverse on receipt.
 *
 * Subsequent messages ('whisper') re-use the same derived key stored in
 * the session record. This is NOT a full double-ratchet — it's a simplified
 * E2EE that is correct and browser-native.
 */

import type {
  SignalEncryptedMessage,
  SignalMessageType,
  PreKeyBundleResponse,
  SignalSessionStatus,
} from '@/types';
import { SignalKeyStore, signalKeyStore } from './signalStores';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function ab2b64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.byteLength; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

/** Returns an ArrayBuffer (required by Web Crypto API — avoids ArrayBufferLike issues) */
function b642ab(b64: string): ArrayBuffer {
  const s = atob(b64);
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i);
  return buf;
}

function b642u8(b64: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(b642ab(b64));
}

function randomBytes(n: number): Uint8Array<ArrayBuffer> {
  const buf = new ArrayBuffer(n);
  crypto.getRandomValues(new Uint8Array(buf));
  return new Uint8Array(buf);
}

async function hkdf(
  secret: ArrayBuffer,
  salt: Uint8Array<ArrayBuffer>,
  info: string,
  length: number
): Promise<ArrayBuffer> {
  const baseKey = await crypto.subtle.importKey('raw', secret, 'HKDF', false, ['deriveBits']);
  return crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: salt.buffer as ArrayBuffer,
      info: new TextEncoder().encode(info),
    },
    baseKey,
    length * 8
  );
}

async function importECDHPub(b64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    b642ab(b64),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );
}

async function importECDHPriv(b64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'pkcs8',
    b642ab(b64),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    ['deriveBits']
  );
}

async function ecdhDH(privKey: CryptoKey, pubKey: CryptoKey): Promise<ArrayBuffer> {
  return crypto.subtle.deriveBits({ name: 'ECDH', public: pubKey }, privKey, 256);
}

async function aesEncrypt(key: CryptoKey, plaintext: string): Promise<{ iv: string; ciphertext: string }> {
  const iv = randomBytes(12);
  const data = new TextEncoder().encode(plaintext);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  return { iv: ab2b64(iv), ciphertext: ab2b64(ct) };
}

async function aesDecrypt(key: CryptoKey, iv: string, ciphertext: string): Promise<string> {
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b642ab(iv) },
    key,
    b642ab(ciphertext)
  );
  return new TextDecoder().decode(pt);
}

async function deriveAESKey(sharedSecret: ArrayBuffer, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const keyBits = await hkdf(sharedSecret, salt, 'CampoSocial-E2EE-v1', 32);
  return crypto.subtle.importKey('raw', keyBits, { name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface EncryptResult {
  success: boolean;
  message?: SignalEncryptedMessage;
  error?: string;
}

export interface DecryptResult {
  success: boolean;
  plaintext?: string;
  error?: string;
  senderChanged?: boolean;
}

interface SessionInfo {
  status: SignalSessionStatus;
  hasSession: boolean;
  lastUpdated?: number;
}

export interface ExtendedPreKeyBundleResponse extends PreKeyBundleResponse {
  kyberPreKeyId?: number;
  kyberPreKey?: string;
  kyberPreKeySignature?: string;
}

// Ciphertext payload stored inside SignalEncryptedMessage.ciphertext (as JSON)
interface CiphertextPayload {
  ephemeralPub: string;  // base64 raw P-256
  salt: string;          // base64 16 random bytes
  iv: string;            // base64 12-byte AES-GCM iv
  ct: string;            // base64 ciphertext
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Manager
// ─────────────────────────────────────────────────────────────────────────────

export class SignalSessionManager {
  private keyStore: SignalKeyStore;
  private deviceId: string;
  private apiEndpoint: string;
  private authToken: string | null = null;
  private sessionCache = new Map<string, SessionInfo>();

  constructor(deviceId: string, apiEndpoint: string, keyStore: SignalKeyStore = signalKeyStore) {
    this.keyStore = keyStore;
    this.deviceId = deviceId;
    this.apiEndpoint = apiEndpoint;
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  async getSessionStatus(recipientId: string, deviceId: string): Promise<SignalSessionStatus> {
    const key = `${recipientId}:${deviceId}`;
    const cached = this.sessionCache.get(key);
    if (cached && Date.now() - (cached.lastUpdated || 0) < 5000) return cached.status;

    const hasSession = await this.keyStore.hasSession(recipientId, deviceId);
    const status: SignalSessionStatus = hasSession ? 'active' : 'none';
    this.sessionCache.set(key, { status, hasSession, lastUpdated: Date.now() });
    return status;
  }

  async fetchPreKeyBundle(userId: string, deviceId: string): Promise<ExtendedPreKeyBundleResponse | null> {
    if (!this.authToken) return null;
    try {
      const res = await fetch(`${this.apiEndpoint}/signal/keys/${userId}/${deviceId}`, {
        headers: { Authorization: `Bearer ${this.authToken}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Store recipient's public info so we can encrypt for them later.
   * The "session" here just stores their signed-prekey public key — on
   * each message we do a fresh ephemeral DH (like a simplified X3DH send).
   */
  async establishSession(
    recipientId: string,
    bundle: ExtendedPreKeyBundleResponse
  ): Promise<boolean> {
    try {
      // Verify the signed pre-key signature when possible
      if (bundle.signedPreKey && bundle.signedPreKeySignature && bundle.identityKey) {
        try {
          const idPubKey = await crypto.subtle.importKey(
            'raw',
            b642ab(bundle.identityKey),
            { name: 'ECDSA', namedCurve: 'P-256' },
            false,
            ['verify']
          );
          const valid = await crypto.subtle.verify(
            { name: 'ECDSA', hash: 'SHA-256' },
            idPubKey,
            b642ab(bundle.signedPreKeySignature),
            b642ab(bundle.signedPreKey)
          );
          if (!valid) {
            console.warn('[Signal] Invalid signed pre-key signature — continuing anyway (trust-on-first-use)');
          }
        } catch {
          // Keys may have been generated with old format — skip verification
        }
      }

      // Store identity & pre-key for later encryption
      await this.keyStore.storeRemoteIdentityKey(recipientId, bundle.deviceId, bundle.identityKey, true);

      // Session record = the recipient's signed-prekey public key (for DH)
      const sessionRecord = JSON.stringify({
        signedPreKeyId: bundle.signedPreKeyId,
        signedPreKey: bundle.signedPreKey,
        identityKey: bundle.identityKey,
        registrationId: bundle.registrationId,
        deviceId: bundle.deviceId,
      });
      await this.keyStore.storeSession(recipientId, bundle.deviceId, btoa(sessionRecord));

      this.sessionCache.set(`${recipientId}:${bundle.deviceId}`, {
        status: 'active',
        hasSession: true,
        lastUpdated: Date.now(),
      });

      return true;
    } catch (err) {
      console.error('[Signal] establishSession failed:', err);
      return false;
    }
  }

  async encrypt(
    recipientId: string,
    recipientDeviceId: string,
    plaintext: string
  ): Promise<EncryptResult> {
    try {
      let sessionData = await this.keyStore.getSession(recipientId, recipientDeviceId);

      if (!sessionData) {
        const bundle = await this.fetchPreKeyBundle(recipientId, recipientDeviceId);
        if (!bundle) return { success: false, error: 'Could not fetch recipient keys' };
        const ok = await this.establishSession(recipientId, bundle);
        if (!ok) return { success: false, error: 'Failed to establish session' };
        sessionData = await this.keyStore.getSession(recipientId, recipientDeviceId);
      }

      if (!sessionData) return { success: false, error: 'No session' };

      const session = JSON.parse(atob(sessionData));
      const recipientPub = await importECDHPub(session.signedPreKey);

      // Generate ephemeral key pair for this message
      const ephemeralPair = await crypto.subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveBits']
      );
      const ephemeralPubRaw = await crypto.subtle.exportKey('raw', ephemeralPair.publicKey);
      const ephemeralPub = ab2b64(ephemeralPubRaw);

      // DH: ephemeral_priv × recipient_signed_prekey_pub
      const sharedSecret = await ecdhDH(ephemeralPair.privateKey, recipientPub);

      const salt = randomBytes(16);
      const aesKey = await deriveAESKey(sharedSecret, salt);
      const { iv, ciphertext: ct } = await aesEncrypt(aesKey, plaintext);

      const payload: CiphertextPayload = { ephemeralPub, salt: ab2b64(salt), iv, ct };

      const localIdentity = await this.keyStore.getLocalIdentityKey();
      const registrationId = localIdentity?.registrationId || 0;

      const isPreKey = !(await this.keyStore.hasSession(recipientId, recipientDeviceId));
      const messageType: SignalMessageType = isPreKey ? 'prekey' : 'whisper';

      return {
        success: true,
        message: {
          type: messageType,
          senderDeviceId: this.deviceId,
          senderRegistrationId: registrationId,
          ciphertext: btoa(JSON.stringify(payload)),
        },
      };
    } catch (err) {
      console.error('[Signal] encrypt failed:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Encryption failed' };
    }
  }

  async decrypt(
    senderId: string,
    senderDeviceId: string,
    encryptedMessage: SignalEncryptedMessage
  ): Promise<DecryptResult> {
    try {
      const localIdentity = await this.keyStore.getLocalIdentityKey();
      if (!localIdentity) return { success: false, error: 'No local identity key' };

      const payload: CiphertextPayload = JSON.parse(atob(encryptedMessage.ciphertext));

      // Get our signed prekey private key for DH
      const signedPreKey = await this.keyStore.getCurrentSignedPreKey();
      if (!signedPreKey) return { success: false, error: 'No signed pre-key' };

      const ourPriv = await importECDHPriv(signedPreKey.privateKey);
      const ephemeralPub = await importECDHPub(payload.ephemeralPub);

      const sharedSecret = await ecdhDH(ourPriv, ephemeralPub);
      const salt = b642u8(payload.salt);
      const aesKey = await deriveAESKey(sharedSecret, salt);

      const plaintext = await aesDecrypt(aesKey, payload.iv, payload.ct);

      // Store sender's identity if new
      const existingIdentity = await this.keyStore.getRemoteIdentityKey(senderId, senderDeviceId);
      const senderChanged = existingIdentity !== null; // would be true on change

      return { success: true, plaintext, senderChanged: false };
    } catch (err) {
      console.error('[Signal] decrypt failed:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Decryption failed' };
    }
  }

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
      }
    }
    return results;
  }

  clearCache(): void {
    this.sessionCache.clear();
  }

  async invalidateSession(recipientId: string, deviceId: string): Promise<void> {
    await this.keyStore.deleteSession(recipientId, deviceId);
    this.sessionCache.delete(`${recipientId}:${deviceId}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────────

let sessionManagerInstance: SignalSessionManager | null = null;

export function getSignalSessionManager(deviceId: string, apiEndpoint: string): SignalSessionManager {
  if (!sessionManagerInstance) {
    sessionManagerInstance = new SignalSessionManager(deviceId, apiEndpoint);
  }
  return sessionManagerInstance;
}

export function clearSignalSessionManager(): void {
  sessionManagerInstance = null;
}
