"use client";

import { useContext, ReactNode } from 'react';
import { AuthContext } from '@/context/authcontext';
import { CommunityProvider } from '@/context/CommunityContext';
import YapProvider from "@/context/yapcontext";
import EventProvider from "@/context/eventcontext";
import MarketplaceProvider from "@/context/marketplacecontext";
import UserProvider from "@/context/usercontext";
import ChatProvider from "@/context/chatcontext";

interface AuthenticatedWrapperProps {
  children: ReactNode;
}

export default function AuthenticatedWrapper({ children }: AuthenticatedWrapperProps) {
  const { isAuthenticated } = useContext(AuthContext);

  // Wrap with contexts - ChatProvider only loads when authenticated
  const content = (
    <UserProvider>
      <MarketplaceProvider>
        <EventProvider>
          <YapProvider>
            <CommunityProvider>
              {isAuthenticated ? (
                <ChatProvider>
                  {children}
                </ChatProvider>
              ) : (
                children
              )}
            </CommunityProvider>
          </YapProvider>
        </EventProvider>
      </MarketplaceProvider>
    </UserProvider>
  );

  return content;
} 