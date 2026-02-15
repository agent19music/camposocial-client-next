"use client";

import { useState, useContext, useEffect } from 'react';
import { useAuthModal } from '@/context/AuthModalContext';
import { AuthContext } from '@/context/authcontext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  // Auto-close modal when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      closeAuthModal();
    }
  }, [isAuthenticated, isOpen, closeAuthModal]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          <DialogHeader className="space-y-3 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-semibold">
                {activeTab === 'login' ? 'Sign In' : 'Create Account'}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeAuthModal}
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {message && (
              <DialogDescription className="text-sm text-muted-foreground pt-2 border-t">
                {message}
              </DialogDescription>
            )}
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="data-[state=active]:bg-[var(--color-fun)] data-[state=active]:text-white">
                Log In
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-[var(--color-fun)] data-[state=active]:text-white">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-0">
              <div className="space-y-4">
                <SocialLoginButtons />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>
                <EmailLoginForm />
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-0">
              <div className="space-y-4">
                <SocialLoginModal />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or sign up with email</span>
                  </div>
                </div>
                <ManualSignupForm />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
