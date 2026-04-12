import OfflineIndicator from '@/components/ui/OfflineIndicator';
import Sidebar from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import NotificationBell from '@/components/ui/NotificationBell';
import NohAssistant from '@/components/ui/NohAssistant';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageSelector from '@/components/ui/LanguageSelector';
import ThemeInit from '@/components/ui/ThemeInit';
import AuthGuard from '@/components/ui/AuthGuard';
import { WakeUpPing } from '@/components/ui/WakeUpPing';

export const dynamic = 'force-dynamic'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)' }} data-dashboard-root>
      <ThemeInit />
      <AuthGuard />
      <div data-sidebar><Sidebar /></div>
      <MobileNav />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }} data-main-content>
        <header style={{
          height: '48px',
          background: 'var(--header-bg)',
          borderBottom: '0.5px solid var(--border-color)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'flex-end', padding: '0 24px',
          flexShrink: 0, gap: '12px',
        }}>
          <LanguageSelector />
          <ThemeToggle />
          <NotificationBell />
        </header>
        <main style={{ flex: 1, overflowX: 'hidden' }}>
          <OfflineIndicator />
          {children}
        </main>
      </div>
      <WakeUpPing />
      <div data-noah-panel><NohAssistant /></div>
    </div>
  )
}
