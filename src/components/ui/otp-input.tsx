'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { OTPInputProps } from '@/types';

export function OTPInput({
    length = 6,
    value,
    onChange,
    disabled = false,
    className
}: OTPInputProps) {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    // Split value into individual digits
    const digits = value.split('').slice(0, length);
    while (digits.length < length) {
        digits.push('');
    }

    const handleChange = (index: number, inputValue: string) => {
        // Only accept digits
        const digit = inputValue.replace(/\D/g, '').slice(-1);

        const newDigits = [...digits];
        newDigits[index] = digit;
        onChange(newDigits.join(''));

        // Move to next input if digit entered
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (!digits[index] && index > 0) {
                // Move to previous input on backspace if current is empty
                inputRefs.current[index - 1]?.focus();
                const newDigits = [...digits];
                newDigits[index - 1] = '';
                onChange(newDigits.join(''));
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        onChange(pastedData);

        // Focus the appropriate input after paste
        const focusIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[focusIndex]?.focus();
    };

    return (
        <div className={cn("flex gap-2 justify-center", className)}>
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className={cn(
                        "w-12 h-14 text-center text-2xl font-mono font-semibold",
                        "rounded-lg border-2 border-gray-200 dark:border-gray-700",
                        "bg-white dark:bg-gray-900",
                        "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
                        "transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        digit && "border-orange-400 dark:border-orange-500"
                    )}
                    aria-label={`Digit ${index + 1}`}
                />
            ))}
        </div>
    );
}
