"use client";

import { useContext, ReactNode } from 'react';
import { AuthContext } from '@/context/authcontext';
import YapProvider from "@/context/yapcontext";
import EventProvider from "@/context/eventcontext";
import MarketplaceProvider from "@/context/marketplacecontext";
import { FriendshipProvider } from "@/context/friendshipcontext";
import { MessagesProvider } from "@/context/MessagesContext";
import UserProvider from "@/context/usercontext";
import ChatProvider from "@/context/chatcontext";

interface AuthenticatedWrapperProps {
  children: ReactNode;
}

export default function AuthenticatedWrapper({ children }: AuthenticatedWrapperProps) {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  // If still loading, show children without authenticated contexts
  if (isLoading) {
    return <>{children}</>;
  }

  // If not authenticated, show children without authenticated contexts
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // If authenticated, wrap with all the authenticated contexts
  return (
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
  );
} 