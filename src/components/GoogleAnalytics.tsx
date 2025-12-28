'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { GA_MEASUREMENT_ID, isGAConfigured, pageview } from '@/lib/gtag';

// Separate component for tracking to handle Suspense boundary
function GoogleAnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!isGAConfigured()) return;

        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
        pageview(url);
    }, [pathname, searchParams]);

    return null;
}

export default function GoogleAnalytics() {
    // Don't render anything if GA is not configured
    if (!isGAConfigured()) {
        if (process.env.NODE_ENV === 'development') {
            console.log('[GA4] Google Analytics not configured. Set NEXT_PUBLIC_GA_MEASUREMENT_ID in your .env.local');
        }
        return null;
    }

    return (
        <>
            {/* Google Tag (gtag.js) */}
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true,
            });
          `,
                }}
            />
            {/* Page view tracking on route changes */}
            <Suspense fallback={null}>
                <GoogleAnalyticsTracker />
            </Suspense>
        </>
    );
}
