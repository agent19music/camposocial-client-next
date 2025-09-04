"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  ArrowRight,
  Users,
  Calendar,
  ShoppingBag,
  MessageSquare,
  Globe,
  Shield,
  Zap,
  ChevronRight
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FloatingBackground } from "@/components/ui/floating-background";
import { useContext } from "react";
import { AuthContext } from "@/context/authcontext";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
const features = [
  {
    icon: Users,
    title: "Find Your Tribe",
    description: "Connect with people who actually get you and share your vibe"
  },
  {
    icon: Calendar,
    title: "Epic Experiences",
    description: "Discover parties, study sessions, and adventures you won't forget"
  },
  {
    icon: ShoppingBag,
    title: "Campus Marketplace",
    description: "Buy, sell, and trade everything from textbooks to concert tickets"
  },
  {
    icon: MessageSquare,
    title: "Real Conversations",
    description: "Chat, share memes, and stay connected with your campus crew"
  }
];

const stats = [
  { value: "50K+", label: "Squad Members" },
  { value: "200+", label: "Campus Takeovers" },
  { value: "10K+", label: "Epic Hangouts" },
  { value: "24/7", label: "Good Vibes Only" }
];

export default function Home() {
  const { currentUser } = useContext(AuthContext);
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-violet-50/50 dark:from-black dark:via-black dark:to-purple-950/20">
      {/* Subtle floating background */}
      <FloatingBackground iconCount={20} opacity={3} />
      
      {/* Navigation - Clean header with unified dark mode */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/90 backdrop-blur-2xl border-b border-purple-100/50 dark:border-purple-900/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <Image
                src="/camposocial_logo.png"
                alt="CampoSocial"
                width={36}
                height={36}
                className="rounded-xl shadow-sm"
                priority
              />
              <span className="text-[1.125rem] font-semibold tracking-tight text-slate-900 dark:text-white">CampoSocial</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {currentUser ? (
                <Link href="/yaps">
                    <Avatar>
                      <AvatarImage src={currentUser.avatar} alt={currentUser.username} />
                      <AvatarFallback>{currentUser.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Link>
              ) : (
                <Link href="/sigup">
                  <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium px-4">
                    Sign In
                  </Button>
                </Link>
              )}
          
              <Link href="/signup">
                <Button size="sm" className="bg-gradient-to-r from-[#D29DF6] to-[#C17FF2] hover:from-[#C17FF2] hover:to-[#B16FE8] text-white font-medium px-6 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Clean Apple-style hero with dark mode background */}
      <section className="pt-32 pb-20 px-6 sm:px-8 lg:px-10 relative overflow-hidden dark:bg-black">
        {/* Gradient orbs - enhanced for dark mode */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-gradient-to-br from-purple-500/20 dark:from-purple-600/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-tl from-violet-500/20 dark:from-violet-600/30 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Clean pill badge */}
              <motion.div 
                className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#D29DF6]/10 to-[#C17FF2]/10 backdrop-blur-sm border border-[#D29DF6]/20 mb-8"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span className="text-sm font-medium bg-gradient-to-r from-[#D29DF6] to-[#C17FF2] bg-clip-text text-transparent">
                  Over 50,000 students connected
                </span>
              </motion.div>
              
              {/* Main headline - Clean Apple-style typography */}
              <div className="mb-8">
                <motion.h1 
                  className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <span className="block">The Campus</span>
                  <span className="block bg-gradient-to-r from-[#D29DF6] via-[#C17FF2] to-[#B16FE8] bg-clip-text text-transparent">
                    Social Network
                  </span>
                  <span className="block">That Gets You</span>
                </motion.h1>
              </div>
              
              {/* Clean description */}
              <motion.p 
                className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-[1.5] font-normal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Connect with students who share your interests. Discover events that matter. 
                Build friendships that last beyond graduation.
              </motion.p>
              
              {/* Clean CTA buttons - Apple style */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Link href="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-[#D29DF6] to-[#C17FF2] hover:from-[#C17FF2] hover:to-[#B16FE8] text-white font-medium px-8 py-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl text-[1.0625rem] min-w-[180px]">
                    Get Started
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                
                <Link href="/login">
                  <Button size="lg" variant="ghost" className="text-[#D29DF6] hover:text-[#C17FF2] font-medium px-8 py-3 rounded-full transition-colors duration-200 text-[1.0625rem] hover:bg-[#D29DF6]/5">
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
              
              {/* Clean stats grid */}
              <motion.div 
                className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-16 border-t border-slate-200 dark:border-slate-700/50 max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + (0.05 * index) }}
                    className="text-center"
                  >
                    <div className="text-3xl font-semibold bg-gradient-to-r from-[#D29DF6] to-[#C17FF2] bg-clip-text text-transparent mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Clean grid layout */}
      <section className="py-24 px-6 sm:px-8 lg:px-10 bg-purple-50/30 dark:bg-black/95">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white mb-4">
                Built for Campus Life
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Everything you need to thrive in your university community.
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <div className="bg-white dark:bg-purple-950/20 p-8 h-full rounded-2xl border border-purple-100/50 dark:border-purple-900/30 hover:shadow-lg transition-all duration-300 group backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D29DF6]/10 to-[#C17FF2]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-[#D29DF6]" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Clean gradient card */}
      <section className="py-24 px-6 sm:px-8 lg:px-10 dark:bg-black">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-br from-[#D29DF6] via-[#C17FF2] to-[#B16FE8] rounded-3xl p-16 text-white relative overflow-hidden shadow-xl">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='20' cy='20' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
                Ready to find your people?
              </h2>
              <p className="text-xl mb-10 opacity-95 max-w-2xl mx-auto">
                Join thousands of students already building meaningful connections on campus.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-[#D29DF6] hover:bg-white/95 font-medium px-8 py-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/events">
                  <Button size="lg" variant="outline" className="border-2 border-white/80 text-white hover:bg-white/10 font-medium px-8 py-3 rounded-full transition-all duration-200">
                    Browse Events
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Minimal Apple style */}
      <footer className="py-16 px-6 sm:px-8 lg:px-10 border-t border-purple-100 dark:border-purple-900/20 bg-purple-50/30 dark:bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Image
                src="/camposocial_logo.png"
                alt="CampoSocial"
                width={36}
                height={36}
                className="rounded-xl shadow-sm"
              />
              <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">CampoSocial</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Connecting students worldwide since 2024
            </p>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              Made with care for the student community
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


