'use client';

import { useContext, useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { AuthContext } from '@/context/authcontext';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { SmileySad } from '@phosphor-icons/react';

export function SocialLoginModal() {
  const { socialLogin } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const loadingMessages = [
    'just a moment',
    'connecting to Google',
    'setting things up',
    'almost there'
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

  const googleLogin = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      setIsLoading(true);
      setHasError(false);
      setLoadingMessageIndex(0);

      try {
        if (!credentialResponse.access_token) {
          console.error('Invalid Google OAuth response:', credentialResponse);
          toast.error('Invalid Google OAuth response');
          setHasError(true);
          setIsLoading(false);
          return;
        }

        const transformedData = {
          access_token: credentialResponse.access_token,
          redirect_uri: 'postmessage',
          token_type: credentialResponse.token_type,
          expires_in: credentialResponse.expires_in,
          scope: credentialResponse.scope
        };

        const result = await socialLogin('google', transformedData);

        if (!result.success) {
          setHasError(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Google login error:', error);
        toast.error(`Google signup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setHasError(true);
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      toast.error(`Google signup failed: ${error?.error_description || 'Unknown error'}`);
      setHasError(true);
      setIsLoading(false);
    },
    scope: 'email profile',
    flow: 'implicit'
  });

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
            let&apos;s try again
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

  if (isLoading) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <Button
        onClick={() => googleLogin()}
        variant="outline"
        className="w-full h-14 bg-white dark:bg-[#1A1A19] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 group"
      >
        <div className="flex items-center justify-center space-x-3">
          <Icons.google className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
          <div className="flex flex-col items-start">
            <span className="font-semibold text-sm">Continue with Google</span>
            <span className="text-xs opacity-70">Create your account</span>
          </div>
        </div>
      </Button>
    </motion.div>
  );
}
