'use client';

import { useState, useContext } from 'react';
import { AuthContext } from '@/context/authcontext';
import { useAuthModal } from '@/context/AuthModalContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OTPInput } from '@/components/ui/otp-input';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Eye, EyeOff, Loader2, Mail, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { deriveKeyPassword } from '@/lib/keyStorage';

type Step = 'login' | 'verify';

export function EmailLoginForm() {
    const { sendOTP, verifyOTP } = useContext(AuthContext);
    const { closeAuthModal } = useAuthModal();
    const router = useRouter();
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;

    const [step, setStep] = useState<Step>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // For unverified user flow
    const [unverifiedEmail, setUnverifiedEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            toast.error('Please enter username and password');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${apiEndpoint}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include',
            });

            const result = await response.json();

            if (result.requires_verification) {
                // User needs to verify email first
                setUnverifiedEmail(result.email);
                setStep('verify');
                // Trigger OTP send
                await sendOTP(result.email);
                return;
            }

            if (response.ok && result.access_token) {
                // Set token via API route
                await fetch('/api/auth/set-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: result.access_token }),
                });

                // Derive E2EE key for email/password users
                try {
                    let userId = result.user_id;
                    if (!userId && result.access_token) {
                        // Decode user_id from JWT payload (sub claim)
                        const payload = JSON.parse(atob(result.access_token.split('.')[1]));
                        userId = payload.sub;
                    }
                    if (userId) {
                        const keyPassword = await deriveKeyPassword(password, userId);
                        sessionStorage.setItem('e2ee_key_password', keyPassword);
                    }
                } catch (e) {
                    console.error('Failed to derive key password:', e);
                }

                toast.success('Welcome back!');
                // Close the auth modal first, then navigate
                closeAuthModal();
                router.push(`/yaps/profile/${username}`);
            } else {
                toast.error(result.error || result.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otpCode.length !== 6) {
            toast.error('Please enter the 6-digit code');
            return;
        }

        setIsLoading(true);
        try {
            // Pass password for E2EE key derivation
            await verifyOTP(unverifiedEmail, otpCode, password);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        try {
            await sendOTP(unverifiedEmail);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <AnimatePresence mode="wait">
                {step === 'login' && (
                    <motion.form
                        key="login-step"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleLogin}
                        className="space-y-4"
                    >
                        {/* Username Field */}
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Username
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-10 h-12"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10 h-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 text-white font-semibold transition-all duration-200 hover:scale-[1.02]"
                            style={{ backgroundColor: 'var(--color-fun)' }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'Sign In'
                            )}
                        </Button>

                        {/* Forgot password link */}
                        <div className="text-center">
                            <a
                                href="/reset-password"
                                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Forgot your password?
                            </a>
                        </div>
                    </motion.form>
                )}

                {step === 'verify' && (
                    <motion.form
                        key="verify-step"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleVerifyOtp}
                        className="space-y-4"
                    >
                        <div className="text-center space-y-2 pb-4">
                            <div className="w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                                <Mail className="h-8 w-8 text-orange-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Verify your email
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Your email isn&apos;t verified yet. We sent a code to <span className="font-medium text-gray-700 dark:text-gray-300">{unverifiedEmail}</span>
                            </p>
                        </div>

                        {/* OTP Input */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center block">
                                Verification Code
                            </Label>
                            <OTPInput
                                value={otpCode}
                                onChange={setOtpCode}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 text-white font-semibold transition-all duration-200 hover:scale-[1.02]"
                            style={{ backgroundColor: 'var(--color-fun)' }}
                            disabled={isLoading || otpCode.length !== 6}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'Verify & Sign In'
                            )}
                        </Button>

                        {/* Resend & Back */}
                        <div className="flex items-center justify-between pt-2">
                            <button
                                type="button"
                                onClick={() => setStep('login')}
                                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                ← Back to login
                            </button>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={isLoading}
                                className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1 disabled:opacity-50"
                            >
                                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                                Resend code
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
