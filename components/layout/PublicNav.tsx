'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Inicio',    href: '/' },
  { label: 'Sectores', href: '/#sectores' },
  { label: 'NOAH',     href: '/#noah' },
  { label: 'Demo',     href: '/demo' },
  { label: 'Precios',  href: '/precios' },
]

interface PublicNavProps {
  /** Si true, el nav empieza transparente y se vuelve sólido al hacer scroll (default: true) */
  transparent?: boolean
}

export default function PublicNav({ transparent = true }: PublicNavProps) {
  const [scrolled, setScrolled] = useState(!transparent)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (!transparent) return
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [transparent])

  // Cerrar menú al cambiar de ruta
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href.split('#')[0]) && href !== '/'
  }

  return (
    <>
      <style>{`
        .pub-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          height: 64px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 max(24px, calc((100vw - 1200px) / 2));
          transition: background .3s ease, border-color .3s ease, backdrop-filter .3s ease;
          border-bottom: 1px solid transparent;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .pub-nav.solid {
          background: rgba(10, 26, 15, 0.90);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-color: rgba(255,255,255,0.07);
        }
        .pub-nav-logo {
          display: flex; align-items: center; text-decoration: none; flex-shrink: 0;
        }
        .pub-nav-logo img {
          height: 28px; width: auto; object-fit: contain;
          /* logo-white sobre fondo dark */
          filter: brightness(1);
        }
        .pub-nav-links {
          display: flex; align-items: center; gap: 4px;
          list-style: none;
        }
        .pub-nav-links a {
          font-size: 14px; color: rgba(240,253,244,0.65);
          text-decoration: none; padding: 6px 14px; border-radius: 8px;
          transition: color .2s, background .2s;
          white-space: nowrap;
        }
        .pub-nav-links a:hover {
          color: #f0fdf4;
          background: rgba(255,255,255,0.06);
        }
        .pub-nav-links a.active { color: #22c55e; }
        .pub-nav-right {
          display: flex; align-items: center; gap: 8px; flex-shrink: 0;
        }
        .pub-nav-login {
          font-size: 14px; color: rgba(240,253,244,0.7) !important;
          padding: 7px 16px !important; border-radius: 8px !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          transition: border-color .2s, color .2s !important;
          background: transparent !important;
        }
        .pub-nav-login:hover {
          color: #f0fdf4 !important;
          border-color: rgba(255,255,255,0.3) !important;
          background: rgba(255,255,255,0.04) !important;
        }
        .pub-nav-cta {
          font-size: 14px !important; font-weight: 500 !important;
          color: #0a1a0f !important; background: #22c55e !important;
          padding: 8px 18px !important; border-radius: 8px !important;
          transition: background .2s !important;
          white-space: nowrap;
        }
        .pub-nav-cta:hover { background: #16a34a !important; }

        /* HAMBURGER */
        .pub-nav-hamburger {
          display: none; background: none; border: none; cursor: pointer;
          color: rgba(240,253,244,0.7); padding: 6px;
          flex-direction: column; gap: 5px; align-items: flex-end;
        }
        .pub-nav-hamburger span {
          display: block; height: 1.5px; background: currentColor;
          border-radius: 2px; transition: width .2s;
        }

        /* MOBILE MENU */
        .pub-nav-mobile {
          position: fixed; top: 64px; left: 0; right: 0; z-index: 199;
          background: rgba(10,26,15,0.97);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 16px max(24px, calc((100vw - 1200px) / 2)) 24px;
          display: flex; flex-direction: column; gap: 4px;
          animation: slideDown .2s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pub-nav-mobile a {
          font-size: 15px; color: rgba(240,253,244,0.7);
          text-decoration: none; padding: 12px 16px; border-radius: 10px;
          transition: color .2s, background .2s;
        }
        .pub-nav-mobile a:hover { color: #f0fdf4; background: rgba(255,255,255,0.05); }
        .pub-nav-mobile a.active { color: #22c55e; }
        .pub-nav-mobile-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 8px 0; }
        .pub-nav-mobile-cta {
          display: block; text-align: center; margin-top: 4px;
          background: #22c55e; color: #0a1a0f !important;
          font-weight: 500; border-radius: 10px; padding: 13px !important;
        }

        @media (max-width: 768px) {
          .pub-nav-links { display: none; }
          .pub-nav-hamburger { display: flex; }
          .pub-nav-login { display: none; }
        }
        @media (min-width: 769px) {
          .pub-nav-mobile { display: none !important; }
        }
      `}</style>

      <nav className={`pub-nav${scrolled ? ' solid' : ''}`}>
        {/* LOGO */}
        <Link href="/" className="pub-nav-logo">
          <img
            src="/images/logo-white.png"
            alt="PRAIRON"
            style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
          />
        </Link>

        {/* DESKTOP LINKS */}
        <ul className="pub-nav-links">
          {NAV_LINKS.map(l => (
            <li key={l.href}>
              <Link href={l.href} className={isActive(l.href) ? 'active' : ''}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* RIGHT CTAs */}
        <div className="pub-nav-right">
          <Link href="/login" className="pub-nav-links pub-nav-login" style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '14px', color: 'rgba(240,253,244,0.7)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', transition: 'all .2s' }}>
            Ingresar
          </Link>
          <Link href="/register" className="pub-nav-cta" style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, color: '#0a1a0f', background: '#22c55e', textDecoration: 'none', transition: 'background .2s' }}>
            Empezar gratis
          </Link>

          {/* Hamburger */}
          <button
            className="pub-nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            <span style={{ width: menuOpen ? '18px' : '22px' }} />
            <span style={{ width: '18px' }} />
            <span style={{ width: menuOpen ? '22px' : '14px' }} />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="pub-nav-mobile">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className={isActive(l.href) ? 'active' : ''}>
              {l.label}
            </Link>
          ))}
          <div className="pub-nav-mobile-divider" />
          <Link href="/login" style={{ fontSize: '15px', color: 'rgba(240,253,244,0.7)', textDecoration: 'none', padding: '12px 16px', borderRadius: '10px' }}>
            Ingresar →
          </Link>
          <Link href="/register" className="pub-nav-mobile-cta">
            Empezar gratis — 14 días sin costo
          </Link>
        </div>
      )}
    </>
  )
}
