"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  UserCheck,
  Users,
  Edit3,
  ShieldAlert,
  Calendar,
  MessageCircle,
  Ban,
  AlertTriangle,
  RefreshCw,
  Mail,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import AnimatedFooter from "@/components/landing/animated-footer";
import { useTheme } from "@/context/themecontext";

// TODO [LEGAL REVIEW]: Have a lawyer review all sections, especially liability limitations, eligibility, and termination clauses

export default function TermsOfService() {
  const { theme } = useTheme();

  const sections = [
    {
      icon: UserCheck,
      title: "Acceptance of Terms",
      content: `By creating an account or using CampoSocial, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.

These terms constitute a legal agreement between you and CampoSocial. We encourage you to read them carefully before using the platform.`
    },
    {
      icon: Users,
      title: "Eligibility & Accounts",
      content: `**Eligibility**
• You must be at least 13 years old to use CampoSocial (or the minimum age required in your jurisdiction).
• CampoSocial is designed for students and members of educational communities. Some features may require verification of student status.

**Account Responsibilities**
• You are responsible for maintaining the confidentiality of your account credentials.
• You are responsible for all activities that occur under your account.
• You must provide accurate and complete information when creating your account.
• You may not create accounts for others without their permission or impersonate any person or entity.
• Notify us immediately if you suspect unauthorized access to your account.`
    },
    {
      icon: Users,
      title: "Campus Community Guidelines",
      content: `CampoSocial is built for campus communities. To keep our platform safe and welcoming, you agree to:

**Be Respectful**
• Treat others with respect and kindness.
• Engage in constructive discussions and debates.

**Prohibited Conduct**
• No harassment, bullying, threats, or intimidation of any kind.
• No hate speech, discrimination, or content that promotes violence.
• No sharing of others' private information without consent (doxxing).
• No spam, scams, or deceptive practices.
• No content that is illegal or promotes illegal activities.
• No sexually explicit content or content involving minors.

Violations may result in content removal, account suspension, or permanent ban at our discretion.`
    },
    {
      icon: Edit3,
      title: "User Content & License",
      content: `**Your Content**
You retain ownership of the content you create and share on CampoSocial (yaps, comments, messages, listings, etc.).

**License to CampoSocial**
By posting content, you grant CampoSocial a non-exclusive, worldwide, royalty-free license to:
• Host, store, and display your content within the service.
• Distribute your content to other users as intended by the platform's features.
• Use your content to promote and improve CampoSocial (e.g., featured posts).

This license ends when you delete your content or account, except where your content has been shared by others or we need to retain it for legal purposes.

**Responsibility for Content**
You are solely responsible for the content you post. Do not share content that infringes on others' intellectual property rights or violates these terms.`
    },
    {
      icon: ShieldAlert,
      title: "Prohibited Activities",
      content: `You agree not to:

• **Spam or Abuse**: Send unsolicited messages, create fake accounts, or manipulate engagement metrics.
• **Scrape or Harvest**: Use automated tools to collect data or content from CampoSocial without permission.
• **Hack or Exploit**: Attempt to gain unauthorized access to our systems or other users' accounts.
• **Interfere**: Disrupt or burden our infrastructure or other users' experience.
• **Circumvent**: Bypass security measures or access restrictions.
• **Commercial Misuse**: Use CampoSocial for unauthorized commercial purposes or advertising.
• **Illegal Activities**: Use the platform for any illegal purpose or to facilitate illegal transactions.`
    },
    {
      icon: Calendar,
      title: "Events & Marketplace Disclaimers",
      content: `**Events**
CampoSocial allows users to discover and share campus events. Please note:
• CampoSocial is not the organizer of third-party events listed on the platform.
• We do not guarantee the accuracy of event information, safety, or quality.
• Attend events at your own discretion and exercise appropriate caution.

**Marketplace**
The marketplace enables students to buy and sell items. Please note:
• CampoSocial is not a party to transactions between buyers and sellers.
• We do not guarantee the quality, safety, or legality of items listed.
• We are not responsible for disputes between buyers and sellers.
• Exercise caution when meeting others for transactions—meet in public places when possible.
• Report suspicious listings or users to us immediately.`
    },
    {
      icon: MessageCircle,
      title: "Messaging & Social Features",
      content: `**Content Moderation**
• We do not pre-screen all user content, but we may review and remove content that violates these terms.
• You can report content or users that violate our guidelines.
• We may use automated tools to help detect violations.

**Blocking & Privacy**
• You can block other users to prevent them from interacting with you.
• Blocking does not guarantee complete prevention of all contact.
• Respect others' privacy settings and boundaries.

**No Guarantee of Delivery**
• We strive to deliver messages reliably but cannot guarantee delivery or timing of all communications.`
    },
    {
      icon: Ban,
      title: "Termination & Suspension",
      content: `**Your Right to Terminate**
You may delete your account at any time through your account settings or by contacting us.

**Our Right to Terminate**
We may suspend or terminate your account, without prior notice, if we believe you have:
• Violated these Terms of Service.
• Engaged in conduct harmful to other users or the platform.
• Used the platform for illegal purposes.

**Effect of Termination**
Upon termination:
• Your right to use CampoSocial ends immediately.
• We may delete your content and data (subject to our data retention policies).
• Some provisions of these terms survive termination (e.g., limitation of liability).`
    },
    {
      icon: AlertTriangle,
      title: "Disclaimers & Limitation of Liability",
      // TODO [LEGAL REVIEW]: This section requires careful legal review for your jurisdiction
      content: `**"As Is" Service**
CampoSocial is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that:
• The service will be uninterrupted, secure, or error-free.
• Any defects will be corrected.
• The service will meet your specific requirements.

**Limitation of Liability**
To the maximum extent permitted by applicable law:
• CampoSocial shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
• Our total liability for any claims arising from your use of the service shall not exceed the amount you paid us (if any) in the 12 months preceding the claim.
• We are not responsible for the actions, content, or conduct of third parties, including other users.

**Indemnification**
You agree to indemnify and hold CampoSocial harmless from any claims, damages, or expenses arising from your use of the service or violation of these terms.`
    },
    {
      icon: RefreshCw,
      title: "Changes to Service & Terms",
      content: `**Changes to the Service**
We continuously improve CampoSocial and may:
• Add, modify, or remove features at any time.
• Change pricing or introduce new paid features (with notice).
• Discontinue the service with reasonable notice.

**Changes to These Terms**
We may update these Terms of Service from time to time. When we make significant changes:
• We will notify you through the app or other means.
• Your continued use after changes become effective constitutes acceptance.
• If you do not agree to the updated terms, please discontinue use of the service.`
    },
    {
      icon: Mail,
      title: "Contact Information",
      content: `If you have questions about these Terms of Service, please contact us at:

📧 **Email**: hi@camposocial.com

We're here to help and will respond to your inquiries as soon as possible.

**Effective Date**: December 2024

Thank you for being part of the CampoSocial community!`
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
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1
                  className="text-4xl md:text-5xl font-bold tracking-tight"
                  style={{
                    color: "var(--color-heading)",
                    fontFamily: "Helvetica",
                  }}
                >
                  Terms of Service
                </h1>
              </div>
            </div>

            <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl">
              Welcome to CampoSocial! These terms govern your use of our
              platform. By using CampoSocial, you agree to these terms. Please
              read them carefully.
            </p>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> These terms are provided for
                informational purposes and are subject to review. For specific
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
            <Link href="/privacy">
              <Button
                variant="outline"
                className="px-6 py-3 rounded-full border-stone-300 dark:border-stone-700"
              >
                View Privacy Policy
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

