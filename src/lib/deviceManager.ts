/**
 * Device Manager for Multi-Device E2EE
 * 
 * Handles device registration, identification, and management for
 * the multi-device end-to-end encryption system.
 */

const DEVICE_ID_KEY = 'camposocial_device_id';
const DEVICE_INFO_KEY = 'camposocial_device_info';

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'web' | 'ios' | 'android' | 'desktop';
  publicKey: string;
  createdAt: string;
  lastActive: string;
  isActive: boolean;
  isCurrent?: boolean;
}

export interface DeviceKeysResponse {
  device_id: string;
  public_key: string;
  device_type: string;
}

/**
 * Generate a v4 UUID for device identification
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create a persistent device ID for this device.
 * Stored in localStorage for persistence across sessions.
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') {
    // SSR fallback
    return generateUUID();
  }
  
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    deviceId = generateUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
    console.log('[E2EE Device] Created new device ID:', deviceId.substring(0, 8) + '...');
  }
  
  return deviceId;
}

/**
 * Get the current device ID without creating one if it doesn't exist.
 */
export function getDeviceId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DEVICE_ID_KEY);
}

/**
 * Clear the device ID (used when logging out or revoking device)
 */
export function clearDeviceId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DEVICE_ID_KEY);
  localStorage.removeItem(DEVICE_INFO_KEY);
}

/**
 * Detect the device type based on user agent
 */
export function detectDeviceType(): 'web' | 'ios' | 'android' | 'desktop' {
  if (typeof window === 'undefined') return 'web';
  
  const ua = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/electron/.test(ua)) return 'desktop';
  
  return 'web';
}

/**
 * Generate a human-readable device name
 */
export function getDeviceName(): string {
  if (typeof window === 'undefined') return 'Unknown Device';
  
  const ua = navigator.userAgent;
  
  // Extract browser name
  let browser = 'Browser';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';
  
  // Extract OS/platform
  let platform = '';
  if (ua.includes('iPhone')) platform = 'iPhone';
  else if (ua.includes('iPad')) platform = 'iPad';
  else if (ua.includes('Android')) platform = 'Android';
  else if (ua.includes('Mac OS X')) platform = 'Mac';
  else if (ua.includes('Windows')) platform = 'Windows';
  else if (ua.includes('Linux')) platform = 'Linux';
  
  if (platform) {
    return `${browser} on ${platform}`;
  }
  
  return browser;
}

/**
 * Register this device with the server.
 * Should be called after keys are generated/restored.
 * 
 * @param publicKey - The device's NaCl public key
 * @param apiEndpoint - Base API endpoint URL
 * @param authToken - JWT authentication token
 * @returns The registered device info or null if registration failed
 */
