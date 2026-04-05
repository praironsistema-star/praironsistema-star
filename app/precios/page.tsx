import Link from 'next/link'

export const metadata = {
  title: 'Precios — PRAIRON',
  description: 'Planes y precios de PRAIRON. Sistema agroindustrial con IA nativa para ganadería, avicultura, palma y agricultura.',
}

const PLANES = [
  {
    key: 'starter', name: 'Starter', price: 29, desc: 'Para fincas pequeñas que empiezan a digitalizar',
    color: '#6b6b67', bg: '#f9f9f7', border: '#e5e5e3',
    features: ['1 usuario', 'Hasta 2 granjas', 'Dashboard básico', 'Tareas y alertas', 'NOAH IA (50 consultas/mes)', 'Reportes CSV', 'Soporte por email'],
    cta: 'Empezar gratis', href: '/register',
  },
  {
    key: 'pro', name: 'Pro', price: 89, desc: 'Para operaciones en crecimiento que necesitan todo',
    color: '#036446', bg: '#e8f5ef', border: '#036446',
    badge: 'Más popular',
    features: ['Hasta 10 usuarios', 'Granjas ilimitadas', 'Dashboard adaptativo por sector', 'Módulos: Ganadería · Avicultura · Palma · Agrícola', 'NOAH IA ilimitado', 'Calendario agrícola', 'Clima en tiempo real', 'PDF con diseño PRAIRON', 'Reportes avanzados', 'Notificaciones email', 'Soporte prioritario'],
    cta: 'Empezar gratis 14 días', href: '/register',
  },
  {
    key: 'enterprise', name: 'Enterprise', price: 199, desc: 'Para grupos empresariales y cooperativas',
    color: '#185fa5', bg: '#e6f1fb', border: '#185fa5',
    features: ['Usuarios ilimitados', 'Multi-empresa', 'Permisos por rol personalizados', 'API pública documentada', 'NOAH con memoria + contexto', 'Análisis de imágenes IA', 'Benchmark regional', 'Trazabilidad ODS exportable', 'Backup automático', 'Integración WhatsApp', 'Gerente de cuenta dedicado', 'SLA 99.9%'],
    cta: 'Hablar con ventas', href: 'mailto:ventas@prairon.com',
  },
]

const FAQ = [
  { q: '¿Puedo cambiar de plan después?', a: 'Sí, puedes subir o bajar de plan en cualquier momento desde tu configuración. El cambio aplica al siguiente ciclo de facturación.' },
  { q: '¿Hay contrato mínimo?', a: 'No. Todos los planes son mensuales y puedes cancelar cuando quieras. También ofrecemos descuento del 20% pagando anual.' },
  { q: '¿Qué pasa con mis datos si cancelo?', a: 'Tus datos son tuyos. Puedes exportar un backup completo en JSON/CSV antes de cancelar. Los guardamos 30 días adicionales por si cambias de opinión.' },
  { q: '¿El NOAH está disponible en todos los planes?', a: 'Sí. El Starter incluye 50 consultas/mes. Pro y Enterprise tienen NOH ilimitado con funciones adicionales como memoria y análisis de imágenes.' },
  { q: '¿Cómo funciona el período de prueba?', a: '14 días gratis con acceso completo al plan Pro. Sin tarjeta de crédito. Al terminar, elige el plan que mejor se ajuste a tu operación.' },
]

