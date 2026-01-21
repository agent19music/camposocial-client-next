import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;


    // Try to get token from cookies first
    const cookieStore = await cookies();
    let authToken = cookieStore.get('authToken')?.value;

    // Fallback: try to get from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authToken && authHeader?.startsWith('Bearer ')) {
      authToken = authHeader.substring(7);
    } else if (authToken) {
    }


    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();

    // Create a new FormData for the backend request
    const backendFormData = new FormData();

    // Forward all form fields to backend
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }

    const backendUrl = `${apiEndpoint}/seller`;

    // Send request to backend API
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: backendFormData,
    });


    const data = await response.json();

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
