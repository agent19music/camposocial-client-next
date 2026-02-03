"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useContext } from "react";
import { AuthContext } from "@/context/authcontext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GraduationCap,
  Handshake,
  Star,
  Lock,
  ChatsCircle,
} from '@phosphor-icons/react'
import { useTheme } from "@/context/themecontext";

// Landing page components
import { SectionScrollConnector } from "@/components/landing/scroll-trail-icon";
import AnimatedFooter from "@/components/landing/animated-footer";

export default function Home() {
  const { currentUser } = useContext(AuthContext);
  const { theme } = useTheme();

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[var(--color-background-hex)]">

      {/* ========================================================
        HERO SECTION WITH NOTCHED NAVBAR (Desktop) / Edge-to-Edge (Mobile)
        ========================================================
      */}
      <section className="relative min-h-screen">
        {/* Hero Container - Rounded on desktop, edge-to-edge on mobile */}
        <div className="relative lg:mx-6 xl:mx-10 lg:my-4">
          {/* The hero image container with border effect on desktop */}
          <div className="relative h-screen lg:h-[calc(100vh-2rem)] lg:rounded-3xl overflow-hidden lg:ring-1 lg:ring-stone-300 dark:lg:ring-stone-700 ">
            {/* Background Image - Valley Picnic Scene */}
            <div className="absolute inset-0 z-0">
              <Image
                src="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/slop_hero3.webp"
                alt="Serene valley landscape with students enjoying a picnic"
                fill
                priority
                quality={100}
                sizes="100vw"
                className="object-cover"
                style={{ objectFit: 'cover', objectPosition: '70% 50%' }}
              />
            </div>




            {/* Navbar Notch - Desktop Only (Fixed/Sticky) */}
            <div className="hidden lg:block fixed top-0 left-1/2 -translate-x-1/2 z-50">
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative"
              >
                {/* Left curved cutout */}
                <svg className="absolute -left-5 top-0 w-5 h-5" viewBox="0 0 20 20" fill="none">
                  <path d="M20 0 L20 20 Q20 0 0 0 Z" className="fill-[var(--color-background-hex)]" />
                </svg>

                {/* Notch background shape */}
                <div className="relative bg-[var(--color-background-hex)] px-6 py-3 rounded-b-3xl shadow-lg">
                  <div className="flex items-center gap-6">
                    {/* Left nav items */}
                    <div className="flex items-center gap-2">
                      <Image
                        src={theme !== 'dark'
                          ? "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-light.png"
                          : "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-dark.png"
                        }
                        alt="CampoSocial"
                        width={40}
                        height={40}
                        className="rounded-xl"
                        priority
                      />
                      <Image
                      unoptimized
                        src={theme !== 'dark'
                          ? "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/ezgif-camposocial-light-flicker.gif"
                          : "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/ezgif-camposocial-dark-flicker.gif"
                        }
                        alt="CampoSocial"
                        width={100}
                        height={100}
                        className="rounded-sm"
                        priority
                      />
                    </div>

                    {/* Separator */}
                    <div className="w-px h-8 bg-[var(--color-border-hex)]" />

                    {/* Right nav items */}
                    <div className="flex items-center gap-3">
                      <ThemeToggle
                        className="w-10 h-10 rounded-xl"
                        iconClassName="h-5 w-5"
                      />
                      {currentUser && (
                        <Link href="/yaps">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={currentUser.avatar} alt={currentUser.username} />
                            <AvatarFallback>{currentUser.username.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right curved cutout */}
                <svg className="absolute -right-5 top-0 w-5 h-5" viewBox="0 0 20 20" fill="none">
                  <path d="M0 0 L0 20 Q0 0 20 0 Z" className="fill-[var(--color-background-hex)]" />
                </svg>
              </motion.div>
            </div>

            {/* Mobile Navigation - Simple sticky bar with rounded bottom corners */}
            <nav className="lg:hidden fixed top-0 left-0 right-0 z-50    bg-[var(--color-background-hex)] backdrop-blur-sm rounded-b-2xl shadow-md">
              <motion.div
                className="flex justify-between items-center h-14 px-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="flex items-center space-x-2">
                  <Image
                    src={theme !== 'dark'
                      ? "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-light.png"
                      : "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-dark.png"
                    }
                    alt="CampoSocial"
                    width={36}
                    height={36}
                    className="rounded-lg"
                    priority
                  />
                  <Image
                    src={theme !== 'dark'
                      ? "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/ezgif-camposocial-light-flicker.gif"
                      : "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/ezgif-camposocial-dark-flicker.gif"
                    }
                    alt="CampoSocial"
                    width={90}
                    height={90}
                    className="rounded-sm"
                    priority
                  />
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle
                    className="w-9 h-9 rounded-lg"
                    iconClassName="h-5 w-5"
                  />
                  {currentUser && (
                    <Link href="/yaps">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={currentUser.avatar} alt={currentUser.username} />
                        <AvatarFallback>{currentUser.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Link>
                  )}
                </div>
              </motion.div>
            </nav>

            {/* Hero Content - Vertically centered */}
            <div className="relative z-10 h-full flex flex-col justify-center pt-14 lg:pt-0 px-4 sm:px-6 lg:px-12 xl:px-20">
              <div className="max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  {/* Main H1 - Duna-inspired typography */}
                  <h1
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-semibold leading-[1.1] mb-6 break-words"
                    style={{
                      letterSpacing: '-0.0004em',
                      color: '#222221',
                      fontFamily: 'Helvetica',
                    }}
                  >
                    Build networks that last a lifetime
                  </h1>

                  {/* Helper Text - Muted, breathable */}
                  <motion.p
                    className="text-lg sm:text-xl md:text-2xl leading-relaxed max-w-lg mb-8"
                    style={{
                      color: '#4a4a4a',
                      lineHeight: '1.6',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    Connect with students who share your passions.
                    Discover experiences that matter. Create friendships that outlast graduation.
                  </motion.p>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    <Link href="/signup">
                      <Button
                        size="lg"
                        className="font-medium px-8 sm:px-10 py-6 sm:py-8 bg-[#ff9013] hover:bg-[#e8820f] text-white rounded-full transition-all duration-300 text-lg sm:text-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      >
                        Get Started
                        <ArrowRight className="ml-2 h-6 w-6" />
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>




      {/* Features Section - Two Column Asymmetric */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {/* Left Column - Content (40%) */}
            <div className="lg:col-span-2 space-y-6 order-1">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >


                {/* Headline */}
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mt-6 mb-4"
                  style={{ fontFamily: "Helvetica", color: "var(--color-heading)" }}
                >
                  Built for Campus Life
                </h2>

                {/* Supporting Copy */}
                <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
                  Everything you need to thrive in your university community. From finding your tribe
                  to discovering events, shopping the marketplace, and staying connected.
                </p>

                {/* CTA Button */}
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="mt-8 px-8 py-6 rounded-full font-medium transition-all duration-300 hover:-translate-y-0.5"
                    style={{ backgroundColor: '#E8A898', color: 'white' }}
                  >
                    Get Started Free
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right Column - Feature Cards Grid (60%) */}
            <div className="lg:col-span-3 order-2">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Find Your Tribe */}
                  <div
                    className="relative overflow-hidden rounded-2xl min-h-[240px] sm:min-h-[280px] p-5 sm:p-6 md:p-8 flex flex-col justify-start group hover:scale-[1.02] transition-all duration-500 shadow-md hover:shadow-xl sticky top-24 sm:static"
                    style={{
                      background: 'linear-gradient(135deg, #E8A898 0%, #F5D4B8 100%)',
                      backgroundImage: `url('https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/feature-cards/find-your-tribe-nobg-preview.png'), linear-gradient(135deg, #E8A898 0%, #F5D4B8 100%)`,
                      backgroundSize: 'auto 55%, cover',
                      backgroundPosition: 'bottom right, center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <div className="relative z-10">
                      <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight" style={{ color: '#3a2a25', fontFamily: 'Helvetica' }}>
                        Find Your Tribe
                      </h3>
                      <p className="text-sm md:text-base leading-relaxed" style={{ color: '#5a4a45' }}>
                        Connect with people who get you
                      </p>
                    </div>
                  </div>

                  {/* Epic Experiences */}
                  <div
                    className="relative overflow-hidden rounded-2xl min-h-[240px] sm:min-h-[280px] p-5 sm:p-6 md:p-8 flex flex-col justify-start group hover:scale-[1.02] transition-all duration-500 shadow-md hover:shadow-xl sticky top-28 sm:static"
                    style={{
                      background: 'linear-gradient(135deg, #C4A8C8 0%, #D4B8C8 100%)',
                      backgroundImage: `url('https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/feature-cards/epic-experiences-nobg-preview.png'), linear-gradient(135deg, #C4A8C8 0%, #D4B8C8 100%)`,
                      backgroundSize: 'auto 55%, cover',
                      backgroundPosition: 'bottom right, center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <div className="relative z-10">
                      <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight" style={{ color: '#3a2a3a', fontFamily: 'Helvetica' }}>
                        Epic Experiences
                      </h3>
                      <p className="text-sm md:text-base leading-relaxed" style={{ color: '#5a4a5a' }}>
                        Adventures you won&apos;t forget
                      </p>
                    </div>
                  </div>

                  {/* Campus Marketplace */}
                  <div
                    className="relative overflow-hidden rounded-2xl min-h-[240px] sm:min-h-[280px] p-5 sm:p-6 md:p-8 flex flex-col justify-start group hover:scale-[1.02] transition-all duration-500 shadow-md hover:shadow-xl sticky top-32 sm:static"
                    style={{
                      background: 'linear-gradient(135deg, #98A888 0%, #B8C8A8 100%)',
                      backgroundImage: `url('https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/feature-cards/campus-marketplace-nog-high.png'), linear-gradient(135deg, #98A888 0%, #B8C8A8 100%)`,
                      backgroundSize: 'auto 55%, cover',
                      backgroundPosition: 'bottom right, center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <div className="relative z-10">
                      <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight" style={{ color: '#2a3a2a', fontFamily: 'Helvetica' }}>
                        Campus Marketplace
                      </h3>
                      <p className="text-sm md:text-base leading-relaxed" style={{ color: '#4a5a4a' }}>
                        Buy, sell, trade with ease
                      </p>
                    </div>
                  </div>

                  {/* Real Conversations */}
                  <div
                    className="relative overflow-hidden rounded-2xl min-h-[240px] sm:min-h-[280px] p-5 sm:p-6 md:p-8 flex flex-col justify-start group hover:scale-[1.02] transition-all duration-500 shadow-md hover:shadow-xl sticky top-36 sm:static"
                    style={{
                      background: 'linear-gradient(135deg, #B8A898 0%, #E8D4C8 100%)',
                      backgroundImage: `url('https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/feature-cards/real-conversations-nobg.png'), linear-gradient(135deg, #B8A898 0%, #E8D4C8 100%)`,
                      backgroundSize: 'auto 55%, cover',
                      backgroundPosition: 'bottom right, center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <div className="relative z-10">
                      <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight" style={{ color: '#3a2a2a', fontFamily: 'Helvetica' }}>
                        Real Conversations
                      </h3>
                      <p className="text-sm md:text-base leading-relaxed" style={{ color: '#5a4a4a' }}>
                        Stay connected with your crew
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll Connector - Features to Marketplace */}
      <SectionScrollConnector icon="shop" side="right" height={180} />

      {/* Marketplace Showcase Section - Two Column Asymmetric */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {/* Left Column - Content (40%) */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >


                {/* Headline */}
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mt-6 mb-4"
                  style={{ fontFamily: "Helvetica", color: "var(--color-heading)" }}
                >
                  Campus Marketplace
                </h2>

                {/* Supporting Copy */}
                <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
                  Discover unique finds from fellow students. From vintage fashion to rare collectibles,
                  buy and sell with trust in your campus community.
                </p>

                {/* CTA Button */}
                <Link href="/marketplace">
                  <Button
                    size="lg"
                    className="mt-8 px-8 py-6 rounded-full font-medium transition-all duration-300 hover:-translate-y-0.5"
                    style={{ backgroundColor: '#98A888', color: 'white' }}
                  >
                    Shop Marketplace
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right Column - Image Showcase (60%) */}
            <div className="lg:col-span-3 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                {/* Hero Image */}
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-4">
                  <Image
                    src="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/marketplace/popupstores.jpg"
                    alt="Campus Coffee Pop-Up marketplace event"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Supporting Images Grid - 3 columns on desktop, 2 on mobile */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="relative aspect-square rounded-xl overflow-hidden">
                    <Image
                      src="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/marketplace/sadeshirtthrift.jpg"
                      alt="Vintage Sade shirt"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden">
                    <Image
                      src="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/marketplace/adidassamba.jpg"
                      alt="Adidas Samba shoes"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden hidden lg:block">
                    <Image
                      src="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/marketplace/manutd2007homekitthrift.jpg"
                      alt="Manchester United jersey"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll Connector - Marketplace to Events */}
      <SectionScrollConnector icon="ticket" side="left" height={180} />

      {/* Events Showcase Section - Two Column Asymmetric */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {/* Left Column - Content (40%) */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >


                {/* Headline */}
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mt-6 mb-4"
                  style={{ fontFamily: "Helvetica", color: "var(--color-heading)" }}
                >
                  Campus Events
                </h2>

                {/* Supporting Copy */}
                <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
                  Never miss a moment. From outdoor concerts to nature hikes and celebrations,
                  discover experiences that create lasting memories.
                </p>

                {/* CTA Button */}
                <Link href="/events">
                  <Button
                    size="lg"
                    className="mt-8 px-8 py-6 rounded-full font-medium transition-all duration-300 hover:-translate-y-0.5"
                    style={{ backgroundColor: '#C4A8C8', color: 'white' }}
                  >
                    Explore Events
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right Column - Image Showcase (60%) */}
            <div className="lg:col-span-3 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                {/* Hero Image */}
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-4">
                  <Image
                    src="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/events/chilloutside.jpg"
                    alt="Sunset Sessions outdoor concert on main quad"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Supporting Images Grid - 3 columns on desktop, 2 on mobile */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="relative aspect-square rounded-xl overflow-hidden">
                    <Image
                      src="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/events/naturetrail.jpg"
                      alt="Nature hike adventure"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden">
                    <Image
                      src="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/events/christmasparty.jpg"
                      alt="Holiday party celebration"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden hidden lg:block">
                    <Image
                      src="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/events/clubmeet.jpg"
                      alt="Campus gathering"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll Connector - Events to Chat */}
      <SectionScrollConnector icon="paperplane" side="right" height={180} />

      {/* Chat & Messaging Section - Two Column Asymmetric */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {/* Left Column - Content (40%) */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >


                {/* Headline */}
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mt-6 mb-4"
                  style={{ fontFamily: "Helvetica", color: "var(--color-heading)" }}
                >
                  Connect & Chat
                </h2>

                {/* Supporting Copy */}
                <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
                  Message friends, join group chats, and stay connected with your campus community.
                  End-to-end encrypted for your privacy.
                </p>

                {/* CTA Button */}
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="mt-8 px-8 py-6 rounded-full font-medium transition-all duration-300 hover:-translate-y-0.5"
                    style={{ backgroundColor: '#A898C8', color: 'white' }}
                  >
                    Start Chatting
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right Column - Chat Preview (60%) */}
            <div className="lg:col-span-3 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                {/* Chat Preview Cards */}
                <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 space-y-3">
                  {/* Chat Message 1 */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 hover:-translate-y-1 transition-transform duration-200">
                    <div className="relative flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12">
                      <Image
                        src="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/avatars/grouppfp.png"
                        alt="Study Group"
                        fill
                        className="rounded-full object-cover"
                      />
                      <span className="absolute -top-1 -right-2 w-5 h-5 bg-[#ff9013] text-white text-xs font-bold rounded-full flex items-center justify-center">3</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-800 dark:text-stone-100 text-sm truncate">Study Group</span>
                        <span className="text-xs text-stone-500 dark:text-stone-400 flex-shrink-0">2m ago</span>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400 truncate">Anyone have notes from today&apos;s lecture?</p>
                    </div>
                  </div>

                  {/* Chat Message 2 */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 hover:-translate-y-1 transition-transform duration-200">
                    <div className="relative flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12">
                      <Image
                        src="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/avatars/fanumtax.png"
                        alt="Sean"
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-800 dark:text-stone-100 text-sm truncate">Sean</span>
                        <span className="text-xs text-stone-500 dark:text-stone-400 flex-shrink-0">15m ago</span>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400 truncate">So, what&apos;s your favourite class this semester?</p>
                    </div>
                  </div>

                  {/* Chat Message 3 */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 hover:-translate-y-1 transition-transform duration-200">
                    <div className="relative flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12">
                      <Image
                        src="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/avatars/chunli.png"
                        alt="Lee"
                        fill
                        className="rounded-full object-cover"
                      />
                      <span className="absolute -top-1 -right-2 w-5 h-5 bg-[#ff9013] text-white text-xs font-bold rounded-full flex items-center justify-center">9+</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-800 dark:text-stone-100 text-sm truncate">Lee</span>
                        <span className="text-xs text-stone-500 dark:text-stone-400 flex-shrink-0">1h ago</span>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400 truncate">Pizza night tonight?</p>
                    </div>
                  </div>
                </div>

                {/* Feature Pills */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
                    <Lock className="w-8 h-8 text-stone-700 dark:text-stone-300 flex-shrink-0" weight="duotone" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-stone-800 dark:text-stone-100 truncate">End-to-End</div>
                      <div className="text-xs text-stone-600 dark:text-stone-400 truncate">Encrypted</div>
                    </div>
                  </div>
                  <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
                    <ChatsCircle className="w-8 h-8 text-stone-700 dark:text-stone-300 flex-shrink-0" weight="duotone" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-stone-800 dark:text-stone-100 truncate">Group Chats</div>
                      <div className="text-xs text-stone-600 dark:text-stone-400 truncate">Clubs & more</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll Connector - Chat to Community */}
      <SectionScrollConnector icon="users" side="left" height={180} />

      {/* Community Section - Two Column Asymmetric */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {/* Left Column - Content (40%) */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >


                {/* Headline */}
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mt-6 mb-4"
                  style={{ fontFamily: "Helvetica", color: "var(--color-heading)" }}
                >
                  Your Campus Community
                </h2>

                {/* Supporting Copy */}
                <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
                  Find your people. From study buddies to lifelong friends. Join a growing network
                  of students connecting, collaborating, and building lasting relationships.
                </p>

                {/* CTA Button */}
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="mt-8 px-8 py-6 rounded-full font-medium transition-all duration-300 hover:-translate-y-0.5"
                    style={{ backgroundColor: '#B8A898', color: 'white' }}
                  >
                    Join Community
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right Column - Image Showcase (60%) */}
            <div className="lg:col-span-3 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                {/* Hero Image */}
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-4">
                  <Image
                    src="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/events/unisocial.png"
                    alt="Students collaborating in campus lounge"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Stats Grid - Responsive with text truncation */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center overflow-hidden">
                    <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-stone-700 dark:text-stone-300 mx-auto mb-1 sm:mb-2" weight="duotone" />
                    <div className="text-sm sm:text-lg font-semibold text-stone-800 dark:text-stone-100 truncate">Universities</div>
                    <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 truncate">Campus networks</div>
                  </div>
                  <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center overflow-hidden">
                    <Handshake className="w-6 h-6 sm:w-8 sm:h-8 text-stone-700 dark:text-stone-300 mx-auto mb-1 sm:mb-2" weight="duotone" />
                    <div className="text-sm sm:text-lg font-semibold text-stone-800 dark:text-stone-100 truncate">Friendships</div>
                    <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 truncate">Connections</div>
                  </div>
                  <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center overflow-hidden">
                    <Star className="w-6 h-6 sm:w-8 sm:h-8 text-[#ff9013] mx-auto mb-1 sm:mb-2" weight="duotone" />
                    <div className="text-sm sm:text-lg font-semibold text-stone-800 dark:text-stone-100 truncate">Coming Soon</div>
                    <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 truncate">Be first</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-10 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-semibold tracking-tight mb-6" style={{ fontFamily: 'Helvetica', color: 'var(--color-heading)' }}>
              Ready to join your campus?
            </h2>
            <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-400 mb-10 max-w-2xl mx-auto">
              Connect with students on your campus. Buy, sell, chat, and discover events all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-4 text-base sm:text-lg font-medium text-white rounded-full transition-all duration-300 hover:-translate-y-1"
                style={{ backgroundColor: '#ff9013' }}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-4 text-base sm:text-lg font-medium text-stone-700 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 rounded-full transition-all duration-300 hover:-translate-y-1"
              >
                I Have an Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Animated Footer */}
      <AnimatedFooter />
    </div>
  );
}
