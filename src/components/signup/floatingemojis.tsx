"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SocialLoginModal } from "@/modals/signup/socialsbuttons"
import { Icons } from "@/components/icons"
import { FloatingBackground } from "@/components/ui/floating-background"
import Link from "next/link"

export default function FloatingEmojisBackground({
  title = "Welcome to camposocial",
}: {
  title?: string
}) {
  const words = title.split(" ")
  const [isSocialOpen, setIsSocialOpen] = useState(false)

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-blush-100 dark:bg-mocha-500 transition-colors duration-300">
      <FloatingBackground iconCount={60} opacity={10} />

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10" 
           style={{
             backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)`,
             backgroundSize: '50px 50px'
           }} />

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          <motion.h1 
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-12 tracking-tighter leading-none"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                    }}
                    className="inline-block text-transparent bg-clip-text 
                               bg-gradient-to-r from-mocha-500 via-sunset-500 to-blush-500 
                               dark:from-blush-300 dark:via-sunset-400 dark:to-mocha-300
                               hover:from-sunset-600 hover:via-blush-500 hover:to-mocha-600
                               transition-all duration-300"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </motion.h1>

          {/* OAuth only authentication */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white/80 dark:bg-black/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                Join our community
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Connect with your campus community through seamless social authentication.
              </p>
              
              <Dialog open={isSocialOpen} onOpenChange={setIsSocialOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-mocha-500 to-sunset-500 hover:from-mocha-600 hover:to-sunset-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Icons.globe className="mr-2 h-5 w-5" />
                    Sign Up with Social
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-0 shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">
                      Choose your platform
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600 dark:text-gray-400">
                      Sign up quickly and securely with your preferred social platform.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-6">
                    <SocialLoginModal />
                  </div>
                </DialogContent>
              </Dialog>
              
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link 
                    href="/login" 
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors duration-200 hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

