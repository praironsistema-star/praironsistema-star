'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getUser, logout } from '@/lib/auth'
import { useIndustry } from '@/hooks/useIndustry'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

const NAV = [
  {
    group: 'Principal',
    items: [
      { href: '/dashboard',       icon: '⊞',  label: 'Dashboard' },
      { href: '/recomendaciones', icon: '🤖',  label: 'NOAH IA' },
    ]
  },
  {
    group: 'Producción',
    items: [
      { href: '/farms',           icon: '🏡',  label: 'Fincas' },
      { href: '/crops',           icon: '🌿',  label: 'Cultivos' },
      { href: '/caficultura',     icon: '☕',  label: 'Caficultura',      module: 'CAFE' },
      { href: '/palma',           icon: '🌴',  label: 'Palma',            module: 'PALMA' },
      { href: '/avicultura',      icon: '🐔',  label: 'Avicultura',       module: 'AVICULTURA' },
      { href: '/ganaderia',       icon: '🐄',  label: 'Ganadería',        module: 'GANADERIA' },
      { href: '/cana',            icon: '🌾',  label: 'Caña de Azúcar',   module: 'CANA' },
      { href: '/acuicultura',     icon: '🐟',  label: 'Acuicultura',      module: 'ACUICULTURA' },
      { href: '/apicultura',      icon: '🍯',  label: 'Apicultura',       module: 'APICULTURA' },
      { href: '/cacao',           icon: '🍫',  label: 'Cacao',            module: 'CACAO' },
      { href: '/arroz',           icon: '🌾',  label: 'Arroz',            module: 'ARROZ' },
      { href: '/horticultura',    icon: '🥬',  label: 'Horticultura',     module: 'HORTICULTURA' },
      { href: '/vivero',          icon: '🌱',  label: 'Vivero Palma',     module: 'VIVERO' },
      { href: '/floricultura',    icon: '💐',  label: 'Floricultura',     module: 'FLORICULTURA' },
      { href: '/fruticultura',    icon: '🍓',  label: 'Fruticultura',     module: 'FRUTICULTURA' },
      { href: '/organica',        icon: '🌿',  label: 'Agro Orgánica',    module: 'ORGANICA' },
      { href: '/porcicultura',    icon: '🐖',  label: 'Porcicultura',     module: 'PORCICULTURA' },
      { href: '/trazabilidad',    icon: '🔗',  label: 'Trazabilidad QR' },
    ]
  },
  {
    group: 'Campo',
    items: [
      { href: '/tasks',           icon: '✅',  label: 'Tareas' },
      { href: '/tareo',           icon: '📋',  label: 'Tareo Digital' },
      { href: '/rrhh',            icon: '👷',  label: 'RRHH' },
      { href: '/maquinaria',      icon: '🚜',  label: 'Maquinaria' },
      { href: '/calendario',      icon: '📅',  label: 'Calendario' },
    ]
  },
  {
    group: 'Insumos & Sanidad',
    items: [
      { href: '/inventory',       icon: '📦',  label: 'Inventario' },
      { href: '/compras',         icon: '🛒',  label: 'Compras' },
      { href: '/fitosanitario',   icon: '🧪',  label: 'Fitosanitario' },
      { href: '/laboratorio',     icon: '🔬',  label: 'Laboratorio' },
    ]
  },
  {
    group: 'Finanzas',
    items: [
      { href: '/ventas',          icon: '🧾',  label: 'Ventas' },
      { href: '/reports',         icon: '📊',  label: 'Reportes' },
      { href: '/benchmark',       icon: '📈',  label: 'Benchmarking' },
      { href: '/performance',     icon: '⚡',  label: 'Performance' },
    ]
  },
  {
    group: 'Inteligencia',
    items: [
      { href: '/clima',           icon: '⛅',  label: 'Clima' },
      { href: '/alerts',          icon: '🔔',  label: 'Alertas' },
      { href: '/ods',             icon: '🌍',  label: 'Sostenibilidad' },
      { href: '/certificaciones', icon: '🏅',  label: 'Certificaciones' },
      { href: '/recomendaciones', icon: '💡',  label: 'Recomendaciones' },
      { href: '/vision',          icon: '🔭',  label: 'Visión' },
    ]
  },
  {
    group: 'Sistema',
    items: [
      { href: '/settings',        icon: '⚙️',  label: 'Configuración' },
      { href: '/roles',           icon: '🔐',  label: 'Roles' },
      { href: '/team',            icon: '👥',  label: 'Equipo' },
    ]
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const user = getUser()
  const { hasModule, isLoaded } = useIndustry()

  const initials = user?.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      background: 'var(--sidebar-bg, #fff)',
      borderRight: '0.5px solid var(--border-color, #e5e5e3)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>

      {/* ── Logo PRAIRON ── */}
      <div style={{
        padding: '16px 16px 14px',
        borderBottom: '0.5px solid var(--border-color, #e5e5e3)',
        flexShrink: 0,
      }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <picture>
            <source srcSet="/images/logo-dark.png" media="(prefers-color-scheme: dark)" />
            <img
              src="/images/logo-white.png"
              alt="PRAIRON"
              style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
            />
          </picture>
        </Link>
        <div style={{
          fontSize: '9px',
          color: 'var(--text-tertiary, #9b9b97)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginTop: '4px',
          fontWeight: '500',
        }}>
          Gestión Agropecuaria
        </div>
      </div>

      {/* ── Nav grupos (scrollable) ── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {NAV.map(group => {
          // Filtrar ítems según módulos del usuario
          const visibleItems = isLoaded
            ? group.items.filter(item => !item.module || hasModule(item.module))
            : group.items.filter(item => !item.module)

          // No mostrar el grupo si quedó vacío
          if (visibleItems.length === 0) return null

          return (
            <div key={group.group} style={{ marginBottom: '4px' }}>
              <div style={{
                fontSize: '9px',
                fontWeight: '600',
                color: 'var(--text-tertiary, #c4c4c0)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '10px 16px 4px',
              }}>
                {group.group}
              </div>

              {visibleItems.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      padding: '7px 16px',
                      borderRadius: '6px',
                      margin: '0 6px',
                      fontSize: '12.5px',
                      fontWeight: active ? '500' : '400',
                      color: active
                        ? 'var(--brand-green, #036446)'
                        : 'var(--text-secondary, #6b6b67)',
                      background: active ? 'var(--green-bg, #f0fdf4)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.1s, color 0.1s',
                    }}>
                      <span style={{ fontSize: '13px', lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {active && (
                        <span style={{
                          width: '4px', height: '4px',
                          borderRadius: '50%',
                          background: 'var(--brand-green, #036446)',
                          flexShrink: 0,
                        }} />
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* ── Perfil + Logout (fijo al fondo) ── */}
      <div style={{
        borderTop: '0.5px solid var(--border-color, #e5e5e3)',
        padding: '10px 8px',
        flexShrink: 0,
      }}>
        <Link href="/profile" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary, #f5f5f3)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#036446',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '600',
              color: '#fff',
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '500',
                color: 'var(--text-primary, #1a1a18)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user?.name || 'Mi perfil'}
              </div>
              <div style={{
                fontSize: '10px',
                color: 'var(--text-tertiary, #9b9b97)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user?.email || ''}
              </div>
            </div>
          </div>
        </Link>

        <LanguageSwitcher />

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            padding: '7px 8px',
            borderRadius: '6px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '12.5px',
            color: 'var(--text-secondary, #6b6b67)',
            transition: 'background 0.1s, color 0.1s',
            marginTop: '2px',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#fff1f1'
            e.currentTarget.style.color = '#dc2626'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-secondary, #6b6b67)'
          }}
        >
          <span style={{ fontSize: '13px', lineHeight: 1 }}>→</span>
          <span>Cerrar sesión</span>
        </button>
      </div>

    </aside>
    <style>{`
      @media (max-width: 768px) {
        [data-sidebar] { display: none !important; }
        [data-main-content] { padding-bottom: 64px; }
        [data-noah-panel] { bottom: 64px !important; }
      }
    `}</style>
  )
}
