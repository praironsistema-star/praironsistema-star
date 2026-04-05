'use client'

import Link from 'next/link'
import { SECTORES } from '@/lib/sectores'

// ─────────────────────────────────────────────────────────────────────────────
// /soluciones/page.tsx — Índice de todas las áreas productivas
// ─────────────────────────────────────────────────────────────────────────────


export default function SolucionesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8', fontFamily: "'Syne', sans-serif" }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250,250,248,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid #e5e5e3',
        padding: '0 40px', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <img src="/images/logo-white.png" alt="PRAIRON" style={{ height: '22px', objectFit: 'contain' }} />
        </Link>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/login" style={{
            fontSize: '13px', color: '#036446', padding: '6px 14px',
            borderRadius: '6px', textDecoration: 'none',
            border: '0.5px solid #036446',
          }}>Ingresar</Link>
          <Link href="/register" style={{
            fontSize: '13px', color: '#fff', padding: '6px 14px',
            borderRadius: '6px', textDecoration: 'none',
            background: '#036446',
          }}>Empezar gratis</Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '72px 40px 48px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase',
          color: '#036446', fontWeight: '600',
          background: '#f0fdf4', border: '0.5px solid #bbf7d0',
          padding: '5px 14px', borderRadius: '99px', marginBottom: '20px',
        }}>
          Áreas productivas
        </div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: '700', color: '#1a1a18',
          lineHeight: '1.1', margin: '0 0 16px',
          letterSpacing: '-0.02em',
        }}>
          Un sistema hecho para<br />
          <span style={{ color: '#036446' }}>cada tipo de producción</span>
        </h1>
        <p style={{
          fontSize: '17px', color: '#6b6b67', lineHeight: '1.7',
          maxWidth: '560px', margin: '0 auto',
        }}>
          PRAIRON no es un sistema genérico. Cada área productiva tiene su propio flujo, módulos y lenguaje. Elige tu sector y descubre todo lo que incluye.
        </p>
      </section>

      {/* Grid de sectores */}
      <section style={{ padding: '0 40px 80px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {SECTORES.map(sector => (
            <Link
              key={sector.slug}
              href={`/soluciones/${sector.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                background: '#fff',
                border: '0.5px solid #e5e5e3',
                borderRadius: '14px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                height: '100%',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = sector.color + '60'
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 20px ${sector.color}12`
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e5e3'
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
              }}
              >
                {/* Icono */}
                <div style={{
                  width: '52px', height: '52px', borderRadius: '12px',
                  background: sector.colorBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '26px', marginBottom: '16px',
                }}>
                  {sector.heroIcon}
                </div>

                {/* Nombre */}
                <div style={{
                  fontSize: '16px', fontWeight: '600', color: '#1a1a18',
                  marginBottom: '6px',
                }}>
                  {sector.name}
                </div>

                {/* Tagline */}
                <div style={{
                  fontSize: '13px', color: '#6b6b67', lineHeight: '1.5',
                  marginBottom: '16px',
                }}>
                  {sector.tagline}
                </div>

                {/* Features preview (primeras 3) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px' }}>
                  {sector.features.slice(0, 3).map((f, i) => (
                    <div key={i} style={{
                      fontSize: '12px', color: '#9b9b97',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                      <span style={{ color: sector.color, fontSize: '10px' }}>✓</span>
                      {f.title}
                    </div>
                  ))}
                  {sector.features.length > 3 && (
                    <div style={{ fontSize: '12px', color: '#c4c4c0' }}>
                      + {sector.features.length - 3} más
                    </div>
                  )}
                </div>

                {/* Link */}
                <div style={{
                  fontSize: '13px', color: sector.color,
                  fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  Ver solución completa →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA global */}
      <section style={{
        background: '#1a1a18', padding: '64px 40px', textAlign: 'center',
      }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '28px', fontWeight: '700', color: '#fff',
            margin: '0 0 12px', letterSpacing: '-0.01em',
          }}>
            Sin importar tu sector,<br />PRAIRON funciona offline
          </h2>
          <p style={{
            fontSize: '15px', color: 'rgba(255,255,255,0.55)',
            margin: '0 0 28px', lineHeight: '1.6',
          }}>
            El único sistema agropecuario de LATAM con modo offline completo. Funciona en el campo, sin señal, igual que en la oficina.
          </p>
          <Link href="/register" style={{
            display: 'inline-block',
            padding: '13px 28px', borderRadius: '8px',
            background: '#036446', color: '#fff',
            textDecoration: 'none', fontSize: '14px', fontWeight: '700',
          }}>
            Empezar 14 días gratis
          </Link>
        </div>
      </section>

    </div>
  )
}
