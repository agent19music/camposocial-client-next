import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('authToken')?.value;
        
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
