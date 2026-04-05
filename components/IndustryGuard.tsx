'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '../lib/auth';

interface Props {
  module: string;
  children: React.ReactNode;
}

export function IndustryGuard({ module, children }: Props) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const user = getUser();

    if (!user) {
      router.replace('/login');
      return;
    }

    const modules = user.industryModules || [];
    const isMixto = modules.includes('MIXTO');
    const hasAccess = isMixto || modules.includes(module);

    if (!hasAccess) {
      router.replace('/dashboard?error=acceso_denegado');
      return;
    }

    setAllowed(true);
  }, [module, router]);

  if (allowed === null) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '14px',
        color: 'var(--color-text-secondary)',
      }}>
        Verificando acceso...
      </div>
    );
  }

  return <>{children}</>;
}
