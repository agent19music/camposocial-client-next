import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    // Verify state to prevent CSRF
    const savedState = sessionStorage.getItem('oauth_state');
    if (state !== savedState) {
        return NextResponse.redirect('/login?error=invalid_state');
    }

    try {
        const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
        const response = await fetch(`${apiEndpoint}/oauth/github/callback?code=${code}`);
        const data = await response.json();

        if (data.access_token) {
            sessionStorage.setItem('authToken', data.access_token);
            return NextResponse.redirect('/yaps');
        } else {
            return NextResponse.redirect('/login?error=authentication_failed');
        }
    } catch (error) {
        console.error('GitHub callback error:', error);
        return NextResponse.redirect('/login?error=server_error');
    }
}