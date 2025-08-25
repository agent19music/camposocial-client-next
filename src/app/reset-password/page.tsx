"use client"

import { ResetPassword } from "@/components/resetpassword/ResetPassword"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { FloatingBackground } from "@/components/ui/floating-background"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-violet-50/50 dark:from-black dark:via-black dark:to-purple-950/20 flex items-center justify-center p-4">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Floating icons background */}
      <FloatingBackground iconCount={30} opacity={8} />

      {/* Decorative gradient orbs - matching landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-gradient-to-br from-[#D29DF6]/20 dark:from-[#B16FE8]/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-tl from-[#C17FF2]/20 dark:from-[#C17FF2]/30 to-transparent rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10">
        <ResetPassword />
      </div>
    </div>
  )
}

