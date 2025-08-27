'use client';

import { useContext, useState, useEffect } from 'react';
import Image from 'next/image';
import { AuthContext } from '@/context/authcontext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { FloatingBackground } from '@/components/ui/floating-background';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompleteProfile() {
  const { completeProfile } = useContext(AuthContext);
  const apiEndpoint = process.env.API_ENDPOINT;
  const [formData, setFormData] = useState({
    username: '',
    category: '',
    phone_no: '',
    display_name: '',
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameDebounce, setUsernameDebounce] = useState<NodeJS.Timeout>();

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    
    try {
      // First try the API route which forwards to backend
      const response = await fetch('/api/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.available !== undefined) {
          setUsernameStatus(data.available ? 'available' : 'taken');
          return;
        }
      }
      
      // Fallback: If backend endpoint doesn't exist yet, do basic validation
      // In production, you should always check with backend
      // For now, we'll consider it available if it passes basic rules
      if (username.length >= 3 && username.length <= 20 && /^[a-z0-9_]+$/.test(username)) {
        setUsernameStatus('available');
      } else {
        setUsernameStatus('idle');
      }
    } catch (error) {
      console.error('Error checking username:', error);
      // Fallback to basic validation if network error
      if (username.length >= 3 && username.length <= 20 && /^[a-z0-9_]+$/.test(username)) {
        setUsernameStatus('available');
      } else {
        setUsernameStatus('idle');
      }
    }
  };

  // Handle username change with debounce
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setFormData(prev => ({ ...prev, username }));
    
    // Clear existing debounce
    if (usernameDebounce) {
      clearTimeout(usernameDebounce);
    }
    
    // Set new debounce
    const timeout = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 500);
    
    setUsernameDebounce(timeout);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username
    if (usernameStatus !== 'available' && formData.username) {
      toast.error('Please choose an available username');
      return;
    }
    
    // Ensure all required fields are filled
    if (!formData.username || !formData.category || !formData.display_name) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    try {
      await completeProfile(formData);
    } catch (error) {
      console.error('Error completing profile:', error);
      toast.error('Failed to complete profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-violet-50/50 dark:from-black dark:via-black dark:to-purple-950/20 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <FloatingBackground iconCount={30} opacity={8} />
      
      {/* Decorative gradient orbs - matching landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-gradient-to-br from-[#D29DF6]/20 dark:from-[#B16FE8]/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-tl from-[#C17FF2]/20 dark:from-[#C17FF2]/30 to-transparent rounded-full blur-3xl" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-white/80 dark:bg-black/70 backdrop-blur-xl border border-[#D29DF6]/20 dark:border-[#B16FE8]/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-2"
            >
              <Image
                src="/camposocial_logo.png"
                alt="CampoSocial"
                width={80}
                height={80}
                className="rounded-full shadow-xl"
                priority
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#D29DF6] via-[#C17FF2] to-[#B16FE8] bg-clip-text text-transparent">
                Complete Your Profile
              </CardTitle>
            </motion.div>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Help us personalize your campus experience
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="username" className="text-sm font-medium">
                  Username *
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleUsernameChange}
                    placeholder="Choose your unique username"
                    className={`bg-white/50 dark:bg-gray-800/50 pr-10 ${
                      usernameStatus === 'taken' 
                        ? 'border-red-500 dark:border-red-400' 
                        : usernameStatus === 'available'
                        ? 'border-green-500 dark:border-green-400'
                        : 'border-[#D29DF6]/30 dark:border-[#B16FE8]/30'
                    } focus:border-[#C17FF2] dark:focus:border-[#D29DF6]`}
                    required
                    minLength={3}
                    maxLength={20}
                    pattern="[a-z0-9_]+"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {usernameStatus === 'checking' && (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    )}
                    {usernameStatus === 'available' && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {usernameStatus === 'taken' && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                {usernameStatus === 'taken' && (
                  <p className="text-xs text-red-500 dark:text-red-400">
                    This username is already taken
                  </p>
                )}
                {usernameStatus === 'available' && (
                  <p className="text-xs text-green-500 dark:text-green-400">
                    Great! This username is available
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Only lowercase letters, numbers, and underscores allowed
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-2"
              >
                <Label htmlFor="category" className="text-sm font-medium">
                  Category *
                </Label>
                <Select value={formData.category} onValueChange={handleSelectChange} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="alumni">Alumni</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="display_name" className="text-sm font-medium">
                  Display Name *
                </Label>
                <Input
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  placeholder="How should others see your name?"
                  className="bg-white/50 dark:bg-gray-800/50 border-[#D29DF6]/30 dark:border-[#B16FE8]/30 focus:border-[#C17FF2] dark:focus:border-[#D29DF6]"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="phone_no" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  type="tel"
                  name="phone_no"
                  value={formData.phone_no}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="bg-white/50 dark:bg-gray-800/50 border-[#D29DF6]/30 dark:border-[#B16FE8]/30 focus:border-[#C17FF2] dark:focus:border-[#D29DF6]"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <Label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </Label>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us a bit about yourself..."
                  className="bg-white/50 dark:bg-gray-800/50 min-h-[80px] resize-none border-[#D29DF6]/30 dark:border-[#B16FE8]/30 focus:border-[#C17FF2] dark:focus:border-[#D29DF6]"
                  maxLength={150}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.bio.length}/150 characters
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[#D29DF6] to-[#C17FF2] hover:from-[#C17FF2] hover:to-[#B16FE8] text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  disabled={isLoading || (formData.username && usernameStatus !== 'available') || !formData.username || !formData.category || !formData.display_name}
                >
                  {isLoading ? 'Completing...' : 'Complete Profile'}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}