'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/authcontext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Sparkles } from 'lucide-react';

interface FeatureCard {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
}

const features: FeatureCard[] = [
  {
    icon: Icons.messageCircle,
    title: "Connect & Chat",
    description: "Share your thoughts and connect with like-minded people in your campus community.",
    color: "blush"
  },
  {
    icon: Icons.calendar,
    title: "Discover Events",
    description: "Find exciting events happening around campus and never miss out on the fun.",
    color: "sunset"
  },
  {
    icon: Icons.shoppingBag,
    title: "Campus Marketplace",
    description: "Buy and sell items within your campus community safely and easily.",
    color: "mocha"
  },
  {
    icon: Icons.users,
    title: "Build Your Network",
    description: "Follow friends, join conversations, and grow your campus social circle.",
    color: "sage"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200/20 dark:bg-purple-800/10 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-200/20 dark:bg-blue-800/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-200/20 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        {/* Welcome Header */}
        <motion.div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#92736C] to-[#92736C]/80 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#92736C] via-[#92736C]/90 to-[#FDF1F5] dark:from-[#92736C] dark:via-[#92736C]/90 dark:to-[#FDF1F5] bg-clip-text text-transparent mb-4">
            Welcome, {currentUser?.first_name}!
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            You're all set! Here's what you can do to get the most out of CampoSocial.
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
                              <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
                    feature.color === 'blush' ? 'from-[#92736C]/80 to-[#92736C]/60' :
                    feature.color === 'mocha' ? 'from-[#92736C] to-[#92736C]/80' :
                    'from-[#92736C]/70 to-[#FDF1F5]/80'
                  } flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
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
            className="bg-gradient-to-r from-[#92736C] to-[#92736C]/90 hover:from-[#92736C]/90 hover:to-[#92736C]/80 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Icons.messageCircle className="w-5 h-5 mr-2" />
            Start Exploring
          </Button>
          
          <Button 
            onClick={handleExploreMarketplace}
            variant="outline"
            className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-300 dark:text-gray-200 dark:hover:bg-gray-700 font-semibold px-8 py-3 rounded-full transition-all duration-300"
          >
            <Icons.shoppingBag className="w-5 h-5 mr-2" />
            Browse Marketplace
          </Button>
          
          <Button 
            onClick={handleDiscoverEvents}
            variant="outline"
            className="border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-300 dark:text-indigo-200 dark:hover:bg-gray-700 font-semibold px-8 py-3 rounded-full transition-all duration-300"
          >
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
            className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 text-sm underline transition-colors duration-200"
          >
            Skip tour and continue
          </button>
        </motion.div>
      </div>
    </div>
  );
} 