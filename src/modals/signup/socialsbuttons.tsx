import { useContext } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { AuthContext } from '@/context/authcontext';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// Utility function for Twitter OAuth 2.0 PKCE
async function generateCodeChallenge() {
  // Generate code verifier
  const codeVerifier = generateCodeVerifier();
  
  // Create code challenge
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return {
    verifier: codeVerifier,
    challenge: challenge
  };
}

function generateCodeVerifier() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function SocialLoginModal() {
  const { socialLogin, showSocialModal, setShowSocialModal } = useContext(AuthContext);

  const googleLogin = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      try {
        console.log('Google OAuth Response:', credentialResponse);
        
        // Check if we have the expected response structure
        if (!credentialResponse.access_token) {
          console.error('Invalid Google OAuth response:', credentialResponse);
          toast.error('Invalid Google OAuth response');
          return;
        }
        
        // Transform the response to match backend expectations
        const transformedData = {
          access_token: credentialResponse.access_token,
          redirect_uri: 'postmessage',
          token_type: credentialResponse.token_type,
          expires_in: credentialResponse.expires_in,
          scope: credentialResponse.scope
        };
        
        console.log('Sending to backend:', transformedData);
        await socialLogin('google', transformedData);
      } catch (error) {
        console.error('Google login error:', error);
        toast.error(`Google login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      toast.error(`Google login failed: ${error?.error_description || 'Unknown error'}`);
    },
    scope: 'email profile',
    flow: 'implicit'
  });

  const handleGithubLogin = async () => {
    const githubClientId = process.env.GITHUB_CLIENT_ID;
    
    if (!githubClientId || githubClientId === 'your_github_client_id_here') {
      toast.error('GitHub OAuth not configured. Please check environment variables.');
      return;
    }
    
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/oauth/github/callback`);
    const state = Math.random().toString(36).substring(7);
    
    // Store state in sessionStorage for CSRF protection (this is client-side only)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauth_state', state);
    }
    
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&state=${state}&scope=user:email`;
    
    // Redirect to GitHub OAuth
    window.location.href = authUrl;
  };

  const handleTwitterLogin = async () => {
    try {
      const twitterClientId = process.env.TWITTER_CLIENT_ID;
      const redirectUri = encodeURIComponent(`${window.location.origin}/api/oauth/twitter/callback`);
      const state = Math.random().toString(36).substring(7);
      const codeChallenge = await generateCodeChallenge();
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('oauth_state', state);
        sessionStorage.setItem('code_verifier', codeChallenge.verifier);
      }
      
      const authUrl = `https://twitter.com/i/oauth2/authorize?` +
          `client_id=${twitterClientId}` +
          `&redirect_uri=${redirectUri}` +
          `&state=${state}` +
          `&code_challenge=${codeChallenge.challenge}` +
          `&code_challenge_method=S256` +
          `&response_type=code` +
          `&scope=users.read%20tweet.read`;

      // Redirect to Twitter OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Twitter login setup error:', error);
      toast.error('Twitter login setup failed');
    }
  };

  const socialProviders = [
    {
      name: 'GitHub',
      icon: Icons.github,
      onClick: handleGithubLogin,
      color: 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white',
      description: 'Continue with your GitHub account'
    },
    {
      name: 'Google',
      icon: Icons.google,
      onClick: () => googleLogin(),
      color: 'bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600',
      description: 'Continue with your Google account'
    },
    {
      name: 'Twitter',
      icon: Icons.x,
      onClick: handleTwitterLogin,
      color: 'bg-black hover:bg-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 text-white',
      description: 'Continue with your Twitter account'
    }
  ];

  if (!showSocialModal) {
    return (
      <div className="text-center">
        <Button 
          onClick={() => setShowSocialModal(true)}
          className="w-full h-14 bg-gradient-to-r from-[#D29DF6] to-[#C17FF2] hover:from-[#C17FF2] hover:to-[#B16FE8] text-white font-semibold transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
        >
          <div className="flex items-center justify-center space-x-3">
            <span className="text-lg">🚀</span>
            <span>Get Started</span>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Choose your login method</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowSocialModal(false)}
          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <span className="text-xl">&times;</span>
        </Button>
      </div>

      {socialProviders.map((provider, index) => (
        <motion.div
          key={provider.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <Button 
            variant="outline" 
            className={`w-full h-14 ${provider.color} transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg group border-0`}
            onClick={provider.onClick}
          >
            <div className="flex items-center justify-center space-x-3">
              <provider.icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <div className="flex flex-col items-start">
                <span className="font-semibold text-sm">Continue with {provider.name}</span>
                <span className="text-xs opacity-70">{provider.description}</span>
              </div>
            </div>
          </Button>
        </motion.div>
      ))}
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="text-center pt-4"
      >
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          By continuing, you agree to our Terms of Service and Privacy Policy. 
          Your account will be created automatically.
        </p>
      </motion.div>
    </div>
  );
}
