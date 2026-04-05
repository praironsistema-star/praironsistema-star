import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: '#f9f9f7',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: 'Figtree, system-ui, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
          <img src="/images/logo-dark.png" alt="PRAIRON" style={{ height:'26px', width:'auto' }} />
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '20px', padding: '40px 32px' }}>

          {/* NOH bubble */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '28px', textAlign: 'left' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#036446', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '700', color: 'white', flexShrink: 0, fontFamily: 'monospace' }}>N</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#036446', marginBottom: '6px' }}>NOAH</div>
              <div style={{ padding: '12px 16px', background: '#e8f5ef', border: '0.5px solid #a7f3d0', borderRadius: '0 12px 12px 12px', fontSize: '13px', color: '#024d36', lineHeight: 1.6 }}>
                Revisé todos los lotes, galpones y cultivos... y aquí no hay nada sembrado. Creo que esta página no existe. ¿Volvemos al dashboard?
              </div>
            </div>
          </div>

          {/* 404 */}
          <div style={{ fontFamily: 'monospace', fontSize: '72px', fontWeight: '500', color: '#e5e5e3', lineHeight: 1, marginBottom: '8px' }}>404</div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a18', marginBottom: '8px' }}>Página no encontrada</div>
          <div style={{ fontSize: '13px', color: '#9b9b97', marginBottom: '28px', lineHeight: 1.6 }}>
            La ruta que buscas no existe o fue movida.
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" style={{
              padding: '10px 22px', background: '#036446', color: 'white',
              borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '500',
            }}>
              Ir al dashboard →
            </Link>
            <Link href="/farms" style={{
              padding: '10px 22px', background: '#fff', color: '#6b6b67',
              border: '0.5px solid #e5e5e3', borderRadius: '8px',
              textDecoration: 'none', fontSize: '13px',
            }}>
              Ver mis fincas
            </Link>
          </div>
        </div>

        <div style={{ marginTop: '20px', fontSize: '11px', color: '#9b9b97' }}>
          PRAIRON · Agroindustrial OS · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}
