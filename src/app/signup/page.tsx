"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'
import { SocialLoginModal } from '@/modals/signup/socialsbuttons'
import { FallingIcons } from '@/components/ui/falling-icons'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-purple-50/30 to-violet-50/50 dark:from-black dark:via-black dark:to-purple-950/20 relative overflow-hidden">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Falling icons background */}
      <FallingIcons />

      {/* Background decoration - matching landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-gradient-to-br from-[#D29DF6]/20 dark:from-[#B16FE8]/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-tl from-[#C17FF2]/20 dark:from-[#C17FF2]/30 to-transparent rounded-full blur-3xl" />
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
                src="/camposocial_logo.png"
                alt="CampoSocial"
                width={100}
                height={100}
                className="rounded-full shadow-xl"
                priority
              />
            </motion.div>
          </div>

          <h2 className="text-4xl font-bold bg-gradient-to-r from-[#D29DF6] via-[#C17FF2] to-[#B16FE8] bg-clip-text text-transparent mb-2">
            Join CampoSocial
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Connect with your campus community
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
              className="text-[#B16FE8] dark:text-[#D29DF6] hover:text-[#C17FF2] dark:hover:text-[#C17FF2] font-medium transition-colors underline decoration-2 underline-offset-2"
            >
              Sign in
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

