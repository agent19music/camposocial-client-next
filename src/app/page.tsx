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

const stats = [
  { value: "50K+", label: "Squad Members" },
  { value: "200+", label: "Campus Takeovers" },
  { value: "10K+", label: "Epic Hangouts" },
  { value: "24/7", label: "Good Vibes Only" }
];

export default function Home() {
  const { currentUser } = useContext(AuthContext);
  const C = Palette;
  const {theme} = useTheme();


  return (
   <div className="min-h-screen bg-stone-50 dark:bg-stone-950"
 style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='6' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`,
        }}>

    
      
      {/* Navigation - Clean header with unified dark mode */}
      <nav className="fixed top-0 w-full z-50  backdrop-blur-2xl ">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-14">
              <div className="flex items-center space-x-3">
              <Image
                src= {theme !== 'dark'
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
                src={theme !== 'dark'
                  ? "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/ezgif-camposocial-light-flicker.gif"
                  : "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/ezgif-camposocial-dark-flicker.gif"
                }
                alt="University Logo"
                width={90}
                height={90}
                className="  rounded-sm"
                priority
              />
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
 <section className="pt-24 pb-0 px-6 sm:px-8 lg:px-10 relative overflow-hidden min-h-[85vh]"

 >

        <div className="max-w-6xl mx-auto relative z-20"> {/* Increased z-index for text/CTA */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
            
              
              {/* Main headline - Text centered, bold, and impactful */}
              <div className="mb-2">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center w-full mb-3 md:mb-4 tracking-tight" 
              style={{ 
                color: 'var(--color-heading)',
                fontFamily: 'Helvetica',
              }}>
                The 
                 
                 Campus Social
                
               Network That Gets You
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
                
                <Link href="/comingsoon">
                  <Button
                    size="lg"
                    variant="default"
                    className="font-medium px-8 bg-[#ff9013]  py-3 my-4 rounded-full transition-colors duration-200 text-[1.0625rem]"
                    style={{ color: C.white }}
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
      <section className="py-20 px-6 sm:px-8 lg:px-10">
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
                <div className="text-3xl font-semibold mb-1 text-stone-800 dark:text-stone-100">
                  {stat.value.replace('+', '')}
                  {stat.value.includes('+') && <span className="text-[#ff9013]">+</span>}
                </div>
                <div className="text-sm font-medium text-stone-500 dark:text-stone-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section - Clean grid layout */}
      <section className="py-24 px-6 sm:px-8 lg:px-10">
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
                      <feature.icon className="h-6 w-6 text-stone-700 dark:text-stone-300"  />
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
              <div className="relative rounded-xl mb-4 flex-1 min-h-[200px] overflow-hidden">
                <Image
                  src="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/heroimages/marketplace/popupstores.jpg" 
                  alt="Students at campus coffee shop marketplace pop-up"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
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
          
          
          <BentoCard>
            <StatCard label="Active Listings" value="2,400+" />
          </BentoCard>
          
          <BentoCard>
            <StatCard label="Sold This Week" value="180" />
          </BentoCard>
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
          
          <BentoCard className="md:col-span-2">
            <div className="h-full flex flex-col justify-center items-center text-center p-4">
              <div className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-2">50+</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Events This Week</div>
            </div>
          </BentoCard>
          
          <BentoCard className="md:col-span-2">
            <div className="h-full flex flex-col justify-center items-center text-center p-4">
              <div className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-2">12k</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Students Attending</div>
            </div>
          </BentoCard>
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
          
          <BentoCard>
            <div className="h-full flex flex-col justify-center items-center text-center p-4">
              <Lock className="w-12 h-12 text-stone-700 dark:text-stone-300 mb-4" weight="duotone" />
              <div className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-1">End-to-End</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Encrypted Messages</div>
            </div>
          </BentoCard>
          
          <BentoCard>
            <StatCard label="Active Chats" value="5.2k" />
          </BentoCard>
          
          <BentoCard className="md:col-span-2">
            <div className="h-full flex items-center justify-between p-2">
              <div>
                <div className="text-lg font-semibold text-stone-800 dark:text-stone-100">Group Chats</div>
                <div className="text-sm text-stone-600 dark:text-stone-400">Study groups, clubs, dorms & more</div>
              </div>
              <div className="text-3xl font-bold text-stone-800 dark:text-stone-100">340+</div>
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
          
          <BentoCard>
            <div className="h-full flex flex-col justify-center items-center text-center p-4">
              <UserAvatarGroup count={5} />
              <div className="mt-4 text-lg font-semibold text-stone-800 dark:text-stone-100">8,500+</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Students Connected</div>
            </div>
          </BentoCard>
          
          <BentoCard>
            <div className="h-full flex flex-col justify-center p-4">
              <GraduationCap className="w-8 h-8 text-stone-700 dark:text-stone-300 mb-2" weight="duotone" />
              <div className="text-lg font-semibold text-stone-800 dark:text-stone-100">50+</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Universities</div>
            </div>
          </BentoCard>
          
          <BentoCard>
            <div className="h-full flex flex-col justify-center p-4">
              <Handshake className="w-8 h-8 text-stone-700 dark:text-stone-300 mb-2" weight="duotone" />
              <div className="text-lg font-semibold text-stone-800 dark:text-stone-100">25k</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Friendships Made</div>
            </div>
          </BentoCard>
          
          <BentoCard>
            <div className="h-full flex flex-col justify-center p-4">
              <Star className="w-8 h-8 text-[#ff9013] mb-2" weight="duotone" />
              <div className="text-lg font-semibold text-stone-800 dark:text-stone-100">4.9</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">App Store Rating</div>
            </div>
          </BentoCard>
        </BentoGrid>
      </BentoSection>

      {/* Final CTA Section */}
      <section className="py-24 px-6 sm:px-8 lg:px-10">
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
              Connect with thousands of students. Buy, sell, chat, and discover events all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/comingsoon"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white rounded-full transition-all duration-300 hover:-translate-y-1"
                style={{ backgroundColor: '#ff9013' }}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/comingsoon"
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


