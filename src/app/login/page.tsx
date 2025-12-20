"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Colors as Palette } from "@/constants/Colors";
import { motion } from "framer-motion";
import { SocialLoginButtons } from "@/modals/login/socialslogin";
import { EmailLoginForm } from "@/components/auth/EmailLoginForm";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FloatingBackground } from "@/components/ui/floating-background";
import { AuthContext } from "@/context/authcontext";
import { useTheme } from "@/context/themecontext";
import { ChevronDown, ChevronUp, User } from "lucide-react";

export default function LoginForm() {
  const { setShowSocialModal } = useContext(AuthContext);
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  // Automatically expand the social login modal when the page loads
  useEffect(() => {
    setShowSocialModal(true);
  }, [setShowSocialModal]);

  const { theme } = useTheme();

  return (
    <div className="min-h-screen transition-colors duration-500 flex items-center justify-center p-4" >
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Floating icons background (disabled in dark mode) */}
      {theme !== 'dark' && (
        <FloatingBackground iconCount={30} opacity={8} />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-background dark:bg-background backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center space-y-4">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-2"
            >
              <Image
                src={theme === 'dark'
                  ? "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-dark.png"
                  : "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-light.png"
                }
                alt="CampoSocial"
                width={80}
                height={80}
                className="rounded-full shadow-xl"
                priority
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="text-3xl font-bold" style={{ color: 'var(--color-heading)', fontFamily: 'Helvetica' }}>
                We&apos;re Glad to See You Again
              </CardTitle>
            </motion.div>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Sign in to your account to continue connecting with your friends
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Login Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <SocialLoginButtons />
            </motion.div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-background text-gray-500">or</span>
              </div>
            </div>

            {/* Collapsible Email Login */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <button
                onClick={() => setShowEmailLogin(!showEmailLogin)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="font-medium">Sign in with Username</span>
                {showEmailLogin ? (
                  <ChevronUp className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                )}
              </button>

              {showEmailLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="pt-4"
                >
                  <EmailLoginForm />
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold transition-colors duration-200 hover:underline"
                  style={{ color: 'var(--color-fun)' }}
                >
                  Sign up here
                </Link>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
