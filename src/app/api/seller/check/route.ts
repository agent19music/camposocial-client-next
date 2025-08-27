import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken');

    if (!authToken) {
      return NextResponse.json({ is_seller: false }, { status: 200 });
    }

    const response = await fetch(`${apiEndpoint}/marketplace/check-seller`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error checking seller status:', error);
    return NextResponse.json({ is_seller: false }, { status: 200 });
  }
}

