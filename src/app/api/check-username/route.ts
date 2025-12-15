import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

function normalizeUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim().replace(/^['"]|['"]$/g, '');
  if (!trimmed) {
    return null;
  }
  return trimmed.replace(/\/+$/, '');
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const username = (body?.username ?? '').toString().trim();

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const apiEndpoint = normalizeUrl(process.env.NEXT_PUBLIC_API_ENDPOINT || null);
  if (!apiEndpoint) {
    return NextResponse.json({ error: 'API endpoint not configured' }, { status: 500 });
  }

  const headerList = await headers();
  const origin = normalizeUrl(headerList.get('origin'));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${apiEndpoint}/check-username`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(origin ? { Origin: origin } : {}),
      },
      body: JSON.stringify({ username }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        {
          error: data?.error || `Upstream error (${response.status})`,
          available: false,
        },
        { status: response.status }
      );
    }

    if (typeof data.available !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid response from upstream service', available: false },
        { status: 502 }
      );
    }

    return NextResponse.json({ available: data.available }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking username:', message);

    return NextResponse.json(
      { error: message, available: false },
      { status: 500 }
    );
  }
}
