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
    color: "from-blue-500 to-cyan-400"
  },
  {
    icon: Calendar,
    title: "Events",
    description: "Discover and create memorable campus experiences",
    color: "from-purple-500 to-pink-400"
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Buy and sell with confidence within your university",
    color: "from-green-500 to-emerald-400"
  },
  {
    icon: MessageSquare,
    title: "Chat",
    description: "Stay connected with real-time messaging",
    color: "from-orange-500 to-yellow-400"
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
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
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
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold">
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
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
                  Connected.
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                The social platform designed for university life. Connect with classmates, 
                discover events, trade safely, and build your campus community.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link href="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group">
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
            className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-sm" />
            <div className="relative z-10">
              <Zap className="h-12 w-12 mx-auto mb-6 text-white/90" />
              <h2 className="text-3xl font-bold mb-4">
                Ready to transform your campus experience?
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of students who are already connecting, discovering, and thriving on CampoSocial.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-white/90 font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105">
                    Create your account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center text-white/75 text-sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Free forever • No credit card required
                </div>
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
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
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


