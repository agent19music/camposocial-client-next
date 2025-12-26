"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState, useContext, useEffect } from 'react'
import { Colors as Palette } from "@/constants/Colors";
import { SocialLoginModal } from '@/modals/signup/socialsbuttons'
import { ManualSignupForm } from '@/components/auth/ManualSignupForm'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { AuthContext } from '@/context/authcontext'
import { useTheme } from '@/context/themecontext';
import { ChevronDown, ChevronUp, Mail } from 'lucide-react';

export default function SignUpPage() {
  const C = Palette;
  const { setShowSocialModal } = useContext(AuthContext);
  const [showManualSignup, setShowManualSignup] = useState(false);

  useEffect(() => {
    setShowSocialModal(true);
  }, [setShowSocialModal]);

  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" >
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Background decoration - matching landing page (disabled in dark mode) */}
      {theme !== 'dark' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(181,168,209,0.06)' }} />
          <div className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(193,127,242,0.08)' }} />
        </div>
      )}

      {/* Main content */}
      <div className="w-full max-w-md space-y-8 p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
              className="relative"
            >
              <Image
                src={theme === 'dark'
                  ? "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-dark.png"
                  : "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-light.png"
                }
                alt="CampoSocial"
                width={100}
                height={100}
                className="rounded-full shadow-xl"
                priority
              />
            </motion.div>
          </div>

          <h2 className="text-4xl font-bold flex items-center justify-center " style={{ color: 'var(--color-heading)', fontFamily: 'Helvetica' }}>
            Join
            <Image
              src={theme === 'dark'
                ? "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-typo-dark.png"
                : "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-typo-light.png"
              }
              alt="CampoSocial"
              width={200}
              height={200}
              className="inline-block align-middle"

            />
          </h2>
          <p className="text-gray-600 dark:text-gray-300  text-lg">
            It&apos;ll be fun, I promise.
          </p>
        </motion.div>

        {/* Social signup options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 dark:bg-black/70 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-[#D29DF6]/20 dark:border-[#B16FE8]/20">
          <SocialLoginModal />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-black/70 text-gray-500">or</span>
            </div>
          </div>

          {/* Collapsible Manual Signup */}
          <div className="space-y-4">
            <button
              onClick={() => setShowManualSignup(!showManualSignup)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span className="font-medium">Sign up with Email</span>
              {showManualSignup ? (
                <ChevronUp className="h-4 w-4 ml-auto" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-auto" />
              )}
            </button>

            {showManualSignup && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="pt-4"
              >
                <ManualSignupForm />
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Already have an account?{' '}
            <a
              href="/login"
              className="font-medium transition-colors underline decoration-2 underline-offset-2"
              style={{ color: 'var(--color-fun)' }}
            >
              Log in here
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
