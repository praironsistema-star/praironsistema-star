'use client';
import { useState, useEffect } from 'react';
import { getUser } from '../lib/auth';

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'VIEWER';

export function useRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const user = getUser();
    setRole((user?.roleName as UserRole) ?? null);
    setIsLoaded(true);
  }, []);

  return {
    role,
    isLoaded,
    isOwner:      role === 'OWNER',
    isAdmin:      role === 'ADMIN' || role === 'OWNER',
    isManager:    role === 'MANAGER' || role === 'ADMIN' || role === 'OWNER',
    isTechnician: role === 'TECHNICIAN',
    isViewer:     role === 'VIEWER',
    canEdit:      role !== 'VIEWER',
    canManage:    role === 'OWNER' || role === 'ADMIN' || role === 'MANAGER',
    canViewFinance: role === 'OWNER' || role === 'ADMIN' || role === 'MANAGER',
  };
}
