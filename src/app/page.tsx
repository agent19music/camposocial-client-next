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
import { DarkColors, Colors as Palette } from "../../constants/Colors";
import {HeartStraightIcon,UsersThreeIcon,ShoppingBagOpenIcon,ChatsCircleIcon,CalendarDotsIcon,ChatCircleTextIcon} from '@phosphor-icons/react'
import Footer from "@/components/footer";
import { useTheme } from "@/context/themecontext";

const features = [
  {
    icon: UsersThreeIcon,
    title: "Find Your Tribe",
    description: "Connect with people who actually get you and share your vibe"
  },
  {
    icon: CalendarDotsIcon,
    title: "Epic Experiences",
    description: "Discover parties, study sessions, and adventures you won't forget"
  },
  {
    icon: ShoppingBagOpenIcon,
    title: "Campus Marketplace",
    description: "Buy, sell, and trade everything from textbooks to concert tickets"
  },
  {
    icon: ChatCircleTextIcon,
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
  const C = Palette;
  const isDark = useTheme();
  // small helper to convert hex to rgba for subtle alpha gradients
  const hexToRgba = (hex: string, alpha = 1) => {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  return (
   <div className="min-h-scree bg-background">

      <FloatingBackground iconCount={20} opacity={3} />
      
      {/* Navigation - Clean header with unified dark mode */}
      <nav className="fixed top-0 w-full z-50  backdrop-blur-2xl ">
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
              <span className="text-[1.125rem] font-semibold tracking-tight" style={{ color: 'var(--color-heading)' }}>CampoSocial</span>
            </div>
            <div className="flex items-center gap-2">
          <ThemeToggle />
              {/* <ThemeToggle /> */}
              {currentUser &&(
                <Link href="/yaps">
                    <Avatar>
                      <AvatarImage src={currentUser.avatar} alt={currentUser.username} />
                      <AvatarFallback>{currentUser.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Link>
              )}
          
         
            </div>
          </div>
        </div>
      </nav>

      {/* ========================================================
        HERO SECTION - TRANSFORMED
        ========================================================
      */}
 <section className="pt-24 pb-0 px-6 sm:px-8 lg:px-10 relative overflow-hidden dark:bg-black min-h-[85vh]">
        {/* Gradient orbs - enhanced for dark mode */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 left-1/3 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: hexToRgba(C.primaryLight, 0.12) }}
          />
          <div
            className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: hexToRgba(C.accentLight, 0.12) }}
          />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-20"> {/* Increased z-index for text/CTA */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Clean pill badge */}
              {/* <motion.div 
                className="inline-flex items-center px-4 py-2 rounded-full backdrop-blur-sm border mb-3"
                style={{
                  backgroundColor: C.accentLight,
                  borderColor: hexToRgba(C.accent, 0.18),
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span className="text-sm font-medium" style={{ color: C.primaryDark }}>
                  Over 50,000 students connected
                </span>
              </motion.div> */}
              
              {/* Main headline - Text centered, bold, and impactful */}
              <div className="mb-2">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center w-full mb-3 md:mb-4 tracking-tight" 
              style={{ 
                color: 'var(--color-heading)',
                fontFamily: 'Helvetica',
              }}>
                The Campus Social Network That Gets You
              </h2>
              </div>
              
              {/* Clean description */}
              <motion.p 
                className="text-base  text-center  leading-[28px] max-w-[700px] w-full mx-auto font-normal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Connect with students who share your interests. Discover events that matter. 
                Build friendships that last beyond graduation.
              </motion.p>
              
              {/* Clean CTA buttons - Apple style */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {/* <Link href="/signup">
                  
                </Link> */}
                
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="default"
                    className="font-medium px-8 py-3 my-4 rounded-full transition-colors duration-200 text-[1.0625rem]"
                    style={{ color: C.white, backgroundColor: C.primaryDark }}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>

            </motion.div>
          </div>
        </div>
        
 {/* HERO GIRL IMAGE PLACEMENT */}
 <motion.div
            className="relative w-full h-[500px] flex justify-center mt-[-60px] pb-10" 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
            <Image
                src="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/hero%20girl.png"
                alt="Happy student using CampoSocial"
                width={700}
                height={700}
                quality={100}
                className="object-contain w-full h-full max-w-xl lg:max-w-2xl xl:max-w-3xl absolute bottom-[-100px] left-1/2 transform -translate-x-1/2 z-10"
            />
            
            {/* Floating Icon Bubbles */}
            {/* INBOX BUBBLE - Top Left */}
            <motion.div
              className="absolute top-[5%] left-[5%] md:left-[15%] lg:left-[20%] w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full flex items-center justify-center shadow-lg z-20"
              style={{ backgroundColor: '#B5D4E8' }}
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <ChatsCircleIcon size={40} weight="regular" color="white" className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
            </motion.div>

            {/* SHOPPING BUBBLE - Top Right */}
            <motion.div
              className="absolute top-[5%] right-[5%] md:right-[15%] lg:right-[20%] w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full flex items-center justify-center shadow-lg z-20"
              style={{ backgroundColor: '#E8B4C4' }}
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <ShoppingBagOpenIcon size={40} weight="regular" color="white" className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
            </motion.div>

            {/* LIKE BUBBLE - Bottom Left */}
            <motion.div
              className="absolute bottom-[15%] left-[5%] md:left-[15%] lg:left-[20%] w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full flex items-center justify-center shadow-lg z-20"
              style={{ backgroundColor: '#89B8A0' }}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <HeartStraightIcon size={40} weight="regular" color="white" className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
            </motion.div>

            {/* EVENT BUBBLE - Bottom Right */}
            <motion.div
              className="absolute bottom-[15%] right-[5%] md:right-[15%] lg:right-[20%] w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full flex items-center justify-center shadow-lg z-20"
              style={{ backgroundColor: '#D4A574' }}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <CalendarDotsIcon size={40} weight="regular" color="white" className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
            </motion.div>
        </motion.div>
      </section>




      {/* ========================================================
        NEW STATS SECTION (Separated from Hero)
        ========================================================
      */}
      <section className="py-20 px-6 sm:px-8 lg:px-10 dark:bg-black">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-10  max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl font-semibold mb-1" style={{ color: C.primaryDark }}>
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section - Clean grid layout */}
      <section className="py-24 px-6 sm:px-8 lg:px-dark:bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
                <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white mb-4" style={{ fontFamily: 'Helvetica'   ,color: 'var(--color-heading)'}}>
                Built for Campus Life
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto" >
                Everything you need to thrive in your university community.
              </p>
            </motion.div>
          </div>
          
          <div className="grid bg-[#FAFAF9] dark:bg-[#1A1A19] grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <div className="bg-[#FAFAF9] dark:bg-[#1A1A19]  p-8 h-full rounded-2xl   hover:shadow-lg transition-all duration-300 group backdrop-blur-sm">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: C.accent }}
                  >
                      <feature.icon className="h-6 w-6 text-slate-500 dark:text-white"  />
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

      {/* Footer - Minimal Apple style */}
      <Footer />
      <footer className="py-2 px-6 sm:px-8 lg:px-10 dark:bg-background">
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
        
             <div className="text-center mt-8">
             <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
             Made by an over caffeinated undergrad 
              <Image 
                src="https://pub-abe4a6405e724602a7fac9bf761e290c.r2.dev/sean_pfp_peace-removebg-preview.png" 
                alt="Sean" 
                width={40} 
                height={40} 
                className="inline-block rounded-full" 
              />
            </p>
          </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


