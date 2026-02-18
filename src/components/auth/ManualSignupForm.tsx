'use client';

import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '@/context/authcontext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OTPInput } from '@/components/ui/otp-input';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, RefreshCw, UserPlus } from 'lucide-react';
import { SmileySad } from '@phosphor-icons/react';
import toast from 'react-hot-toast';

type Step = 'email' | 'otp';

export function ManualSignupForm() {
    const { register, sendOTP, verifyOTP } = useContext(AuthContext);

    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const loadingMessages = [
        'creating your account',
        'setting things up',
        'almost ready',
        'just a moment'
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
        setErrors({});
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters';
        }
        return '';
    };

    const handleEmailStep = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            newErrors.password = passwordError;
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setIsLoading(true);
        setHasError(false);
        setLoadingMessageIndex(0);

        try {
            const result = await register(email, password);
            if (result.success && result.requiresVerification) {
                setStep('otp');
            } else if (!result.success) {
                setHasError(true);
            }
        } catch {
            setHasError(true);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpStep = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otpCode.length !== 6) {
            setErrors({ otp: 'Please enter the 6-digit code' });
            return;
        }

        setErrors({});
        setIsLoading(true);

        try {
            await verifyOTP(email, otpCode, password);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        try {
            await sendOTP(email);
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
                        oops, something went wrong
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        let&apos;s try that again
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

    if (isLoading && step === 'email') {
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
                        <UserPlus className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" style={{ color: 'var(--color-fun)' }} />
                        <div className="flex flex-col items-start">
                            <span className="font-semibold text-sm">Sign up with Email</span>
                            <span className="text-xs opacity-70">Create a new account</span>
                        </div>
                    </div>
                </Button>
            </motion.div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            {step === 'email' && (
                <motion.form
                    key="email-step"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleEmailStep}
                    className="space-y-3"
                >
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Create your account
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
                        <div className={`relative bg-white dark:bg-[#1A1A19] rounded-xl border overflow-hidden transition-all duration-200 group-focus-within:border-[var(--color-fun)] group-focus-within:shadow-sm ${errors.email ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}>
                            <div className="flex items-center px-4 py-3">
                                <Mail className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
                                    required
                                />
                            </div>
                        </div>
                        {errors.email && (
                            <p className="text-xs text-red-500 mt-1 ml-1">{errors.email}</p>
                        )}
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                        <div className={`relative bg-white dark:bg-[#1A1A19] rounded-xl border overflow-hidden transition-all duration-200 group-focus-within:border-[var(--color-fun)] group-focus-within:shadow-sm ${errors.password ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}>
                            <div className="flex items-center px-4 py-3">
                                <Lock className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password (8+ characters)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
                                    required
                                    minLength={8}
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
                        {errors.password && (
                            <p className="text-xs text-red-500 mt-1 ml-1">{errors.password}</p>
                        )}
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                        <div className={`relative bg-white dark:bg-[#1A1A19] rounded-xl border overflow-hidden transition-all duration-200 group-focus-within:border-[var(--color-fun)] group-focus-within:shadow-sm ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}>
                            <div className="flex items-center px-4 py-3">
                                <Lock className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
                                    required
                                />
                            </div>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-xs text-red-500 mt-1 ml-1">{errors.confirmPassword}</p>
                        )}
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
                                    Continue
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </motion.div>
                </motion.form>
            )}

            {step === 'otp' && (
                <motion.form
                    key="otp-step"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleOtpStep}
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
                            Check your email
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            We sent a code to <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
                        </p>
                    </div>

                    <div className="space-y-3">
                        <OTPInput
                            value={otpCode}
                            onChange={setOtpCode}
                            disabled={isLoading}
                        />
                        {errors.otp && (
                            <p className="text-xs text-red-500 text-center">{errors.otp}</p>
                        )}
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
                                'Verify Email'
                            )}
                        </Button>
                    </motion.div>

                    <div className="flex items-center justify-between pt-1">
                        <button
                            type="button"
                            onClick={() => setStep('email')}
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
