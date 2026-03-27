import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: string;
}

interface StoredAccount {
  passwordHash: string;
  salt: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    salt + password
  );
}

function generateSalt(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 14);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const userData = await AsyncStorage.getItem('auth_user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch {} finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const storedAccounts = await AsyncStorage.getItem('auth_accounts_v2');
      const accounts: Record<string, StoredAccount> = storedAccounts
        ? JSON.parse(storedAccounts)
        : {};

      const account = accounts[email.toLowerCase()];
      if (!account) {
        return { success: false, error: 'No account found with this email' };
      }

      const hash = await hashPassword(password, account.salt);
      if (account.passwordHash !== hash) {
        return { success: false, error: 'Incorrect password' };
      }

      setUser(account.user);
      await AsyncStorage.setItem('auth_user', JSON.stringify(account.user));
      return { success: true };
    } catch {
      return { success: false, error: 'Something went wrong' };
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    try {
      const storedAccounts = await AsyncStorage.getItem('auth_accounts_v2');
      const accounts: Record<string, StoredAccount> = storedAccounts
        ? JSON.parse(storedAccounts)
        : {};

      if (accounts[email.toLowerCase()]) {
        return { success: false, error: 'An account with this email already exists' };
      }

      const salt = generateSalt();
      const passwordHash = await hashPassword(password, salt);

      const newUser: User = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        name,
        email: email.toLowerCase(),
        joinedAt: new Date().toISOString(),
      };

      accounts[email.toLowerCase()] = { passwordHash, salt, user: newUser };
      await AsyncStorage.setItem('auth_accounts_v2', JSON.stringify(accounts));
      await AsyncStorage.setItem('auth_user', JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    } catch {
      return { success: false, error: 'Something went wrong' };
    }
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem('auth_user');
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    await AsyncStorage.setItem('auth_user', JSON.stringify(updated));

    const storedAccounts = await AsyncStorage.getItem('auth_accounts_v2');
    if (storedAccounts) {
      const accounts = JSON.parse(storedAccounts);
      if (accounts[user.email]) {
        accounts[user.email].user = updated;
        await AsyncStorage.setItem('auth_accounts_v2', JSON.stringify(accounts));
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
