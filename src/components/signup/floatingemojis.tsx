"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import CreateAccount from "@/components/signup/manualsignup"
import { SocialLoginModal } from "@/modals/signup/socialsbuttons"
import Link from "next/link"

const socialEmojis = ["🔥", "💯", "💬", "📅", "📸", "👍", "🎉", "🌟", "📱", "🤳", "👋", "🗓️", "📢", "🔔", "💖"]

function FloatingEmoji({ x, y, emoji }: { x: number; y: number; emoji: string }) {
  return (
    <motion.text
      x={x}
      y={y}
      fontSize="24"
      textAnchor="middle"
      dominantBaseline="central"
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0.7, 0.3, 0.7],
        scale: [1, 1.2, 1],
        x: x + Math.random() * 100 - 50,
        y: y + Math.random() * 100 - 50,
      }}
      transition={{
        duration: 5 + Math.random() * 10,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }}
    >
      {emoji}
    </motion.text>
  )
}

function FloatingEmojis() {
  const [emojis, setEmojis] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([])

  useEffect(() => {
    const newEmojis = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      emoji: socialEmojis[Math.floor(Math.random() * socialEmojis.length)],
    }))
    setEmojis(newEmojis)
  }, [])

  

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full">
        <title>Floating Social Emojis</title>
        {emojis.map((emojiObj) => (
          <FloatingEmoji key={emojiObj.id} {...emojiObj} />
        ))}
      </svg>
    </div>
  )
}

export default function FloatingEmojisBackground({
  title = "Welcome to camposocial",
}: {
  title?: string
}) {
  const words = title.split(" ")
  const [isManualOpen, setIsManualOpen] = useState(false)
  const [isSocialOpen, setIsSocialOpen] = useState(false)


  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
      <FloatingEmojis />

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
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
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="inline-block text-transparent bg-clip-text 
                               bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 
                               dark:from-purple-300 dark:via-pink-200 dark:to-red-300
                               animate-text-shimmer"
                    style={{
                      backgroundSize: "200% auto",
                      animation: "textShimmer 2s linear infinite",
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          {/* Your existing buttons and content go here */}
          <div className="space-y-4 bg-white/35 dark:bg-black/80 p-8 rounded-2xl backdrop-blur-lg shadow-xl">
          <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="w-full">
                Sign Up Manually
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create an Account</DialogTitle>
                <DialogDescription>Enter your details to create a new account.</DialogDescription>
              </DialogHeader>
              <CreateAccount onClose={() => setIsManualOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={isSocialOpen} onOpenChange={setIsSocialOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Sign Up with Socials
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Social Sign Up</DialogTitle>
                <DialogDescription>Choose a social platform to create your account.</DialogDescription>
              </DialogHeader>
              <SocialLoginModal />
            </DialogContent>
          </Dialog>
          <div className="text-center mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-600 hover:underline">
              Log in here
            </Link>
          </div>
        </div>
        </motion.div>
      </div>
    </div>
  )
}

