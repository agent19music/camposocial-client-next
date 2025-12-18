import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;

    console.log('[Seller Signup API] Starting request...');
    console.log('[Seller Signup API] API Endpoint:', apiEndpoint);

    // Try to get token from cookies first
    const cookieStore = await cookies();
    let authToken = cookieStore.get('authToken')?.value;

    // Fallback: try to get from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authToken && authHeader?.startsWith('Bearer ')) {
      authToken = authHeader.substring(7);
      console.log('[Seller Signup API] Token from header');
    } else if (authToken) {
      console.log('[Seller Signup API] Token from cookie');
    }

    console.log('[Seller Signup API] Has auth token:', !!authToken);

    if (!authToken) {
      console.log('[Seller Signup API] No auth token found');
      return NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    console.log('[Seller Signup API] Form data keys:', [...formData.keys()]);

    // Create a new FormData for the backend request
    const backendFormData = new FormData();

    // Forward all form fields to backend
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }

    const backendUrl = `${apiEndpoint}/seller`;
    console.log('[Seller Signup API] Calling backend:', backendUrl);

    // Send request to backend API
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: backendFormData,
    });

    console.log('[Seller Signup API] Backend response status:', response.status);

    const data = await response.json();
    console.log('[Seller Signup API] Backend response:', data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to create seller account' },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: 'Seller account created successfully', data },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Seller Signup API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process seller registration. Please try again.' },
      { status: 500 }
    );
  }
}
