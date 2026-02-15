import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const response = NextResponse.json({ success: true });

        const cookieDomain = process.env.AUTH_COOKIE_DOMAIN;
        const secure = process.env.NODE_ENV === 'production';
        const sameSite = cookieDomain ? 'none' : 'lax';

        response.cookies.set('authToken', '', {
            httpOnly: true,
            secure: cookieDomain ? true : secure,
            sameSite,
            domain: cookieDomain || undefined,
            maxAge: 0
        });

        response.cookies.set('authEndpoint', '', {
            httpOnly: false,
            secure: cookieDomain ? true : secure,
            sameSite,
            domain: cookieDomain || undefined,
            maxAge: 0
        });

        return response;
    } catch (error) {
        console.error('Error clearing auth token:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
