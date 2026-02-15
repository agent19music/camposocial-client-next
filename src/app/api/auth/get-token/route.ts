import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function isTokenNotExpired(token: string): boolean {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        const payload = JSON.parse(atob(parts[1]));
        if (!payload.exp || typeof payload.exp !== 'number') return false;
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('authToken')?.value;
        const storedEndpoint = cookieStore.get('authEndpoint')?.value;
        const currentEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || '';

        // Token is valid only if not expired AND was issued for the current API endpoint
        const isEndpointMatch = !storedEndpoint || storedEndpoint === currentEndpoint;
        const isValid = authToken && isTokenNotExpired(authToken) && isEndpointMatch;

        if (isValid) {
            return NextResponse.json({ token: authToken });
        } else {
            // Auto-clear stale cookies if present but invalid
            if (authToken) {
                const res = NextResponse.json({ token: null });
                res.cookies.delete('authToken');
                res.cookies.delete('authEndpoint');
                return res;
            }
            return NextResponse.json({ token: null });
        }
    } catch (error) {
        console.error('Error getting auth token:', error);
        return NextResponse.json({ token: null }, { status: 500 });
    }
}
