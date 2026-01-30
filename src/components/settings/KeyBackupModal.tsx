"use client";

import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../context/authcontext";
import { ChatContext } from "../../context/chatcontext";
import {
    backupKeyToServer,
    restoreKeyFromServer,
    checkServerBackupStatus,
    deleteServerKeyBackup,
    storeKeyPair
} from "../../lib/keyStorage";
import { 
    X, 
    Shield, 
    Key, 
    CheckCircle, 
    AlertTriangle,
    Eye,
    EyeOff,
    Copy,
    Download,
    Upload,
    Trash2,
    RefreshCw
} from "lucide-react";
import { toast } from "react-hot-toast";

interface KeyBackupModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'backup' | 'restore';
}

export function KeyBackupModal({ isOpen, onClose, mode: initialMode = 'backup' }: KeyBackupModalProps) {
    const { authToken, currentUser } = useContext(AuthContext);
    const { keyStatus, exportPublicKey } = useContext(ChatContext);
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
    
    const [mode, setMode] = useState<'backup' | 'restore'>(initialMode);
    const [step, setStep] = useState<'check' | 'passphrase' | 'confirm' | 'success'>('check');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [hasBackup, setHasBackup] = useState<boolean | null>(null);
    const [backupDate, setBackupDate] = useState<string | null>(null);
    
    const [passphrase, setPassphrase] = useState('');
    const [confirmPassphrase, setConfirmPassphrase] = useState('');
    const [showPassphrase, setShowPassphrase] = useState(false);
    
    // Passphrase strength indicator
    const [passphraseStrength, setPassphraseStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
    
    useEffect(() => {
        if (passphrase.length === 0) {
            setPassphraseStrength('weak');
        } else if (passphrase.length < 12) {
            setPassphraseStrength('weak');
        } else if (passphrase.length < 16 || !/[A-Z]/.test(passphrase) || !/[0-9]/.test(passphrase)) {
            setPassphraseStrength('medium');
        } else {
            setPassphraseStrength('strong');
        }
    }, [passphrase]);
    
    // Check backup status on open
    useEffect(() => {
        if (!isOpen || !authToken || !apiEndpoint) return;
        
        const checkStatus = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const status = await checkServerBackupStatus(apiEndpoint, authToken);
                if (status) {
                    setHasBackup(status.hasBackup);
                    setBackupDate(status.updatedAt || status.createdAt || null);
                }
            } catch (err) {
                console.error('Error checking backup status:', err);
            } finally {
                setLoading(false);
            }
        };
        
        checkStatus();
    }, [isOpen, authToken, apiEndpoint]);
    
    const handleCreateBackup = async () => {
        if (!authToken || !apiEndpoint) return;
        
        // Validate passphrase
        if (passphrase.length < 12) {
            setError('Passphrase must be at least 12 characters');
            return;
        }
        
        if (passphrase !== confirmPassphrase) {
            setError('Passphrases do not match');
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            // Get the current secret key from session storage
            const keyPassword = sessionStorage.getItem('e2ee_key_password');
            if (!keyPassword) {
                setError('Please re-login to access your encryption keys');
                return;
            }
            
            // Retrieve the keypair
            const { retrieveKeyPair } = await import('../../lib/keyStorage');
            const keyPair = await retrieveKeyPair(keyPassword);
            
            if (!keyPair) {
                setError('Could not retrieve encryption keys');
                return;
            }
            
            // Backup to server
            const success = await backupKeyToServer(
                keyPair.secretKey,
                passphrase,
                apiEndpoint,
                authToken
            );
            
            if (success) {
                setHasBackup(true);
                setBackupDate(new Date().toISOString());
                setStep('success');
                toast.success('Key backup created successfully');
            } else {
                setError('Failed to create backup');
            }
        } catch (err) {
            console.error('Error creating backup:', err);
            setError('An error occurred while creating backup');
        } finally {
            setLoading(false);
        }
    };
    
    const handleRestore = async () => {
        if (!authToken || !apiEndpoint || !currentUser) return;
        
        if (!passphrase) {
            setError('Please enter your recovery passphrase');
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            // Get public key from server
            const publicKey = await exportPublicKey?.();
            
            if (!publicKey) {
                setError('Could not retrieve public key');
                return;
            }
            
            // Restore from server
            const keyPair = await restoreKeyFromServer(
                passphrase,
                publicKey,
                apiEndpoint,
                authToken
            );
            
            if (keyPair) {
                // Store locally with the key password from session
                const keyPassword = sessionStorage.getItem('e2ee_key_password');
                if (keyPassword) {
                    await storeKeyPair(keyPair, keyPassword);
                    setStep('success');
                    toast.success('Keys restored successfully! Refresh to use.');
                    
                    // Reload to apply keys
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    setError('Please re-login to complete restoration');
                }
            } else {
                setError('Invalid recovery passphrase');
            }
        } catch (err) {
            console.error('Error restoring keys:', err);
            setError('An error occurred while restoring keys');
        } finally {
            setLoading(false);
        }
    };
    
    const handleDeleteBackup = async () => {
        if (!authToken || !apiEndpoint) return;
        
        const confirmed = window.confirm(
            'Are you sure you want to delete your key backup? This cannot be undone. ' +
            'If you lose access to your device, you will not be able to decrypt old messages.'
        );
        
        if (!confirmed) return;
        
        setLoading(true);
        
        try {
            const success = await deleteServerKeyBackup(apiEndpoint, authToken);
            if (success) {
                setHasBackup(false);
                setBackupDate(null);
                toast.success('Key backup deleted');
            } else {
                toast.error('Failed to delete backup');
            }
        } catch (err) {
            toast.error('Error deleting backup');
        } finally {
            setLoading(false);
        }
    };
    
    const resetModal = useCallback(() => {
        setStep('check');
        setPassphrase('');
        setConfirmPassphrase('');
        setError(null);
    }, []);
    
    useEffect(() => {
        if (!isOpen) {
            resetModal();
        }
    }, [isOpen, resetModal]);
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl 
                          border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {mode === 'backup' ? 'Key Backup' : 'Key Recovery'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                                 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 
                                 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-6">
                    {loading && step === 'check' ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : step === 'check' ? (
                        <div className="space-y-4">
                            {/* Backup Status */}
                            <div className={`p-4 rounded-lg border ${
                                hasBackup 
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                            }`}>
                                <div className="flex items-start gap-3">
                                    {hasBackup ? (
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                    )}
                                    <div>
                                        <p className={`font-medium ${
                                            hasBackup 
                                                ? 'text-green-700 dark:text-green-300' 
                                                : 'text-yellow-700 dark:text-yellow-300'
                                        }`}>
                                            {hasBackup ? 'Key Backup Active' : 'No Key Backup'}
                                        </p>
                                        <p className={`text-sm ${
                                            hasBackup 
                                                ? 'text-green-600 dark:text-green-400' 
                                                : 'text-yellow-600 dark:text-yellow-400'
                                        }`}>
                                            {hasBackup && backupDate
                                                ? `Last updated: ${new Date(backupDate).toLocaleDateString()}`
                                                : 'Create a backup to access messages on new devices'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Mode Tabs */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setMode('backup')}
                                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                        mode === 'backup'
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    <Upload className="w-4 h-4 inline-block mr-2" />
                                    Backup
                                </button>
                                <button
                                    onClick={() => setMode('restore')}
                                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                        mode === 'restore'
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    <Download className="w-4 h-4 inline-block mr-2" />
                                    Restore
                                </button>
                            </div>
                            
                            <button
                                onClick={() => setStep('passphrase')}
                                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white 
                                         rounded-lg font-medium transition-colors"
                            >
                                {mode === 'backup' 
                                    ? (hasBackup ? 'Update Backup' : 'Create Backup')
                                    : 'Restore Keys'}
                            </button>
                            
                            {hasBackup && (
                                <button
                                    onClick={handleDeleteBackup}
                                    disabled={loading}
                                    className="w-full py-2 px-4 text-red-600 dark:text-red-400 
                                             hover:bg-red-50 dark:hover:bg-red-900/20 
                                             rounded-lg font-medium transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 inline-block mr-2" />
                                    Delete Backup
                                </button>
                            )}
                        </div>
                    ) : step === 'passphrase' ? (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {mode === 'backup'
                                    ? 'Create a recovery passphrase. You will need this to restore your keys on a new device.'
                                    : 'Enter the recovery passphrase you created when backing up your keys.'}
                            </p>
                            
                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 
                                              dark:border-red-800 rounded-lg text-sm text-red-700 
                                              dark:text-red-300">
                                    {error}
                                </div>
                            )}
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Recovery Passphrase
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassphrase ? 'text' : 'password'}
                                            value={passphrase}
                                            onChange={(e) => setPassphrase(e.target.value)}
                                            placeholder="Enter a strong passphrase..."
                                            className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 
                                                     rounded-lg bg-white dark:bg-gray-800 text-gray-900 
                                                     dark:text-white focus:ring-2 focus:ring-blue-500 
                                                     focus:border-transparent"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassphrase(!showPassphrase)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
                                                     hover:text-gray-600 dark:hover:text-gray-200"
                                        >
                                            {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    
                                    {mode === 'backup' && passphrase && (
                                        <div className="mt-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-1 flex-1 rounded ${
                                                    passphraseStrength === 'weak' ? 'bg-red-400' :
                                                    passphraseStrength === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                                                }`} />
                                                <span className={`text-xs ${
                                                    passphraseStrength === 'weak' ? 'text-red-500' :
                                                    passphraseStrength === 'medium' ? 'text-yellow-500' : 'text-green-500'
                                                }`}>
                                                    {passphraseStrength === 'weak' ? 'Weak' :
                                                     passphraseStrength === 'medium' ? 'Medium' : 'Strong'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Min 12 characters. Use uppercase, numbers for strength.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                {mode === 'backup' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Confirm Passphrase
                                        </label>
                                        <input
                                            type={showPassphrase ? 'text' : 'password'}
                                            value={confirmPassphrase}
                                            onChange={(e) => setConfirmPassphrase(e.target.value)}
                                            placeholder="Confirm your passphrase..."
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                                                     rounded-lg bg-white dark:bg-gray-800 text-gray-900 
                                                     dark:text-white focus:ring-2 focus:ring-blue-500 
                                                     focus:border-transparent"
                                        />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setStep('check');
                                        setError(null);
                                    }}
                                    className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-800 
                                             text-gray-700 dark:text-gray-300 rounded-lg 
                                             font-medium transition-colors hover:bg-gray-200 
                                             dark:hover:bg-gray-700"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={mode === 'backup' ? handleCreateBackup : handleRestore}
                                    disabled={loading || !passphrase || (mode === 'backup' && !confirmPassphrase)}
                                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 
                                             text-white rounded-lg font-medium transition-colors 
                                             disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <RefreshCw className="w-4 h-4 inline-block animate-spin mr-2" />
                                    ) : null}
                                    {mode === 'backup' ? 'Create Backup' : 'Restore'}
                                </button>
                            </div>
                        </div>
                    ) : step === 'success' ? (
                        <div className="text-center py-6 space-y-4">
                            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 
                                          rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {mode === 'backup' ? 'Backup Created!' : 'Keys Restored!'}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {mode === 'backup'
                                        ? 'Your encryption keys are now backed up securely.'
                                        : 'Your encryption keys have been restored. The page will reload.'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                                         rounded-lg font-medium transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    ) : null}
                </div>
                
                {/* Footer */}
                {step !== 'success' && (
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t 
                                  border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p>
                                Your passphrase is never stored on our servers. Only you can 
                                decrypt your key backup. If you forget your passphrase, your 
                                backup cannot be recovered.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default KeyBackupModal;
