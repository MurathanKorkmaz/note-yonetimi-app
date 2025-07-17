'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // localStorage değişikliklerini dinle
    const handleStorageChange = () => {
      checkAuth();
    };

    // Custom auth event listener
    const handleAuthChange = (event: CustomEvent) => {
      if (event.detail.type === 'login') {
        setUser(event.detail.user);
      } else if (event.detail.type === 'logout') {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange' as any, handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange' as any, handleAuthChange);
    };
  }, []);

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      
      // Custom event dispatch for logout
      window.dispatchEvent(new CustomEvent('authChange', {
        detail: { type: 'logout' }
      }));
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout
  };
} 