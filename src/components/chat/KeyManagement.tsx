"use client";

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { Key, Lock, Unlock, Download, Upload, Shield, AlertTriangle } from 'lucide-react';
import { useChat } from '@/context/chatcontext';
import { exportEncryptedBackup, importEncryptedBackup, changeKeyPassword } from '@/lib/keyStorage';
import type { KeyManagementProps } from '@/types';

export function KeyManagement({ compact = false }: KeyManagementProps) {
  const { keyStatus, generateKeys, unlockKeys, loadKeys } = useChat();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'generate' | 'unlock' | 'backup' | 'restore' | 'change'>('generate');
  const [backupData, setBackupData] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleGenerateKeys = useCallback(async () => {
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsGenerating(true);
    try {
      await generateKeys(password);
      setShowPasswordDialog(false);
      setPassword('');
      setConfirmPassword('');
    } finally {
      setIsGenerating(false);
    }
  }, [password, confirmPassword, generateKeys]);

  const handleUnlockKeys = useCallback(async () => {
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setIsUnlocking(true);
    try {
      const success = await unlockKeys(password);
      if (success) {
        setShowPasswordDialog(false);
        setPassword('');
      }
    } finally {
      setIsUnlocking(false);
    }
  }, [password, unlockKeys]);

  const handleExportBackup = useCallback(async () => {
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    try {
      const backup = await exportEncryptedBackup(password);
      if (backup) {
        // Create downloadable file
        const blob = new Blob([backup], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'camposocial-keys-backup.json';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Key backup downloaded');
        setShowPasswordDialog(false);
        setPassword('');
      }
    } catch (error) {
      toast.error('Failed to export backup');
    }
  }, [password]);

  const handleImportBackup = useCallback(async () => {
    if (!backupData || !password) {
      toast.error('Please provide backup data and password');
      return;
    }

    try {
      const result = await importEncryptedBackup(backupData, password);
      if (result) {
        toast.success('Keys restored successfully');
        await loadKeys(password);
        setShowPasswordDialog(false);
        setBackupData('');
        setPassword('');
      } else {
        toast.error('Invalid backup or wrong password');
      }
    } catch (error) {
      toast.error('Failed to restore backup');
    }
  }, [backupData, password, loadKeys]);

  const handleChangePassword = useCallback(async () => {
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const success = await changeKeyPassword(currentPassword, newPassword);
      if (success) {
        toast.success('Password changed successfully');
        setShowPasswordDialog(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error('Current password is incorrect');
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  }, [currentPassword, newPassword, confirmPassword]);

  const openDialog = (mode: typeof dialogMode) => {
    setDialogMode(mode);
    setPassword('');
    setConfirmPassword('');
    setBackupData('');
    setCurrentPassword('');
    setNewPassword('');
    setShowPasswordDialog(true);
  };

  const getStatusIcon = () => {
    switch (keyStatus) {
      case 'available':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'locked':
        return <Lock className="h-4 w-4 text-yellow-500" />;
      case 'generating':
        return <Key className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (keyStatus) {
      case 'available':
        return 'E2E Encryption Active';
      case 'locked':
        return 'Keys Locked';
      case 'generating':
        return 'Generating Keys...';
      default:
        return 'No Encryption Keys';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-xs text-muted-foreground">{getStatusText()}</span>
        {keyStatus === 'locked' && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openDialog('unlock')}
            className="h-6 px-2"
          >
            <Unlock className="h-3 w-3" />
          </Button>
        )}
        {keyStatus === 'unavailable' && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openDialog('generate')}
            className="h-6 px-2"
          >
            <Key className="h-3 w-3" />
          </Button>
        )}

        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'generate' && 'Set Up Encryption'}
                {dialogMode === 'unlock' && 'Unlock Encryption Keys'}
                {dialogMode === 'backup' && 'Export Key Backup'}
                {dialogMode === 'restore' && 'Restore Keys from Backup'}
                {dialogMode === 'change' && 'Change Key Password'}
              </DialogTitle>
              <DialogDescription>
                {dialogMode === 'generate' && 'Create a password to protect your encryption keys. This password is required to decrypt messages.'}
                {dialogMode === 'unlock' && 'Enter your password to unlock your encryption keys.'}
                {dialogMode === 'backup' && 'Export an encrypted backup of your keys.'}
                {dialogMode === 'restore' && 'Restore your encryption keys from a backup file.'}
                {dialogMode === 'change' && 'Change the password protecting your encryption keys.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {dialogMode === 'generate' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm Password</Label>
                    <Input
                      id="confirm"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ⚠️ If you forget this password, you will lose access to all encrypted messages.
                  </p>
                </>
              )}

              {dialogMode === 'unlock' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              {dialogMode === 'backup' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Current Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              {dialogMode === 'restore' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="backup">Backup Data</Label>
                    <Input
                      id="backup"
                      type="file"
                      accept=".json"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const text = await file.text();
                          setBackupData(text);
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Backup Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password used for backup"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </>
              )}

              {dialogMode === 'change' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="current">Current Password</Label>
                    <Input
                      id="current"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new">New Password</Label>
                    <Input
                      id="new"
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <Input
                      id="confirm"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Cancel
              </Button>
              {dialogMode === 'generate' && (
                <Button onClick={handleGenerateKeys} disabled={isGenerating}>
                  {isGenerating ? 'Generating...' : 'Generate Keys'}
                </Button>
              )}
              {dialogMode === 'unlock' && (
                <Button onClick={handleUnlockKeys} disabled={isUnlocking}>
                  {isUnlocking ? 'Unlocking...' : 'Unlock'}
                </Button>
              )}
              {dialogMode === 'backup' && (
                <Button onClick={handleExportBackup}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Backup
                </Button>
              )}
              {dialogMode === 'restore' && (
                <Button onClick={handleImportBackup}>
                  <Upload className="h-4 w-4 mr-2" />
                  Restore Keys
                </Button>
              )}
              {dialogMode === 'change' && (
                <Button onClick={handleChangePassword}>
                  Change Password
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          End-to-End Encryption
        </CardTitle>
        <CardDescription>{getStatusText()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {keyStatus === 'unavailable' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set up end-to-end encryption to secure your messages. Only you and the recipient will be able to read them.
            </p>
            <Button onClick={() => openDialog('generate')} className="w-full">
              <Key className="h-4 w-4 mr-2" />
              Set Up Encryption
            </Button>
            <Button variant="outline" onClick={() => openDialog('restore')} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Restore from Backup
            </Button>
          </div>
        )}

        {keyStatus === 'locked' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your encryption keys are locked. Enter your password to unlock and send/receive encrypted messages.
            </p>
            <Button onClick={() => openDialog('unlock')} className="w-full">
              <Unlock className="h-4 w-4 mr-2" />
              Unlock Keys
            </Button>
          </div>
        )}

        {keyStatus === 'available' && (
          <div className="space-y-4">
            <p className="text-sm text-green-600 dark:text-green-400">
              ✓ Your messages are protected with end-to-end encryption.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => openDialog('backup')} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Backup Keys
              </Button>
              <Button variant="outline" onClick={() => openDialog('change')} className="flex-1">
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          </div>
        )}

        {keyStatus === 'generating' && (
          <p className="text-sm text-muted-foreground animate-pulse">
            Generating encryption keys...
          </p>
        )}

        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'generate' && 'Set Up Encryption'}
                {dialogMode === 'unlock' && 'Unlock Encryption Keys'}
                {dialogMode === 'backup' && 'Export Key Backup'}
                {dialogMode === 'restore' && 'Restore Keys from Backup'}
                {dialogMode === 'change' && 'Change Key Password'}
              </DialogTitle>
              <DialogDescription>
                {dialogMode === 'generate' && 'Create a password to protect your encryption keys. This password is required to decrypt messages.'}
                {dialogMode === 'unlock' && 'Enter your password to unlock your encryption keys.'}
                {dialogMode === 'backup' && 'Export an encrypted backup of your keys.'}
                {dialogMode === 'restore' && 'Restore your encryption keys from a backup file.'}
                {dialogMode === 'change' && 'Change the password protecting your encryption keys.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {dialogMode === 'generate' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm Password</Label>
                    <Input
                      id="confirm"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ⚠️ If you forget this password, you will lose access to all encrypted messages.
                  </p>
                </>
              )}

              {dialogMode === 'unlock' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              {dialogMode === 'backup' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Current Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              {dialogMode === 'restore' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="backup">Backup Data</Label>
                    <Input
                      id="backup"
                      type="file"
                      accept=".json"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const text = await file.text();
                          setBackupData(text);
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Backup Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password used for backup"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </>
              )}

              {dialogMode === 'change' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="current">Current Password</Label>
                    <Input
                      id="current"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new">New Password</Label>
                    <Input
                      id="new"
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <Input
                      id="confirm"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Cancel
              </Button>
              {dialogMode === 'generate' && (
                <Button onClick={handleGenerateKeys} disabled={isGenerating}>
                  {isGenerating ? 'Generating...' : 'Generate Keys'}
                </Button>
              )}
              {dialogMode === 'unlock' && (
                <Button onClick={handleUnlockKeys} disabled={isUnlocking}>
                  {isUnlocking ? 'Unlocking...' : 'Unlock'}
                </Button>
              )}
              {dialogMode === 'backup' && (
                <Button onClick={handleExportBackup}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Backup
                </Button>
              )}
              {dialogMode === 'restore' && (
                <Button onClick={handleImportBackup}>
                  <Upload className="h-4 w-4 mr-2" />
                  Restore Keys
                </Button>
              )}
              {dialogMode === 'change' && (
                <Button onClick={handleChangePassword}>
                  Change Password
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default KeyManagement;



