"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { UsernameEmailForm } from "./UsernameEmailForm"
import { VerificationCodeForm } from "./VerificationCodeForm"
import { NewPasswordForm } from "./NewPasswordForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {toast} from "react-hot-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

type ResetStep = "username-email" | "verification" | "new-password"

export function ResetPassword() {
  const [step, setStep] = useState<ResetStep>("username-email")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
 
  const router = useRouter()
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || "defaultApiEndpoint";



  async function handleUsernameEmailSubmit(username: string, email: string) {
    try {
      setUsername(username);
      setEmail(email);
      const response = await fetch(`${apiEndpoint}/confirm_email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email }),
      });
  
      if (response.ok) {
        toast.success('Email confirmation successful!');
        setStep("verification")
        const data = await response.json();
      } else if (response.status === 404) {
        toast.error('Email confirmation failed (404: Not Found)');
      } else {
        toast.error('Email confirmation failed:', response.statusText);
      }
    } catch (error) {
      toast.error('Error submitting form:', error);
    }
  }

  const handleVerificationSubmit = async (code: string) => {
    // Mock verification code check
    const isValid = await mockVerifyCode(code)
    if (isValid) {
      setStep("new-password")
    } else {
      alert("Invalid verification code")
    }
  }

  const handleNewPasswordSubmit = async (newPassword: string) => {
    // Mock password reset
    await resetPassword(apiEndpoint, username, newPassword)
    toast.success("Password reset successfully!")
    // Reset the form
    setUsername("")
    setEmail("")
    router.push('/login');

  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="w-full max-w-md bg-white/80 dark:bg-black/70 backdrop-blur-xl border border-[#D29DF6]/20 dark:border-[#B16FE8]/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-2"
          >
            <Image
              src="/camposocial_logo.png"
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
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#D29DF6] via-[#C17FF2] to-[#B16FE8] bg-clip-text text-transparent">
              Reset Password
            </CardTitle>
          </motion.div>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            {step === "username-email" && "Enter your username and email to reset your password."}
            {step === "verification" && "Enter the verification code sent to your email."}
            {step === "new-password" && "Enter your new password."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {step === "username-email" && <UsernameEmailForm onSubmit={handleUsernameEmailSubmit} />}
            {step === "verification" && <VerificationCodeForm onSubmit={handleVerificationSubmit} />}
            {step === "new-password" && <NewPasswordForm onSubmit={handleNewPasswordSubmit} />}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center pt-4"
          >
            <Link 
              href="/login" 
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#B16FE8] dark:hover:text-[#D29DF6] transition-colors duration-200 hover:underline"
            >
              Back to login
            </Link>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Mock functions for API calls
async function mockValidateUsernameEmail(username: string, email: string): Promise<boolean> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return true // Always return true for this example
}

async function mockSendVerificationCode(email: string): Promise<void> {
  // Simulate sending verification code
  await new Promise((resolve) => setTimeout(resolve, 1000))
}

async function mockVerifyCode(code: string): Promise<boolean> {
  // Simulate verification code check
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return true // Always return true for this example
}

async function resetPassword(apiEndpoint: string, username: string, newPassword: string): Promise<void> {
  try {
    const response = await fetch(`${apiEndpoint}/reset_password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username,
        new_password: newPassword }),
    });

    if (response.ok) {
      const data = await response.json();
    } else if (response.status === 404) {
      toast.error(response.message);
    } else {
      toast.error('Password reset failed:', response.statusText);
    }
  } catch (error) {
    toast.error('Error submitting form:', error);
  }
}

