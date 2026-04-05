'use client'
import Link from 'next/link'
import type { Sector } from '@/lib/sectores'

// ─────────────────────────────────────────────────────────────────────────────
// SectorPage.tsx — Diseño de página por sector productivo
// Ruta destino: /components/landing/SectorPage.tsx
// ─────────────────────────────────────────────────────────────────────────────

export default function SectorPage({ sector }: { sector: Sector }) {
  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8', fontFamily: "'Syne', sans-serif" }}>

      {/* ── Header navegación ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250,250,248,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid #e5e5e3',
        padding: '0 40px',
        height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/images/logo-white.png" alt="PRAIRON" style={{ height: '22px', objectFit: 'contain' }} />
        </Link>
        <nav style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <Link href="/soluciones" style={{
            fontSize: '13px', color: '#6b6b67', padding: '6px 12px',
            borderRadius: '6px', textDecoration: 'none',
            background: '#f0f0ee',
          }}>
            ← Todas las áreas
          </Link>
          <Link href="/login" style={{
            fontSize: '13px', color: '#036446', padding: '6px 14px',
            borderRadius: '6px', textDecoration: 'none',
            border: '0.5px solid #036446', marginLeft: '8px',
          }}>
            Ingresar
          </Link>
          <Link href="/register" style={{
            fontSize: '13px', color: '#fff', padding: '6px 14px',
            borderRadius: '6px', textDecoration: 'none',
            background: '#036446',
          }}>
            Empezar gratis
          </Link>
        </nav>
      </header>

      {/* ── Hero del sector ── */}
      <section style={{
        padding: '80px 40px 64px',
        maxWidth: '1100px',
        margin: '0 auto',
        position: 'relative',
      }}>
        {/* Fondo decorativo */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '400px', height: '400px',
          background: `radial-gradient(circle, ${sector.color}10 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
            <span style={{ fontSize: '11px', color: '#9b9b97', letterSpacing: '0.1em', textTransform: 'uppercase' }}>PRAIRON</span>
            <span style={{ fontSize: '11px', color: '#c4c4c0' }}>›</span>
            <span style={{ fontSize: '11px', color: '#9b9b97', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Áreas productivas</span>
            <span style={{ fontSize: '11px', color: '#c4c4c0' }}>›</span>
            <span style={{ fontSize: '11px', color: sector.color, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '600' }}>
              {sector.name}
            </span>
          </div>

          {/* Icono + Título */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '20px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: sector.colorBg,
              border: `1px solid ${sector.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', flexShrink: 0,
            }}>
              {sector.heroIcon}
            </div>
            <div>
              <h1 style={{
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontWeight: '700', color: '#1a1a18',
                lineHeight: '1.1', margin: 0,
                letterSpacing: '-0.02em',
              }}>
                {sector.name}
              </h1>
              <p style={{
                fontSize: '18px', color: sector.color,
                fontWeight: '500', margin: '8px 0 0',
                lineHeight: '1.4',
              }}>
                {sector.tagline}
              </p>
            </div>
          </div>

          {/* Descripción */}
          <p style={{
            fontSize: '16px', color: '#4a4a47', lineHeight: '1.7',
            maxWidth: '680px', margin: '0 0 40px',
          }}>
            {sector.description}
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
            {sector.stats.map((stat, i) => (
              <div key={i} style={{
                background: '#fff',
                border: '0.5px solid #e5e5e3',
                borderRadius: '12px',
                padding: '16px 24px',
                minWidth: '140px',
              }}>
                <div style={{
                  fontSize: '28px', fontWeight: '700',
                  color: sector.color, lineHeight: '1',
                  letterSpacing: '-0.02em',
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '12px', color: '#9b9b97',
                  marginTop: '4px', lineHeight: '1.3',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '8px',
              background: sector.color, color: '#fff',
              textDecoration: 'none', fontSize: '14px', fontWeight: '600',
              transition: 'opacity 0.15s',
            }}>
              {sector.cta} →
            </Link>
            <Link href="/demo" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '8px',
              background: '#fff', color: '#1a1a18',
              textDecoration: 'none', fontSize: '14px', fontWeight: '500',
              border: '0.5px solid #e5e5e3',
            }}>
              Ver demo sin registro
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{
        padding: '64px 40px',
        background: '#fff',
        borderTop: '0.5px solid #e5e5e3',
        borderBottom: '0.5px solid #e5e5e3',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '40px' }}>
            <div style={{
              fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
              color: sector.color, fontWeight: '600', marginBottom: '8px',
            }}>
              Todo lo que incluye
            </div>
            <h2 style={{
              fontSize: '28px', fontWeight: '700', color: '#1a1a18',
              margin: 0, letterSpacing: '-0.01em',
            }}>
              Funcionalidades diseñadas para {sector.name.toLowerCase()}
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
          }}>
            {sector.features.map((feature, i) => (
              <div key={i} style={{
                background: '#fafaf8',
                border: '0.5px solid #e5e5e3',
                borderRadius: '12px',
                padding: '20px',
                transition: 'border-color 0.15s',
              }}>
                <div style={{
                  fontSize: '24px', marginBottom: '12px',
                  width: '44px', height: '44px',
                  background: sector.colorBg,
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {feature.icon}
                </div>
                <div style={{
                  fontSize: '14px', fontWeight: '600', color: '#1a1a18', marginBottom: '6px',
                }}>
                  {feature.title}
                </div>
                <div style={{
                  fontSize: '13px', color: '#6b6b67', lineHeight: '1.6',
                }}>
                  {feature.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Módulos incluidos ── */}
      <section style={{ padding: '64px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
          color: '#9b9b97', fontWeight: '600', marginBottom: '8px',
        }}>
          Módulos del sistema
        </div>
        <h2 style={{
          fontSize: '22px', fontWeight: '700', color: '#1a1a18',
          margin: '0 0 24px', letterSpacing: '-0.01em',
        }}>
          Acceso completo a estos módulos con tu plan
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {sector.modules.map((mod, i) => (
            <span key={i} style={{
              padding: '6px 14px',
              borderRadius: '99px',
              background: sector.colorBg,
              color: sector.color,
              fontSize: '13px',
              fontWeight: '500',
              border: `0.5px solid ${sector.color}30`,
            }}>
              {mod}
            </span>
          ))}
          <span style={{
            padding: '6px 14px', borderRadius: '99px',
            background: '#f5f5f3', color: '#6b6b67',
            fontSize: '13px', border: '0.5px solid #e5e5e3',
          }}>
            + NOAH IA
          </span>
          <span style={{
            padding: '6px 14px', borderRadius: '99px',
            background: '#f5f5f3', color: '#6b6b67',
            fontSize: '13px', border: '0.5px solid #e5e5e3',
          }}>
            + Offline completo
          </span>
          <span style={{
            padding: '6px 14px', borderRadius: '99px',
            background: '#f5f5f3', color: '#6b6b67',
            fontSize: '13px', border: '0.5px solid #e5e5e3',
          }}>
            + Multi-finca
          </span>
          <span style={{
            padding: '6px 14px', borderRadius: '99px',
            background: '#f5f5f3', color: '#6b6b67',
            fontSize: '13px', border: '0.5px solid #e5e5e3',
          }}>
            + 3 idiomas (ES/EN/PT)
          </span>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section style={{
        background: sector.color,
        padding: '64px 40px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            fontSize: '36px', marginBottom: '16px',
          }}>
            {sector.heroIcon}
          </div>
          <h2 style={{
            fontSize: '28px', fontWeight: '700', color: '#fff',
            margin: '0 0 12px', letterSpacing: '-0.01em',
          }}>
            Empieza a gestionar tu {sector.name.toLowerCase()} hoy
          </h2>
          <p style={{
            fontSize: '15px', color: 'rgba(255,255,255,0.75)',
            margin: '0 0 32px', lineHeight: '1.6',
          }}>
            14 días gratis, sin tarjeta de crédito. Si en 14 días no ves el valor, cancelás sin preguntas.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              padding: '13px 28px', borderRadius: '8px',
              background: '#fff', color: sector.color,
              textDecoration: 'none', fontSize: '14px', fontWeight: '700',
            }}>
              Comenzar 14 días gratis
            </Link>
            <Link href="/demo" style={{
              padding: '13px 28px', borderRadius: '8px',
              background: 'transparent', color: '#fff',
              textDecoration: 'none', fontSize: '14px', fontWeight: '500',
              border: '1px solid rgba(255,255,255,0.4)',
            }}>
              Ver demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── Otros sectores ── */}
      <section style={{ padding: '48px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          fontSize: '12px', color: '#9b9b97', marginBottom: '16px',
          letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '600',
        }}>
          También cubrimos
        </div>
        <Link href="/soluciones" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '14px', color: '#036446', textDecoration: 'none', fontWeight: '500',
        }}>
          Ver todas las áreas productivas →
        </Link>
      </section>

    </div>
  )
}
