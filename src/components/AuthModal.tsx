"use client";

import { useState, useContext, useEffect } from 'react';
import { useAuthModal } from '@/context/AuthModalContext';
import { AuthContext } from '@/context/authcontext';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EmailLoginForm } from '@/components/auth/EmailLoginForm';
import { ManualSignupForm } from '@/components/auth/ManualSignupForm';
import { SocialLoginButtons } from '@/modals/login/socialslogin';
import { SocialLoginModal } from '@/modals/signup/socialsbuttons';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AuthModal() {
  const { isOpen, message, closeAuthModal } = useAuthModal();
  const { isAuthenticated } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      closeAuthModal();
    }
  }, [isAuthenticated, isOpen, closeAuthModal]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={closeAuthModal}
              className="absolute right-4 top-4 h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'login' ? 'Welcome back' : 'Join the campus'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {activeTab === 'login' 
                  ? 'Sign in to continue to your account' 
                  : 'Create an account to get started'}
              </p>
            </motion.div>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200/50 dark:border-orange-800/30"
              >
                <DialogDescription className="text-sm text-center" style={{ color: 'var(--color-fun)' }}>
                  {message}
                </DialogDescription>
              </motion.div>
            )}
          </div>

          {/* Tab Switcher */}
          <div className="px-6 pb-4">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'login'
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'signup'
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <SocialLoginButtons />
                  
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white dark:bg-background px-3 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        or
                      </span>
                    </div>
                  </div>

                  <EmailLoginForm />
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <SocialLoginModal />

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white dark:bg-background px-3 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        or
                      </span>
                    </div>
                  </div>

                  <ManualSignupForm />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 leading-relaxed">
              By continuing, you agree to our{' '}
              <a href="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-300">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">
                Privacy Policy
              </a>
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
