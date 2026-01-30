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
import { DreamyOrbs } from "@/components/ui/dreamy-orbs";
import { HeroAuraGlow } from "@/components/ui/hero-aura-glow";
import { useContext } from "react";
import { AuthContext } from "@/context/authcontext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DarkColors, Colors as Palette } from "../../constants/Colors";
import {
  HeartStraightIcon,
  UsersThreeIcon,
  ShoppingBagOpenIcon,
  ChatsCircleIcon,
  CalendarDotsIcon,
  ChatCircleTextIcon,
  GraduationCap,
  Handshake,
  Star,
  Lock,
  ChatTeardrop,
  Books
} from '@phosphor-icons/react'
import { useTheme } from "@/context/themecontext";


// Landing page components
import { SectionScrollConnector } from "@/components/landing/scroll-trail-icon";
import {
  BentoGrid,
  BentoCard,
  BentoSection,
  PlaceholderImage,
  ProductCard,
  EventCard,
  ChatPreview,
  StatCard,
  UserAvatarGroup,
} from "@/components/landing/bento-showcase";
import AnimatedFooter from "@/components/landing/animated-footer";

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

export default function Home() {
  const { currentUser } = useContext(AuthContext);
  const C = Palette;
  const { theme } = useTheme();


  return (
    <div className="min-h-screen relative"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='6' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`,
      }}>

      {/* Dreamy floating orbs background */}
      <DreamyOrbs orbCount={10} />

      {/* Navigation - Floating header with solid background */}
      <nav className="fixed top-0 w-full z-50 pt-4 px-6 sm:px-8 lg:px-10">
        <motion.div
          className="max-w-7xl mx-auto bg-white dark:bg-stone-950 border-l border-r border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex justify-between items-center h-16 px-6">
            <div className="flex items-center space-x-3">
              <Image
                src={theme !== 'dark'
                  ? "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-light.png"
                  : "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-dark.png"
                }
                alt="CampoSocial"
                width={44}
                height={44}
                className="rounded-xl shadow-sm"
                priority
              />
              <Image
                src={theme !== 'dark'
                  ? "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/ezgif-camposocial-light-flicker.gif"
                  : "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/ezgif-camposocial-dark-flicker.gif"
                }
                alt="University Logo"
                width={110}
                height={110}
                className="rounded-sm"
                priority
              />
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle
                className="w-11 h-11 rounded-xl  shadow-sm"
                iconClassName="h-6 w-6"
              />
              {currentUser && (
                <Link href="/yaps">
                  <Avatar>
                    <AvatarImage src={currentUser.avatar} alt={currentUser.username} />
                    <AvatarFallback>{currentUser.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </nav>

      {/* ========================================================
        HERO SECTION - CALM NATUREFUL DESIGN WITH DREAMY AURA
        ========================================================
      */}
      <section className="relative h-screen overflow-hidden">
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

        {/* Hemisphere aura glow from bottom */}
        <HeroAuraGlow />

        {/* Hero Content - Vertically centered (account for fixed nav height) */}
        <div className="relative z-10 h-full flex flex-col justify-center pt-16 px-6 sm:px-8 lg:px-12 xl:px-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Main H1 - Duna-inspired typography */}
              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.1] font-bold mb-6"
                style={{
                  letterSpacing: '-0.04em',
                  color: '#222221',
                  fontFamily: 'Helvetica',
                }}
              >
                Build networks that last a lifetime
              </h1>

              {/* Helper Text - Muted, breathable */}
              <motion.p
                className="text-lg md:text-xl leading-relaxed max-w-lg mb-8"
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
                    className="font-medium px-8 py-6 bg-[#ff9013] hover:bg-[#e8820f] text-white rounded-full transition-all duration-300 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>

      </section>




      {/* Features Section - Clean grid layout */}
      <section className="py-24 px-6 sm:px-8 lg:px-10 relative bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight mb-4" style={{ fontFamily: 'Helvetica', color: 'var(--color-heading)' }}>
                Built for Campus Life
              </h2>
              <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto" >
                Everything you need to thrive in your university community.
              </p>
            </motion.div>
          </div>

          <div className="grid  grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <div className="bg-white dark:bg-stone-900 p-8 h-full rounded-2xl border border-stone-200 dark:border-stone-800 transition-all duration-300 group hover:-translate-y-1">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"

                  >
                    <feature.icon className="h-6 w-6 text-stone-700 dark:text-stone-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scroll Connector - Features to Marketplace */}
      <SectionScrollConnector icon="shop" side="right" height={180} />

      {/* Marketplace Showcase Section */}
      <BentoSection
        title="Campus Marketplace"
        subtitle="Buy, sell, and discover from fellow students. Textbooks, dorm essentials, handmade goods, and more."
      >
        <BentoGrid columns={3}>
          <BentoCard className="md:col-span-2 md:row-span-2 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="relative flex-1 min-h-[300px] overflow-hidden">
                <Image
                  src="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/marketplace/popupstores.jpg"
                  alt="Students at campus coffee shop marketplace pop-up"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 flex-shrink-0">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Featured Seller</span>
                <h3 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mt-1">Campus Coffee Pop-Up</h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">Weekly vendor marketplace at the campus café</p>
              </div>
            </div>
          </BentoCard>

          <ProductCard
            image="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/marketplace/sadeshirtthrift.jpg"
            imageAlt="Vintage Sade graphic tee with classic tour design, oversized fit, perfect condition"
            title="Vintage Sade Shirt"
            price="$28"
            seller="@vintagevibes"
          />

          <ProductCard
            image="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/marketplace/adidassamba.jpg"
            imageAlt="Samba classic shoes in white leather with iconic three stripes, gently worn"
            title="Adidas Samba Shoes"
            price="$65"
            seller="@sneakerhead"
          />

          <ProductCard
            image="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/marketplace/manutd2007homekitthrift.jpg"
            imageAlt="Manchester United official kit jersey, authentic merchandise, great condition"
            title="Man Utd Jersey"
            price="$45"
            seller="@footie_fan"
          />

          <ProductCard
            image="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/marketplace/lipaccessories.jpg"
            imageAlt="Makeup collection with trendy lip accessories, glosses and liners in various shades"
            title="Lip Accessories Set"
            price="$22"
            seller="@beauty_hub"
          />
          <ProductCard
            image="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/marketplace/floralcupcakes.jpg"
            imageAlt="Assorted floral-themed cupcakes with intricate icing designs, perfect for events"
            title="Floral Cupcakes"
            price="$7"
            seller="@sweettooth"
          />
        </BentoGrid>
      </BentoSection>

      {/* Scroll Connector - Marketplace to Events */}
      <SectionScrollConnector icon="ticket" side="left" height={180} />

      {/* Events Showcase Section */}
      <BentoSection
        title="Campus Events"
        subtitle="Never miss a party, study session, club meeting, or campus happening. All in one place."
      >
        <BentoGrid columns={4}>
          <EventCard
            image="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/events/chilloutside.jpg"
            imageAlt="Outdoor sunset concert on the main quad"
            title="Sunset Sessions"
            date="Fri, Nov 15"
            location="Main Quad"
            attendees={234}
          />

          <EventCard
            image="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/events/naturetrail.jpg"
            imageAlt="Students hiking on nature trail"
            title="Nature Hike"
            date="Sun, Nov 17"
            location="Greenwood Park"
            attendees={56}
          />


          <EventCard
            image="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/events/christmasparty.jpg"
            imageAlt="Holiday party celebration on campus"
            title="Holiday Party"
            date="Sat, Dec 16"
            location="Main Quad"
            attendees={450}
          />

          <EventCard
            image="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/events/clubmeet.jpg"
            imageAlt="Students in study lounge planning session"
            title="Club Planning"
            date="Sun, Nov 17"
            location="Student Center"
            attendees={45}
          />
        </BentoGrid>
      </BentoSection>

      {/* Scroll Connector - Events to Chat */}
      <SectionScrollConnector icon="paperplane" side="right" height={180} />

      {/* Chat & Messaging Section */}
      <BentoSection
        title="Connect & Chat"
        subtitle="Message friends, join group chats, and stay connected with your campus community."
      >
        <BentoGrid columns={3}>
          <BentoCard className="md:col-span-2">
            <div className="space-y-3">
              <ChatPreview
                avatar="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/avatars/grouppfp.png"
                avatarAlt="Profile photo: Group study session with students"
                name="Study Group"
                message="Anyone have notes from today's lecture?"
                time="2m ago"
                unread={3}
              />
              <ChatPreview
                avatar="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/avatars/fanumtax.png"
                avatarAlt="Profile photo: Sean"
                name="Sean"
                message="So, what's your favourite class this semester?"
                time="15m ago"
              />
              <ChatPreview
                avatar="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/avatars/chunli.png"
                avatarAlt="Profile photo: Lee"
                name="Lee"
                message="Pizza night tonight?"
                time="1h ago"
                unread={12}
              />
            </div>
          </BentoCard>

          <BentoCard withOrbs orbColorScheme="lavender">
            <div className="h-full flex flex-col justify-center items-center text-center p-4">
              <Lock className="w-12 h-12 text-stone-700 dark:text-stone-300 mb-4" weight="duotone" />
              <div className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-1">End-to-End</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Encrypted Messages</div>
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-2" withOrbs orbColorScheme="peach">
            <div className="h-full flex items-center justify-between p-4">
              <div>
                <div className="text-lg font-semibold text-stone-800 dark:text-stone-100">Group Chats</div>
                <div className="text-sm text-stone-600 dark:text-stone-400">Study groups, clubs, dorms & more</div>
              </div>
              <ChatsCircleIcon className="w-10 h-10 text-stone-600 dark:text-stone-400" weight="duotone" />
            </div>
          </BentoCard>
        </BentoGrid>
      </BentoSection>

      {/* Scroll Connector - Chat to Community */}
      <SectionScrollConnector icon="users" side="left" height={180} />

      {/* Community Section */}
      <BentoSection
        title="Your Campus Community"
        subtitle="Find your people. From study buddies to lifelong friends."
      >
        <BentoGrid columns={3}>
          <BentoCard className="md:col-span-2 overflow-hidden">
            <div className="relative rounded-xl h-full min-h-[200px] overflow-hidden">
              <Image
                src="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/events/unisocial.png"
                alt="Students collaborating in campus lounge"
                fill
                className="object-cover"
              />
            </div>
          </BentoCard>

          <BentoCard withOrbs orbColorScheme="pink">
            <div className="h-full flex flex-col justify-center items-center text-center p-4">
              <UserAvatarGroup count={5} />
              <div className="mt-4 text-lg font-semibold text-stone-800 dark:text-stone-100">Growing Community</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Students Connecting Daily</div>
            </div>
          </BentoCard>

          <BentoCard withOrbs orbColorScheme="lavender">
            <div className="h-full flex flex-col justify-center p-4">
              <GraduationCap className="w-8 h-8 text-stone-700 dark:text-stone-300 mb-2" weight="duotone" />
              <div className="text-lg font-semibold text-stone-800 dark:text-stone-100">Universities</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Campus networks</div>
            </div>
          </BentoCard>

          <BentoCard withOrbs orbColorScheme="peach">
            <div className="h-full flex flex-col justify-center p-4">
              <Handshake className="w-8 h-8 text-stone-700 dark:text-stone-300 mb-2" weight="duotone" />
              <div className="text-lg font-semibold text-stone-800 dark:text-stone-100">Friendships</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Connections that last</div>
            </div>
          </BentoCard>

          <BentoCard withOrbs orbColorScheme="gold">
            <div className="h-full flex flex-col justify-center p-4">
              <Star className="w-8 h-8 text-[#ff9013] mb-2" weight="duotone" />
              <div className="text-lg font-semibold text-stone-800 dark:text-stone-100">Launching Soon</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Be among the first</div>
            </div>
          </BentoCard>
        </BentoGrid>
      </BentoSection>

      {/* Final CTA Section */}
      <section className="py-24 px-6 sm:px-8 lg:px-10 relative bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-6xl font-semibold tracking-tight mb-6" style={{ fontFamily: 'Helvetica', color: 'var(--color-heading)' }}>
              Ready to join your campus?
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-400 mb-10 max-w-2xl mx-auto">
              Connect with students on your campus. Buy, sell, chat, and discover events all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white rounded-full transition-all duration-300 hover:-translate-y-1"
                style={{ backgroundColor: '#ff9013' }}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"

                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-stone-700 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 rounded-full transition-all duration-300 hover:-translate-y-1"
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


