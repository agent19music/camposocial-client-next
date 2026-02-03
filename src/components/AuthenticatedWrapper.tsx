"use client";

import { useContext, ReactNode } from 'react';
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



  // If authenticated, wrap with all the authenticated contexts
  return (
    <UserProvider>
      <MarketplaceProvider>
        <EventProvider>
          <YapProvider>
            <CommunityProvider>
              <ChatProvider>
                {children}
              </ChatProvider>
            </CommunityProvider>
          </YapProvider>
        </EventProvider>
      </MarketplaceProvider>
    </UserProvider>
  );
} 