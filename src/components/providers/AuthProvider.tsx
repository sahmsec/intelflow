"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Mock loading state
    const timer = setTimeout(() => {
      // Auto-login mock user for dev
      setIsSignedIn(true);
      setUser({
        id: 'usr_mock123',
        name: 'Demo User',
        email: 'demo@intelflow.app',
        imageUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=7C3AED&color=fff',
      });
      setIsLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const signOut = () => {
    setIsSignedIn(false);
    setUser(null);
  };

  const signIn = () => {
    setIsSignedIn(true);
    setUser({
      id: 'usr_mock123',
      name: 'Demo User',
      email: 'demo@intelflow.app',
      imageUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=7C3AED&color=fff',
    });
  };

  return (
    <AuthContext.Provider value={{ isLoaded, isSignedIn, user, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}
