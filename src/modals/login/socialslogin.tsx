'use client';

import { useContext } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { AuthContext } from '@/context/authcontext';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

/**
 * SocialLoginButtons - OAuth buttons for LOGIN page (existing users only)
 * If user doesn't have an account, they'll be redirected to signup
 */
export function SocialLoginButtons() {
    const { oauthLogin, showSocialModal, setShowSocialModal } = useContext(AuthContext);

    const googleLogin = useGoogleLogin({
        onSuccess: async (credentialResponse) => {
            try {
                if (!credentialResponse.access_token) {
                    toast.error('Invalid Google OAuth response');
                    return;
                }

                const transformedData = {
                    access_token: credentialResponse.access_token,
                    redirect_uri: 'postmessage',
                    token_type: credentialResponse.token_type,
                    expires_in: credentialResponse.expires_in,
                    scope: credentialResponse.scope
                };

                // Use oauthLogin which only allows existing users
                await oauthLogin('google', transformedData);
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
        const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

        if (!githubClientId) {
            toast.error('GitHub OAuth not configured');
            return;
        }

        // Store login mode in session storage so callback knows it's login
        sessionStorage.setItem('oauth_mode', 'login');

        const redirectUri = encodeURIComponent(`${window.location.origin}/api/oauth/github/callback`);
        const state = Math.random().toString(36).substring(7);
        sessionStorage.setItem('oauth_state', state);

        const authUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&state=${state}&scope=user:email`;
        window.location.href = authUrl;
    };

    // Only show Google and GitHub (hide Twitter)
    const socialProviders = [
        {
            name: 'Google',
            icon: Icons.google,
            onClick: () => googleLogin(),
            color: 'bg-white dark:bg-[#1A1A19] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600',
            description: 'Sign in with your Google account'
        },
        {
            name: 'GitHub',
            icon: Icons.github,
            onClick: handleGithubLogin,
            color: 'bg-white dark:bg-[#1A1A19] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600',
            description: 'Sign in with your GitHub account'
        }
    ];

    if (!showSocialModal) {
        return (
            <div className="text-center">
                <Button
                    onClick={() => setShowSocialModal(true)}
                    className="w-full h-14 text-white font-semibold transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
                    style={{ backgroundColor: 'var(--color-fun)' }}
                >
                    <div className="flex items-center justify-center space-x-3">
                        <span>Sign In</span>
                    </div>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sign in to your account</h3>
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
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-center pt-4"
            >
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Don&apos;t have an account? Sign up on the signup page to create one.
                </p>
            </motion.div>
        </div>
    );
}
