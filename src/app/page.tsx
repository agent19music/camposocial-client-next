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
    title: "Connect",
    description: "Build authentic relationships with your campus community",
    color: "from-[#92736C] to-[#92736C]/80"
  },
  {
    icon: Calendar,
    title: "Events",
    description: "Discover and create memorable campus experiences",
    color: "from-[#92736C]/90 to-[#FDF1F5]"
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Buy and sell with confidence within your university",
    color: "from-[#92736C]/80 to-[#92736C]/60"
  },
  {
    icon: MessageSquare,
    title: "Chat",
    description: "Stay connected with real-time messaging",
    color: "from-[#92736C]/70 to-[#FDF1F5]/80"
  }
];

const stats = [
  { value: "50K+", label: "Students Connected" },
  { value: "200+", label: "Universities" },
  { value: "10K+", label: "Events Created" },
  { value: "99.9%", label: "Uptime" }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Floating background icons */}
      <FloatingBackground iconCount={40} opacity={6} />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#92736C] to-[#92736C]/80 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">CampoSocial</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-gradient-to-r from-[#92736C] to-[#92736C]/90 hover:from-[#92736C]/90 hover:to-[#92736C]/80 text-white font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm font-medium mb-6">
                <Globe className="h-4 w-4 mr-2" />
                Trusted by students worldwide
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
                Your campus.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#92736C] via-[#92736C]/90 to-[#FDF1F5]">
                  Connected.
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                The social platform designed for university life. Connect with classmates, 
                discover events, trade safely, and build your campus community.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link href="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-[#92736C] to-[#92736C]/90 hover:from-[#92736C]/90 hover:to-[#92736C]/80 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group">
                    Start connecting today
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105">
                    Sign in to continue
                  </Button>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-border/50">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
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
                <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
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
            className="text-center bg-gradient-to-r from-[#92736C] to-[#92736C]/90 rounded-3xl p-12 text-white relative overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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
                  <Button size="lg" className="bg-white text-[#92736C] hover:bg-white/90 font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105">
                    Join CampoSocial Today
                  </Button>
                </Link>
                <Link href="/events">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-xl transition-all duration-300">
                    Explore Events
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-[#92736C] to-[#92736C]/80 rounded-lg flex items-center justify-center">
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


