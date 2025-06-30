import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const authToken = request.cookies.get('authToken')?.value;
        
        if (authToken) {
            return NextResponse.json({ token: authToken });
        } else {
            return NextResponse.json({ token: null });
        }
    } catch (error) {
        console.error('Error getting auth token:', error);
        return NextResponse.json({ token: null }, { status: 500 });
    }
} 