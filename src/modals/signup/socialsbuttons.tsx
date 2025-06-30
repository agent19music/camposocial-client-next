import { useContext } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { AuthContext } from '@/context/authcontext';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import toast from 'react-hot-toast';

export function SocialLoginModal() {
  const { socialLogin } = useContext(AuthContext);

  const googleLogin = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      try {
        await socialLogin('google', credentialResponse);
      } catch (error) {
        console.error('Google login error:', error);
        toast.error('Google login failed');
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      toast.error('Google login failed');
    },
  });

  const handleGithubLogin = async () => {
    const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/github-callback`); // Updated path
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('oauth_state', state);
    
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&state=${state}&scope=user:email`;
  };

  const handleTwitterLogin = async () => {
    const twitterClientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID;
    const redirectUri = encodeURIComponent('https://localhost:3000/twitter-callback');
    const state = Math.random().toString(36).substring(7);
    const codeChallenge = await generateCodeChallenge();
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('code_verifier', codeChallenge.verifier);
    
    window.location.href = `https://twitter.com/i/oauth2/authorize?` +
        `client_id=${twitterClientId}` +
        `&redirect_uri=${redirectUri}` +
        `&state=${state}` +
        `&code_challenge=${codeChallenge.challenge}` +
        `&code_challenge_method=S256` +
        `&response_type=code` +
        `&scope=users.read%20tweet.read`;
  };

  return (
    <div className="flex flex-col space-y-4">
      <Button variant="outline" className="w-full" onClick={handleGithubLogin}>
        <Icons.github className="mr-2 h-4 w-4" />
        Sign up with GitHub
      </Button>
      <Button variant="outline" className="w-full" onClick={() => googleLogin()}>
        <Icons.google className="mr-2 h-4 w-4" />
        Sign up with Google
      </Button>
      <Button variant="outline" className="w-full" onClick={handleTwitterLogin}>
        <Icons.x className="mr-2 h-4 w-4" />
        Sign up with Twitter
      </Button>
    </div>
  );
}
