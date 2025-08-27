'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AuthContext } from '@/context/authcontext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { motion } from 'framer-motion';``


interface FeatureCard {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  colorClass: string;
}

const features: FeatureCard[] = [
  {
    icon: Icons.messageCircle,
    title: "Connect & Chat",
    description: "Share your thoughts and connect with like-minded people in your campus community.",
    colorClass: "text-purple-600 dark:text-purple-400"
  },
  {
    icon: Icons.calendar,
    title: "Discover Events",
    description: "Find exciting events happening around campus and never miss out on the fun.",
    colorClass: "text-violet-600 dark:text-violet-400"
  },
  {
    icon: Icons.shoppingBag,
    title: "Campus Marketplace",
    description: "Buy and sell items within your campus community safely and easily.",
    colorClass: "text-purple-600 dark:text-purple-400"
  },
  {
    icon: Icons.users,
    title: "Build Your Network",
    description: "Follow friends, join conversations, and grow your campus social circle.",
    colorClass: "text-violet-600 dark:text-violet-400"
  }
];

export default function WelcomePage() {
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const router = useRouter();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleGetStarted = () => {
    router.push('/yaps');
  };

  const handleExploreMarketplace = () => {
    router.push('/marketplace');
  };

  const handleDiscoverEvents = () => {
    router.push('/events');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-violet-50/50 dark:from-black dark:via-black dark:to-purple-950/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B16FE8]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-violet-50/50 dark:from-black dark:via-black dark:to-purple-950/20 overflow-hidden">
      {/* Background decoration - matching landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-gradient-to-br from-[#D29DF6]/20 dark:from-[#B16FE8]/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-tl from-[#C17FF2]/20 dark:from-[#C17FF2]/30 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        {/* Welcome Header */}
        <motion.div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6"
          >
            <Image
              src="/camposocial_logo.png"
              alt="CampoSocial"
              width={96}
              height={96}
              className="rounded-full shadow-xl"
              priority
            />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#D29DF6] via-[#C17FF2] to-[#B16FE8] bg-clip-text text-transparent mb-4">
            Welcome, {currentUser?.first_name}!
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            You&apos;re all set! Here&apos;s what you can do to get the most out of CampoSocial.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl w-full"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group"
            >
                              <Card className="h-full bg-white/80 dark:bg-black/70 backdrop-blur-sm border-[#D29DF6]/20 dark:border-[#B16FE8]/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="mb-4 group-hover:scale-105 transition-transform duration-300">
                    <feature.icon className={`w-7 h-7 ${feature.colorClass}`} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <Button 
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-[#D29DF6] to-[#C17FF2] hover:from-[#C17FF2] hover:to-[#B16FE8] text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <Icons.messageCircle className="w-5 h-5 mr-2" />
            Start Exploring
          </Button>
          
          <Button 
            onClick={handleExploreMarketplace}
            variant="outline"
            className="border-2 border-[#D29DF6]/50 text-[#B16FE8] hover:bg-[#D29DF6]/10 dark:border-[#B16FE8]/50 dark:text-[#D29DF6] dark:hover:bg-[#B16FE8]/10 font-semibold px-8 py-3 rounded-full transition-all duration-300">
            <Icons.shoppingBag className="w-5 h-5 mr-2" />
            Browse Marketplace
          </Button>
          
          <Button 
            onClick={handleDiscoverEvents}
            variant="outline"
            className="border-2 border-[#C17FF2]/50 text-[#C17FF2] hover:bg-[#C17FF2]/10 dark:border-[#C17FF2]/50 dark:text-[#C17FF2] dark:hover:bg-[#C17FF2]/10 font-semibold px-8 py-3 rounded-full transition-all duration-300">
            <Icons.calendar className="w-5 h-5 mr-2" />
            Discover Events
          </Button>
        </motion.div>

        {/* Skip link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <button 
            onClick={handleGetStarted}
            className="text-gray-500 dark:text-gray-400 hover:text-[#B16FE8] dark:hover:text-[#D29DF6] text-sm underline transition-colors duration-200">
            Skip tour and continue
          </button>
        </motion.div>
      </div>
    </div>
  );
} 