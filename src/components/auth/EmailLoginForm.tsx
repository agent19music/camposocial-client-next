'use client';

import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '@/context/authcontext';
import { useAuthModal } from '@/context/AuthModalContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OTPInput } from '@/components/ui/otp-input';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Eye, EyeOff, Loader2, Mail, RefreshCw, ArrowRight } from 'lucide-react';
import { SmileySad } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { deriveKeyPassword } from '@/lib/keyStorage';

type Step = 'credentials' | 'verify';

export function EmailLoginForm() {
    const { sendOTP, verifyOTP } = useContext(AuthContext);
    const { closeAuthModal } = useAuthModal();
    const router = useRouter();
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;

    const [step, setStep] = useState<Step>('credentials');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const [showForm, setShowForm] = useState(false);

    const [unverifiedEmail, setUnverifiedEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');

    const loadingMessages = [
        'signing you in',
        'checking credentials',
        'almost there',
        'one moment please'
    ];

    useEffect(() => {
        if (!isLoading || hasError) return;
        const interval = setInterval(() => {
            setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [isLoading, hasError, loadingMessages.length]);

    const resetState = () => {
        setIsLoading(false);
        setHasError(false);
        setLoadingMessageIndex(0);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!identifier || !password) {
            toast.error('Please enter your credentials');
            return;
        }

        setIsLoading(true);
        setHasError(false);
        setLoadingMessageIndex(0);

        try {
            const response = await fetch(`${apiEndpoint}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
                credentials: 'include',
            });

            const result = await response.json();

            if (result.requires_verification) {
                setUnverifiedEmail(result.email);
                setStep('verify');
                await sendOTP(result.email);
                setIsLoading(false);
                return;
            }

            if (response.ok && result.access_token) {
                await fetch('/api/auth/set-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: result.access_token }),
                });

                try {
                    let userId = result.user_id;
                    if (!userId && result.access_token) {
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
                closeAuthModal();
                const username = identifier.includes('@') ? result.username : identifier;
                if (username) {
                    router.push(`/yaps/profile/${username}`);
                }
            } else {
                setHasError(true);
                toast.error(result.error || result.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setHasError(true);
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

    if (hasError) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 space-y-4"
            >
                <motion.div
                    initial={{ rotate: -10 }}
                    animate={{ rotate: [0, -5, 5, -5, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <SmileySad
                        className="h-14 w-14"
                        weight="duotone"
                        style={{ color: 'var(--color-fun)' }}
                    />
                </motion.div>
                <div className="text-center space-y-1">
                    <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                        that didn&apos;t work
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        check your credentials and try again
                    </p>
                </div>
                <Button
                    onClick={resetState}
                    className="text-white font-semibold transition-all duration-200 hover:scale-[1.02]"
                    style={{ backgroundColor: 'var(--color-fun)' }}
                >
                    Try Again
                </Button>
            </motion.div>
        );
    }

    if (isLoading && step === 'credentials') {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 space-y-4"
            >
                <Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--color-fun)' }} />
                <motion.div
                    key={loadingMessageIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                >
                    <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                        {loadingMessages[loadingMessageIndex]}
                    </p>
                </motion.div>
            </motion.div>
        );
    }

    if (!showForm) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Button
                    onClick={() => setShowForm(true)}
                    variant="outline"
                    className="w-full h-14 bg-white dark:bg-[#1A1A19] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 group"
                >
                    <div className="flex items-center justify-center space-x-3">
                        <div className="flex flex-col items-center">
                            <span className="font-semibold text-sm">Continue with Email or Username</span>
                            <span className="text-xs opacity-70">Sign in to your account</span>
                        </div>
                    </div>
                </Button>
            </motion.div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            {step === 'credentials' && (
                <motion.form
                    key="credentials-step"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleLogin}
                    className="space-y-3"
                >
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Sign in with credentials
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowForm(false)}
                            className="h-7 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        >
                            Cancel
                        </Button>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                        <div className="relative bg-white dark:bg-[#1A1A19] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 group-focus-within:border-[var(--color-fun)] group-focus-within:shadow-sm">
                            <div className="flex items-center px-4 py-3">
                                <User className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                                <Input
                                    type="text"
                                    placeholder="Email or username"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                        <div className="relative bg-white dark:bg-[#1A1A19] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 group-focus-within:border-[var(--color-fun)] group-focus-within:shadow-sm">
                            <div className="flex items-center px-4 py-3">
                                <Lock className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2 flex-shrink-0 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            type="submit"
                            className="w-full h-12 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                            style={{ backgroundColor: 'var(--color-fun)' }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Sign In
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </motion.div>

                    <div className="text-center pt-1">
                        <a
                            href="/reset-password"
                            className="text-sm text-gray-500 hover:text-[var(--color-fun)] dark:text-gray-400 transition-colors"
                        >
                            Forgot your password?
                        </a>
                    </div>
                </motion.form>
            )}

            {step === 'verify' && (
                <motion.form
                    key="verify-step"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleVerifyOtp}
                    className="space-y-4"
                >
                    <div className="text-center space-y-2 pb-2">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                            className="w-14 h-14 mx-auto bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-2xl flex items-center justify-center"
                        >
                            <Mail className="h-7 w-7" style={{ color: 'var(--color-fun)' }} />
                        </motion.div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Verify your email
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            We sent a code to <span className="font-medium text-gray-700 dark:text-gray-300">{unverifiedEmail}</span>
                        </p>
                    </div>

                    <div className="space-y-3">
                        <OTPInput
                            value={otpCode}
                            onChange={setOtpCode}
                            disabled={isLoading}
                        />
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            type="submit"
                            className="w-full h-12 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                            style={{ backgroundColor: 'var(--color-fun)' }}
                            disabled={isLoading || otpCode.length !== 6}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'Verify & Sign In'
                            )}
                        </Button>
                    </motion.div>

                    <div className="flex items-center justify-between pt-1">
                        <button
                            type="button"
                            onClick={() => setStep('credentials')}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                            ← Back
                        </button>
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={isLoading}
                            className="text-sm hover:text-orange-600 flex items-center gap-1 disabled:opacity-50 transition-colors"
                            style={{ color: 'var(--color-fun)' }}
                        >
                            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                            Resend code
                        </button>
                    </div>
                </motion.form>
            )}
        </AnimatePresence>
    );
}
