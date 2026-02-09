"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthModalContextType {
  isOpen: boolean;
  message?: string;
  openAuthModal: (message?: string) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType>({
  isOpen: false,
  message: undefined,
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const openAuthModal = (msg?: string) => {
    setMessage(msg);
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
    setMessage(undefined);
  };

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        message,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export const useAuthModal = () => useContext(AuthModalContext);
