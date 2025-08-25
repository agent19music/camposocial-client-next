import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/themecontext";
import AuthProvider from "@/context/authcontext";
import AuthenticatedWrapper from "@/components/AuthenticatedWrapper";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from '@react-oauth/google';

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair"
});

export const metadata: Metadata = {
  title: "CampoSocial - Your Campus Connected",
  description: "The social platform designed for university life",
  authors: [{ name: "CampoSocial" }],
  icons: {
    icon: "/camposocial_logo.png",
    shortcut: "/camposocial_logo.png",
    apple: "/camposocial_logo.png"
  },
  openGraph: {
    title: "CampoSocial - Your Campus Connected",
    description: "The social platform designed for university life",
    type: "website",
    images: [
      {
        url: "/camposocial_logo.png",
        width: 1200,
        height: 630,
        alt: "CampoSocial - Your Campus Connected"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@camposocial",
    images: ["/camposocial_logo.png"]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${inter.className}`}>
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
            {googleClientId && googleClientId !== 'your_google_client_id_here' ? (
              <GoogleOAuthProvider clientId={googleClientId}>
                <AuthenticatedWrapper>
                  {children}
                </AuthenticatedWrapper>
              </GoogleOAuthProvider>
            ) : (
              <>
                {process.env.NODE_ENV === 'development' && (
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 m-4">
                    <p className="font-bold">Warning: Google OAuth not configured</p>
                    <p>Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local file</p>
                  </div>
                )}
                <AuthenticatedWrapper>
                  {children}
                </AuthenticatedWrapper>
              </>
            )}
          </AuthProvider>
        </ThemeProvider>
      </body>  
    </html>
  );
}