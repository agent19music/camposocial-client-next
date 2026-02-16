"use client";

import { useAuthModal } from '@/context/AuthModalContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {  Calendar, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from '@/context/themecontext';
import { AuthFadeWallProps } from '@/types';

export function AuthFadeWall({ children, visibleItems = 5, contentType = 'yaps' }: AuthFadeWallProps) {
  const { openAuthModal } = useAuthModal();
  const { theme } = useTheme();

  const contentMessages = {
    yaps: {
      title: "See what's happening on campus",
      description: "Join CampoSocial to discover trending yaps, connect with classmates, and share your campus moments.",
      cta: "Sign up to see more"
    },
    events: {
      title: "Discover epic campus events",
      description: "Join CampoSocial to RSVP, get tickets, and never miss out on campus happenings.",
      cta: "Sign up to RSVP"
    },
    products: {
      title: "Find great deals from students",
      description: "Join CampoSocial to browse the marketplace, buy and sell with your campus community.",
      cta: "Sign up to shop"
    }
  };

  const message = contentMessages[contentType];

  return (
    <div className="relative">
      {/* Content with fade overlay */}
      <div className="relative">
        {children}
        
        {/* Gradient fade overlay */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, ${theme === 'dark' ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)'} 100%)`
          }}
        />
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="sticky bottom-0 z-10 mt-8 p-8 rounded-2xl border bg-card/95 backdrop-blur-sm"
        style={{
          background: theme === 'dark' 
            ? 'rgba(0, 0, 0, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)'
        }}
      >
        <div className="flex flex-col md:flex-row items-center gap-6 max-w-4xl mx-auto">
          {/* Logo/Branding */}
          <div className="flex-shrink-0">
            <Image
              src={theme === 'dark'
                ? "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-dark.png"
                : "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-light.png"
              }
              alt="CampoSocial"
              width={64}
              height={64}
              className="rounded-xl"
            />
          </div>

          {/* Message */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-heading)' }}>
              {message.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {message.description}
            </p>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Button
                onClick={() => openAuthModal(message.cta)}
                className="text-white font-semibold transition-all duration-200 hover:scale-[1.02]"
                style={{ backgroundColor: 'var(--color-fun)' }}
              >
                Sign Up
              </Button>
              <Button
                variant="outline"
                onClick={() => openAuthModal()}
                className="font-semibold transition-all duration-200 hover:scale-[1.02]"
              >
                Log In
              </Button>
            </div>
          </div>

       
        </div>
      </motion.div>
    </div>
  );
}
