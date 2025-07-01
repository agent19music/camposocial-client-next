"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight,
  Users,
  Calendar,
  ShoppingBag,
  MessageSquare,
  Sparkles,
  Globe,
  Shield,
  Zap
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FloatingBackground } from "@/components/ui/floating-background";

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
  return (
    <div className="min-h-screen bg-background grain-bg">
      {/* Floating background icons */}
      <FloatingBackground iconCount={40} opacity={6} />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#D29DF6] to-[#D29DF6]/80 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">CampoSocial</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost" size="sm" className="glass-card border-0">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-gradient-to-r from-[#D29DF6] to-[#D29DF6]/90 hover:from-[#D29DF6]/90 hover:to-[#D29DF6]/80 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Dynamic gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D29DF6]/10 via-background to-[#D29DF6]/5 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#D29DF6]/20 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '6s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#D29DF6]/15 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '8s', animationDelay: '1s' }}></div>
        
        {/* Floating emojis for extra personality */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            className="absolute top-20 left-20 text-4xl opacity-40"
            animate={{ y: [-10, 10, -10], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            🎉
          </motion.div>
          <motion.div 
            className="absolute top-40 right-32 text-3xl opacity-30"
            animate={{ y: [10, -10, 10], rotate: [0, -5, 5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            🚀
          </motion.div>
          <motion.div 
            className="absolute bottom-40 left-32 text-5xl opacity-20"
            animate={{ y: [-5, 15, -5], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          >
            ⚡
          </motion.div>
          <motion.div 
            className="absolute top-60 right-20 text-3xl opacity-35"
            animate={{ y: [5, -15, 5], rotate: [0, -10, 10, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            💫
          </motion.div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge with animation */}
              <motion.div 
                className="inline-flex items-center px-6 py-3 rounded-full glass-golden text-foreground text-sm font-medium mb-8 shadow-xl border border-[#D29DF6]/20"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <Zap className="h-4 w-4 mr-2 text-[#D29DF6] animate-pulse" />
                <span className="bg-gradient-to-r from-[#D29DF6] to-[#D29DF6]/80 bg-clip-text text-transparent font-semibold">
                  Join 50K+ students already vibing
                </span>
              </motion.div>
              
              {/* Main headline with staggered animation */}
              <div className="space-y-4 mb-10">
                <motion.h1 
                  className="text-6xl sm:text-7xl lg:text-8xl font-inter font-black text-foreground leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <span className="block">Where Campus</span>
                  <span className="block bg-gradient-to-r from-[#D29DF6] via-[#D29DF6]/90 to-[#D29DF6]/70 bg-clip-text text-transparent animate-gradient-x">
                    Legends
                  </span>
                  <span className="block">Are Born</span>
                </motion.h1>
                
                <motion.div
                  className="text-2xl sm:text-3xl lg:text-4xl font-playfair italic text-foreground/70 font-light"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  Your social universe awaits ✨
                </motion.div>
              </div>
              
              {/* Enhanced description */}
              <motion.p 
                className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                Stop doom-scrolling and start <span className="text-[#D29DF6] font-semibold">actually connecting</span>. 
                Find your tribe, discover epic events, trade like a pro, and turn your campus into your playground.
              </motion.p>
              
              {/* Enhanced CTA buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
              >
                <Link href="/signup">
                  <Button size="lg" className="relative bg-gradient-to-r from-[#D29DF6] to-[#D29DF6]/90 hover:from-[#D29DF6]/90 hover:to-[#D29DF6]/80 text-white font-bold px-10 py-4 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-[#D29DF6]/25 group text-lg overflow-hidden">
                    <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    <span className="relative">Start Your Journey</span>
                    <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="glass-card border-2 border-[#D29DF6]/30 hover:border-[#D29DF6] font-semibold px-10 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg group">
                    <span className="group-hover:text-[#D29DF6] transition-colors">I&apos;m Already Cool</span>
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:text-[#D29DF6] transition-all" />
                  </Button>
                </Link>
              </motion.div>
              
              {/* Enhanced Stats with better visual appeal */}
              <motion.div 
                className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-white/20"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.3 + (0.1 * index) }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className="text-center glass-card p-6 rounded-2xl border border-[#D29DF6]/20 hover:border-[#D29DF6]/40 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="text-4xl font-black bg-gradient-to-r from-[#D29DF6] to-[#D29DF6]/70 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground group-hover:text-[#D29DF6]/80 transition-colors">
                      {stat.label}
                    </div>
                    {/* Add subtle glow effect */}
                    <div className="absolute inset-0 bg-[#D29DF6]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D29DF6]/5 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Everything you need for campus life
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed specifically for university students and campus communities.
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="glass-card p-6 h-full rounded-2xl group hover:shadow-2xl transition-all duration-500">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r from-[#D29DF6] to-[#D29DF6]/80 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2 group-hover:text-[#D29DF6] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-r from-[#D29DF6] to-[#D29DF6]/90 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl"
          >
            {/* Enhanced background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to join your campus community?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Connect with thousands of students, discover amazing events, and make lasting friendships.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-[#D29DF6] hover:bg-white/90 font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Join CampoSocial Today
                  </Button>
                </Link>
                <Link href="/events">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-xl transition-all duration-300 glass border-2">
                    Explore Events
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10 relative">
        <div className="absolute inset-0 glass-card border-0 rounded-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-[#D29DF6] to-[#D29DF6]/80 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">CampoSocial</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Connecting university students worldwide
            </p>
            <div className="flex justify-center items-center text-xs text-muted-foreground">
              Made with ❤️ for students, by students
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


