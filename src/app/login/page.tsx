"use client";

import Link from "next/link";
import Image from "next/image";
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
import { SocialLoginModal } from "@/modals/signup/socialsbuttons";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FloatingBackground } from "@/components/ui/floating-background";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/context/authcontext";
import { useTheme } from "@/context/themecontext";

export default function LoginForm() {
  const { setShowSocialModal } = useContext(AuthContext);

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

      {/* Floating icons background */}
      <FloatingBackground iconCount={30} opacity={8} />

      {/* Decorative gradient orbs - matching landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(181,168,209,0.06)' }} />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(193,127,242,0.05)' }} />
      </div>

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
                src= {theme === 'dark'
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

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center pt-2"
            >
              <Link 
                href="/reset-password" 
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200 hover:underline"
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
