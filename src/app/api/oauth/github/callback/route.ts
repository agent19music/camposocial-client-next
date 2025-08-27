import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (!code) {
        return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
    }

    try {
        const apiEndpoint = process.env.API_ENDPOINT;
        
        // Call the backend OAuth endpoint with the code
        const response = await fetch(`${apiEndpoint}/oauth/github/callback?code=${code}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
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
        console.error('GitHub callback error:', error);
        return NextResponse.redirect(new URL('/login?error=server_error', request.url));
    }
}