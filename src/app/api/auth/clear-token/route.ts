import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const response = NextResponse.json({ success: true });
        
        // Clear auth token cookie
        response.cookies.set('authToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0 // Expire immediately
        });

        return response;
    } catch (error) {
        console.error('Error clearing auth token:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 