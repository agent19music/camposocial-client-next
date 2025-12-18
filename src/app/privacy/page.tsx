"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Eye, Lock, UserCheck, Server, Share2, Trash2, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import AnimatedFooter from "@/components/landing/animated-footer";
import { useTheme } from "@/context/themecontext";

// TODO [LEGAL REVIEW]: Have a lawyer review all sections, especially data subject rights and retention policies

export default function PrivacyPolicy() {
  const { theme } = useTheme();

  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: `When you create a CampoSocial account, we collect information you provide directly, including:

• **Account Information**: Your name, email address, username, password (encrypted), and profile details such as your university, profile photo, and bio.
• **Social Graph**: Your friends list, followers, and people you follow.
• **Content You Create**: Yaps (posts), comments, messages, event RSVPs, marketplace listings, and any other content you share on the platform.
• **Communications**: Messages you send and receive through our chat features.
• **Usage Data**: Information about how you interact with our services, including pages visited, features used, and actions taken.
• **Device Information**: Basic device and browser information to help us provide and improve our services.`
    },
    {
      icon: Server,
      title: "How We Use Your Information",
      content: `We use the information we collect to:

• **Provide Our Services**: Enable you to create and share content, connect with other students, discover events, and use the marketplace.
• **Personalize Your Experience**: Show you relevant content, suggest connections, and customize your feed.
• **Communicate With You**: Send important updates, respond to your inquiries, and notify you about activity relevant to you.
• **Improve & Protect**: Analyze usage patterns to improve our services, detect and prevent fraud or abuse, and ensure the safety of our community.
• **Legal Compliance**: Comply with applicable laws, regulations, and legal processes.`
    },
    {
      icon: Lock,
      title: "Sign-In & OAuth",
      content: `CampoSocial may offer sign-in through third-party identity providers (such as social login options). When you choose to sign in this way:

• The third-party provider may share basic profile information with us (such as your name and email address) based on your settings with that provider.
• **We do not receive or store your password** from third-party providers when you use OAuth sign-in.
• Your use of third-party sign-in is also subject to that provider's privacy policy.
• You can disconnect third-party sign-in methods at any time through your account settings.`
    },
    {
      icon: Shield,
      title: "Data Storage & Security",
      content: `We take reasonable measures to protect your information:

• Your data is stored on secure servers with access controls and encryption where appropriate.
• Passwords are hashed and never stored in plain text.
• We regularly review our security practices and update them as needed.
• **No Absolute Guarantees**: While we strive to protect your data, no method of transmission or storage is 100% secure. We cannot guarantee absolute security.`
    },
    {
      icon: Share2,
      title: "Sharing & Disclosure",
      content: `We do not sell your personal information. We may share your information in the following circumstances:

• **With Your Consent**: When you explicitly agree to share information.
• **Public Content**: Content you post publicly (such as yaps or marketplace listings) is visible to other users as intended.
• **Service Providers**: With trusted third parties who help us operate our services (hosting, analytics, customer support), bound by confidentiality obligations.
• **Legal Requirements**: When required by law, legal process, or to protect the rights, safety, or property of CampoSocial, our users, or others.
• **Safety**: To investigate or prevent fraud, abuse, or other harmful activities.`
    },
    {
      icon: UserCheck,
      title: "Your Choices & Rights",
      content: `You have control over your information:

• **Access & Update**: You can view and update your profile information at any time through your account settings.
• **Delete Content**: You can delete your posts, comments, and other content you've created.
• **Account Deletion**: You can request deletion of your account by contacting us. We will delete or anonymize your data, except where we need to retain it for legal or legitimate business purposes.
• **Communication Preferences**: You can manage notification settings and opt out of non-essential communications.
• **Additional Rights**: Depending on your location, you may have additional rights under applicable privacy laws. Contact us to exercise these rights.`
    },
    {
      icon: Trash2,
      title: "Data Retention",
      content: `We retain your information for as long as:

• Your account is active, or
• As needed to provide you with our services, or
• As required by law or for legitimate business purposes (such as resolving disputes or enforcing our agreements).

When you delete your account, we will delete or anonymize your personal information within a reasonable timeframe, unless retention is required by law.`
    },
    {
      icon: Mail,
      title: "Contact Us & Changes",
      content: `**Contact Us**
If you have questions about this Privacy Policy or our data practices, please contact us at:
📧 hi@camposocial.com

**Changes to This Policy**
We may update this Privacy Policy from time to time. When we make significant changes, we will notify you through the app or by other means. Your continued use of CampoSocial after changes become effective constitutes acceptance of the updated policy.

**Effective Date**: December 2024`
    }
  ];

  return (
    <div
      className="min-h-screen bg-stone-50 dark:bg-stone-950"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='6' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`,
      }}
    >
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                <Image
                  src={
                    theme !== "dark"
                      ? "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-light.png"
                      : "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-dark.png"
                  }
                  alt="CampoSocial"
                  width={36}
                  height={36}
                  className="rounded-xl shadow-sm"
                  priority
                />
                <Image
                  src={
                    theme !== "dark"
                      ? "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/ezgif-camposocial-light-flicker.gif"
                      : "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/ezgif-camposocial-dark-flicker.gif"
                  }
                  alt="CampoSocial"
                  width={90}
                  height={90}
                  className="rounded-sm"
                  priority
                />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-12 px-6 sm:px-8 lg:px-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/">
              <Button
                variant="ghost"
                className="mb-6 text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>

            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "#ff9013" }}
              >
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1
                  className="text-4xl md:text-5xl font-bold tracking-tight"
                  style={{
                    color: "var(--color-heading)",
                    fontFamily: "Helvetica",
                  }}
                >
                  Privacy Policy
                </h1>
              </div>
            </div>

            <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl">
              Your privacy matters to us. This policy explains how CampoSocial
              collects, uses, and protects your information. We believe in
              transparency and giving you control over your data.
            </p>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> This privacy policy is provided for
                informational purposes and is subject to review. For specific
                legal questions, please consult with a qualified legal
                professional.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="pb-24 px-6 sm:px-8 lg:px-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                    <section.icon className="h-5 w-5 text-stone-700 dark:text-stone-300" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold text-stone-800 dark:text-stone-100">
                    {section.title}
                  </h2>
                </div>
                <div className="prose prose-stone dark:prose-invert max-w-none">
                  <div className="text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-line">
                    {section.content.split("**").map((part, i) =>
                      i % 2 === 1 ? (
                        <strong
                          key={i}
                          className="text-stone-800 dark:text-stone-200"
                        >
                          {part}
                        </strong>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="pb-16 px-6 sm:px-8 lg:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/terms">
              <Button
                variant="outline"
                className="px-6 py-3 rounded-full border-stone-300 dark:border-stone-700"
              >
                View Terms of Service
              </Button>
            </Link>
            <Link href="mailto:hi@camposocial.com">
              <Button
                className="px-6 py-3 rounded-full text-white"
                style={{ backgroundColor: "#ff9013" }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <AnimatedFooter />
    </div>
  );
}

