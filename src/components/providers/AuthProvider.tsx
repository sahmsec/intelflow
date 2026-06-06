"use client";

import React, { createContext, useContext } from 'react';
import { authClient } from '@/lib/auth-client';

type User = {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
};

type AuthContextType = {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: User | null;
  signOut: () => void;
  signIn: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isLoaded: false,
  isSignedIn: false,
  user: null,
  signOut: () => {},
  signIn: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        imageUrl: session.user.image || undefined,
      }
    : null;

  const signOut = async () => {
    await authClient.signOut();
    window.location.href = '/login';
  };

  const signIn = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ isLoaded: !isPending, isSignedIn: !!session, user, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}