export default function PreciosPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f7', fontFamily: 'Figtree, system-ui, sans-serif' }}>

      {/* Nav */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(249,249,247,0.96)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid #e5e5e3', padding: '0 40px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '26px', height: '26px', background: '#036446', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white', fontFamily: 'monospace' }}>P</div>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#036446', letterSpacing: '.06em' }}>PRAIRON</span>
        </Link>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/login" style={{ fontSize: '12px', color: '#6b6b67', padding: '6px 12px', textDecoration: 'none' }}>Ingresar</Link>
          <Link href="/register" style={{ fontSize: '12px', color: 'white', background: '#036446', padding: '7px 16px', borderRadius: '6px', textDecoration: 'none', fontWeight: '500' }}>Empezar gratis</Link>
        </div>
      </div>

      <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '60px 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', border: '0.5px solid #a7f3d0', borderRadius: '20px', fontSize: '11px', fontWeight: '500', color: '#036446', marginBottom: '16px' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#036446' }} />
            Sin tarjeta · 14 días gratis · Cancela cuando quieras
          </div>
          <h1 style={{ fontSize: '40px', fontWeight: '400', color: '#1a1a18', margin: '0 0 12px', letterSpacing: '-1px', fontFamily: 'Georgia, serif' }}>
            Precios simples y transparentes
          </h1>
          <p style={{ fontSize: '15px', color: '#6b6b67', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
            Elige el plan que se ajuste a tu operación. Todos incluyen el NOAH con IA nativa.
          </p>
        </div>

        {/* Planes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '60px', alignItems: 'start' }}>
          {PLANES.map(p => (
            <div key={p.key} style={{
              background: '#fff', border: `1.5px solid ${p.border}`,
              borderRadius: '16px', overflow: 'hidden',
              boxShadow: p.key === 'pro' ? '0 8px 32px rgba(3,100,70,0.12)' : 'none',
              transform: p.key === 'pro' ? 'scale(1.02)' : 'none',
            }}>
              {p.key === 'pro' && (
                <div style={{ background: '#036446', padding: '6px', textAlign: 'center', fontSize: '11px', fontWeight: '600', color: 'white', letterSpacing: '.06em' }}>
                  ★ MÁS POPULAR
                </div>
              )}
              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: p.color, marginBottom: '4px', letterSpacing: '.04em' }}>{p.name.toUpperCase()}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '36px', fontWeight: '500', color: '#1a1a18' }}>${p.price}</span>
                  <span style={{ fontSize: '13px', color: '#9b9b97' }}>USD/mes</span>
                </div>
                <div style={{ fontSize: '12px', color: '#9b9b97', marginBottom: '20px', lineHeight: 1.5 }}>{p.desc}</div>

                <Link href={p.href} style={{
                  display: 'block', textAlign: 'center', padding: '11px',
                  background: p.key === 'pro' ? '#036446' : p.key === 'enterprise' ? '#185fa5' : '#1a1a18',
                  color: 'white', borderRadius: '8px', textDecoration: 'none',
                  fontSize: '13px', fontWeight: '500', marginBottom: '20px',
                }}>
                  {p.cta}
                </Link>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '12px', color: '#6b6b67' }}>
                      <span style={{ color: p.color, flexShrink: 0, fontWeight: '600' }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Descuento anual */}
        <div style={{ background: '#e8f5ef', border: '0.5px solid #a7f3d0', borderRadius: '12px', padding: '20px 24px', marginBottom: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#036446', marginBottom: '4px' }}>💰 Paga anual y ahorra 20%</div>
            <div style={{ fontSize: '12px', color: '#0f6e56' }}>Starter $278/año · Pro $854/año · Enterprise $1,910/año</div>
          </div>
          <Link href="/register" style={{ padding: '9px 20px', background: '#036446', color: 'white', borderRadius: '7px', textDecoration: 'none', fontSize: '13px', fontWeight: '500', flexShrink: 0 }}>
            Ver plan anual
          </Link>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '400', color: '#1a1a18', textAlign: 'center', marginBottom: '32px', fontFamily: 'Georgia, serif' }}>Preguntas frecuentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQ.map((f, i) => (
              <div key={i} style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '18px 20px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a18', marginBottom: '8px' }}>{f.q}</div>
                <div style={{ fontSize: '13px', color: '#6b6b67', lineHeight: 1.6 }}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div style={{ background: '#024d36', borderRadius: '16px', padding: '40px', textAlign: 'center', marginTop: '60px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '400', color: 'white', margin: '0 0 10px', fontFamily: 'Georgia, serif' }}>
            Empieza hoy sin compromiso
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px', lineHeight: 1.7 }}>
            14 días gratis con acceso completo al plan Pro. Sin tarjeta de crédito.
          </p>
          <Link href="/register" style={{ display: 'inline-block', padding: '12px 32px', background: '#0dac5e', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
            Crear mi cuenta gratis →
          </Link>
        </div>

      </div>
    </div>
  )
}
