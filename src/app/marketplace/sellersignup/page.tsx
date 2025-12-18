'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from '@/components/ui/textarea';
import { useContext } from 'react';
import { AuthContext } from '@/context/authcontext';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Pencil, Loader2 } from 'lucide-react';
import { MarketplaceContext } from '@/context/marketplacecontext';

export default function SellerSignup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { currentUser, authToken } = useContext(AuthContext);
  const { setSellerStausChange, sellerStatusChange } = useContext(MarketplaceContext)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sellerDashboardUrl = process.env.NEXT_PUBLIC_SELLER_DASHBOARD_URL;

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || '');
      // API returns snake_case properties (first_name, last_name)
      setName(
        currentUser.first_name && currentUser.last_name
          ? `${currentUser.first_name} ${currentUser.last_name}`
          : (currentUser.display_name || '')
      );
      setPhone(currentUser.phone_no || '');
      setAvatar(currentUser.avatar || '');

      // Log for debugging
      console.log('CurrentUser data:', currentUser);
    }
  }, [currentUser]);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('File size should be less than 5MB');
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error('Only image files are allowed');
          return;
        }

        setAvatarFile(file);
        const fileURL = URL.createObjectURL(file);
        setAvatar(fileURL);
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      toast.error('Failed to select file');
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const validateForm = () => {
    if (!displayName.trim()) {
      toast.error('Business display name is required');
      return false;
    }

    if (!about.trim()) {
      toast.error('About section is required');
      return false;
    }

    // Phone validation if needed (optional field)
    if (phone && !/^\d{10}$/.test(phone)) {
      toast.error('Phone number must be 10 digits');
      return false;
    }

    return true;
  };

  const addUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // Append form data
      formData.append('display_name', displayName.trim());
      formData.append('about', about.trim());

      if (phone) {
        formData.append('phone', phone);
      }

      // Handle avatar
      if (avatarFile) {
        formData.append('avatar_file', avatarFile);
      } else if (avatar) {
        formData.append('avatar_url', avatar);
      }

      // Check if authToken exists before making the request
      if (!authToken) {
        throw new Error('Authentication token is missing');
      }

      console.log('[Seller Signup] Submitting with auth token');

      // Use the API route instead of direct backend call
      const response = await fetch('/api/seller/signup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
        credentials: 'include', // Include cookies for authentication
      });

      let result: any = null;
      try {
        result = await response.json();
      } catch (e) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        result = { error: text };
      }

      if (response.ok) {
        setSellerStausChange(!sellerStatusChange)
        toast.success('Your seller account has been created successfully!');
        console.log('Seller account created:', result);
        // Redirect to dashboard
        setTimeout(() => {
          if (sellerDashboardUrl) {
            window.location.href = sellerDashboardUrl;
          } else {
            router.push('/marketplace');
          }
        }, 300);
      } else {
        setError(result.error || 'Failed to create seller account');
        toast.error(result.error || 'Failed to create seller account');
      }
    } catch (error: any) {
      console.error('Seller registration error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(`Registration failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md mb-4">
          <AlertTitle>Not Logged In</AlertTitle>
          <AlertDescription>
            Please log in first to join the seller community.
          </AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <form onSubmit={addUser} className="mx-auto max-w-md space-y-8 p-4">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Join the Seller Community</h1>
            <p className="text-muted-foreground">
              Complete your seller profile to start selling on our marketplace
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatar} alt="User's profile picture" />
                  <AvatarFallback>{displayName.slice(0, 2).toUpperCase() || 'DP'}</AvatarFallback>
                </Avatar>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={handleFileUploadClick}
                  type="button"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onSelectFile}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Business Display Name<span className="text-red-500">*</span></Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Sam's Smoothies"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="about">About<span className="text-red-500">*</span></Label>
              <Textarea
                id="about"
                placeholder="A brief description of your business"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : "Submit Seller Application"}
            </Button>
          </div>
        </form>
      </div>
      <div className="hidden bg-muted lg:flex lg:items-center lg:justify-center">
        <Image
          src="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-light.png"
          alt="CampoSocial Logo"
          width={288}
          height={162}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}