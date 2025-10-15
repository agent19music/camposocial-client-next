"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Colors as Palette } from "@/constants/Colors";
import { SocialLoginModal } from '@/modals/signup/socialsbuttons'
import { FallingIcons } from '@/components/ui/falling-icons'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useContext, useEffect } from 'react'
import { AuthContext } from '@/context/authcontext'
import { useTheme } from '@/context/themecontext';

export default function SignUpPage() {
  const C = Palette;
  const { setShowSocialModal } = useContext(AuthContext);
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

      {/* Falling icons background */}
      <FallingIcons />

      {/* Background decoration - matching landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(181,168,209,0.06)' }} />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(193,127,242,0.08)' }} />
      </div>

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
                src= {theme === 'dark'
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
              src= {theme === 'dark'
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 dark:bg-black/70 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-[#D29DF6]/20 dark:border-[#B16FE8]/20">
          <SocialLoginModal />
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
              Sign in
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

