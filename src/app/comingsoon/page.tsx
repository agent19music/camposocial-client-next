'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CheckCircleIcon } from '@phosphor-icons/react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/themecontext';

const funMessages = [
  "Uh oh, someone's eager!",
  "Nah, let him cook...",
  "It's working on my computer, gimme a sec to push to prod",
];

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    // Pick a random message on mount
    const randomMessage = funMessages[Math.floor(Math.random() * funMessages.length)];
    setMessage(randomMessage);
  }, []);

  // Validate email on change
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(email));
    if (email && !emailRegex.test(email)) {
      setError('');
    } else {
      setError('');
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isValidEmail) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('camposocial_waitlist')
        .insert([
          { email: email.toLowerCase().trim() }
        ])
        .select();

      if (supabaseError) {
        // Check if it's a unique constraint violation
        if (supabaseError.code === '23505' || supabaseError.message.includes('duplicate') || supabaseError.message.includes('unique')) {
          setError('Someone already gave us that email');
        } else {
          setError('Something went wrong. Please try again.');
          console.error('Supabase error:', supabaseError);
        }
        setIsLoading(false);
        return;
      }

      // Success
      setIsLoading(false);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting email:', err);
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-background dark:bg-background items-center justify-center p-4 md:p-5">
      {/* Logo in top left */}
      <header className="absolute top-4 left-4 md:top-5 md:left-10">
        <div className="flex flex-row items-center" onClick={() => router.push('/')}>
    <Image
                src= {theme !== 'dark'
                  ? "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-light.png"
                  : "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-dark.png"
                }
                alt="CampoSocial"
                width={36}
                height={36}
                className="rounded-xl shadow-sm"
                priority
              />
          <h1 className="text-xl md:text-2xl font-semibold ml-2" style={{ fontFamily: 'Helvetica', color: 'var(--color-heading)' }}>
            CampoSocial
          </h1>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-2xl w-full text-center px-4">
        {!isSubmitted ? (
          <>
            {/* Emoji or Icon */}
            <div className="text-5xl md:text-7xl mb-6 md:mb-8 animate-bounce">👀</div>

            {/* Heading */}
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight px-2"
              style={{ fontFamily: 'Helvetica', color: 'var(--color-heading)' }}
            >
              {message || "Uh oh, someone's eager!"}
            </h2>

            {/* Subheading */}
            <p className="text-base md:text-xl mb-8 md:mb-12 leading-relaxed max-w-xl mx-auto px-2">
              We&apos;re putting the finishing touches on something special. 
              CampoSocial will launch in the coming weeks.
            </p>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="max-w-md mx-auto px-2">
              <div className="flex flex-col sm:flex-row gap-3 mb-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className={`flex-1 px-4 md:px-6 py-3 md:py-4 rounded-full border-2 ${
                    error ? 'border-red-500' : 'border-primary'
                  } bg-white text-black placeholder-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base`}
                  style={{ fontFamily: 'Helvetica' }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !isValidEmail || !email}
                  style={{ backgroundColor: 'var(--color-heading)' }}
                  className="px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold dark:text-black  text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm md:text-base"
                >
                    {isLoading ? 'Joining...' : 'Join Waitlist'}
                </button>
              </div>
              {error && (
                <p className="text-sm text-red-500 mb-2 text-left px-2">
                  {error}
                </p>
              )}
              <p className="text-xs md:text-sm">
                We&apos;ll notify you when we launch and share exclusive updates
              </p>
            </form>
          </>
        ) : (
          <>
            {/* Success state */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl max-w-lg mx-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#89B8A0] rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <CheckCircleIcon size={40} weight="bold" className="text-white md:hidden" />
                <CheckCircleIcon size={48} weight="bold" className="text-white hidden md:block" />
              </div>
              
              <h2 
                className="text-2xl md:text-4xl font-bold text-[#212121] mb-3 md:mb-4"
                style={{ fontFamily: 'Helvetica' }}
              >
                You&apos;re on the list!
              </h2>
              
              <p className="text-base md:text-lg text-[#4A4A4A] mb-4 md:mb-6">
                Thanks for joining our waitlist. We&apos;ll send you an email at{' '}
                <span className="font-semibold text-[#212121] break-all">{email}</span> when we launch.
              </p>
              
              <button
                onClick={() => router.push('/')}
                className="px-6 md:px-8 py-3 text-[#212121] rounded-full font-semibold hover:bg-gray-100 transition-all border-2 border-[#212121] text-sm md:text-base"
              >
                Back to Home
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer text */}
      <footer className="absolute bottom-4 md:bottom-8 text-center w-full px-4">
        <p className="text-xs md:text-sm">
          Questions? Reach us at{' '}
          <a href="mailto:seanmotanya@gmail.com" className="font-semibold hover:underline">
            seanmotanya@gmail.com
          </a>
        </p>
      </footer>
    </main>
  );
}
