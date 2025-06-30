import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (!code) {
        return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
    }

    try {
        const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
        
        // For Twitter OAuth 2.0, we need to exchange the code for an access token
        // This should be handled by the backend
        const response = await fetch(`${apiEndpoint}/oauth/twitter/callback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                code,
                state 
            })
        });

        const data = await response.json();

        if (data.access_token) {
            // Create response with redirect
            const redirectUrl = data.is_profile_complete ? '/yaps' : '/complete-profile';
            const response = NextResponse.redirect(new URL(redirectUrl, request.url));
            
            // Set auth token as HTTP-only cookie
            response.cookies.set('authToken', data.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });

            return response;
        } else {
            return NextResponse.redirect(new URL('/login?error=authentication_failed', request.url));
        }
    } catch (error) {
        console.error('Twitter callback error:', error);
        return NextResponse.redirect(new URL('/login?error=server_error', request.url));
    }
} 