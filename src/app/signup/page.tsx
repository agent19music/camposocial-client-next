"use client"

import { motion } from 'framer-motion'
import { SocialLoginModal } from '@/modals/signup/socialsbuttons'
import { FallingIcons } from '@/components/ui/falling-icons'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDF1F5] to-[#92736C]/30 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Falling icons background */}
      <FallingIcons />

      {/* Background decoration with accent colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FDF1F5]/40 dark:bg-[#92736C]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#92736C]/30 dark:bg-[#92736C]/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#FDF1F5]/30 dark:bg-[#FDF1F5]/10 rounded-full blur-3xl"></div>
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
              className="w-20 h-20 bg-gradient-to-br from-[#92736C] via-[#92736C]/90 to-[#FDF1F5] rounded-full flex items-center justify-center shadow-xl"
            >
              <span className="text-white text-3xl font-bold">C</span>
            </motion.div>
          </div>

          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
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
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-[#92736C]/20 dark:border-gray-700"
        >
          <SocialLoginModal />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Already have an account?{' '}
            <a 
              href="/login" 
              className="text-[#92736C] dark:text-[#92736C] hover:text-[#92736C]/80 dark:hover:text-[#92736C]/80 font-medium transition-colors underline decoration-2 underline-offset-2"
            >
              Sign in
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

