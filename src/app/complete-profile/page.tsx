'use client';

import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { AuthContext } from '@/context/authcontext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Colors as Palette } from '@/constants/Colors';

const C = Palette;
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { FloatingBackground } from '@/components/ui/floating-background';
import { CheckCircle2, XCircle, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '@/context/themecontext';
import { UNIVERSITIES, FACULTIES } from '@/constants/universities'; // Import constants
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"


export default function CompleteProfile() {
  const { completeProfile } = useContext(AuthContext);
  const { theme } = useTheme();
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
  const normalizedApiEndpoint = useMemo(() => {
    if (!apiEndpoint) {
      return null;
    }
    const trimmed = apiEndpoint.trim().replace(/^['"]|['"]$/g, '');
    return trimmed.replace(/\/+$/, '');
  }, [apiEndpoint]);

  const [formData, setFormData] = useState({
    username: '',
    university: '',
    faculty: '',
    phone_no: '',
    display_name: '',
    bio: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const usernameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usernameRequestControllerRef = useRef<AbortController | null>(null);

  // Searchable Select State
  const [openUni, setOpenUni] = useState(false);
  const [searchUni, setSearchUni] = useState("");
  const [openFaculty, setOpenFaculty] = useState(false);
  const [searchFaculty, setSearchFaculty] = useState("");

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    if (usernameRequestControllerRef.current) {
      usernameRequestControllerRef.current.abort();
    }
    const controller = new AbortController();
    usernameRequestControllerRef.current = controller;
    const endpoint = normalizedApiEndpoint
      ? `${normalizedApiEndpoint}/check-username`
      : '/api/check-username';

    try {
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (typeof data.available === 'boolean') {
        setUsernameStatus(data.available ? 'available' : 'taken');
        return;
      }
      throw new Error('Invalid response');
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      console.error('Error checking username:', error);
      if (username.length >= 3 && username.length <= 20 && /^[a-z0-9_]+$/.test(username)) {
        setUsernameStatus('available');
      } else {
        setUsernameStatus('idle');
      }
    } finally {
      if (usernameRequestControllerRef.current === controller) {
        usernameRequestControllerRef.current = null;
      }
    }
  };

  // Handle username change with debounce
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setFormData(prev => ({ ...prev, username }));

    // Clear existing debounce
    if (usernameDebounceRef.current) {
      clearTimeout(usernameDebounceRef.current);
    }

    // Set new debounce
    usernameDebounceRef.current = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (usernameDebounceRef.current) {
        clearTimeout(usernameDebounceRef.current);
      }
      if (usernameRequestControllerRef.current) {
        usernameRequestControllerRef.current.abort();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate username
    if (usernameStatus !== 'available' && formData.username) {
      toast.error('Please choose an available username');
      return;
    }

    // Ensure all required fields are filled
    if (!formData.username || !formData.university || !formData.faculty || !formData.display_name) {
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

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  return (
    <div className="min-h-screen bg-[#f1efe7] dark:bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Disable floating background in dark mode */}
      {theme !== 'dark' && (
        <FloatingBackground iconCount={30} opacity={8} />
      )}




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
                src={theme === 'dark'
                  ? "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-dark.png"
                  : "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-light.png"
                }
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
              <CardTitle className="text-3xl" style={{ color: 'var(--color-heading)', fontFamily: 'Helvetica' }}>
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
                    className={`bg-white/50 dark:bg-background pr-10 ${usernameStatus === 'taken'
                      ? 'border-red-500 dark:border-red-400'
                      : usernameStatus === 'available'
                        ? 'border-green-500 dark:border-green-400'
                        : 'border-background/30 dark:border-[#ff9013]/30'
                      } focus:border-[#ff9013] dark:focus:border-[#ff9013]`}
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
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="university" className="text-sm font-medium">
                    University / College *
                  </Label>
                  <Popover open={openUni} onOpenChange={setOpenUni}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openUni}
                        className="w-full justify-between bg-white/50 dark:bg-background border-background/30 dark:border-[#ff9013]/30 focus:border-[#ff9013] dark:focus:border-[#ff9013]"
                      >
                        {formData.university
                          ? formData.university
                          : "Select your university"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <div className="p-2">
                        <Input
                          placeholder="Search university..."
                          value={searchUni}
                          onChange={(e) => setSearchUni(e.target.value)}
                          className="mb-2"
                        />
                        <div className="max-h-[200px] overflow-y-auto">
                          {UNIVERSITIES.filter(u => u.toLowerCase().includes(searchUni.toLowerCase())).map((uni) => (
                            <div
                              key={uni}
                              className="flex items-center p-2 hover:bg-muted cursor-pointer rounded-sm"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, university: uni }));
                                setOpenUni(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.university === uni ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {uni}
                            </div>
                          ))}
                          {UNIVERSITIES.filter(u => u.toLowerCase().includes(searchUni.toLowerCase())).length === 0 && (
                            <div className="p-2 text-sm text-muted-foreground">No university found.</div>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faculty" className="text-sm font-medium">
                    Faculty / School *
                  </Label>
                  <Popover open={openFaculty} onOpenChange={setOpenFaculty}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openFaculty}
                        className="w-full justify-between bg-white/50 dark:bg-background border-background/30 dark:border-[#ff9013]/30 focus:border-[#ff9013] dark:focus:border-[#ff9013]"
                      >
                        {formData.faculty
                          ? formData.faculty
                          : "Select your faculty"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <div className="p-2">
                        <Input
                          placeholder="Search faculty..."
                          value={searchFaculty}
                          onChange={(e) => setSearchFaculty(e.target.value)}
                          className="mb-2"
                        />
                        <div className="max-h-[200px] overflow-y-auto">
                          {FACULTIES.filter(f => f.toLowerCase().includes(searchFaculty.toLowerCase())).map((fac) => (
                            <div
                              key={fac}
                              className="flex items-center p-2 hover:bg-muted cursor-pointer rounded-sm"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, faculty: fac }));
                                setOpenFaculty(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.faculty === fac ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {fac}
                            </div>
                          ))}
                          {FACULTIES.filter(f => f.toLowerCase().includes(searchFaculty.toLowerCase())).length === 0 && (
                            <div className="p-2 text-sm text-muted-foreground">No faculty found.</div>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
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
                  className="bg-white/50 dark:bg-gray-800/50 border-[#ff9013]/30 dark:border-[#ff9013]/30 focus:border-[#C17FF2] dark:focus:border-[#D29DF6]"
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-z0-9_]+"
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
                  className="bg-white/50 dark:bg-gray-800/50 border-[#ff9013]/30 dark:border-[#ff9013]/30 focus:border-[#C17FF2] dark:focus:border-[#D29DF6]"
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
                  className="bg-white/50 dark:bg-gray-800/50 min-h-[80px] resize-none border-[#ff9013]/30 dark:border-[#ff9013]/30 focus:border-[#C17FF2] dark:focus:border-[#ff9013]"
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
                  className="w-full text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: '#ff9013' }}
                  disabled={isLoading || (formData.username && usernameStatus !== 'available') || !formData.username || !formData.university || !formData.faculty || !formData.display_name}
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