import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        const response = NextResponse.json({ success: true });
        const cookieDomain = process.env.AUTH_COOKIE_DOMAIN;
        const secure = process.env.NODE_ENV === 'production';
        const sameSite = cookieDomain ? 'none' : 'lax';

        response.cookies.set('authToken', token, {
            httpOnly: true,
            secure: cookieDomain ? true : secure,
            sameSite,
            domain: cookieDomain || undefined,
            maxAge: 60 * 60 * 24 * 7
        });

        // Stamp which API endpoint issued this token so middleware can
        // detect endpoint switches and auto-invalidate stale tokens
        const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || '';
        response.cookies.set('authEndpoint', apiEndpoint, {
            httpOnly: false, // readable by middleware
            secure: cookieDomain ? true : secure,
            sameSite,
            domain: cookieDomain || undefined,
            maxAge: 60 * 60 * 24 * 7
        });

        return response;
    } catch (error) {
        console.error('Error setting auth token:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