export async function registerDevice(
  publicKey: string,
  apiEndpoint: string,
  authToken: string
): Promise<DeviceInfo | null> {
  try {
    const deviceId = getOrCreateDeviceId();
    const deviceName = getDeviceName();
    const deviceType = detectDeviceType();
    
    const response = await fetch(`${apiEndpoint}/devices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        device_id: deviceId,
        device_name: deviceName,
        device_type: deviceType,
        public_key: publicKey,
      }),
    });
    
    if (!response.ok) {
      console.error('[E2EE Device] Failed to register device:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    const deviceInfo: DeviceInfo = {
      id: data.device.id,
      name: data.device.device_name,
      type: data.device.device_type,
      publicKey: data.device.public_key,
      createdAt: data.device.created_at,
      lastActive: data.device.last_active,
      isActive: data.device.is_active,
      isCurrent: true,
    };
    
    // Cache device info locally
    localStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));
    
    console.log('[E2EE Device] Device registered:', deviceInfo.name);
    return deviceInfo;
  } catch (error) {
    console.error('[E2EE Device] Error registering device:', error);
    return null;
  }
}

/**
 * Get the list of user's registered devices.
 * 
 * @param apiEndpoint - Base API endpoint URL
 * @param authToken - JWT authentication token
 * @returns List of registered devices or null if request failed
 */
export async function listDevices(
  apiEndpoint: string,
  authToken: string
): Promise<DeviceInfo[] | null> {
  try {
    const response = await fetch(`${apiEndpoint}/devices`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    if (!response.ok) {
      console.error('[E2EE Device] Failed to list devices:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    const currentDeviceId = getDeviceId();
    
    return data.devices.map((d: any) => ({
      id: d.id,
      name: d.device_name,
      type: d.device_type,
      publicKey: d.public_key,
      createdAt: d.created_at,
      lastActive: d.last_active,
      isActive: d.is_active,
      isCurrent: d.id === currentDeviceId,
    }));
  } catch (error) {
    console.error('[E2EE Device] Error listing devices:', error);
    return null;
  }
}

/**
 * Revoke a device (removes its access to new messages).
 * 
 * @param deviceId - The device ID to revoke
 * @param apiEndpoint - Base API endpoint URL
 * @param authToken - JWT authentication token
 * @returns true if revocation was successful
 */
export async function revokeDevice(
  deviceId: string,
  apiEndpoint: string,
  authToken: string
): Promise<boolean> {
  try {
    const response = await fetch(`${apiEndpoint}/devices/${deviceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    if (!response.ok) {
      console.error('[E2EE Device] Failed to revoke device:', response.statusText);
      return false;
    }
    
    // If revoking current device, clear local device ID
    const currentDeviceId = getDeviceId();
    if (deviceId === currentDeviceId) {
      clearDeviceId();
    }
    
    console.log('[E2EE Device] Device revoked:', deviceId);
    return true;
  } catch (error) {
    console.error('[E2EE Device] Error revoking device:', error);
    return false;
  }
}

/**
 * Send a heartbeat to update device's last_active timestamp.
 * Should be called periodically while the app is in use.
 * 
 * @param apiEndpoint - Base API endpoint URL
 * @param authToken - JWT authentication token
 */
export async function sendDeviceHeartbeat(
  apiEndpoint: string,
  authToken: string
): Promise<void> {
  try {
    const deviceId = getDeviceId();
    if (!deviceId) return;
    
    await fetch(`${apiEndpoint}/devices/${deviceId}/heartbeat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
  } catch (error) {
    // Silently fail heartbeats - not critical
  }
}

/**
 * Get public keys for all of a user's active devices.
 * Used when encrypting messages for multi-device delivery.
 * 
 * @param userId - The target user's ID
 * @param apiEndpoint - Base API endpoint URL
 * @param authToken - JWT authentication token
 * @returns Array of device keys or null if request failed
 */
export async function getUserDeviceKeys(
  userId: number | string,
  apiEndpoint: string,
  authToken: string
): Promise<DeviceKeysResponse[] | null> {
  try {
    const response = await fetch(`${apiEndpoint}/keys/devices/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    if (!response.ok) {
      console.error('[E2EE Device] Failed to get user device keys:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    return data.devices;
  } catch (error) {
    console.error('[E2EE Device] Error getting user device keys:', error);
    return null;
  }
}

/**
 * Get public keys for multiple users' devices in bulk.
 * More efficient than individual requests when sending to conversations.
 * 
 * @param userIds - Array of user IDs
 * @param apiEndpoint - Base API endpoint URL
 * @param authToken - JWT authentication token
 * @returns Map of user ID to device keys, or null if request failed
 */
export async function getBulkDeviceKeys(
  userIds: (number | string)[],
  apiEndpoint: string,
  authToken: string
): Promise<Record<string, DeviceKeysResponse[]> | null> {
  try {
    const response = await fetch(`${apiEndpoint}/keys/devices/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        user_ids: userIds.map(id => Number(id)),
      }),
    });
    
    if (!response.ok) {
      console.error('[E2EE Device] Failed to get bulk device keys:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    return data.device_keys;
  } catch (error) {
    console.error('[E2EE Device] Error getting bulk device keys:', error);
    return null;
  }
}

/**
 * Get cached device info for current device
 */
export function getCachedDeviceInfo(): DeviceInfo | null {
  if (typeof window === 'undefined') return null;
  
  const cached = localStorage.getItem(DEVICE_INFO_KEY);
  if (!cached) return null;
  
  try {
    return JSON.parse(cached);
  } catch {
    return null;
  }
}

/**
 * Check if device is registered
 */
export function isDeviceRegistered(): boolean {
  return !!getDeviceId() && !!getCachedDeviceInfo();
}
