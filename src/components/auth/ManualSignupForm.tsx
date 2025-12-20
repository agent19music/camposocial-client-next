'use client';

import { useState, useContext } from 'react';
import { AuthContext } from '@/context/authcontext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OTPInput } from '@/components/ui/otp-input';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, RefreshCw } from 'lucide-react';

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
    const [errors, setErrors] = useState<Record<string, string>>({});

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

        try {
            const result = await register(email, password);
            if (result.success && result.requiresVerification) {
                setStep('otp');
            }
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
            // Pass password for E2EE key derivation
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

    return (
        <div className="space-y-4">
            <AnimatePresence mode="wait">
                {step === 'email' && (
                    <motion.form
                        key="email-step"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleEmailStep}
                        className="space-y-4"
                    >
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@university.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`pl-10 h-12 ${errors.email ? 'border-red-500' : ''}`}
                                    required
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-red-500">{errors.email}</p>
                            )}
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
                                    placeholder="At least 8 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`pl-10 pr-10 h-12 ${errors.password ? 'border-red-500' : ''}`}
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-500">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`pl-10 h-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                    required
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                            )}
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
                                <span className="flex items-center gap-2">
                                    Continue <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </motion.form>
                )}

                {step === 'otp' && (
                    <motion.form
                        key="otp-step"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleOtpStep}
                        className="space-y-4"
                    >
                        <div className="text-center space-y-2 pb-4">
                            <div className="w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                                <Mail className="h-8 w-8 text-orange-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Check your email
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                We sent a 6-digit code to <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
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
                            {errors.otp && (
                                <p className="text-xs text-red-500 text-center">{errors.otp}</p>
                            )}
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
                                'Verify Email'
                            )}
                        </Button>

                        {/* Resend & Back */}
                        <div className="flex items-center justify-between pt-2">
                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                ← Back
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
