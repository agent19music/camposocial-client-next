/**
 * IndexedDB Key Storage with Password-Based Encryption
 * 
 * Stores the user's private key in IndexedDB, encrypted with their password.
 * Uses Web Crypto API for PBKDF2 key derivation and AES-GCM encryption.
 */

import { KeyPair, generateKeyPair, isValidSecretKey, isValidPublicKey } from './crypto';

const DB_NAME = 'camposocial_keys';
const DB_VERSION = 1;
const STORE_NAME = 'keys';
const PBKDF2_ITERATIONS = 100000;
const KEY_DERIVATION_SALT = 'camposocial-e2ee-key-derivation-v1';

/**
 * Derive a consistent key password from user's login password and user ID.
 * This allows automatic unlocking of E2EE keys using login credentials.
 */
export async function deriveKeyPassword(loginPassword: string, userId: string | number): Promise<string> {
  const encoder = new TextEncoder();
  const salt = encoder.encode(`${KEY_DERIVATION_SALT}:${userId}`);
  
  // Import the password as a key
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(loginPassword),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    256  // 32 bytes
  );
  
  // Convert to base64 for use as the key password
  return btoa(String.fromCharCode(...new Uint8Array(derivedBits)));
}

interface StoredKeyData {
  id: string;  // Always 'user_keys'
  publicKey: string;
  encryptedSecretKey: string;  // Base64 encoded
  salt: string;  // Base64 encoded
  iv: string;    // Base64 encoded
}

/**
 * Open or create the IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Derive an AES-GCM key from password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt the secret key with AES-GCM using a password-derived key
 */
async function encryptSecretKey(secretKey: string, password: string): Promise<{
  encryptedData: string;
  salt: string;
  iv: string;
}> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const derivedKey = await deriveKey(password, salt);
  
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    derivedKey,
    encoder.encode(secretKey)
  );
  
  return {
    encryptedData: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

/**
 * Decrypt the secret key using a password-derived key
 */
async function decryptSecretKey(
  encryptedData: string,
  salt: string,
  iv: string,
  password: string
): Promise<string> {
  const saltBytes = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  const encryptedBytes = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  
  const derivedKey = await deriveKey(password, saltBytes);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes },
    derivedKey,
    encryptedBytes
  );
  
  return new TextDecoder().decode(decrypted);
}

/**
 * Store a keypair in IndexedDB with password encryption
 */
export async function storeKeyPair(
  keyPair: KeyPair,
  password: string
): Promise<void> {
  const db = await openDatabase();
  
  const { encryptedData, salt, iv } = await encryptSecretKey(keyPair.secretKey, password);
  
  const storedData: StoredKeyData = {
    id: 'user_keys',
    publicKey: keyPair.publicKey,
    encryptedSecretKey: encryptedData,
    salt,
    iv,
  };
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(storedData);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
    
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Retrieve the keypair from IndexedDB (requires password to decrypt secret key)
 */
export async function retrieveKeyPair(password: string): Promise<KeyPair | null> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('user_keys');
    
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
    
    request.onsuccess = async () => {
      db.close();
      
      const data = request.result as StoredKeyData | undefined;
      if (!data) {
        resolve(null);
        return;
      }
      
      try {
        const secretKey = await decryptSecretKey(
          data.encryptedSecretKey,
          data.salt,
          data.iv,
          password
        );
        
        resolve({
          publicKey: data.publicKey,
          secretKey,
        });
      } catch (error) {
        console.error('Failed to decrypt keys (wrong password?):', error);
        resolve(null);
      }
    };
  });
}

/**
 * Get just the public key (doesn't require password)
 */
export async function getPublicKey(): Promise<string | null> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('user_keys');
    
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
    
    request.onsuccess = () => {
      db.close();
      const data = request.result as StoredKeyData | undefined;
      resolve(data?.publicKey ?? null);
    };
  });
}

/**
 * Check if keys exist in storage and are valid NaCl format
 */
export async function hasStoredKeys(): Promise<boolean> {
  const publicKey = await getPublicKey();
  if (!publicKey) return false;
  
  // Check if it's a valid NaCl key (base64, 32 bytes when decoded)
  // Old PGP keys start with "-----BEGIN PGP"
  if (publicKey.startsWith('-----BEGIN')) {
    console.warn('Old PGP format key detected, needs migration');
    return false;
  }
  
  try {
    const decoded = atob(publicKey);
    return decoded.length === 32; // NaCl public key is 32 bytes
  } catch {
    return false;
  }
}

/**
 * Delete stored keys
 */
export async function deleteStoredKeys(): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete('user_keys');
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
    
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Generate and store a new keypair with password protection
 */
export async function generateAndStoreKeyPair(password: string): Promise<KeyPair> {
  const keyPair = generateKeyPair();
  await storeKeyPair(keyPair, password);
  return keyPair;
}

/**
 * Change the password for stored keys
 */
export async function changeKeyPassword(
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  const keyPair = await retrieveKeyPair(currentPassword);
  if (!keyPair) {
    return false;
  }
  
  await storeKeyPair(keyPair, newPassword);
  return true;
}

/**
 * Export encrypted key backup (for server storage or manual backup)
 */
export async function exportEncryptedBackup(password: string): Promise<string | null> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('user_keys');
    
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
    
    request.onsuccess = () => {
      db.close();
      const data = request.result as StoredKeyData | undefined;
      if (!data) {
        resolve(null);
        return;
      }
      
      // Export as JSON string (already encrypted with user's password)
      resolve(JSON.stringify({
        publicKey: data.publicKey,
        encryptedSecretKey: data.encryptedSecretKey,
        salt: data.salt,
        iv: data.iv,
      }));
    };
  });
}

/**
 * Import encrypted key backup
 */
export async function importEncryptedBackup(
  backupJson: string,
  password: string
): Promise<KeyPair | null> {
  try {
    const backup = JSON.parse(backupJson);
    
    // Verify we can decrypt with the provided password
    const secretKey = await decryptSecretKey(
      backup.encryptedSecretKey,
      backup.salt,
      backup.iv,
      password
    );
    
    // Validate the keys
    if (!isValidPublicKey(backup.publicKey) || !isValidSecretKey(secretKey)) {
      console.error('Invalid key format in backup');
      return null;
    }
    
    // Store in IndexedDB
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({
        id: 'user_keys',
        publicKey: backup.publicKey,
        encryptedSecretKey: backup.encryptedSecretKey,
        salt: backup.salt,
        iv: backup.iv,
      });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve({
        publicKey: backup.publicKey,
        secretKey,
      });
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Failed to import backup:', error);
    return null;
  }
}

