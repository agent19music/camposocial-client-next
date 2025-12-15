/**
 * E2EE Crypto utilities using TweetNaCl (NaCl box)
 * 
 * Uses ECDH key exchange with XSalsa20-Poly1305 authenticated encryption.
 * The server never sees plaintext or private keys.
 */

import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';

export interface KeyPair {
  publicKey: string;  // Base64 encoded
  secretKey: string;  // Base64 encoded
}

export interface EncryptedPayload {
  ciphertext: string;  // Base64 encoded
  nonce: string;       // Base64 encoded
}

/**
 * Generate a new NaCl box keypair
 * @returns KeyPair with base64-encoded public and secret keys
 */
export function generateKeyPair(): KeyPair {
  const keyPair = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(keyPair.publicKey),
    secretKey: encodeBase64(keyPair.secretKey),
  };
}

/**
 * Encrypt a message using NaCl box (ECDH + XSalsa20-Poly1305)
 * 
 * @param message - Plaintext message to encrypt
 * @param recipientPublicKey - Recipient's base64-encoded public key
 * @param senderSecretKey - Sender's base64-encoded secret key
 * @returns EncryptedPayload with ciphertext and nonce
 */
export function encryptMessage(
  message: string,
  recipientPublicKey: string,
  senderSecretKey: string
): EncryptedPayload {
  const recipientPubKeyBytes = decodeBase64(recipientPublicKey);
  const senderSecKeyBytes = decodeBase64(senderSecretKey);
  
  // Generate a random nonce (24 bytes for NaCl box)
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  
  // Encode message to Uint8Array
  const messageBytes = new TextEncoder().encode(message);
  
  // Encrypt using NaCl box
  const ciphertext = nacl.box(
    messageBytes,
    nonce,
    recipientPubKeyBytes,
    senderSecKeyBytes
  );
  
  return {
    ciphertext: encodeBase64(ciphertext),
    nonce: encodeBase64(nonce),
  };
}

/**
 * Decrypt a message using NaCl box
 * 
 * @param ciphertext - Base64-encoded ciphertext
 * @param nonce - Base64-encoded nonce
 * @param senderPublicKey - Sender's base64-encoded public key
 * @param recipientSecretKey - Recipient's base64-encoded secret key
 * @returns Decrypted plaintext message or null if decryption fails
 */
export function decryptMessage(
  ciphertext: string,
  nonce: string,
  senderPublicKey: string,
  recipientSecretKey: string
): string | null {
  try {
    const ciphertextBytes = decodeBase64(ciphertext);
    const nonceBytes = decodeBase64(nonce);
    const senderPubKeyBytes = decodeBase64(senderPublicKey);
    const recipientSecKeyBytes = decodeBase64(recipientSecretKey);
    
    // Decrypt using NaCl box.open
    const decrypted = nacl.box.open(
      ciphertextBytes,
      nonceBytes,
      senderPubKeyBytes,
      recipientSecKeyBytes
    );
    
    if (!decrypted) {
      console.error('Decryption failed: invalid ciphertext or keys');
      return null;
    }
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

/**
 * Validate that a string is a valid base64-encoded NaCl public key
 */
export function isValidPublicKey(key: string): boolean {
  try {
    const decoded = decodeBase64(key);
    return decoded.length === nacl.box.publicKeyLength;
  } catch {
    return false;
  }
}

/**
 * Validate that a string is a valid base64-encoded NaCl secret key
 */
export function isValidSecretKey(key: string): boolean {
  try {
    const decoded = decodeBase64(key);
    return decoded.length === nacl.box.secretKeyLength;
  } catch {
    return false;
  }
}

// Re-export base64 utilities for convenience
export { encodeBase64, decodeBase64 };



