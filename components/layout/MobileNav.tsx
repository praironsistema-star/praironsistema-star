'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  const BASE_ITEMS = [
    { href: '/dashboard', icon: '⊞', label: t('nav.dashboard') },
    { href: '/tasks',     icon: '✅', label: t('nav.tasks') },
    { href: '/alerts',    icon: '🔔', label: t('nav.alerts') },
    { href: '/reports',   icon: '📊', label: t('nav.reports') },
    { href: '/profile',   icon: '👤', label: t('nav.profile') },
  ];

  return (
    <nav style={{
      display: 'none',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--bg-card, #fff)',
      borderTop: '0.5px solid var(--border-color, #e5e5e5)',
      padding: '8px 0 env(safe-area-inset-bottom, 8px)',
      zIndex: 100,
    }}
    className="mobile-nav"
    >
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        {BASE_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '4px 12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: active ? 'var(--color-primary, #036446)' : 'var(--text-muted, #888)',
                fontSize: 10,
                fontWeight: active ? 600 : 400,
                minWidth: 48,
              }}
            >
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .mobile-nav { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
