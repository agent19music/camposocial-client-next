import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/themecontext";
import YapProvider  from "@/context/yapcontext";
import EventProvider from "@/context/eventcontext";
import MarketplaceProvider from "@/context/marketplacecontext";
import {FriendshipProvider} from "@/context/friendshipcontext";
import { MessagesProvider } from "@/context/MessagesContext";
import UserProvider from "@/context/usercontext";
import AuthProvider from "@/context/authcontext";
import { Toaster } from "react-hot-toast";
import ChatProvider from "@/context/chatcontext";
import { GoogleOAuthProvider } from '@react-oauth/google';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
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
                  theme: {
                    primary: 'green',
                    secondary: 'black',
                  },
                },
              }}
            />
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
              <UserProvider>
                <MarketplaceProvider>
                  <FriendshipProvider>
                    <MessagesProvider>
                  <EventProvider>
                    <YapProvider>
                      <ChatProvider>
                        {children}
                      </ChatProvider>
                    </YapProvider>
                  </EventProvider>
                  </MessagesProvider>
                  </FriendshipProvider>
                </MarketplaceProvider>
              </UserProvider>
            </GoogleOAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>  
    </html>
  );
}

