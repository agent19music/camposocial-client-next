import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/context/themecontext";
import AuthProvider from "@/context/authcontext";
import { WebSocketProvider } from "@/context/websocket-context";
import AuthenticatedWrapper from "@/components/AuthenticatedWrapper";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from '@react-oauth/google';
import StructuredData, { websiteSchema, organizationSchema } from "@/components/StructuredData";
import Script from "next/script";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair"
});

const Helvetica = localFont({
  src: "../../public/fonts/Helvetica.ttf",
  variable: "--font-helvetica",
  display: "swap",
  weight: "100",
});

const timesCondensed = localFont({
  src: "../../public/Times New Roman MT Condensed Regular.otf",
  variable: "--font-times-condensed",
  display: "swap",
  weight: "100",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://camposocial.app'),
  title: {
    default: "CampoSocial - Your Campus Connected",
    template: "%s | CampoSocial"
  },
  description: "The ultimate social platform designed for university life. Connect with your campus community, discover epic events, trade in the marketplace, and build lasting friendships. Join thousands of students already using CampoSocial.",
  keywords: [
    "campus social network",
    "university social platform",
    "student community",
    "campus events",
    "student marketplace",
    "college social app",
    "university life",
    "student networking",
    "campus hangouts",
    "student marketplace"
  ],
  authors: [{
    name: "CampoSocial Team",
    url: "https://camposocial.app"
  }],
  creator: "CampoSocial",
  publisher: "CampoSocial",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: 'https://camposocial.app',
  },
  icons: {
    icon: [
      { url: '/camposocial_logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/camposocial_logo.png', sizes: '16x16', type: 'image/png' }
    ],
    shortcut: '/camposocial_logo.png',
    apple: [
      { url: '/camposocial_logo.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'mask-icon', url: '/camposocial_logo.png', color: '#8B5CF6' }
    ]
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://camposocial.app',
    siteName: 'CampoSocial',
    title: 'CampoSocial - Your Campus Connected',
    description: 'The ultimate social platform designed for university life. Connect with your campus community, discover epic events, trade in the marketplace, and build lasting friendships.',
    images: [
      {
        url: '/camposocial_logo.png',
        width: 1200,
        height: 630,
        alt: 'CampoSocial - Your Campus Connected',
        type: 'image/png',
      },
      {
        url: '/camposocial_logo.png',
        width: 800,
        height: 600,
        alt: 'CampoSocial - Campus Social Platform',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@camposocial',
    creator: '@camposocial',
    title: 'CampoSocial - Your Campus Connected',
    description: 'The ultimate social platform designed for university life. Connect with your campus community!',
    images: ['/camposocial_logo.png'],
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'CampoSocial',
    'application-name': 'CampoSocial',
    'msapplication-TileColor': '#8B5CF6',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#8B5CF6',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
        <StructuredData type="website" data={websiteSchema} />
        <StructuredData type="organization" data={organizationSchema} />
        <Script id="theme-init" strategy="beforeInteractive">{`(function(){try{var t=localStorage.getItem('theme');var m=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var v=t|| (m?'dark':'light');var e=document.documentElement;e.classList.remove('light','dark');e.classList.add(v);}catch(e){}})();`}</Script>
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${timesCondensed.variable} ${Helvetica.variable} ${inter.className}`}>
        <ThemeProvider>
          <AuthProvider>
            <Toaster
              position="top-center"
              reverseOrder={false}
              gutter={8}
              containerClassName=""
              containerStyle={{}}
              toastOptions={{
                className: '',
                duration: 5000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                },
              }}
            />
            <GoogleOAuthProvider clientId={googleClientId || ''}>
              <WebSocketProvider>
                <AuthenticatedWrapper>
                  {children}
                </AuthenticatedWrapper>
              </WebSocketProvider>
            </GoogleOAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}