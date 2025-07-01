"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { SocialLoginModal } from "@/modals/signup/socialsbuttons";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FloatingBackground } from "@/components/ui/floating-background";

export default function LoginForm() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF1F5] via-[#FDF1F5]/70 to-[#92736C]/20 dark:from-gray-900 dark:via-gray-800 dark:to-[#92736C]/20 transition-colors duration-500 flex items-center justify-center p-4">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Floating icons background */}
      <FloatingBackground iconCount={30} opacity={8} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-white/90 dark:bg-black/70 backdrop-blur-xl border border-[#92736C]/20 dark:border-gray-700/50 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#92736C] to-[#92736C]/80 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
            </motion.div>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Sign in to your account to continue connecting with your campus community
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <SocialLoginModal />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link 
                  href="/signup" 
                  className="text-[#92736C] dark:text-[#92736C] hover:text-[#92736C]/80 dark:hover:text-[#92736C]/80 font-semibold transition-colors duration-200 hover:underline"
                >
                  Sign up here
                </Link>
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center pt-2"
            >
              <Link 
                href="/reset-password" 
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 hover:underline"
              >
                Need help accessing your account?
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
