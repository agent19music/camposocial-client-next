"use client";

import { useState, useEffect, useCallback } from "react";
import { useContext } from "react";
import { AuthContext } from "../../context/authcontext";
import { 
    listDevices, 
    revokeDevice, 
    getDeviceId,
    DeviceInfo 
} from "../../lib/deviceManager";
import { 
    Smartphone, 
    Laptop, 
    Monitor, 
    Tablet,
    Trash2,
    RefreshCw,
    Shield,
    CheckCircle,
    AlertCircle
} from "lucide-react";

interface DeviceManagementProps {
    onBackupClick?: () => void;
}

export function DeviceManagement({ onBackupClick }: DeviceManagementProps) {
    const { authToken } = useContext(AuthContext);
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
    
    const [devices, setDevices] = useState<DeviceInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revokingDevice, setRevokingDevice] = useState<string | null>(null);
    
    const currentDeviceId = getDeviceId();
    
    const fetchDevices = useCallback(async () => {
        if (!authToken || !apiEndpoint) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const deviceList = await listDevices(apiEndpoint, authToken);
            if (deviceList) {
                setDevices(deviceList);
            } else {
                setError("Failed to load devices");
            }
        } catch (err) {
            setError("Error loading devices");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [authToken, apiEndpoint]);
    
    useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);
    
    const handleRevokeDevice = async (deviceId: string) => {
        if (!authToken || !apiEndpoint) return;
        
        const isCurrentDevice = deviceId === currentDeviceId;
        
        if (isCurrentDevice) {
            const confirmed = window.confirm(
                "This will log out this device. You'll need to set up E2EE again when you log back in. Continue?"
            );
            if (!confirmed) return;
        } else {
            const confirmed = window.confirm(
                "Remove this device? It will no longer be able to decrypt new messages."
            );
            if (!confirmed) return;
        }
        
        setRevokingDevice(deviceId);
        
        try {
            const success = await revokeDevice(deviceId, apiEndpoint, authToken);
            if (success) {
                setDevices(prev => prev.filter(d => d.id !== deviceId));
                
                if (isCurrentDevice) {
                    // Redirect to login after revoking current device
                    window.location.href = "/login";
                }
            } else {
                setError("Failed to revoke device");
            }
        } catch (err) {
            setError("Error revoking device");
            console.error(err);
        } finally {
            setRevokingDevice(null);
        }
    };
    
    const getDeviceIcon = (type: string) => {
        switch (type) {
            case 'ios':
            case 'android':
                return <Smartphone className="w-5 h-5" />;
            case 'desktop':
                return <Monitor className="w-5 h-5" />;
            case 'tablet':
                return <Tablet className="w-5 h-5" />;
            default:
                return <Laptop className="w-5 h-5" />;
        }
    };
    
    const formatLastActive = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 5) return "Just now";
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString();
    };
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Your Devices
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage devices with E2EE access
                        </p>
                    </div>
                </div>
                
                <button
                    onClick={fetchDevices}
                    disabled={loading}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                             dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 
                             dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    title="Refresh devices"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>
            
            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 
                          rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium">Messages are end-to-end encrypted</p>
                    <p className="mt-1 text-blue-600 dark:text-blue-400">
                        Each device has its own encryption keys. Messages are encrypted 
                        separately for each of your active devices.
                    </p>
                </div>
            </div>
            
            {/* Error Display */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                              rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
            )}
            
            {/* Device List */}
            <div className="space-y-3">
                {loading ? (
                    // Loading skeleton
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 
                                                   rounded-lg h-20" />
                        ))}
                    </div>
                ) : devices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Monitor className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No devices registered</p>
                        <p className="text-sm mt-1">
                            Devices are registered automatically when you use E2EE
                        </p>
                    </div>
                ) : (
                    devices.map(device => (
                        <div 
                            key={device.id}
                            className={`flex items-center justify-between p-4 rounded-lg border 
                                      ${device.isCurrent 
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                      }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg 
                                              ${device.isCurrent 
                                                ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' 
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                              }`}>
                                    {getDeviceIcon(device.type)}
                                </div>
                                
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {device.name}
                                        </span>
                                        {device.isCurrent && (
                                            <span className="px-2 py-0.5 text-xs font-medium 
                                                          bg-green-100 dark:bg-green-900/40 
                                                          text-green-700 dark:text-green-300 
                                                          rounded-full">
                                                This device
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Last active: {formatLastActive(device.lastActive)}
                                    </p>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => handleRevokeDevice(device.id)}
                                disabled={revokingDevice === device.id}
                                className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 
                                         dark:hover:text-red-300 rounded-lg hover:bg-red-50 
                                         dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                title={device.isCurrent ? "Log out this device" : "Remove device"}
                            >
                                {revokingDevice === device.id ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Trash2 className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    ))
                )}
            </div>
            
            {/* Key Backup Section */}
            {onBackupClick && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onBackupClick}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 
                                 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 
                                 dark:hover:bg-gray-700 rounded-lg text-gray-700 
                                 dark:text-gray-300 font-medium transition-colors"
                    >
                        <Shield className="w-5 h-5" />
                        Manage Key Backup
                    </button>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                        Backup your encryption keys to restore on new devices
                    </p>
                </div>
            )}
        </div>
    );
}

export default DeviceManagement;
